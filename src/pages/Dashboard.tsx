import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopProducts } from "@/components/dashboard/TopDishes";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { mockDashboardStats, mockProducts } from "@/data/mockData";
import { ShoppingCart, TrendingUp, AlertTriangle, CreditCard, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";

const formatCFA = (amount: number) => amount.toLocaleString('fr-FR') + ' F';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 11, 18),
    to: new Date(2024, 11, 24),
  });
  const lowStockProducts = mockProducts.filter(p => p.stock <= p.minStock);

  return (
    <AdminLayout 
      title="Tableau de bord" 
      subtitle="Bienvenue ! Voici un aperçu de votre activité"
    >
      {/* Date Range Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} className="w-full sm:w-auto" />
        <p className="text-sm text-muted-foreground">
          Données affichées pour la période sélectionnée
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
        <StatCard
          title="Ventes du jour"
          value={mockDashboardStats.todaySales}
          icon={<ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />}
          trend={12}
          trendLabel="vs hier"
          variant="primary"
        />
        <StatCard
          title="Revenus du jour"
          value={formatCFA(mockDashboardStats.todayRevenue)}
          icon={<TrendingUp className="w-5 h-5 md:w-6 md:h-6" />}
          trend={8}
          trendLabel="vs hier"
          variant="success"
        />
        <StatCard
          title="Stock critique"
          value={mockDashboardStats.lowStockCount}
          icon={<AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />}
          variant="warning"
        />
        <StatCard
          title="Crédits en cours"
          value={formatCFA(mockDashboardStats.pendingCredits)}
          icon={<CreditCard className="w-5 h-5 md:w-6 md:h-6" />}
          variant="destructive"
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
            <h3 className="text-lg font-semibold text-foreground">Alertes stock</h3>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Tous les stocks sont suffisants ✓
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <div>
                    <p className="font-medium text-foreground text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.reference}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={product.stock <= product.minStock / 2 ? "destructive" : "warning"}>
                      {product.stock} en stock
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Seuil: {product.minStock}</p>
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
