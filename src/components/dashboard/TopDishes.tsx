import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { venteService } from "@/services/api.service";

export function TopProducts() {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTopProducts();
  }, []);

  const loadTopProducts = async () => {
    try {
      setIsLoading(true);
      const response = await venteService.getAll();
      const ventes = response.data || [];

      const productCounts: Record<string, any> = {};
      ventes.forEach((vente: any) => {
        if (vente.articles && Array.isArray(vente.articles)) {
          vente.articles.forEach((article: any) => {
            const productId = article.produitId;
            if (!productCounts[productId]) {
              productCounts[productId] = {
                name: article.produit?.nom || "Produit inconnu",
                count: 0,
              };
            }
            productCounts[productId].count += article.quantite || 0;
          });
        }
      });

      const sortedProducts = Object.values(productCounts)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

      setTopProducts(sortedProducts);
    } catch (error) {
      console.error("Erreur chargement top produits:", error);
      setTopProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

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
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
        ) : topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée disponible</p>
        ) : (
          topProducts.map((product, index) => {
            const maxCount = Math.max(...topProducts.map((p) => p.count));
            return (
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
            );
          })
        )}
      </div>
    </div>
  );
}
