import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { mockClients, mockSales } from "@/data/mockData";
import { Client } from "@/types";
import { Plus, Search, Phone, MapPin, CreditCard, User, AlertTriangle, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const formatCFA = (amount: number) => amount.toLocaleString('fr-FR') + ' F';

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = mockClients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const totalCreditsEnCours = mockClients.reduce((acc, c) => acc + (c.totalCredit - c.totalPaid), 0);
  const clientsAvecCredit = mockClients.filter(c => c.totalCredit - c.totalPaid > 0).length;

  const getClientSales = (clientId: string) => mockSales.filter(s => s.clientId === clientId);

  return (
    <AdminLayout title="Clients & Crédits" subtitle="Gérez vos clients et suivez les crédits en cours">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{mockClients.length}</p>
            <p className="text-xs text-muted-foreground">Total clients</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{clientsAvecCredit}</p>
            <p className="text-xs text-muted-foreground">Avec crédit</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatCFA(totalCreditsEnCours)}</p>
            <p className="text-xs text-muted-foreground">Crédits en cours</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatCFA(mockClients.reduce((acc, c) => acc + c.totalPaid, 0))}</p>
            <p className="text-xs text-muted-foreground">Total recouvrés</p>
          </div>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher par nom ou téléphone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
              <DialogDescription>Enregistrez un nouveau client</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Nom complet</Label><Input placeholder="Ex: Mamadou Diallo" /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input placeholder="77 123 45 67" /></div>
              <div className="space-y-2"><Label>Email (optionnel)</Label><Input type="email" placeholder="email@example.com" /></div>
              <div className="space-y-2"><Label>Adresse</Label><Input placeholder="Dakar, Médina" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
              <Button className="gradient-primary text-primary-foreground">Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Table */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Total crédit</TableHead>
              <TableHead>Payé</TableHead>
              <TableHead>Reste à payer</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client, index) => {
              const remaining = client.totalCredit - client.totalPaid;
              return (
                <TableRow key={client.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.03}s` }}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {client.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">Depuis {format(client.createdAt, "MMM yyyy", { locale: fr })}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</p>
                      {client.address && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{client.address}</p>}
                    </div>
                  </TableCell>
                  <TableCell><span className="font-medium">{formatCFA(client.totalCredit)}</span></TableCell>
                  <TableCell><span className="text-success font-medium">{formatCFA(client.totalPaid)}</span></TableCell>
                  <TableCell>
                    <span className={`font-bold ${remaining > 0 ? 'text-destructive' : 'text-success'}`}>
                      {formatCFA(remaining)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {remaining === 0 ? (
                      <Badge variant="success">Soldé</Badge>
                    ) : remaining > 100000 ? (
                      <Badge variant="destructive">Crédit élevé</Badge>
                    ) : (
                      <Badge variant="warning">Crédit</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedClient(client)}>
                      <Eye className="w-4 h-4 mr-1" />Détails
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Client Detail Modal */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fiche client - {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Téléphone</p><p className="font-medium">{selectedClient.phone}</p></div>
                <div><p className="text-sm text-muted-foreground">Adresse</p><p className="font-medium">{selectedClient.address || '-'}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total crédit</p>
                  <p className="text-lg font-bold">{formatCFA(selectedClient.totalCredit)}</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Payé</p>
                  <p className="text-lg font-bold text-success">{formatCFA(selectedClient.totalPaid)}</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Reste</p>
                  <p className="text-lg font-bold text-destructive">{formatCFA(selectedClient.totalCredit - selectedClient.totalPaid)}</p>
                </Card>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ventes associées</h4>
                <div className="space-y-2">
                  {getClientSales(selectedClient.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune vente enregistrée</p>
                  ) : (
                    getClientSales(selectedClient.id).map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center p-2 rounded bg-secondary/30">
                        <div>
                          <span className="font-medium text-sm">{sale.id}</span>
                          <span className="text-xs text-muted-foreground ml-2">{format(sale.createdAt, "dd/MM/yyyy", { locale: fr })}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCFA(sale.totalAmount)}</p>
                          {sale.remainingAmount > 0 && <p className="text-xs text-warning">Reste: {formatCFA(sale.remainingAmount)}</p>}
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
