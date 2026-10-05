import { motion } from "framer-motion";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  FileText,
  Ban,
  MessageSquare,
  Lock,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GuardrailItem {
  id: string;
  name: string;
  status: "active" | "warning" | "ok";
  description: string;
  lastCheck: string;
  metric?: string;
}

const guardrails: GuardrailItem[] = [
  {
    id: "spam",
    name: "Spam Control",
    status: "ok",
    description: "Frequency caps enforced, opt-outs honored",
    lastCheck: "2 min ago",
    metric: "0.02% complaint rate",
  },
  {
    id: "tone",
    name: "Tone & Branding",
    status: "ok",
    description: "All content aligned with Sunnystep voice",
    lastCheck: "5 min ago",
    metric: "100% brand compliant",
  },
  {
    id: "compliance",
    name: "PDPA Compliance",
    status: "active",
    description: "Data privacy rules actively monitored",
    lastCheck: "1 min ago",
    metric: "Zero violations",
  },
  {
    id: "human",
    name: "Human Override",
    status: "warning",
    description: "2 campaigns pending review",
    lastCheck: "15 min ago",
    metric: "2 pending approvals",
  },
];

const statusConfig = {
  active: { icon: Shield, color: "text-info bg-info/15", label: "Monitoring" },
  warning: { icon: AlertTriangle, color: "text-warning bg-warning/15", label: "Attention" },
  ok: { icon: CheckCircle, color: "text-success bg-success/15", label: "Healthy" },
};

interface ActivityLog {
  id: string;
  action: string;
  agent: string;
  time: string;
  status: "approved" | "blocked" | "pending";
}

const recentActivity: ActivityLog[] = [
  { id: "1", action: "Email campaign launched", agent: "Campaign Agent", time: "2 min ago", status: "approved" },
  { id: "2", action: "Cart reminder sent", agent: "Abandoned Cart Agent", time: "5 min ago", status: "approved" },
  { id: "3", action: "High-discount offer blocked", agent: "System", time: "12 min ago", status: "blocked" },
  { id: "4", action: "New creative pending review", agent: "Creative Agent", time: "18 min ago", status: "pending" },
  { id: "5", action: "Win-back sequence started", agent: "Lifecycle Agent", time: "25 min ago", status: "approved" },
];

const activityStatusStyles = {
  approved: "bg-success/15 text-success",
  blocked: "bg-destructive/15 text-destructive",
  pending: "bg-warning/15 text-warning",
};

export function GuardrailsPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Guardrails Status */}
      <motion.div
        className="glass-card p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-semibold text-foreground">Safety Guardrails</h3>
            <p className="text-sm text-muted-foreground">Real-time compliance monitoring</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-success/15 text-success text-sm font-medium">
            All Systems Go
          </span>
        </div>

        <div className="space-y-3">
          {guardrails.map((item, index) => {
            const StatusIcon = statusConfig[item.status].icon;
            return (
              <motion.div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", statusConfig[item.status].color)}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{item.metric}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {item.lastCheck}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Activity Log */}
      <motion.div
        className="glass-card p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-semibold text-foreground">Activity Log</h3>
            <p className="text-sm text-muted-foreground">Recent agent actions</p>
          </div>
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors border-b border-border/50 last:border-0"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.agent} • {activity.time}</p>
                </div>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium capitalize",
                activityStatusStyles[activity.status]
              )}>
                {activity.status}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
