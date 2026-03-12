import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PeriodSelector, DateRangeType } from "@/components/PeriodSelector";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Download, TrendingUp, ShoppingCart, CreditCard } from "lucide-react";
import { dashboardService } from "@/services/api.service";
import { startOfDay, endOfDay } from "date-fns";

interface CustomDateRange {
  from: Date | undefined;
  to: Date | undefined;
}

const formatCFA = (amount: number) => amount.toLocaleString("fr-FR") + " F";

const categoryColors = [
  "#f97316",
  "#06b6d4",
  "#22c55e",
  "#a855f7",
  "#ef4444",
  "#eab308",
];

export default function Stats() {
  const [dateRange, setDateRange] = useState<CustomDateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [currentPeriod, setCurrentPeriod] = useState<DateRangeType>("today");
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      
      // Formater les dates correctement en tenant compte du fuseau horaire local
      const formatDateToLocal = (date: Date | undefined) => {
        if (!date) return undefined;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const startDate = formatDateToLocal(dateRange.from);
      const endDate = formatDateToLocal(dateRange.to);
      
      const response = await dashboardService.getStatistiques(startDate, endDate);
      setStatsData(response.data || null);
    } catch (error) {
      console.error("Erreur chargement statistiques:", error);
      setStatsData(null);
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
    
    // Recharger les statistiques avec la NOUVELLE période (en utilisant range directement)
    loadStatisticsWithRange(range);
  };

  const loadStatisticsWithRange = (range: CustomDateRange) => {
    try {
      setIsLoading(true);
      
      // Formater les dates correctement en tenant compte du fuseau horaire local
      const formatDateToLocal = (date: Date | undefined) => {
        if (!date) return undefined;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const startDate = formatDateToLocal(range.from);
      const endDate = formatDateToLocal(range.to);
      
      console.log('Stats - Période sélectionnée:', { startDate, endDate, range });
      
      dashboardService.getStatistiques(startDate, endDate)
        .then((response) => {
          setStatsData(response.data || null);
        })
        .catch((error) => {
          console.error("Erreur chargement statistiques:", error);
          setStatsData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.error("Erreur chargement statistiques:", error);
      setStatsData(null);
      setIsLoading(false);
    }
  };

  const dashboardStats = useMemo(() => {
    if (!statsData) {
      return { totalRevenue: 0, totalSales: 0, pendingCredits: 0 };
    }
    return {
      totalRevenue: statsData.summary?.totalRevenue || 0,
      totalSales: statsData.summary?.totalSales || 0,
      pendingCredits: statsData.summary?.pendingCredits || 0,
    };
  }, [statsData]);

  const weeklyRevenueData = useMemo(() => {
    if (!statsData?.evolutionData) return [];
    return statsData.evolutionData.map((day: any) => ({
      day: day.dayLabel || new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
      revenue: day.revenue || 0,
      sales: day.sales || 0,
    }));
  }, [statsData]);

  const categoryData = useMemo(() => {
    if (!statsData?.categoryData) return [];
    const total = statsData.categoryData.reduce((sum: number, cat: any) => sum + (cat.quantity || 0), 0) || 1;
    
    return statsData.categoryData.map((cat: any, index: number) => ({
      name: cat.name || "Non classé",
      value: Math.round(((cat.quantity || 0) / total) * 100),
      color: categoryColors[index % categoryColors.length],
    }));
  }, [statsData]);

  const topProducts = useMemo(() => {
    if (!statsData?.topProducts) return [];
    return statsData.topProducts.slice(0, 5).map((product: any) => ({
      name: product.name || "Produit",
      count: product.quantity || 0,
    }));
  }, [statsData]);

  return (
    <AdminLayout
      title="Statistiques & Rapports"
      subtitle="Analysez les performances de votre boutique"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild={false}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" asChild={false}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
        <Card className="p-4 md:p-5 gradient-warm border-primary/20">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">
                Chiffre d'affaires
              </p>
              <p className="text-lg md:text-2xl font-bold text-foreground truncate">
                {formatCFA(dashboardStats.totalRevenue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-info" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Total ventes
              </p>
              <p className="text-lg md:text-2xl font-bold text-foreground">
                {dashboardStats.totalSales}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">
                Panier moyen
              </p>
              <p className="text-lg md:text-2xl font-bold text-foreground truncate">
                {formatCFA(
                  dashboardStats.totalSales
                    ? Math.round(
                        dashboardStats.totalRevenue / dashboardStats.totalSales,
                      )
                    : 0,
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">
                Crédits en cours
              </p>
              <p className="text-lg md:text-2xl font-bold text-foreground truncate">
                {formatCFA(dashboardStats.pendingCredits)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-4 md:p-5">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
            Évolution des revenus
          </h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyRevenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(25, 95%, 53%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(25, 95%, 53%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(v) => v / 1000 + "k"}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [formatCFA(value), "Revenus"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(25, 95%, 53%)"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 md:p-5">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
            Nombre de ventes
          </h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRevenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="hsl(199, 89%, 48%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 md:p-5 lg:col-span-1">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
            Répartition par catégorie
          </h3>
          <div className="h-[220px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm text-foreground">{cat.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {cat.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-5 lg:col-span-2">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
            Top des ventes
          </h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => {
              const maxCount = topProducts[0].count || 1;
              const percent = (product.count / maxCount) * 100;

              return (
                <div key={product.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground">
                        {product.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.count} ventes
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
