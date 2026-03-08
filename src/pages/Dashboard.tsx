import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopProducts } from "@/components/dashboard/TopDishes";
import { PeriodSelector, DateRangeType } from "@/components/PeriodSelector";
import {
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { venteService, produitService } from "@/services/api.service";
import { toast } from "sonner";

const formatCFA = (amount: number) => amount.toLocaleString("fr-FR") + " F";

interface CustomDateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DashboardStats {
  totalVentes: number;
  todaySales: number;
  todayRevenue: number;
  lowStockCount: number;
  pendingCredits: number;
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: new Date(),
  });
  const [currentPeriod, setCurrentPeriod] = useState<DateRangeType>("today");
  const [stats, setStats] = useState<DashboardStats>({
    totalVentes: 0,
    todaySales: 0,
    todayRevenue: 0,
    lowStockCount: 0,
    pendingCredits: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les statistiques au montage
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Charger les ventes du jour
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [ventesResponse, lowStockResponse] = await Promise.all([
        venteService.getAll({
          startDate: today.toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        }),
        produitService.getLowStock(),
      ]);

      const ventesData = ventesResponse.data || [];

      // Calculer les stats
      const todaySalesCount = ventesData.length;
      const todayRevenueTotal = ventesData.reduce(
        (sum: number, v: any) => sum + (v.montantTotal || 0),
        0,
      );

      // Compter les crédits en cours
      const pendingCreditsTotal = ventesData
        .filter((v: any) => v.estCredit && v.statut !== "completee")
        .reduce((sum: number, v: any) => sum + (v.montantRestant || 0), 0);

      setStats({
        totalVentes: ventesData.length,
        todaySales: todaySalesCount,
        todayRevenue: todayRevenueTotal,
        lowStockCount: lowStockResponse.data.length || 0,
        pendingCredits: pendingCreditsTotal,
      });

      setLowStockProducts(lowStockResponse.data || []);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      toast.error("Erreur de chargement des données du tableau de bord", {
        duration: 5000,
      });
      // Initialiser avec des valeurs à 0 en cas d'erreur
      setStats({
        totalVentes: 0,
        todaySales: 0,
        todayRevenue: 0,
        lowStockCount: 0,
        pendingCredits: 0,
      });
      setLowStockProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (
    period: DateRangeType,
    range: CustomDateRange,
  ) => {
    setCurrentPeriod(period);
    setDateRange(range);
  };

  return (
    <AdminLayout
      title="Tableau de bord"
      subtitle="Bienvenue ! Voici un aperçu de votre activité"
    >
      {/* Period Selector - Simple inline */}
      <div className="mb-6">
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
        <StatCard
          title="Ventes du jour"
          value={isLoading ? "..." : stats.todaySales}
          icon={<ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />}
          trend={0}
          trendLabel="vs hier"
          variant="primary"
        />
        <StatCard
          title="Revenus du jour"
          value={isLoading ? "..." : formatCFA(stats.todayRevenue)}
          icon={<TrendingUp className="w-5 h-5 md:w-6 md:h-6" />}
          trend={0}
          trendLabel="vs hier"
          variant="success"
        />
        <StatCard
          title="Stock critique"
          value={isLoading ? "..." : stats.lowStockCount}
          icon={<AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />}
          variant="warning"
          trend={0}
          trendLabel={""}
        />
        <StatCard
          title="Crédits en cours"
          value={isLoading ? "..." : formatCFA(stats.pendingCredits)}
          icon={<CreditCard className="w-5 h-5 md:w-6 md:h-6" />}
          variant="destructive"
          trend={0}
          trendLabel={""}
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <TopProducts />
      </div>

      {/* Recent Sales and Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentSales />
        </div>
        <div className="bg-card rounded-xl border shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">
              Alertes stock
            </h3>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Chargement...
            </p>
          ) : lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Tous les stocks sont suffisants ✓
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        product.stock <= product.stockMin / 2
                          ? "destructive"
                          : "warning"
                      }
                    >
                      {product.stock} en stock
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Seuil: {product.stockMin}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
