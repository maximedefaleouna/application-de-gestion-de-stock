import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { mockSales } from "@/data/mockData";
import { Sale, SaleStatus } from "@/types";
import { Search, Filter, MoreHorizontal, Eye, Printer, Trash2, Download, Clock, CreditCard, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<SaleStatus, { label: string; variant: "default" | "success" | "warning" | "info" | "destructive" | "pending" }> = {
  completed: { label: "Payé", variant: "success" },
  credit: { label: "Crédit", variant: "warning" },
  partial: { label: "Partiel", variant: "info" },
  cancelled: { label: "Annulé", variant: "destructive" },
};

const paymentLabels: Record<string, string> = {
  cash: 'Espèces',
  mobile_money: 'Mobile Money',
  card: 'Carte',
  credit: 'Crédit',
};

const formatCFA = (amount: number) => amount.toLocaleString('fr-FR') + ' F';

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const navigate = useNavigate();

  const filteredSales = mockSales.filter((sale) => {
    const matchesSearch =
      (sale.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generateReceipt = (sale: Sale) => {
    const receiptContent = `
═══════════════════════════════════
       AUTOPIECES+ 
       Reçu de vente
═══════════════════════════════════
N° : ${sale.id}
Date : ${format(sale.createdAt, "dd/MM/yyyy HH:mm")}
Vendeur : ${sale.seller}
───────────────────────────────────
${sale.items.map(item => `${item.productName}
  ${item.quantity} x ${formatCFA(item.unitPrice)} = ${formatCFA(item.quantity * item.unitPrice)}`).join('\n')}
───────────────────────────────────
TOTAL : ${formatCFA(sale.totalAmount)}
Payé  : ${formatCFA(sale.paidAmount)}
${sale.remainingAmount > 0 ? `Reste  : ${formatCFA(sale.remainingAmount)}` : ''}
Mode  : ${paymentLabels[sale.paymentMethod]}
${sale.clientName ? `Client : ${sale.clientName}` : ''}
${sale.clientPhone ? `Tél    : ${sale.clientPhone}` : ''}
═══════════════════════════════════
    Merci de votre confiance !
═══════════════════════════════════`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recu-${sale.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Historique des Ventes" subtitle="Consultez et gérez toutes les ventes">
      {/* Filters */}
      <div className="bg-card rounded-xl border shadow-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher par client ou N° vente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
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
          <Button variant="outline" onClick={() => navigate('/pos')}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Nouvelle vente
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Sales Table */}
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
            {filteredSales.map((sale, index) => (
              <TableRow
                key={sale.id}
                className="animate-fade-in cursor-pointer hover:bg-secondary/30"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <TableCell><span className="font-semibold text-foreground">{sale.id}</span></TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{sale.clientName || 'Comptoir'}</p>
                    {sale.clientPhone && (
                      <p className="text-xs text-muted-foreground">{sale.clientPhone}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {sale.items.map((item, i) => (
                      <span key={i}>
                        {item.quantity}x {item.productName}
                        {i < sale.items.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell><span className="font-semibold text-foreground">{formatCFA(sale.totalAmount)}</span></TableCell>
                <TableCell>
                  <span className={sale.remainingAmount > 0 ? "text-warning font-medium" : "text-success font-medium"}>
                    {formatCFA(sale.paidAmount)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[sale.status].variant}>
                    {statusConfig[sale.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="text-foreground">{format(sale.createdAt, "dd MMM yyyy", { locale: fr })}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(sale.createdAt, "HH:mm")}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedSale(sale)}>
                        <Eye className="w-4 h-4 mr-2" />Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generateReceipt(sale)}>
                        <Printer className="w-4 h-4 mr-2" />Télécharger reçu
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />Annuler
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Sale Details Modal */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails vente {selectedSale?.id}</DialogTitle>
            <DialogDescription>Informations complètes de la vente</DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedSale.clientName || 'Comptoir'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={statusConfig[selectedSale.status].variant}>
                    {statusConfig[selectedSale.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paiement</p>
                  <p className="font-medium">{paymentLabels[selectedSale.paymentMethod]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendeur</p>
                  <p className="font-medium">{selectedSale.seller}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Articles</p>
                <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                  {selectedSale.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.quantity}x {item.productName}</span>
                      <span className="font-medium">{formatCFA(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between"><span>Total</span><span className="font-bold text-primary">{formatCFA(selectedSale.totalAmount)}</span></div>
                <div className="flex justify-between"><span>Payé</span><span className="font-medium text-success">{formatCFA(selectedSale.paidAmount)}</span></div>
                {selectedSale.remainingAmount > 0 && (
                  <div className="flex justify-between"><span>Reste à payer</span><span className="font-bold text-warning">{formatCFA(selectedSale.remainingAmount)}</span></div>
                )}
              </div>
              <Button className="w-full" onClick={() => generateReceipt(selectedSale)}>
                <Printer className="w-4 h-4 mr-2" />Télécharger le reçu
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
