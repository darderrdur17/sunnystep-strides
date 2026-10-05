import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bot, Activity, Zap, TrendingUp, LucideIcon } from "lucide-react";

export type AgentStatus = "active" | "learning" | "paused" | "alert";

interface AgentCardProps {
  name: string;
  description: string;
  status: AgentStatus;
  icon: LucideIcon;
  metrics: {
    label: string;
    value: string;
  }[];
  actions: number;
  lastAction: string;
  delay?: number;
}

const statusConfig: Record<AgentStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "agent-status-active" },
  learning: { label: "Learning", className: "agent-status-learning" },
  paused: { label: "Paused", className: "agent-status-paused" },
  alert: { label: "Needs Attention", className: "agent-status-alert" },
};

export function AgentCard({
  name,
  description,
  status,
  icon: Icon,
  metrics,
  actions,
  lastAction,
  delay = 0,
}: AgentCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <motion.div
      className="glass-card p-5 hover:border-primary/30 transition-all duration-300 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl transition-all duration-300",
            status === "active" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
          </div>
        </div>

        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium",
          statusInfo.className,
          status === "active" && "animate-pulse-soft"
        )}>
          {statusInfo.label}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {metrics.map((metric, i) => (
          <div key={i} className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-0.5">{metric.label}</p>
            <p className="font-display font-semibold text-foreground">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="w-3.5 h-3.5" />
          <span>{actions} actions today</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Last: {lastAction}
        </p>
      </div>
    </motion.div>
  );
}
