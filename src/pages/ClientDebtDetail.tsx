import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CreditCard,
} from "lucide-react";
import { paiementCreditService } from "@/services/api.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const formatCFA = (amount: number) => amount.toLocaleString("fr-FR") + " F";

interface ClientInfo {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  adresse?: string;
  totalCredit: number;
  totalPaye: number;
  resteAPayer: number;
}

interface Sale {
  id: string;
  venteNumber?: number;
  formattedVenteNumber?: string;
  montantTotal: number;
  montantPaye: number;
  montantRestant: number;
  statut: string;
  createdAt: string;
  dateEcheance?: string;
  estEchu?: boolean;
  joursRetard?: number;
  articles: Array<{
    produit: string;
    reference: string;
    quantite: number;
    prixUnitaire: number;
  }>;
}

interface Payment {
  id: string;
  montant: number;
  modePaiement: string;
  date: string;
  vente: {
    id: string;
    venteNumber?: number;
    formattedVenteNumber?: string;
    resteApresPaiement: number;
  };
}

export default function ClientDebtDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [ventes, setVentes] = useState<Sale[]>([]);
  const [paiements, setPaiements] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [paymentData, setPaymentData] = useState({
    montant: "",
    modePaiement: "espece" as const,
  });
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (clientId) {
      loadClientDetails(clientId);
    }
  }, [clientId]);

  const loadClientDetails = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await paiementCreditService.getClientDebts(id);
      const data = response.data;
      
      setClientInfo(data.client);
      setVentes(data.ventes);
      setPaiements(data.paiements);
    } catch (error) {
      console.error("Erreur chargement détails client:", error);
      toast.error("Erreur de chargement des informations du client");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPaymentDialog = (sale: Sale) => {
    setSelectedSale(sale);
    setPaymentData({
      montant: sale.montantRestant.toString(),
      modePaiement: "espece",
    });
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedSale || !clientInfo) return;

    const montant = parseFloat(paymentData.montant);
    if (isNaN(montant) || montant <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (montant > selectedSale.montantRestant) {
      toast.error("Le montant ne peut pas dépasser le reste dû");
      return;
    }

    try {
      await paiementCreditService.createPayment({
        clientId: clientInfo.id,
        venteId: selectedSale.id,
        montant: montant,
        modePaiement: paymentData.modePaiement,
      });

      toast.success(
        montant >= selectedSale.montantRestant
          ? "Dette entièrement payée !"
          : "Paiement partiel enregistré"
      );

      setIsPaymentDialogOpen(false);
      loadClientDetails(clientInfo.id);
    } catch (error: any) {
      console.error("Erreur paiement:", error);
      toast.error(error.response?.data?.error || "Erreur lors du paiement");
    }
  };

  const filteredVentes = ventes.filter((vente) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return vente.montantRestant > 0;
    if (filterStatus === "completed") return vente.statut === "completee";
    return true;
  });

  const totalEnCours = ventes.reduce(
    (sum, v) => sum + v.montantRestant,
    0
  );

  const totalPaye = paiements.reduce((sum, p) => sum + p.montant, 0);

  if (isLoading) {
    return (
      <AdminLayout title="Détails du Client" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!clientInfo) {
    return (
      <AdminLayout title="Client non trouvé" subtitle="">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="w-16 h-16 text-destructive" />
          <p className="text-lg font-medium">Client introuvable</p>
          <Button onClick={() => navigate("/debt-payments")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux dettes
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title=""
      subtitle=""
    >
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/debt-payments")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Client Info Card */}
        <Card className="p-6 gradient-warm border-primary/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                <span className="text-2xl font-bold text-primary-foreground">
                  {clientInfo.nom.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{clientInfo.nom}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  <span>{clientInfo.telephone}</span>
                  {clientInfo.email && <span>• {clientInfo.email}</span>}
                  {clientInfo.adresse && <span>• {clientInfo.adresse}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 lg:text-right">
              <div>
                <p className="text-xs text-muted-foreground">Total crédits</p>
                <p className="text-lg font-semibold text-destructive">
                  {formatCFA(clientInfo.totalCredit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Déjà payé</p>
                <p className="text-lg font-semibold text-success">
                  {formatCFA(clientInfo.totalPaye)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reste à payer</p>
                <p className="text-lg font-bold text-destructive">
                  {formatCFA(clientInfo.resteAPayer)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ventes en cours</p>
              <p className="text-xl font-bold">
                {ventes.filter((v) => v.montantRestant > 0).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${
          ventes.some(v => v.estEchu) ? 'bg-destructive/10 border-destructive/50' : ''
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Crédits échus</p>
              <p className="text-xl font-bold text-destructive">
                {ventes.filter((v) => v.estEchu).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ventes soldées</p>
              <p className="text-xl font-bold">
                {ventes.filter((v) => v.statut === "completee").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total payé</p>
              <p className="text-xl font-bold text-success">
                {formatCFA(totalPaye)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventes Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Achats à crédit ({ventes.length})
            </h3>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="pending">En cours</SelectItem>
                <SelectItem value="completed">Soldées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredVentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun achat à crédit
              </p>
            ) : (
              filteredVentes.map((vente) => (
                <div
                  key={vente.id}
                  className={`border rounded-lg p-4 bg-card hover:border-primary/50 transition-all ${
                    vente.estEchu ? 'border-destructive border-2 bg-destructive/5' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          Vente #{vente.formattedVenteNumber || `V-${String(vente.venteNumber).padStart(7, '0')}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(vente.createdAt), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                        {vente.dateEcheance && (
                          <p className={`text-xs mt-1 flex items-center gap-1 ${
                            vente.estEchu ? 'text-destructive font-semibold' : 'text-muted-foreground'
                          }`}>
                            {vente.estEchu ? (
                              <AlertCircle className="w-3 h-3" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Échéance: {format(new Date(vente.dateEcheance), "dd/MM/yyyy", { locale: fr })}
                            {vente.estEchu && vente.joursRetard && vente.joursRetard > 0 && (
                              <span className="text-destructive font-bold ml-1">
                                ({vente.joursRetard} j de retard)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {vente.estEchu && (
                        <Badge variant="destructive" className="animate-pulse">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Retard
                        </Badge>
                      )}
                      <Badge
                        variant={
                          vente.statut === "completee" ? "default" : "destructive"
                        }
                      >
                        {vente.statut === "completee" ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : null}
                        {vente.statut}
                      </Badge>
                    </div>
                  </div>

                  {/* Articles */}
                  <div className="mb-3 space-y-1">
                    {vente.articles.map((article, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-muted-foreground flex justify-between"
                      >
                        <span>
                          {article.produit} ({article.reference}) -{" "}
                          {article.quantite} x {formatCFA(article.prixUnitaire)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Details */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold">
                        {formatCFA(vente.montantTotal)}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-success/10 rounded">
                      <p className="text-xs text-muted-foreground">Payé</p>
                      <p className="font-semibold text-success">
                        {formatCFA(vente.montantPaye)}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-destructive/10 rounded">
                      <p className="text-xs text-muted-foreground">Reste</p>
                      <p className="font-semibold text-destructive">
                        {formatCFA(vente.montantRestant)}
                      </p>
                    </div>
                  </div>

                  {vente.montantRestant > 0 && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenPaymentDialog(vente)}
                      className="w-full"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Effectuer un paiement
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Paiements Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Historique des paiements ({paiements.length})
            </h3>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {paiements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun paiement enregistré
              </p>
            ) : (
              paiements.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 bg-card hover:border-success/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold text-success">
                          {formatCFA(payment.montant)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.modePaiement}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.date), "dd/MM/yyyy HH:mm")}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        Reste: {formatCFA(payment.vente.resteApresPaiement)}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                    Paiement pour la vente #{payment.vente.formattedVenteNumber || `V-${String(payment.vente.venteNumber).padStart(7, '0')}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Effectuer un paiement</DialogTitle>
            <DialogDescription>
              Paiement partiel ou total pour la vente #{selectedSale?.formattedVenteNumber || `V-${String(selectedSale?.venteNumber || 0).padStart(7, '0')}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="text-lg font-semibold">
                  {selectedSale && formatCFA(selectedSale.montantTotal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Déjà payé</p>
                <p className="text-lg font-semibold text-success">
                  {selectedSale && formatCFA(selectedSale.montantPaye)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Reste à payer</p>
              <p className="text-2xl font-bold text-destructive">
                {selectedSale && formatCFA(selectedSale.montantRestant)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant">Montant du paiement</Label>
              <Input
                id="montant"
                type="number"
                value={paymentData.montant}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, montant: e.target.value })
                }
                placeholder="Entrez le montant"
              />
              <p className="text-xs text-muted-foreground">
                Laissez le montant actuel pour un paiement total, ou réduisez-le pour un paiement partiel
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modePaiement">Mode de paiement</Label>
              <Select
                value={paymentData.modePaiement}
                onValueChange={(value: any) =>
                  setPaymentData({ ...paymentData, modePaiement: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="espece">Espèces</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="carte">Carte</SelectItem>
                  <SelectItem value="credit">Crédit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handlePaymentSubmit}>
              Confirmer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
