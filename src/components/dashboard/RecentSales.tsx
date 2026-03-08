import { useState, useEffect } from "react";
import { Clock, MoreHorizontal, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { venteService } from "@/services/api.service";
import { SaleStatus } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig: Record<
  SaleStatus,
  { label: string; variant: "default" | "success" | "warning" | "info" | "destructive" | "pending" }
> = {
  completed: { label: "Payé", variant: "success" },
  credit: { label: "Crédit", variant: "warning" },
  partial: { label: "Partiel", variant: "info" },
  cancelled: { label: "Annulé", variant: "destructive" },
};

const formatCFA = (amount: number) => amount.toLocaleString("fr-FR") + " F";

export function RecentSales() {
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentSales();
  }, []);

  const loadRecentSales = async () => {
    try {
      setIsLoading(true);
      const response = await venteService.getAll();
      const sales = (response.data || []).slice(0, 5);
      setRecentSales(sales);
    } catch (error) {
      console.error("Erreur chargement ventes récentes:", error);
      setRecentSales([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border shadow-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Ventes récentes</h3>
          <p className="text-sm text-muted-foreground">Dernières transactions</p>
        </div>
        <Button variant="outline" size="sm">
          Voir tout
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
        ) : recentSales.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune vente récente</p>
        ) : (
          recentSales.map((sale, index) => (
            <div
              key={sale.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{sale.id}</span>
                  <Badge variant={statusConfig[sale.status]?.variant || "default"}>
                    {statusConfig[sale.status]?.label || sale.status}
                  </Badge>
                </div>
                <p className="text-sm text-foreground truncate">{sale.client?.nom || sale.clientName || "Client comptoir"}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(sale.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                  {sale.isCredit && (
                    <span className="flex items-center gap-1 text-warning">
                      <CreditCard className="w-3 h-3" />
                      Crédit
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-foreground">{formatCFA(sale.totalAmount)}</p>
                <p className="text-xs text-muted-foreground">
                  {sale.items?.length || 0} article{(sale.items?.length || 0) > 1 ? "s" : ""}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Voir détails</DropdownMenuItem>
                  <DropdownMenuItem>Imprimer reçu</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Annuler</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
