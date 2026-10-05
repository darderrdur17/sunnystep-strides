import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number | null;
  changeLabel: string;
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon,
  iconColor = "text-primary",
  delay = 0 
}: MetricCardProps) {
  const hasChange = typeof change === "number" && !Number.isNaN(change);
  const isPositive = (change ?? 0) >= 0;

  return (
    <motion.div
      className="metric-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl bg-primary/10", iconColor.replace("text-", "bg-").replace("primary", "primary/10"))}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {hasChange && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
            isPositive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
          )}>
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(change as number)}%</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="font-display text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
      </div>
    </motion.div>
  );
}
