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
import { venteService, produitService } from "@/services/api.service";

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
    from: new Date(),
    to: new Date(),
  });
  const [currentPeriod, setCurrentPeriod] = useState<DateRangeType>("today");
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [salesRes, productsRes] = await Promise.all([
          venteService.getAll(),
          produitService.getAll(),
        ]);
        setSales(salesRes.data || []);
        setProducts(productsRes.data || []);
      } catch {
        setSales([]);
        setProducts([]);
      }
    };
    loadData();
  }, []);

  const handlePeriodChange = (
    period: DateRangeType,
    range: CustomDateRange,
  ) => {
    setCurrentPeriod(period);
    setDateRange(range);
  };

  const dashboardStats = useMemo(() => {
    const totalRevenue = sales.reduce(
      (acc, s) => acc + Number(s.totalAmount || 0),
      0,
    );
    const totalSales = sales.length;
    const pendingCredits = sales.reduce(
      (acc, s) => acc + Number(s.remainingAmount || 0),
      0,
    );
    return { totalRevenue, totalSales, pendingCredits };
  }, [sales]);

  const weeklyRevenueData = useMemo(() => {
    const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const now = new Date();
    const days: { day: string; revenue: number; sales: number; key: string }[] =
      [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({
        day: dayLabels[(d.getDay() + 6) % 7],
        revenue: 0,
        sales: 0,
        key: d.toISOString().slice(0, 10),
      });
    }

    sales.forEach((sale) => {
      const key = new Date(sale.createdAt).toISOString().slice(0, 10);
      const day = days.find((d) => d.key === key);
      if (day) {
        day.revenue += Number(sale.totalAmount || 0);
        day.sales += 1;
      }
    });

    return days.map(({ key, ...rest }) => rest);
  }, [sales]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const key = p.category || "Non class�";
      counts[key] = (counts[key] || 0) + 1;
    });
    const total = products.length || 1;

    return Object.entries(counts).map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      color: categoryColors[index % categoryColors.length],
    }));
  }, [products]);

  const topProducts = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach((sale) => {
      (sale.items || []).forEach((item: any) => {
        counts[item.productName] =
          (counts[item.productName] || 0) + Number(item.quantity || 0);
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [sales]);

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
                Cr�dits en cours
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
