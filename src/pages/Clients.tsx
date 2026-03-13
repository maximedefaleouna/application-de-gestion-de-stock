import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Phone, Plus, UserPlus, Mail, MapPin, Edit } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { clientService, venteService } from "@/services/api.service";
import { toast } from "sonner";

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "+228",
    email: "",
    address: "",
  });
  const [phoneError, setPhoneError] = useState("");

  const loadData = async () => {
    try {
      const [clientsRes, salesRes] = await Promise.all([
        clientService.getAll(),
        venteService.getAll(),
      ]);
      
      // Calculer les crédits pour chaque client
      const clientsData = clientsRes.data || [];
      const salesData = salesRes.data || [];
      
      const clientsWithCredits = clientsData.map((client: any) => {
        const clientSales = salesData.filter((s: any) => s.clientId === client.id);
        const totalCredit = clientSales.reduce((acc: number, sale: any) => acc + (sale.totalAmount || 0), 0);
        const totalPaid = clientSales.reduce((acc: number, sale: any) => acc + (sale.paidAmount || 0), 0);
        
        return {
          ...client,
          totalCredit,
          totalPaid,
        };
      });
      
      setClients(clientsWithCredits);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur de chargement des clients",
      );
      setClients([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validatePhone = (value: string | undefined) => {
    if (!value) {
      setPhoneError("Le numéro de téléphone est requis");
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

  const handleAddClient = async () => {
    if (!formData.name.trim()) {
      toast.error("Nom du client obligatoire !");
      return;
    }

    if (!validatePhone(formData.phone)) {
      return;
    }

    try {
      await clientService.create({
        nom: formData.name.trim(),
        telephone: formData.phone,
        email: formData.email.trim() || "",
        adresse: formData.address.trim() || "",
      });
      toast.success("Client ajouté avec succès !");
      setFormData({ name: "", phone: "+228", email: "", address: "" });
      setIsAddDialogOpen(false);
      await loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur lors de l'ajout du client",
      );
    }
  };

  const handleEditClick = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      phone: client.phone || "+228",
      email: client.email || "",
      address: client.address || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;

    if (!formData.name.trim()) {
      toast.error("Nom du client obligatoire !");
      return;
    }

    if (!validatePhone(formData.phone)) {
      return;
    }

    try {
      await clientService.update(editingClient.id, {
        nom: formData.name.trim(),
        telephone: formData.phone,
        email: formData.email.trim() || "",
        adresse: formData.address.trim() || "",
      });
      toast.success("Client modifié avec succès !");
      setIsEditDialogOpen(false);
      setEditingClient(null);
      await loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur lors de la modification du client",
      );
    }
  };

  const formatCFA = (amount: number) => amount.toLocaleString("fr-FR") + " F";

  return (
    <AdminLayout
      title="Clients"
      subtitle="Liste des clients et leurs crédits en cours"
    >
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <Button 
          className="gradient-primary text-primary-foreground shadow-glow" 
          onClick={() => setIsAddDialogOpen(true)}
          asChild={false}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      {/* Responsive Table */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Crédit en cours</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client, index) => {
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
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.email ? (
                      <p className="text-sm flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.address ? (
                      <p className="text-sm flex items-center gap-1 text-muted-foreground max-w-[200px] truncate">
                        <MapPin className="w-3 h-3" />
                        {client.address}
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
                      <Badge variant="success">Soldé</Badge>
                    ) : (
                      <Badge variant="destructive">En cours</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(client)}
                      asChild={false}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Nouveau client
            </DialogTitle>
            <DialogDescription>Ajoutez un nouveau client au système</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Nom du client</Label>
              <Input
                id="client-name"
               placeholder="Ex: Jean Kouassi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAddClient()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Téléphone</Label>
              <PhoneInput
                id="client-phone"
            placeholder="Ex: +22877123456"
                value={formData.phone}
                onChange={(value) => {
                  setFormData({ ...formData, phone: value });
                  if (value) validatePhone(value);
                }}
                defaultCountry="TG"
                error={!!phoneError}
              />
              {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
               placeholder="Ex: client@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-address">Adresse</Label>
              <Input
                id="client-address"
               placeholder="Ex: Lomé, Quartier Nyékonakpoè"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} asChild={false}>
              Annuler
            </Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleAddClient} asChild={false}>
              Ajouter le client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Modifier le client
            </DialogTitle>
            <DialogDescription>Modifiez les informations du client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-client-name">Nom du client</Label>
              <Input
                id="edit-client-name"
               placeholder="Ex: Jean Kouassi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-client-phone">Téléphone</Label>
              <PhoneInput
                id="edit-client-phone"
            placeholder="Ex: +22877123456"
                value={formData.phone}
                onChange={(value) => {
                  setFormData({ ...formData, phone: value });
                  if (value) validatePhone(value);
                }}
                defaultCountry="TG"
                error={!!phoneError}
              />
              {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-client-email">Email</Label>
              <Input
                id="edit-client-email"
                type="email"
               placeholder="Ex: client@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-client-address">Adresse</Label>
              <Input
                id="edit-client-address"
               placeholder="Ex: Lomé, Quartier Nyékonakpoè"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} asChild={false}>
              Annuler
            </Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSaveEdit} asChild={false}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
