import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { mockUsers } from "@/data/mockData";
import { User, UserRole } from "@/types";
import { Plus, Search, MoreHorizontal, Edit, Trash2, ShieldCheck, ShoppingCart, User as UserIcon, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  admin: { label: "Administrateur", icon: <ShieldCheck className="w-4 h-4" />, color: "text-primary" },
  seller: { label: "Vendeur", icon: <ShoppingCart className="w-4 h-4" />, color: "text-info" },
};

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+228",
    role: "" as UserRole,
  });
  const [phoneError, setPhoneError] = useState("");

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const validatePhone = (value: string | undefined) => {
    if (!value) {
      setPhoneError("Le numéro de téléphone est requis");
      return false;
    }
    
    const phoneRegex = /^\+[1-9]\d{1,3}\d{6,14}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      setPhoneError("Numéro de téléphone invalide. Exemple: +22877123456");
      return false;
    }
    
    setPhoneError("");
    return true;
  };

  const handleAddUser = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!validatePhone(formData.phone)) {
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      active: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    setUsers([...users, newUser]);
    toast.success("Utilisateur ajouté avec succès");
    setIsAddDialogOpen(false);
    setFormData({ firstName: "", lastName: "", email: "", phone: "+228", role: "" as UserRole });
  };

  const toggleActive = (id: string) => {
    setUsers(users.map(user => user.id === id ? { ...user, active: !user.active } : user));
    toast.success("Statut de l'utilisateur mis à jour");
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "+228",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedUser) return;
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!validatePhone(formData.phone)) {
      return;
    }

    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { 
            ...user, 
            firstName: formData.firstName, 
            lastName: formData.lastName,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email, 
            phone: formData.phone,
            role: formData.role 
          }
        : user
    ));
    toast.success("Utilisateur modifié avec succès");
    setIsEditDialogOpen(false);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    
    setUsers(users.filter(user => user.id !== selectedUser.id));
    toast.success("Utilisateur supprimé avec succès");
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <AdminLayout title="Utilisateurs" subtitle="Gérez les comptes admin et vendeurs">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="Filtrer par rôle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="seller">Vendeur</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground shadow-glow"><Plus className="w-4 h-4 mr-2" />Nouvel utilisateur</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvel utilisateur</DialogTitle><DialogDescription>Créez un compte</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Prénom</Label><Input placeholder="Ex: Jean" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} /></div>
                <div className="space-y-2"><Label>Nom</Label><Input placeholder="Ex: Dupont" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="jean@autopiecesplus.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Téléphone <span className="text-destructive">*</span></Label>
                <PhoneInput 
                  placeholder="77 123 45 67" 
                  value={formData.phone} 
                  onChange={(value) => {
                    setFormData({...formData, phone: value});
                    if (value) setPhoneError("");
                  }} 
                  defaultCountry="TG"
                  error={!!phoneError}
                />
                {phoneError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {phoneError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as UserRole})}><SelectTrigger><SelectValue placeholder="Rôle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="seller">Vendeur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
              <Button className="gradient-primary text-primary-foreground" onClick={handleAddUser}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Modifier l'utilisateur</DialogTitle><DialogDescription>Modifiez les informations</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Prénom</Label><Input placeholder="Ex: Jean" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} /></div>
                <div className="space-y-2"><Label>Nom</Label><Input placeholder="Ex: Dupont" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="jean@autopiecesplus.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Téléphone <span className="text-destructive">*</span></Label>
                <PhoneInput 
                  placeholder="77 123 45 67" 
                  value={formData.phone} 
                  onChange={(value) => {
                    setFormData({...formData, phone: value});
                    if (value) setPhoneError("");
                  }} 
                  defaultCountry="TG"
                  error={!!phoneError}
                />
                {phoneError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {phoneError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as UserRole})}><SelectTrigger><SelectValue placeholder="Rôle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="seller">Vendeur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
              <Button className="gradient-primary text-primary-foreground" onClick={handleSaveEdit}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. L'utilisateur <strong>{selectedUser?.name}</strong> sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(roleConfig).map(([role, config]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${config.color}`}>{config.icon}</div>
              <div><p className="text-2xl font-bold text-foreground">{count}</p><p className="text-xs text-muted-foreground">{config.label}s</p></div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, index) => (
              <TableRow key={user.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.03}s` }}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`flex items-center gap-2 ${roleConfig[user.role].color}`}>
                    {roleConfig[user.role].icon}
                    <span className="text-sm font-medium">{roleConfig[user.role].label}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={user.active} onCheckedChange={() => toggleActive(user.id)} />
                    <Badge variant={user.active ? "success" : "pending"}>{user.active ? "Actif" : "Inactif"}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {user.lastLogin ? (
                    <span className="text-sm">{format(user.lastLogin, "dd MMM yyyy à HH:mm", { locale: fr })}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Jamais</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(user)}><Edit className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(user)}><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
