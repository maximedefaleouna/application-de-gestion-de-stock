import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  produitService,
  clientService,
  venteService,
} from "@/services/api.service";
import { SaleItem } from "@/types";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Printer,
  CreditCard,
  User,
  Package,
} from "lucide-react";
import { toast } from "sonner";

const formatCFA = (amount: number) => amount.toLocaleString("fr-FR") + " F";

export default function POS() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isCredit, setIsCredit] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, clientsRes] = await Promise.all([
        produitService.getAll(),
        clientService.getAll(),
      ]);
      setProducts(productsRes.data || []);
      setClients(clientsRes.data || []);
    } catch (error) {
      console.error("Erreur chargement données POS:", error);
      toast.error(
        "Erreur de chargement des données. Veuillez rafraîchir la page.",
      );
      setProducts([]);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.available &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error("Stock insuffisant !");
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
      return;
    }

    if (product.stock < 1) {
      toast.error("Produit en rupture de stock !");
      return;
    }

    setCart([
      ...cart,
      {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.sellPrice,
        imageUrl: "",
      },
    ]);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    setCart(
      cart.map((item) => {
        if (item.productId !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (product && newQty > product.stock) {
          toast.error("Stock insuffisant !");
          return item;
        }
        return { ...item, quantity: newQty };
      }),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const total = cart.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  );
  const paid = Number(paidAmount) || 0;
  const remaining = Math.max(0, total - paid);
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleSale = () => {
    if (cart.length === 0) {
      toast.error("Le panier est vide !");
      return;
    }
    if (!isCredit && paid < total) {
      toast.error("Montant payé insuffisant !");
      return;
    }
    if (isCredit && !selectedClientId) {
      toast.error("Sélectionnez un client pour la vente à crédit !");
      return;
    }
    setIsReceiptOpen(true);
  };

  const finalizeSale = async () => {
    try {
      const effectivePaidAmount = paidAmount ? paid : isCredit ? 0 : total;
      const remainingAmount = Math.max(0, total - effectivePaidAmount);

      await venteService.create({
        items: cart,
        totalAmount: total,
        paidAmount: effectivePaidAmount,
        remainingAmount,
        paymentMethod: isCredit ? "credit" : paymentMethod,
        status: isCredit
          ? "credit"
          : remainingAmount > 0
            ? "partial"
            : "completed",
        clientId: isCredit ? selectedClientId : null,
        isCredit,
      });

      toast.success("Vente enregistrée avec succès !");
      setCart([]);
      setPaidAmount("");
      setIsCredit(false);
      setSelectedClientId("");
      setIsReceiptOpen(false);
      await loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur lors de l'enregistrement de la vente",
      );
    }
  };

  const downloadReceipt = () => {
    const receiptContent = [
      "AUTOPIECES+",
      "Recu de vente",
      `Date : ${new Date().toLocaleString("fr-FR")}`,
      "-----------------------------------",
      ...cart.map(
        (item) =>
          `${item.productName}\n  ${item.quantity} x ${formatCFA(item.unitPrice)} = ${formatCFA(item.quantity * item.unitPrice)}`,
      ),
      "-----------------------------------",
      `TOTAL : ${formatCFA(total)}`,
      `Payé  : ${formatCFA(paid)}`,
      remaining > 0 ? `Reste : ${formatCFA(remaining)} (CREDIT)` : "",
      `Mode  : ${paymentMethod === "cash" ? "Espèces" : paymentMethod === "mobile_money" ? "Mobile Money" : "Carte"}`,
      selectedClient
        ? `Client : ${selectedClient.nom || selectedClient.name}\nTel    : ${selectedClient.telephone || selectedClient.phone}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([receiptContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recu-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Reçu téléchargé !");
  };

  return (
    <AdminLayout title="Point de Vente" subtitle="Effectuez une nouvelle vente">
      {/* Main Container - Full width control */}
      <div className="w-full max-w-[100vw] overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 px-2 sm:px-4 md:px-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit par nom ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Products Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                Chargement des produits...
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                Aucun produit disponible
              </p>
            ) : (
              filteredProducts.slice(0, 12).map((product) => (
                <Card
                  key={product.id}
                  className="p-3 cursor-pointer hover:shadow-lg hover:border-primary transition-all min-h-[100px]"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    {/* Product Image */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-semibold text-foreground text-xs sm:text-sm truncate break-words leading-tight">
                        {product.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {product.reference}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="font-bold text-primary text-xs sm:text-sm whitespace-nowrap">
                          {formatCFA(product.sellPrice)}
                        </span>
                        <Badge
                          variant={
                            product.stock <= product.minStock
                              ? "warning"
                              : "success"
                          }
                          className="text-[9px] sm:text-[10px] px-1.5 py-0.5 min-w-[40px] text-center"
                        >
                          Stock: {product.stock}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Cart Section - Sticky on desktop */}
        <div className="space-y-3 md:space-y-4 lg:sticky lg:top-4">
          <Card className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h3 className="font-semibold text-foreground text-sm md:text-base">Panier</h3>
              <Badge variant="secondary" className="ml-auto text-xs">
                {cart.length} articles
              </Badge>
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Cliquez sur un produit pour l'ajouter
              </p>
            ) : (
              <div className="space-y-2 md:space-y-3 max-h-[280px] sm:max-h-[350px] overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-1.5 md:gap-2 p-2 rounded-lg bg-secondary/30"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs md:text-sm truncate break-words leading-tight">
                        {item.productName}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {formatCFA(item.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 md:h-7 md:w-7"
                        onClick={() => updateQuantity(item.productId, -1)}
                        asChild={false}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 md:w-8 text-center font-bold text-xs md:text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 md:h-7 md:w-7"
                        onClick={() => updateQuantity(item.productId, 1)}
                        asChild={false}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-bold text-xs md:text-sm w-14 md:w-20 text-right whitespace-nowrap">
                      {formatCFA(item.unitPrice * item.quantity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 md:h-7 md:w-7 text-destructive flex-shrink-0"
                      onClick={() => removeFromCart(item.productId)}
                      asChild={false}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t mt-3 md:mt-4 pt-3 md:pt-4 space-y-2 md:space-y-3">
              {/* Total Display - Large and Clear */}
              <div className="flex justify-between items-center text-base md:text-lg font-bold py-2">
                <span className="text-foreground">Total</span>
                <span className="text-primary text-lg md:text-xl">{formatCFA(total)}</span>
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Vente à crédit
                </Label>
                <Switch checked={isCredit} onCheckedChange={setIsCredit} />
              </div>

              {isCredit && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Client
                  </Label>
                  <Select
                    value={selectedClientId}
                    onValueChange={setSelectedClientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nom || c.name} - {c.telephone || c.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Mode de paiement</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="card">Carte bancaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Montant payé (FCFA)</Label>
                <Input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder={total.toString()}
                />
              </div>

              {paid > 0 && remaining > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reste à payer</span>
                  <span className="font-bold text-warning">
                    {formatCFA(remaining)}
                  </span>
                </div>
              )}

              <Button
                className="w-full gradient-primary text-primary-foreground shadow-glow h-10 md:h-11 text-sm md:text-base"
                onClick={handleSale}
                disabled={cart.length === 0}
                asChild={false}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Valider la vente
              </Button>
            </div>
          </Card>
        </div>
      </div>
      </div>

      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vente confirmée !</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="p-4 bg-secondary/30">
              <div className="space-y-2 text-sm">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-medium">
                      {formatCFA(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCFA(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payé</span>
                  <span className="text-success">
                    {formatCFA(paid || total)}
                  </span>
                </div>
                {remaining > 0 && (
                  <div className="flex justify-between">
                    <span>Reste (crédit)</span>
                    <span className="text-warning">{formatCFA(remaining)}</span>
                  </div>
                )}
                {selectedClient && (
                  <div className="flex justify-between">
                    <span>Client</span>
                    <span>{selectedClient.nom || selectedClient.name}</span>
                  </div>
                )}
              </div>
            </Card>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={downloadReceipt}
                asChild={false}
              >
                <Printer className="w-4 h-4 mr-2" />
                Télécharger reçu
              </Button>
              <Button
                className="flex-1 gradient-primary text-primary-foreground"
                onClick={finalizeSale}
                asChild={false}
              >
                Terminer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
