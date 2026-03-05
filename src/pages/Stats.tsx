import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PeriodSelector, DateRangeType } from "@/components/PeriodSelector";
import { mockDashboardStats, weeklyRevenueData, categoryData } from "@/data/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { Download, TrendingUp, ShoppingCart, CreditCard } from "lucide-react";

interface CustomDateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

const formatCFA = (amount: number) => amount.toLocaleString('fr-FR') + ' F';

export default function Stats() {
  const [dateRange, setDateRange] = useState<CustomDateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [currentPeriod, setCurrentPeriod] = useState<DateRangeType>('today');

  const handlePeriodChange = (period: DateRangeType, range: CustomDateRange) => {
    setCurrentPeriod(period);
    setDateRange(range);
  };

  return (
    <AdminLayout title="Statistiques & Rapports" subtitle="Analysez les performances de votre boutique">
      {/* Period Selector with Exports */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />CSV</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />PDF</Button>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
        <Card className="p-4 md:p-5 gradient-warm border-primary/20">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow"><TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" /></div>
            <div className="min-w-0"><p className="text-xs md:text-sm text-muted-foreground">Chiffre d'affaires</p><p className="text-lg md:text-2xl font-bold text-foreground truncate">{formatCFA(mockDashboardStats.totalRevenue)}</p></div>
          </div>
        </Card>
        <Card className="p-4 md:p-5">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-info/10 flex items-center justify-center"><ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-info" /></div>
            <div><p className="text-xs md:text-sm text-muted-foreground">Total ventes</p><p className="text-lg md:text-2xl font-bold text-foreground">{mockDashboardStats.totalSales}</p></div>
          </div>
        </Card>
        <Card className="p-4 md:p-5">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-success/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-success" /></div>
            <div className="min-w-0"><p className="text-xs md:text-sm text-muted-foreground">Panier moyen</p><p className="text-lg md:text-2xl font-bold text-foreground truncate">{formatCFA(Math.round(mockDashboardStats.totalRevenue / mockDashboardStats.totalSales))}</p></div>
          </div>
        </Card>
        <Card className="p-4 md:p-5">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-warning/10 flex items-center justify-center"><CreditCard className="w-5 h-5 md:w-6 md:h-6 text-warning" /></div>
            <div className="min-w-0"><p className="text-xs md:text-sm text-muted-foreground">Crédits en cours</p><p className="text-lg md:text-2xl font-bold text-foreground truncate">{formatCFA(mockDashboardStats.pendingCredits)}</p></div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-4 md:p-5">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Évolution des revenus</h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyRevenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => (v / 1000) + 'k'} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value: number) => [formatCFA(value), 'Revenus']} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(25, 95%, 53%)" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 md:p-5">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Nombre de ventes</h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="sales" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Category + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 md:p-5 lg:col-span-1">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Répartition par catégorie</h3>
          <div className="h-[220px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} /><span className="text-sm text-foreground">{cat.name}</span></div>
                <span className="text-sm font-medium text-foreground">{cat.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-5 lg:col-span-2">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Top des ventes</h3>
          <div className="space-y-4">
            {mockDashboardStats.topProducts.map((product, index) => {
              const maxCount = mockDashboardStats.topProducts[0].count;
              const percent = (product.count / maxCount) * 100;
              return (
                <div key={product.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center">{index + 1}</span>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{product.count} ventes</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
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
