import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Package,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { produitService, mouvementStockService } from "@/services/api.service";
import { toast } from "sonner";

const formatCFA = (amount: number) => amount.toLocaleString("fr-FR") + " F";

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [movementData, setMovementData] = useState({
    type: "in",
    productId: "",
    quantity: "",
    reason: "",
  });

  const loadData = async () => {
    try {
      const [productsRes, movementsRes] = await Promise.all([
        produitService.getAll(),
        mouvementStockService.getAll(),
      ]);
      setProducts(productsRes.data || []);
      setMovements((movementsRes.data || []).slice(0, 10));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur de chargement du stock",
      );
      setProducts([]);
      setMovements([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalStockValue = products.reduce(
    (acc, p) => acc + p.stock * p.buyPrice,
    0,
  );

  const handleCreateMovement = async () => {
    if (
      !movementData.productId ||
      !movementData.quantity ||
      !movementData.reason
    ) {
      toast.error("Veuillez remplir tous les champs du mouvement");
      return;
    }

    try {
      await mouvementStockService.create({
        productId: movementData.productId,
        type: movementData.type as "in" | "out" | "adjustment",
        quantity: Number(movementData.quantity),
        reason: movementData.reason,
      });
      toast.success("Mouvement enregistr�");
      setIsMovementDialogOpen(false);
      setMovementData({ type: "in", productId: "", quantity: "", reason: "" });
      await loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur lors de la cr�ation du mouvement",
      );
    }
  };

  return (
    <AdminLayout
      title="Gestion du stock"
      subtitle="Suivez vos inventaires et mouvements de stock"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {products.length}
            </p>
            <p className="text-xs text-muted-foreground">R�f�rences</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {lowStockCount}
            </p>
            <p className="text-xs text-muted-foreground">Stock bas</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {outOfStockCount}
            </p>
            <p className="text-xs text-muted-foreground">Ruptures</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatCFA(totalStockValue)}
            </p>
            <p className="text-xs text-muted-foreground">Valeur stock</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          className="gradient-primary text-primary-foreground shadow-glow"
          onClick={() => setIsMovementDialogOpen(true)}
          asChild={false}
        >
          <Plus className="w-4 h-4 mr-2" />
          Mouvement de stock
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-card overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Produit</TableHead>
              <TableHead>R�f�rence</TableHead>
              <TableHead>Cat�gorie</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-center">Seuil</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product, index) => (
              <TableRow
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.brand}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono text-muted-foreground">
                    {product.reference}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.category}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`text-lg font-bold ${product.stock <= product.minStock ? "text-destructive" : "text-foreground"}`}
                  >
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {product.minStock}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {formatCFA(product.stock * product.buyPrice)}
                  </span>
                </TableCell>
                <TableCell>
                  {product.stock === 0 ? (
                    <Badge variant="destructive">Rupture</Badge>
                  ) : product.stock <= product.minStock ? (
                    <Badge variant="warning">Stock bas</Badge>
                  ) : (
                    <Badge variant="success">OK</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-card rounded-xl border shadow-card p-5">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Derniers mouvements
        </h3>
        <div className="space-y-3">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${movement.type === "in" ? "bg-success/10 text-success" : movement.type === "out" ? "bg-destructive/10 text-destructive" : "bg-info/10 text-info"}`}
              >
                {movement.type === "in" ? (
                  <ArrowUpCircle className="w-5 h-5" />
                ) : movement.type === "out" ? (
                  <ArrowDownCircle className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  {movement.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {movement.reason}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold ${movement.type === "in" ? "text-success" : "text-destructive"}`}
                >
                  {movement.type === "in" ? "+" : ""}
                  {movement.quantity}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(movement.date), "dd MMM", { locale: fr })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={isMovementDialogOpen}
        onOpenChange={setIsMovementDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau mouvement de stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type de mouvement</Label>
              <Select
                value={movementData.type}
                onValueChange={(value) =>
                  setMovementData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Entr�e (r�ception)</SelectItem>
                  <SelectItem value="out">Sortie (autre que vente)</SelectItem>
                  <SelectItem value="adjustment">
                    Ajustement (inventaire)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Produit</Label>
              <Select
                value={movementData.productId}
                onValueChange={(value) =>
                  setMovementData((prev) => ({ ...prev, productId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="S�lectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.reference})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantit�</Label>
              <Input
                type="number"
                placeholder="0"
                value={movementData.quantity}
                onChange={(e) =>
                  setMovementData((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Raison</Label>
              <Input
                placeholder="Ex: R�approvisionnement fournisseur"
                value={movementData.reason}
                onChange={(e) =>
                  setMovementData((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMovementDialogOpen(false)}
              asChild={false}
            >
              Annuler
            </Button>
            <Button
              className="gradient-primary text-primary-foreground"
              onClick={handleCreateMovement}
              asChild={false}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
