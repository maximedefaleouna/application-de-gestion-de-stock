import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { authService } from "@/services/api.service";

export default function Profile() {
  const navigate = useNavigate();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get user from localStorage
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
  // Extract user fields with fallbacks
  const userFirstName = currentUser?.prenom || currentUser?.firstName || "";
  const userLastName = currentUser?.nom || currentUser?.lastName || "";
  const userName = currentUser?.name || `${userFirstName} ${userLastName}`.trim() || "Utilisateur";
  const userEmail = currentUser?.email || "-";
  const userRole = currentUser?.role || "vendeur";
  const userCreatedAt = currentUser?.createdAt || currentUser?.creeLe || null;
  const userLastLogin = currentUser?.lastLogin || currentUser?.derniereConnexion || null;

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(
        "Le nouveau mot de passe doit contenir au moins 6 caractères",
      );
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success("Mot de passe modifié avec succès");
      setIsPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      let errorMessage = "Erreur lors du changement de mot de passe";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (Array.isArray(error.response?.data?.details)) {
        const details = error.response.data.details;
        errorMessage = details.map((d: any) => d.message).join(", ");
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
      }
      
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    toast.success("Déconnexion réussie");
    navigate("/login");
  };

  return (
    <AdminLayout
      title="Mon Profil"
      subtitle="Gérez vos informations personnelles"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-24 h-24 bg-gradient-to-br from-primary to-secondary">
                <AvatarFallback className="text-3xl font-bold text-primary-foreground">
                  {(userFirstName && userLastName)
                    ? `${userFirstName.charAt(0)}${userLastName.charAt(0)}`
                    : userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold">
                  {userName}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {userEmail}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      userRole === "admin" ? "default" : "secondary"
                    }
                    className="capitalize"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {userRole === "admin"
                      ? "Administrateur"
                      : "Vendeur"}
                  </Badge>
                  <Badge variant="success">Actif</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Nom</Label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{userLastName || "-"}</span>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Prénom</Label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{userFirstName || "-"}</span>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{userEmail}</span>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Rôle</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium capitalize">
                    {userRole === "admin"
                      ? "Administrateur"
                      : "Vendeur"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Informations du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">
                  Date de création
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {userCreatedAt
                      ? format(
                          new Date(userCreatedAt),
                          "dd MMMM yyyy",
                          { locale: fr },
                        )
                      : "Non disponible"}
                  </span>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">
                  Dernière connexion
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {userLastLogin
                      ? format(
                          new Date(userLastLogin),
                          "dd MMMM yyyy à HH:mm",
                          { locale: fr },
                        )
                      : "Aujourd'hui"}
                  </span>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Statut</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="success">Compte actif</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Gérez votre mot de passe et la sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setIsPasswordDialogOpen(true)}
                variant="outline"
                className="flex-1"
                asChild={false}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Changer le mot de passe
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex-1"
                asChild={false}
              >
                <Lock className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Changer le mot de passe
              </DialogTitle>
              <DialogDescription>
                Entrez votre mot de passe actuel et choisissez-en un nouveau
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    asChild={false}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Minimum 6 caractères"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    asChild={false}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="confirmer mot de passe"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    asChild={false}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                asChild={false}
              >
                Annuler
              </Button>
              <Button
                onClick={handlePasswordChange}
                className="gradient-primary text-primary-foreground"
                asChild={false}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Modifier le mot de passe
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
