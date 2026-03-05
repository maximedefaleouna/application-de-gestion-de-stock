import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Printer, Download, Share2, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import html2pdf from "html2pdf.js";

// Mock data pour le reçu
const mockReceiptData = {
  boutique: {
    nom: "Ma Boutique",
    adresse: "123 Avenue du Commerce, Ville",
    telephone: "+225 06 12 34 56 78",
    email: "contact@boutique.com",
    nif: "NIF: 123456789"
  },
  vente: {
    id: "VTE-2024-001234",
    date: new Date("2024-03-05T14:30:00"),
    vendeur: "Jean Dupont",
    caisse: "Caisse 1"
  },
  client: {
    nom: "Client de passage",
    telephone: "",
    type: "non_enregistre"
  },
  articles: [
    {
      reference: "REF-001",
      nom: "Huile Moteur 5W40",
      quantite: 2,
      prixUnitaire: 45000,
      total: 90000,
      imageUrl: "https://images.unsplash.com/photo-1562780436-a4bfa5c3e15f?w=100&h=100&fit=crop"
    },
    {
      reference: "REF-002",
      nom: "Filtre à huile",
      quantite: 1,
      prixUnitaire: 15000,
      total: 15000,
      imageUrl: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=100&h=100&fit=crop"
    },
    {
      reference: "REF-003",
      nom: "Liquide de refroidissement",
      quantite: 3,
      prixUnitaire: 8000,
      total: 24000,
      imageUrl: "https://images.unsplash.com/photo-1626847037657-fd3622613ce3?w=100&h=100&fit=crop"
    }
  ],
  paiement: {
    mode: "espece", // espece, mobile_money, carte, credit
    montantTotal: 129000,
    montantPaye: 150000,
    monnaie: 21000,
    statut: "completee" // completee, credit, partielle
  }
};

const formatCFA = (amount: number) => {
  return amount.toLocaleString('fr-FR') + ' F CFA';
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default function Receipt() {
  const [receipt] = useState(mockReceiptData);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    toast.success("Impression du reçu...");
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info("Génération du PDF en cours...");
      
      if (!receiptRef.current) {
        toast.error("Erreur: élément de reçu non trouvé");
        return;
      }

      const opt = {
        margin: 0,
        filename: `Recu_${receipt.vente.id}_${new Date().toISOString().split('T')[0]}.pdf`,
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
      };

      // Generate PDF
      await html2pdf().set(opt).from(receiptRef.current).save();
      toast.success("PDF généré avec succès!");
    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const handleShare = () => {
    toast.success("Partage du reçu (simulation)");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Actions bar */}
      <div className="max-w-md mx-auto mb-4 flex gap-2 print:hidden">
        <Button onClick={handlePrint} className="flex-1 gap-2" variant="default">
          <Printer className="w-4 h-4" />
          Imprimer
        </Button>
        <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          PDF
        </Button>
        <Button onClick={handleShare} variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Partager
        </Button>
      </div>

      {/* Reçu */}
      <Card ref={receiptRef} id="receipt-content" className="max-w-md mx-auto shadow-lg print:shadow-none print:border-0 print:max-w-none">
        <CardContent className="p-6 space-y-4">
          {/* En-tête de la boutique */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">MB</span>
            </div>
            <h1 className="text-xl font-bold">{receipt.boutique.nom}</h1>
            <p className="text-sm text-muted-foreground">{receipt.boutique.adresse}</p>
            <p className="text-xs text-muted-foreground">
              Tél: {receipt.boutique.telephone}
            </p>
            <p className="text-xs text-muted-foreground">
              Email: {receipt.boutique.email}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {receipt.boutique.nif}
            </p>
          </div>

          <Separator className="border-2 border-dashed" />

          {/* Informations de la vente */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">N° Vente:</span>
              <span className="font-mono font-semibold">{receipt.vente.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{formatDate(receipt.vente.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendeur:</span>
              <span>{receipt.vente.vendeur}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Caisse:</span>
              <span>{receipt.vente.caisse}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client:</span>
              <Badge variant={receipt.client.type === "enregistre" ? "default" : "secondary"}>
                {receipt.client.nom}
              </Badge>
            </div>
          </div>

          <Separator className="border-2 border-dashed" />

          {/* Liste des articles */}
          <div className="space-y-3">
            {receipt.articles.map((article, index) => (
              <div key={index} className="flex items-center gap-3 py-2 border-b border-dashed last:border-0">
                {/* Product Image */}
                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden print:bg-white">
                  {article.imageUrl ? (
                    <img 
                      src={article.imageUrl} 
                      alt={article.nom}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-2">{article.nom}</p>
                  <p className="text-xs text-muted-foreground font-mono">{article.reference}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">Qté: <strong>{article.quantite}</strong></span>
                    <span className="text-xs text-muted-foreground">P.U: {formatCFA(article.prixUnitaire)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-base text-primary">{formatCFA(article.total)}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="border-2 border-dashed" />

          {/* Totaux et paiement */}
          <div className="space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total à payer:</span>
              <span className="text-primary">{formatCFA(receipt.paiement.montantTotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant payé:</span>
              <span className="font-semibold">{formatCFA(receipt.paiement.montantPaye)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monnaie rendue:</span>
              <span className="font-semibold text-success">{formatCFA(receipt.paiement.monnaie)}</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Mode de paiement:</span>
              <Badge variant="outline" className="capitalize">
                {receipt.paiement.mode.replace('_', ' ')}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Statut:</span>
              <Badge 
                variant={
                  receipt.paiement.statut === "completee" 
                    ? "success" 
                    : receipt.paiement.statut === "credit"
                    ? "destructive"
                    : "warning"
                }
                className="capitalize"
              >
                {receipt.paiement.statut === "completee" && <CheckCircle className="w-3 h-3 mr-1" />}
                {receipt.paiement.statut === "credit" && <XCircle className="w-3 h-3 mr-1" />}
                {receipt.paiement.statut.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <Separator className="border-2 border-dashed" />

          {/* Pied de page */}
          <div className="text-center space-y-2 pt-2">
            <p className="text-sm font-semibold">Merci de votre achat !</p>
            <p className="text-xs text-muted-foreground">
              Ce reçu fait office de facture et de garantie
            </p>
            <p className="text-xs text-muted-foreground">
              Conservez-le précieusement
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-4">
              *** Fin du ticket ***
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="max-w-md mx-auto mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 print:hidden">
        <p className="font-semibold mb-1">ℹ️ Mode démo</p>
        <p>
          Ceci est une maquette de reçu avec des données fictives. 
          Dans la version finale, les données proviendront de l'API backend.
        </p>
      </div>
    </div>
  );
}
