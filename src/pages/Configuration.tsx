import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Save,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Store,
} from "lucide-react";

export default function Configuration() {
  // Mock data - pas de connexion API
  const [config, setConfig] = useState({
    nom: "Ma Boutique",
    nomChef: "Dupont",
    prenomChef: "Jean",
    adresse: "123 Avenue du Commerce",
    telephone: "0612345678",
    email: "contact@boutique.com",
  });

  const handleSave = () => {
    // Mock save - pas d'appel API réel
    toast.success("Configuration enregistrée avec succès !");
    console.log("Configuration sauvegardée:", config);
  };

  const handleChange = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout
      title="Configuration de la boutique"
      subtitle="Gérez les informations de votre établissement"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Informations de l'établissement</CardTitle>
                <CardDescription>
                  Renseignez les coordonnées de votre boutique
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de la boutique *</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nom"
                    value={config.nom}
                    onChange={(e) => handleChange("nom", e.target.value)}
                    className="pl-9"
                    placeholder="Ex: Ma Boutique"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse complète *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="adresse"
                    value={config.adresse}
                    onChange={(e) => handleChange("adresse", e.target.value)}
                    className="pl-9"
                    placeholder="Ex: 123 Rue du Commerce"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="telephone"
                    value={config.telephone}
                    onChange={(e) => handleChange("telephone", e.target.value)}
                    className="pl-9"
                    placeholder="Ex: 0612345678"
                    type="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email de contact *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={config.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="pl-9"
                    placeholder="Ex: contact@boutique.com"
                    type="email"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations du gérant */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Informations du gérant</CardTitle>
                <CardDescription>
                  Coordonnées du responsable de l'établissement
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomChef">Nom du gérant *</Label>
                <Input
                  id="nomChef"
                  value={config.nomChef}
                  onChange={(e) => handleChange("nomChef", e.target.value)}
                  placeholder="Ex: Dupont"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prenomChef">Prénom du gérant *</Label>
                <Input
                  id="prenomChef"
                  value={config.prenomChef}
                  onChange={(e) => handleChange("prenomChef", e.target.value)}
                  placeholder="Ex: Jean"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end border-t pt-6">
          <Button
            variant="outline"
            onClick={() => {
              setConfig({
                nom: "Ma Boutique",
                nomChef: "Dupont",
                prenomChef: "Jean",
                adresse: "123 Avenue du Commerce",
                telephone: "0612345678",
                email: "contact@boutique.com",
              });
              toast.info("Configuration réinitialisée");
            }}
            asChild={false}
          >
            Réinitialiser
          </Button>

          <Button onClick={handleSave} className="gap-2" asChild={false}>
            <Save className="w-4 h-4" />
            Enregistrer la configuration
          </Button>
        </div>

        {/* Aide et informations */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">💡 Le saviez-vous</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Ces informations seront utilisées pour :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Personnaliser vos documents commerciaux (factures, reçus)</li>
              <li>Afficher les coordonnées dans les notifications</li>
              <li>Identifier votre boutique dans le système</li>
              <li>Configurer les paramètres par défaut</li>
            </ul>
            <Separator className="my-3" />
            <p className="text-xs italic">
              Note: Cette page est une maquette. La sauvegarde n'est pas
              connectée à l'API.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
