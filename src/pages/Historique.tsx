import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Activity,
  User,
  FileText,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit,
  Plus,
  LogIn,
  LogOut,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import api from "@/lib/api";

type HistoriqueEntry = {
  id: string;
  action: string;
  entite: string;
  entiteId: string | null;
  description: string;
  createdAt: string;
  utilisateur: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  } | null;
};

const actionIcons: Record<string, React.ReactNode> = {
  creation: <Plus className="w-4 h-4" />,
  modification: <Edit className="w-4 h-4" />,
  suppression: <Trash2 className="w-4 h-4" />,
  connexion: <LogIn className="w-4 h-4" />,
  deconnexion: <LogOut className="w-4 h-4" />,
  vente: <ShoppingCart className="w-4 h-4" />,
  paiement: <DollarSign className="w-4 h-4" />,
  mouvement_stock: <Package className="w-4 h-4" />,
  consultation: <Search className="w-4 h-4" />,
};

const actionColors: Record<string, string> = {
  creation: "bg-success/10 text-success",
  modification: "bg-info/10 text-info",
  suppression: "bg-destructive/10 text-destructive",
  connexion: "bg-primary/10 text-primary",
  deconnexion: "bg-secondary/10 text-secondary-foreground",
  vente: "bg-warning/10 text-warning",
  paiement: "bg-success/10 text-success",
  mouvement_stock: "bg-primary/10 text-primary",
  consultation: "bg-muted/10 text-muted-foreground",
};

const entiteIcons: Record<string, React.ReactNode> = {
  vente: <ShoppingCart className="w-4 h-4" />,
  produit: <Package className="w-4 h-4" />,
  client: <Users className="w-4 h-4" />,
  utilisateur: <User className="w-4 h-4" />,
  categorie: <FileText className="w-4 h-4" />,
  paiement: <DollarSign className="w-4 h-4" />,
  stock: <TrendingUp className="w-4 h-4" />,
};

const formatAction = (action: string) => {
  return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatEntite = (entite: string) => {
  return entite.charAt(0).toUpperCase() + entite.slice(1);
};

export default function Historique() {
  const [historiques, setHistoriques] = useState<HistoriqueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntite, setFilterEntite] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalActions: 0,
    actionsToday: 0,
    actionsLastWeek: 0,
    actionsLastMonth: 0,
  });

  const loadHistorique = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filterAction !== "all") {
        params.append("action", filterAction);
      }

      if (filterEntite !== "all") {
        params.append("entite", filterEntite);
      }

      const [response, statsResponse] = await Promise.all([
        api.get(`/historique?${params.toString()}`),
        api.get("/historique/stats"),
      ]);
      
      setHistoriques(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
      setStats(statsResponse.data.data || {
        totalActions: 0,
        actionsToday: 0,
        actionsLastWeek: 0,
        actionsLastMonth: 0,
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors du chargement de l'historique"
      );
      setHistoriques([]);
      setStats({
        totalActions: 0,
        actionsToday: 0,
        actionsLastWeek: 0,
        actionsLastMonth: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorique();
  }, [page, limit, filterAction, filterEntite]);

  const handleSearch = () => {
    setPage(1);
    loadHistorique();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout
      title="Historique des Actions"
      subtitle="Consultez toutes les activités des utilisateurs"
    >
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Filtrer par action</Label>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                <SelectItem value="creation">Créations</SelectItem>
                <SelectItem value="modification">Modifications</SelectItem>
                <SelectItem value="suppression">Suppressions</SelectItem>
                <SelectItem value="vente">Ventes</SelectItem>
                <SelectItem value="connexion">Connexions</SelectItem>
                <SelectItem value="mouvement_stock">Mouvements de stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Filtrer par entité</Label>
            <Select value={filterEntite} onValueChange={setFilterEntite}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les entités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entités</SelectItem>
                <SelectItem value="vente">Ventes</SelectItem>
                <SelectItem value="produit">Produits</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="utilisateur">Utilisateurs</SelectItem>
                <SelectItem value="categorie">Catégories</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                className="flex-1 gradient-primary text-primary-foreground"
                asChild={false}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </Button>
              {/* <Button
                variant="outline"
                onClick={loadHistorique}
                className="flex-1"
                asChild={false}
              >
                <Download className="w-4 h-4" />
              </Button> */}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Actions</p>
              <p className="text-2xl font-bold">{stats.totalActions}</p>
            </div>
            <Activity className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Actions Aujourd'hui</p>
              <p className="text-2xl font-bold text-success">{stats.actionsToday}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Dernière Action</p>
              <p className="text-sm font-medium">
                {historiques.length > 0
                  ? format(new Date(historiques[0].createdAt), "dd MMM HH:mm", { locale: fr })
                  : "—"}
              </p>
            </div>
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Date & Heure</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entité</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                </TableCell>
              </TableRow>
            ) : historiques.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune activité trouvée</p>
                </TableCell>
              </TableRow>
            ) : (
              historiques.map((entry, index) => (
                <TableRow
                  key={entry.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${actionColors[entry.action] || "bg-muted text-muted-foreground"} flex items-center gap-1`}
                    >
                      {actionIcons[entry.action] || <Activity className="w-3 h-3" />}
                      {formatAction(entry.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {entiteIcons[entry.entite] || <FileText className="w-4 h-4" />}
                      <span className="text-sm font-medium">
                        {formatEntite(entry.entite)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground max-w-md truncate">
                      {entry.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    {entry.utilisateur ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {entry.utilisateur.prenom.charAt(0)}
                          {entry.utilisateur.nom.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {entry.utilisateur.prenom} {entry.utilisateur.nom}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {entry.utilisateur.role}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Système</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.entiteId && (
                      <Badge variant="secondary" className="text-[10px]">
                        ID: {entry.entiteId.slice(0, 8)}...
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, total)} sur {total} résultats
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              asChild={false}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              asChild={false}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
