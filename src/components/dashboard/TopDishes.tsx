import { mockDashboardStats } from "@/data/mockData";
import { Trophy } from "lucide-react";

export function TopProducts() {
  const maxCount = Math.max(...mockDashboardStats.topProducts.map(d => d.count));

  return (
    <div className="bg-card rounded-xl border shadow-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top produits</h3>
          <p className="text-sm text-muted-foreground">Les plus vendus</p>
        </div>
      </div>

      <div className="space-y-4">
        {mockDashboardStats.topProducts.map((product, index) => (
          <div key={product.name} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="font-medium text-foreground">{product.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{product.count} ventes</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${(product.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
