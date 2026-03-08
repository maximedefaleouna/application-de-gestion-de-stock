import { useEffect, useMemo, useState } from "react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Plus,
  Search,
  Phone,
  MapPin,
  CreditCard,
  User,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { clientService, venteService } from "@/services/api.service";
import { toast } from "sonner";

const formatCFA = (amount: number) => amount.toLocaleString("fr-FR") + " F";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [phone, setPhone] = useState<string | undefined>("+228");
  const [phoneError, setPhoneError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const loadData = async () => {
    try {
      const [clientsRes, salesRes] = await Promise.all([
        clientService.getAll(),
        venteService.getAll(),
      ]);
      setClients(clientsRes.data || []);
      setSales(salesRes.data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur de chargement des clients",
      );
      setClients([]);
      setSales([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm),
  );

  const totalCreditsEnCours = useMemo(
    () => clients.reduce((acc, c) => acc + (c.totalCredit - c.totalPaid), 0),
    [clients],
  );
  const clientsAvecCredit = useMemo(
    () => clients.filter((c) => c.totalCredit - c.totalPaid > 0).length,
    [clients],
  );

  const getClientSales = (clientId: string) =>
    sales.filter((s) => s.clientId === clientId);

  const validatePhone = (value: string | undefined) => {
    if (!value) {
      setPhoneError("Le num�ro de t�l�phone est requis");
      return false;
    }

    const phoneRegex = /^\+[1-9]\d{1,3}\d{6,14}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ""))) {
      setPhoneError("Numéro de téléphone invalide. Exemple: +22877123456");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const handleSaveClient = async () => {
    if (!formData.name.trim()) {
      toast.error("Le nom du client est requis");
      return;
    }

    if (!validatePhone(phone)) {
      return;
    }

    try {
      await clientService.create({
        name: formData.name.trim(),
        phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
      });
      toast.success("Client créé avec success");
      setFormData({ name: "", email: "", address: "" });
      setPhone("+228");
      setIsAddDialogOpen(false);
      await loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur lors de la cr�ation du client",
      );
    }
  };

  return (
    <AdminLayout
      title="Clients & crédits"
      subtitle="Gérez vos clients et suivez les crédits en cours"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {clients.length}
            </p>
            <p className="text-xs text-muted-foreground">Total clients</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {clientsAvecCredit}
            </p>
            <p className="text-xs text-muted-foreground">Avec cr�dit</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatCFA(totalCreditsEnCours)}
            </p>
            <p className="text-xs text-muted-foreground">Cr�dits en cours</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatCFA(clients.reduce((acc, c) => acc + c.totalPaid, 0))}
            </p>
            <p className="text-xs text-muted-foreground">Total recouvr�</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou t�l�phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gradient-primary text-primary-foreground shadow-glow"
              asChild={false}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
              <DialogDescription>
                Enregistrez un nouveau client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  T�l�phone <span className="text-destructive">*</span>
                </Label>
                <PhoneInput
                  value={phone}
                  onChange={(v) => {
                    setPhone(v);
                    if (v) setPhoneError("");
                  }}
                  defaultCountry="TG"
                  error={false}
                />
                {phoneError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {phoneError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email (optionnel)</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                asChild={false}
              >
                Annuler
              </Button>
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={handleSaveClient}
                asChild={false}
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Total cr�dit</TableHead>
              <TableHead>Pay�</TableHead>
              <TableHead>Reste � payer</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client, index) => {
              const remaining = client.totalCredit - client.totalPaid;
              return (
                <TableRow
                  key={client.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {client.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Depuis{" "}
                          {format(client.createdAt, "MMM yyyy", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </p>
                      {client.address && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {client.address}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCFA(client.totalCredit)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-success font-medium">
                      {formatCFA(client.totalPaid)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-bold ${remaining > 0 ? "text-destructive" : "text-success"}`}
                    >
                      {formatCFA(remaining)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {remaining === 0 ? (
                      <Badge variant="success">Sold�</Badge>
                    ) : remaining > 100000 ? (
                      <Badge variant="destructive">Cr�dit �lev�</Badge>
                    ) : (
                      <Badge variant="warning">Cr�dit</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedClient(client)}
                      asChild={false}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      D�tails
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedClient}
        onOpenChange={() => setSelectedClient(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fiche client - {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">T�l�phone</p>
                  <p className="font-medium">{selectedClient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{selectedClient.address || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total cr�dit</p>
                  <p className="text-lg font-bold">
                    {formatCFA(selectedClient.totalCredit)}
                  </p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Pay�</p>
                  <p className="text-lg font-bold text-success">
                    {formatCFA(selectedClient.totalPaid)}
                  </p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Reste</p>
                  <p className="text-lg font-bold text-destructive">
                    {formatCFA(
                      selectedClient.totalCredit - selectedClient.totalPaid,
                    )}
                  </p>
                </Card>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ventes associ�es</h4>
                <div className="space-y-2">
                  {getClientSales(selectedClient.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Aucune vente enregistr�e
                    </p>
                  ) : (
                    getClientSales(selectedClient.id).map((sale: any) => (
                      <div
                        key={sale.id}
                        className="flex justify-between items-center p-2 rounded bg-secondary/30"
                      >
                        <div>
                          <span className="font-medium text-sm">{sale.id}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {format(new Date(sale.createdAt), "dd/MM/yyyy", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {formatCFA(sale.totalAmount)}
                          </p>
                          {sale.remainingAmount > 0 && (
                            <p className="text-xs text-warning">
                              Reste: {formatCFA(sale.remainingAmount)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
