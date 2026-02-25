import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { mockProducts, mockClients } from "@/data/mockData";
import { SaleItem } from "@/types";
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer, CreditCard, User } from "lucide-react";
import { toast } from "sonner";

const formatCFA = (amount: number) => amount.toLocaleString('fr-FR') + ' F';

export default function POS() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isCredit, setIsCredit] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const filteredProducts = mockProducts.filter((p) =>
    p.available && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product: typeof mockProducts[0]) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error("Stock insuffisant !");
        return;
      }
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      if (product.stock < 1) {
        toast.error("Produit en rupture de stock !");
        return;
      }
      setCart([...cart, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.sellPrice }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = mockProducts.find(p => p.id === productId);
    setCart(cart.map(item => {
      if (item.productId !== productId) return item;
      const newQty = item.quantity + delta;
      if (newQty < 1) return item;
      if (product && newQty > product.stock) {
        toast.error("Stock insuffisant !");
        return item;
      }
      return { ...item, quantity: newQty };
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const total = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const paid = Number(paidAmount) || 0;
  const remaining = Math.max(0, total - paid);
  const selectedClient = mockClients.find(c => c.id === selectedClientId);

  const handleSale = () => {
    if (cart.length === 0) { toast.error("Le panier est vide !"); return; }
    if (!isCredit && paid < total) { toast.error("Montant payé insuffisant !"); return; }
    if (isCredit && !selectedClientId) { toast.error("Sélectionnez un client pour la vente à crédit !"); return; }
    setIsReceiptOpen(true);
  };

  const finalizeSale = () => {
    toast.success("Vente enregistrée avec succès !");
    setCart([]);
    setPaidAmount("");
    setIsCredit(false);
    setSelectedClientId("");
    setIsReceiptOpen(false);
  };

  const downloadReceipt = () => {
    const receiptContent = `
═══════════════════════════════════
       AUTOPIECES+
       Reçu de vente
═══════════════════════════════════
Date : ${new Date().toLocaleString('fr-FR')}
───────────────────────────────────
${cart.map(item => `${item.productName}
  ${item.quantity} x ${formatCFA(item.unitPrice)} = ${formatCFA(item.quantity * item.unitPrice)}`).join('\n')}
───────────────────────────────────
TOTAL : ${formatCFA(total)}
Payé  : ${formatCFA(paid)}
${remaining > 0 ? `Reste  : ${formatCFA(remaining)} (CREDIT)` : ''}
Mode  : ${paymentMethod === 'cash' ? 'Espèces' : paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Carte'}
${selectedClient ? `Client : ${selectedClient.name}\nTél    : ${selectedClient.phone}` : ''}
═══════════════════════════════════
    Merci de votre confiance !
═══════════════════════════════════`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recu-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Reçu téléchargé !");
  };

  return (
    <AdminLayout title="Point de Vente" subtitle="Effectuez une nouvelle vente">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un produit par nom ou référence..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.slice(0, 12).map((product) => (
              <Card
                key={product.id}
                className="p-3 cursor-pointer hover:shadow-lg hover:border-primary transition-all"
                onClick={() => addToCart(product)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.reference}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-primary text-sm">{formatCFA(product.sellPrice)}</span>
                      <Badge variant={product.stock <= product.minStock ? "warning" : "success"} className="text-[10px]">
                        {product.stock}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Panier</h3>
              <Badge variant="secondary" className="ml-auto">{cart.length} articles</Badge>
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Cliquez sur un produit pour l'ajouter</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{formatCFA(item.unitPrice)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-bold text-sm w-20 text-right">{formatCFA(item.unitPrice * item.quantity)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.productId)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t mt-4 pt-4 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCFA(total)}</span>
              </div>

              {/* Credit toggle */}
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Vente à crédit
                </Label>
                <Switch checked={isCredit} onCheckedChange={setIsCredit} />
              </div>

              {/* Client selection for credit */}
              {isCredit && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><User className="w-3 h-3" />Client</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner client" /></SelectTrigger>
                    <SelectContent>
                      {mockClients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Payment method */}
              <div className="space-y-2">
                <Label>Mode de paiement</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="card">Carte bancaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount paid */}
              <div className="space-y-2">
                <Label>Montant payé (FCFA)</Label>
                <Input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder={total.toString()} />
              </div>

              {paid > 0 && remaining > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reste à payer</span>
                  <span className="font-bold text-warning">{formatCFA(remaining)}</span>
                </div>
              )}

              <Button className="w-full gradient-primary text-primary-foreground shadow-glow" onClick={handleSale} disabled={cart.length === 0}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Valider la vente
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Vente confirmée !</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Card className="p-4 bg-secondary/30">
              <div className="space-y-2 text-sm">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <span>{item.quantity}x {item.productName}</span>
                    <span className="font-medium">{formatCFA(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span><span className="text-primary">{formatCFA(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payé</span><span className="text-success">{formatCFA(paid || total)}</span>
                </div>
                {remaining > 0 && (
                  <div className="flex justify-between">
                    <span>Reste (crédit)</span><span className="text-warning">{formatCFA(remaining)}</span>
                  </div>
                )}
                {selectedClient && (
                  <div className="flex justify-between">
                    <span>Client</span><span>{selectedClient.name}</span>
                  </div>
                )}
              </div>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={downloadReceipt}>
                <Printer className="w-4 h-4 mr-2" />Télécharger reçu
              </Button>
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={finalizeSale}>
                Terminer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
