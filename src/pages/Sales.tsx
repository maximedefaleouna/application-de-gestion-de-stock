import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Printer,
  Download,
  Trash2,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { venteService } from "@/services/api.service";

const statusConfig: Record<
  string,
  {
    label: string;
    variant:
      | "default"
      | "success"
      | "warning"
      | "info"
      | "destructive"
      | "pending";
  }
> = {
  completed: { label: "Payé", variant: "success" },
  credit: { label: "Crédit", variant: "warning" },
  partial: { label: "Partiel", variant: "info" },
  cancelled: { label: "Annulé", variant: "destructive" },
};

const formatCFA = (amount: number) => amount.toLocaleString("fr-FR") + " F";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadSales = async () => {
    try {
      setIsLoading(true);
      const response = await venteService.getAll();
      setSales(response.data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur lors du chargement des ventes",
      );
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await venteService.delete(id);
      toast.success("Vente supprimée");
      await loadSales();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur lors de la suppression",
      );
    }
  };

  const openReceiptAction = (saleId: string, mode: "print" | "download") => {
    const query = new URLSearchParams({ id: saleId, mode }).toString();
    window.open(`/receipt?${query}`, "_blank", "noopener,noreferrer");
  };

  const filteredSales = sales.filter((sale) => {
    const clientName = (sale.clientName || "").toLowerCase();
    const buyerName = `${sale.prenomAcheteur || ''} ${sale.nomAcheteur || ''}`.toLowerCase();
    const buyerPhone = (sale.telephoneAcheteur || "").toLowerCase();
    const matchesSearch =
      clientName.includes(searchTerm.toLowerCase()) ||
      buyerName.includes(searchTerm.toLowerCase()) ||
      buyerPhone.includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout
      title="Historique des ventes"
      subtitle="Consultez et gérez toutes les ventes"
    >
      <div className="bg-card rounded-xl border shadow-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par client ou N° vente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="completed">Payé</SelectItem>
              <SelectItem value="credit">Crédit</SelectItem>
              <SelectItem value="partial">Partiel</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => navigate("/pos")}
            asChild={false}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Nouvelle vente
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>N° Vente</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Payé</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredSales.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  Aucune vente trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale, index) => (
                <TableRow
                  key={sale.id}
                  className="animate-fade-in cursor-pointer hover:bg-secondary/30"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <TableCell>
                    <span className="font-semibold text-foreground">
                      {sale.formattedVenteNumber || sale.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {sale.clientName || 
                         (sale.prenomAcheteur || sale.nomAcheteur || sale.telephoneAcheteur)
                           ? `${sale.prenomAcheteur || ''} ${sale.nomAcheteur || ''}`.trim() || "Comptoir"
                           : "Comptoir"}
                      </p>
                      {sale.clientPhone && (
                        <p className="text-xs text-muted-foreground">
                          {sale.clientPhone}
                        </p>
                      )}
                      {sale.telephoneAcheteur && !sale.clientPhone && (
                        <p className="text-xs text-muted-foreground">
                          {sale.telephoneAcheteur}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{sale.items.length}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground">
                      {formatCFA(sale.totalAmount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        sale.remainingAmount > 0
                          ? "text-warning font-medium"
                          : "text-success font-medium"
                      }
                    >
                      {formatCFA(sale.paidAmount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusConfig[sale.status]?.variant || "default"}
                    >
                      {statusConfig[sale.status]?.label || sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-foreground">
                        {format(new Date(sale.createdAt), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(sale.createdAt), "HH:mm")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild={false}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSelectedSale(sale)}
                          inset={false}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openReceiptAction(sale.id, "print")}
                          inset={false}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Imprimer reçu
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openReceiptAction(sale.id, "download")}
                          inset={false}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger reçu
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(sale.id)}
                          inset={false}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails vente {selectedSale?.id}</DialogTitle>
            <DialogDescription>
              Informations complètes de la vente
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client / Acheteur</p>
                  <p className="font-medium">
                    {selectedSale.clientName || 
                     (selectedSale.prenomAcheteur || selectedSale.nomAcheteur || selectedSale.telephoneAcheteur)
                       ? `${selectedSale.prenomAcheteur || ''} ${selectedSale.nomAcheteur || ''}`.trim() || "Comptoir"
                       : "Comptoir"}
                  </p>
                  {selectedSale.clientPhone && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedSale.clientPhone}
                    </p>
                  )}
                  {selectedSale.telephoneAcheteur && !selectedSale.clientPhone && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedSale.telephoneAcheteur}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge
                    variant={
                      statusConfig[selectedSale.status]?.variant || "default"
                    }
                  >
                    {statusConfig[selectedSale.status]?.label ||
                      selectedSale.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Articles</p>
                <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                  {selectedSale.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="font-medium">
                        {formatCFA(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-bold text-primary">
                    {formatCFA(selectedSale.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payé</span>
                  <span className="font-medium text-success">
                    {formatCFA(selectedSale.paidAmount)}
                  </span>
                </div>
                {selectedSale.remainingAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Reste à payer</span>
                    <span className="font-bold text-warning">
                      {formatCFA(selectedSale.remainingAmount)}
                    </span>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2 sm:justify-start">
                <Button
                  variant="outline"
                  onClick={() => openReceiptAction(selectedSale.id, "print")}
                  asChild={false}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer reçu
                </Button>
                <Button
                  onClick={() => openReceiptAction(selectedSale.id, "download")}
                  asChild={false}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger reçu
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
