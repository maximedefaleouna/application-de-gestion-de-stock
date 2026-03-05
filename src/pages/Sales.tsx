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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockSales } from "@/data/mockData";
import { Sale, SaleStatus } from "@/types";
import { Search, Filter, MoreHorizontal, Eye, Printer, Trash2, Download, Clock, CreditCard, ShoppingCart, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

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

  const generateReceipt = async (sale: Sale, action: 'download' | 'print' = 'download') => {
    try {
      if (action === 'print') {
        toast.info("Préparation de l'impression...");
        
        // Create receipt HTML with images - COMPACT & PROFESSIONAL
        const receiptContent = `
          <div id="receipt-content" style="padding: 15px; font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: white;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 15px; border-bottom: 3px solid #007bff; padding-bottom: 10px;">
              <h1 style="font-size: 22px; margin: 0 0 5px 0; color: #007bff; font-weight: bold;">AUTOPIECES+</h1>
              <p style="margin: 0; font-size: 14px; color: #666;">Reçu de vente</p>
            </div>
            
            <!-- Info Section -->
            <div style="margin-bottom: 15px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #666;">N°:</span>
                <span style="font-family: monospace; font-weight: bold; color: #333;">${sale.id}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #666;">Date:</span>
                <span style="color: #333;">${format(sale.createdAt, "dd/MM/yyyy à HH:mm")}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #666;">Vendeur:</span>
                <span style="color: #333;">${sale.seller}</span>
              </div>
              ${sale.clientName ? `
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #666;">Client:</span>
                <span style="color: #333;">${sale.clientName}</span>
              </div>
              ` : ''}
            </div>
            
            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px;">
              <thead>
                <tr style="background: #007bff; color: white; font-weight: bold;">
                  <th style="padding: 8px 6px; text-align: left; width: 45px;">Img</th>
                  <th style="padding: 8px 6px; text-align: left;">Article</th>
                  <th style="padding: 8px 6px; text-align: center;">Qté</th>
                  <th style="padding: 8px 6px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items.map((item) => `
                  <tr style="border-bottom: 1px dashed #ddd;">
                    <td style="padding: 6px;">
                      ${item.imageUrl ? 
                        `<img src="${item.imageUrl}" alt="" style="width: 35px; height: 35px; object-fit: cover; border-radius: 3px;" onerror="this.style.display='none'" />` : 
                        '<div style="width: 35px; height: 35px; background: #f0f0f0; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 16px;">📦</div>'
                      }
                    </td>
                    <td style="padding: 6px; font-weight: 500; color: #333;">
                      <div style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.productName}</div>
                    </td>
                    <td style="padding: 6px; text-align: center; color: #666;">${item.quantity}</td>
                    <td style="padding: 6px; text-align: right; font-weight: bold; color: #007bff;">${formatCFA(item.quantity * item.unitPrice)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <!-- Totals Section -->
            <div style="border-top: 2px solid #007bff; padding-top: 10px; margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 16px; font-weight: bold;">
                <span style="color: #333;">Total à payer:</span>
                <span style="color: #007bff;">${formatCFA(sale.totalAmount)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px;">
                <span style="color: #666;">Payé:</span>
                <span style="color: #333; font-weight: 500;">${formatCFA(sale.paidAmount)}</span>
              </div>
              ${sale.remainingAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px;">
                <span style="color: #666;">Reste:</span>
                <span style="color: #ffc107; font-weight: 500;">${formatCFA(sale.remainingAmount)}</span>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin: 6px 0 4px 0; font-size: 12px;">
                <span style="color: #666;">Paiement:</span>
                <span style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; color: #333; text-transform: capitalize;">${paymentLabels[sale.paymentMethod]}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 12px;">
                <span style="color: #666;">Statut:</span>
                <span style="background: ${sale.status === 'completed' ? '#d4edda' : sale.status === 'credit' ? '#fff3cd' : '#d1ecf1'}; padding: 2px 6px; border-radius: 3px; color: ${sale.status === 'completed' ? '#155724' : sale.status === 'credit' ? '#856404' : '#0c5460'}; text-transform: capitalize;">${statusConfig[sale.status].label}</span>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 15px; padding-top: 12px; border-top: 2px dashed #ccc;">
              <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 600; color: #333;">Merci de votre confiance !</p>
              <p style="margin: 0; font-size: 10px; color: #999;">Ce reçu fait office de facture et de garantie</p>
            </div>
          </div>
        `;
        
        // Open print window in same tab
        const printWindow = window.open('', '_self');
        if (printWindow) {
          // Replace content with receipt for printing
          document.documentElement.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Reçu ${sale.id}</title>
              <style>
                @media print {
                  body { margin: 0; padding: 10px; }
                  .no-print { display: none; }
                  @page { margin: 1cm; }
                }
                body { 
                  font-family: Arial, sans-serif; 
                  background: white;
                }
                .actions-bar {
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  background: #f8f9fa;
                  padding: 10px;
                  border-bottom: 2px solid #dee2e6;
                  display: flex;
                  gap: 10px;
                  justify-content: center;
                  z-index: 1000;
                }
                .btn {
                  padding: 8px 16px;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 500;
                  text-decoration: none;
                  display: inline-flex;
                  align-items: center;
                  gap: 5px;
                }
                .btn-primary {
                  background: #007bff;
                  color: white;
                }
                .btn-secondary {
                  background: #6c757d;
                  color: white;
                }
                .btn:hover {
                  opacity: 0.9;
                }
                .print-content {
                  margin-top: 60px;
                }
                @media print {
                  .actions-bar { display: none; }
                  .print-content { margin-top: 0; }
                }
              </style>
            </head>
            <body>
              <div class="actions-bar no-print">
                <button class="btn btn-primary" onclick="window.print()">
                  🖨️ Imprimer
                </button>
                <button class="btn btn-secondary" onclick="window.location.href='/sales'">
                  ⬅️ Retour aux ventes
                </button>
              </div>
              <div class="print-content">
                ${receiptContent}
              </div>
              <script>
                // Auto-print after a short delay
                setTimeout(function() {
                  window.print();
                }, 500);
              </script>
            </body>
            </html>
          `;
          document.close();
        }
      } else {
        // Download as PDF
        toast.info("Génération du PDF en cours...");
        
        // Create receipt HTML - COMPACT VERSION WITH IMAGES
        const receiptContent = `
          <div id="receipt-content" style="padding: 15px; font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: white;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 15px; border-bottom: 3px solid #007bff; padding-bottom: 10px;">
              <h1 style="font-size: 22px; margin: 0 0 5px 0; color: #007bff; font-weight: bold;">AUTOPIECES+</h1>
              <p style="margin: 0; font-size: 14px; color: #666;">Reçu de vente</p>
            </div>
            
            <!-- Info Section -->
            <div style="margin-bottom: 15px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #666;">N°:</span>
                <span style="font-family: monospace; font-weight: bold; color: #333;">${sale.id}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #666;">Date:</span>
                <span style="color: #333;">${format(sale.createdAt, "dd/MM/yyyy à HH:mm")}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #666;">Vendeur:</span>
                <span style="color: #333;">${sale.seller}</span>
              </div>
              ${sale.clientName ? `
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #666;">Client:</span>
                <span style="color: #333;">${sale.clientName}</span>
              </div>
              ` : ''}
            </div>
            
            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px;">
              <thead>
                <tr style="background: #007bff; color: white; font-weight: bold;">
                  <th style="padding: 8px 6px; text-align: left; width: 45px;">Img</th>
                  <th style="padding: 8px 6px; text-align: left;">Article</th>
                  <th style="padding: 8px 6px; text-align: center;">Qté</th>
                  <th style="padding: 8px 6px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items.map((item) => `
                  <tr style="border-bottom: 1px dashed #ddd;">
                    <td style="padding: 6px;">
                      ${item.imageUrl ? 
                        `<img src="${item.imageUrl}" alt="" style="width: 35px; height: 35px; object-fit: cover; border-radius: 3px;" onerror="this.style.display='none'" />` : 
                        '<div style="width: 35px; height: 35px; background: #f0f0f0; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 16px;">📦</div>'
                      }
                    </td>
                    <td style="padding: 6px; font-weight: 500; color: #333;">
                      <div style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.productName}</div>
                    </td>
                    <td style="padding: 6px; text-align: center; color: #666;">${item.quantity}</td>
                    <td style="padding: 6px; text-align: right; font-weight: bold; color: #007bff;">${formatCFA(item.quantity * item.unitPrice)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <!-- Totals Section -->
            <div style="border-top: 2px solid #007bff; padding-top: 10px; margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 16px; font-weight: bold;">
                <span style="color: #333;">Total à payer:</span>
                <span style="color: #007bff;">${formatCFA(sale.totalAmount)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px;">
                <span style="color: #666;">Payé:</span>
                <span style="color: #333; font-weight: 500;">${formatCFA(sale.paidAmount)}</span>
              </div>
              ${sale.remainingAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px;">
                <span style="color: #666;">Reste:</span>
                <span style="color: #ffc107; font-weight: 500;">${formatCFA(sale.remainingAmount)}</span>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin: 6px 0 4px 0; font-size: 12px;">
                <span style="color: #666;">Paiement:</span>
                <span style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; color: #333; text-transform: capitalize;">${paymentLabels[sale.paymentMethod]}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 12px;">
                <span style="color: #666;">Statut:</span>
                <span style="background: ${sale.status === 'completed' ? '#d4edda' : sale.status === 'credit' ? '#fff3cd' : '#d1ecf1'}; padding: 2px 6px; border-radius: 3px; color: ${sale.status === 'completed' ? '#155724' : sale.status === 'credit' ? '#856404' : '#0c5460'}; text-transform: capitalize;">${statusConfig[sale.status].label}</span>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 15px; padding-top: 12px; border-top: 2px dashed #ccc;">
              <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 600; color: #333;">Merci de votre confiance !</p>
              <p style="margin: 0; font-size: 10px; color: #999;">Ce reçu fait office de facture et de garantie</p>
            </div>
          </div>
        `;
        
        // Create temporary container
        const container = document.createElement('div');
        container.innerHTML = receiptContent;
        document.body.appendChild(container);
        
        try {
          // Generate PDF
          await html2pdf().set({
            margin: 0,
            filename: `Recu_${sale.id}_${format(sale.createdAt, 'yyyy-MM-dd')}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { 
              scale: 2,
              useCORS: true,
              letterRendering: true,
              allowTaint: false
            },
            jsPDF: { 
              unit: 'mm', 
              format: 'a4', 
              orientation: 'portrait' as const
            }
          }).from(container).save();
          
          toast.success("PDF généré avec succès !");
        } catch (error) {
          console.error('Erreur lors de la génération PDF:', error);
          toast.error("Erreur lors de la génération du PDF");
        } finally {
          // Remove temporary container
          document.body.removeChild(container);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Une erreur est survenue");
    }
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
                      <DropdownMenuItem onClick={() => generateReceipt(sale, 'download')}>
                        <Download className="w-4 h-4 mr-2" />Télécharger PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generateReceipt(sale, 'print')}>
                        <Printer className="w-4 h-4 mr-2" />Imprimer
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
              <Button className="w-full" onClick={() => generateReceipt(selectedSale, 'download')}>
                <Download className="w-4 h-4 mr-2" />Télécharger le reçu (PDF)
              </Button>
              <Button variant="outline" className="w-full mt-2" onClick={() => generateReceipt(selectedSale, 'print')}>
                <Printer className="w-4 h-4 mr-2" />Imprimer le reçu
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
