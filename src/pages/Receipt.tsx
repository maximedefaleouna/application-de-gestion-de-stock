import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Printer, Download } from "lucide-react";
import html2pdf from "html2pdf.js";
import { useSearchParams } from "react-router-dom";
import { venteService, configurationService } from "@/services/api.service";

const formatCFA = (amount: number) => amount.toLocaleString("fr-FR") + " F CFA";

export default function Receipt() {
  const [searchParams] = useSearchParams();
  const [sale, setSale] = useState<any | null>(null);
  const [configuration, setConfiguration] = useState<any | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const autoActionDoneRef = useRef(false);
  const mode = searchParams.get("mode");

  useEffect(() => {
    const saleId = searchParams.get("id");
    autoActionDoneRef.current = false;
    if (!saleId) return;

    const load = async () => {
      try {
        const response = await venteService.getById(saleId);
        setSale(response.data || null);
        
        // Load configuration for shop name
        const configResponse = await configurationService.get();
        setConfiguration(configResponse.data || null);
      } catch {
        setSale(null);
      }
    };

    load();
  }, [searchParams]);

  const handlePrint = () => {
    if (!sale) return;
    toast.success("Impression du reçu...");
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!sale) return;

    try {
      toast.info("Génération du PDF en cours...");

      if (!receiptRef.current) {
        toast.error("Erreur: Élément de reçu non trouvé");
        return;
      }

      await html2pdf()
        .set({
          margin: 0,
          filename: `Recu_${sale.formattedVenteNumber || sale.id}_${new Date().toISOString().split("T")[0]}.pdf`,
          image: { type: "jpeg" as const, quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: false,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
        })
        .from(receiptRef.current)
        .save();

      toast.success("PDF généré avec succès");
    } catch {
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  useEffect(() => {
    if (!sale || autoActionDoneRef.current) return;

    if (mode === "print") {
      autoActionDoneRef.current = true;
      setTimeout(() => handlePrint(), 150);
    } else if (mode === "download") {
      autoActionDoneRef.current = true;
      setTimeout(() => {
        void handleDownloadPDF();
      }, 150);
    }
  }, [sale, mode]);

  if (!sale) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center text-muted-foreground">
            Aucun reçu à afficher. Ajoutez un identifiant de vente dans l'URL:
            `id=...`
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-md mx-auto mb-4 flex gap-2 print:hidden">
        <Button
          onClick={handlePrint}
          className="flex-1 gap-2"
          variant="default"
          asChild={false}
        >
          <Printer className="w-4 h-4" />
          Imprimer
        </Button>
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="gap-2"
          asChild={false}
        >
          <Download className="w-4 h-4" />
          PDF
        </Button>
      </div>

      <Card
        ref={receiptRef}
        id="receipt-content"
        className="max-w-md mx-auto shadow-lg print:shadow-none print:border-0 print:max-w-none"
      >
        <CardContent className="p-6 space-y-3">
          <h1 className="text-xl font-bold text-center">
            {configuration?.nom || "AUTOPIECES+"}
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Reçu de vente
          </p>
          <p className="text-sm text-muted-foreground text-center">
            N° {sale.formattedVenteNumber || sale.id}
          </p>
          {configuration && (
            <div className="text-xs text-muted-foreground text-center space-y-0.5">
              {configuration.adresse && <p>{configuration.adresse}</p>}
              {configuration.telephone && <p>Tél: {configuration.telephone}</p>}
              {configuration.email && <p>Email: {configuration.email}</p>}
            </div>
          )}
          <div className="space-y-2 pt-3 border-t">
            {(sale.items || []).map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.productName}
                </span>
                <span>{formatCFA(item.quantity * item.unitPrice)}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCFA(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Payé</span>
              <span>{formatCFA(sale.paidAmount)}</span>
            </div>
            {sale.remainingAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Reste</span>
                <span>{formatCFA(sale.remainingAmount)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
