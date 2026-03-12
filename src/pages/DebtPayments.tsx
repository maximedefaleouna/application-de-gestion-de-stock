import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { DollarSign, User, CheckCircle2, AlertCircle, Search, Eye } from "lucide-react";
import { paiementCreditService, clientService } from "@/services/api.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const formatCFA = (amount: number) => amount.toLocaleString("fr-FR") + " F";

interface ClientDebt {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  totalDette: number;
  nombreVentesEnCours: number;
}

interface SaleDebt {
  id: string;
  venteNumber?: number;
  formattedVenteNumber?: string;
  montantTotal: number;
  montantPaye: number;
  montantRestant: number;
  statut: string;
  createdAt: string;
  articles: any[];
}

export default function DebtPayments() {
  const navigate = useNavigate();
  const [clientsWithDebts, setClientsWithDebts] = useState<ClientDebt[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientDebt | null>(null);
  const [clientDebts, setClientDebts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleDebt | null>(null);
  const [paymentData, setPaymentData] = useState({
    montant: "",
    modePaiement: "espece" as const,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAllDebts();
  }, []);

  const loadAllDebts = async () => {
    try {
      setIsLoading(true);
      const response = await paiementCreditService.getAllDebts();
      setClientsWithDebts(response.data || []);
    } catch (error) {
      console.error("Erreur chargement dettes:", error);
      toast.error("Erreur de chargement des dettes");
    } finally {
      setIsLoading(false);
    }
  };

  const loadClientDebts = async (clientId: string) => {
    try {
      const response = await paiementCreditService.getClientDebts(clientId);
      setClientDebts(response.data);
    } catch (error) {
      console.error("Erreur chargement dettes client:", error);
      toast.error("Erreur de chargement des dettes du client");
    }
  };

  const handleClientSelect = (client: ClientDebt) => {
    // Navigate to detailed client page
    navigate(`/client-debt-detail/${client.id}`);
  };

  const handleOpenPaymentDialog = (sale: SaleDebt) => {
    setSelectedSale(sale);
    setPaymentData({
      montant: sale.montantRestant.toString(),
      modePaiement: "espece",
    });
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedSale || !selectedClient) return;

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
        clientId: selectedClient.id,
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
      loadClientDebts(selectedClient.id);
      loadAllDebts();
    } catch (error: any) {
      console.error("Erreur paiement:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors du paiement"
      );
    }
  };

  const filteredClients = clientsWithDebts.filter((client) =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone.includes(searchTerm)
  );

  return (
    <AdminLayout
      title="Paiement de Dettes"
      subtitle="Gérer les paiements partiels ou totaux des crédits clients"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des clients avec dettes */}
        <Card className="p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Clients endettés ({clientsWithDebts.length})
          </h3>

          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chargement...
              </p>
            ) : filteredClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun client endetté
              </p>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleClientSelect(client)}
                  className={`w-full p-4 rounded-lg border text-left transition-all group ${
                    selectedClient?.id === client.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{client.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.telephone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        {formatCFA(client.totalDette)}
                      </Badge>
                      <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{client.nombreVentesEnCours} vente(s) en cours</span>
                    <span className="text-primary">Voir détails →</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Détails des dettes du client */}
        <Card className="p-6 lg:col-span-2">
          {!selectedClient ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <DollarSign className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Sélectionnez un client
              </h3>
              <p className="text-sm text-muted-foreground">
                Choisissez un client dans la liste pour voir ses dettes
              </p>
            </div>
          ) : clientDebts ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold">{clientDebts.client.nom}</h3>
                  <p className="text-sm text-muted-foreground">
                    {clientDebts.client.telephone} •{" "}
                    {clientDebts.client.email || "Pas d'email"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total à payer</p>
                  <p className="text-2xl font-bold text-destructive">
                    {formatCFA(clientDebts.client.resteAPayer)}
                  </p>
                </div>
              </div>

              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Ventes en crédit ({clientDebts.ventes.length})
              </h4>

              <div className="space-y-4 mb-6">
                {clientDebts.ventes.map((vente: SaleDebt) => (
                  <div
                    key={vente.id}
                    className="border rounded-lg p-4 bg-card"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium mb-1">
                          Vente #{vente.formattedVenteNumber || `V-${String(vente.venteNumber || 0).padStart(7, '0')}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(vente.createdAt), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            vente.statut === "completee"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {vente.statut === "completee" ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : null}
                          {vente.statut}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium">
                          {formatCFA(vente.montantTotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Déjà payé</p>
                        <p className="font-medium text-success">
                          {formatCFA(vente.montantPaye)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reste à payer</p>
                        <p className="font-medium text-destructive">
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
                        Payer cette dette
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {clientDebts.paiements.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Historique des paiements ({clientDebts.paiements.length})
                  </h4>

                  <div className="space-y-2">
                    {clientDebts.paiements.map((paiement: any) => (
                      <div
                        key={paiement.id}
                        className="flex justify-between items-center p-3 bg-secondary/50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {formatCFA(paiement.montant)} -{" "}
                            {paiement.modePaiement}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(paiement.date), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          Reste: {formatCFA(paiement.vente.resteApresPaiement)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          )}
        </Card>
      </div>

      {/* Dialog de paiement */}
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
