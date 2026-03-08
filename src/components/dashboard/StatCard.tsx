import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend: number;
  trendLabel: string;
  variant: "default" | "primary" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "bg-card",
  primary: "gradient-warm border-primary/20",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  destructive: "bg-destructive/5 border-destructive/20",
};

const iconVariantStyles = {
  default: "bg-secondary text-secondary-foreground",
  primary: "gradient-primary text-primary-foreground shadow-glow",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  variant = "default",
}: StatCardProps) {
  const isPositive = trend && trend > 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 md:p-5 shadow-card transition-all duration-300 hover:shadow-lg animate-fade-in",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-xl md:text-3xl font-bold text-foreground truncate">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-destructive" />
              )}
              <span
                className={cn(
                  "text-xs md:text-sm font-medium",
                  isPositive ? "text-success" : "text-destructive"
                )}
              >
                {isPositive ? "+" : ""}
                {trend}%
              </span>
              {trendLabel && (
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ml-2",
            iconVariantStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
