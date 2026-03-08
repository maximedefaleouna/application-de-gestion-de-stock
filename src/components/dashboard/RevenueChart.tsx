import { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { venteService } from "@/services/api.service";

const formatCFA = (value: number) => (value / 1000) + 'k';

export function RevenueChart() {
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await venteService.getAll();
        setSales(response.data || []);
      } catch {
        setSales([]);
      }
    };
    load();
  }, []);

  const weeklyRevenueData = useMemo(() => {
    const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const now = new Date();
    const days: { day: string; revenue: number; sales: number; dateKey: string }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const day = dayLabels[(d.getDay() + 6) % 7];
      const dateKey = d.toISOString().slice(0, 10);
      days.push({ day, revenue: 0, sales: 0, dateKey });
    }

    sales.forEach((sale) => {
      const key = new Date(sale.createdAt).toISOString().slice(0, 10);
      const match = days.find((d) => d.dateKey === key);
      if (match) {
        match.revenue += Number(sale.totalAmount || 0);
        match.sales += 1;
      }
    });

    return days.map(({ dateKey, ...rest }) => rest);
  }, [sales]);

  return (
    <div className="bg-card rounded-xl border shadow-card p-5">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-foreground">Revenus de la semaine</h3>
        <p className="text-sm text-muted-foreground">Évolution des ventes sur 7 jours</p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={formatCFA}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`, 'Revenus']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(25, 95%, 53%)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
