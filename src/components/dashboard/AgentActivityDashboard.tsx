import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Bot,
  Zap,
  MessageSquare,
  ShoppingCart,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { EmptyDataState } from "@/components/DataProvenance";

interface AgentActivity {
  id: string;
  agent_name: string;
  action_type: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  metadata: any;
}

interface AgentStat {
  actions: number;
  success: number;
  revenue: number;
}

const agentIcons: Record<string, any> = {
  "Campaign Agent": Target,
  "Abandoned Cart Agent": ShoppingCart,
  "Lifecycle Agent": TrendingUp,
  "Creative Agent": Zap,
};

const agentColors: Record<string, string> = {
  "Campaign Agent": "text-primary",
  "Abandoned Cart Agent": "text-warning",
  "Lifecycle Agent": "text-info",
  "Creative Agent": "text-accent",
};

const statusIcons: Record<string, any> = {
  completed: CheckCircle2,
  pending: Clock,
  failed: AlertCircle,
};

const statusColors: Record<string, string> = {
  completed: "text-success",
  pending: "text-warning",
  failed: "text-destructive",
};

function formatTimeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function applyActivityToStats(
  stats: Record<string, AgentStat>,
  name: string,
  completed: boolean
): Record<string, AgentStat> {
  const cur = stats[name] ?? { actions: 0, success: 0, revenue: 0 };
  return {
    ...stats,
    [name]: {
      ...cur,
      actions: cur.actions + 1,
      success: cur.success + (completed ? 1 : 0),
    },
  };
}

export function AgentActivityDashboard() {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [stats, setStats] = useState<Record<string, AgentStat>>({});
  const [loadState, setLoadState] = useState<"loading" | "ready">("loading");
  const [filter, setFilter] = useState<string>("all");
  const [isLive, setIsLive] = useState(true);

  // Initial load: real historical notifications + per-agent revenue.
  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: notifs }, { data: rev }] = await Promise.all([
        supabase
          .from("agent_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("agent_revenue").select("agent_name, revenue"),
      ]);
      if (!active) return;

      const rows = (notifs ?? []) as AgentActivity[];
      const nextStats: Record<string, AgentStat> = {};
      for (const r of rows) {
        const completed = r.status === "completed" || r.status === "success";
        const cur = nextStats[r.agent_name] ?? { actions: 0, success: 0, revenue: 0 };
        nextStats[r.agent_name] = {
          actions: cur.actions + 1,
          success: cur.success + (completed ? 1 : 0),
          revenue: cur.revenue,
        };
      }
      for (const r of rev ?? []) {
        const name = (r as any).agent_name as string;
        const cur = nextStats[name] ?? { actions: 0, success: 0, revenue: 0 };
        cur.revenue += Number((r as any).revenue) || 0;
        nextStats[name] = cur;
      }
      setActivities(rows);
      setStats(nextStats);
      setLoadState("ready");
    })();
    return () => {
      active = false;
    };
  }, []);

  // Live updates from real inserts only — no synthetic activity is generated.
  useEffect(() => {
    if (!isLive) return;
    const channel = supabase
      .channel("agent_activities")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_notifications" },
        (payload) => {
          const n = payload.new as AgentActivity;
          setActivities((prev) => [n, ...prev].slice(0, 20));
          const completed = n.status === "completed" || n.status === "success";
          setStats((prev) => applyActivityToStats(prev, n.agent_name, completed));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLive]);

  const filteredActivities =
    filter === "all" ? activities : activities.filter((a) => a.agent_name === filter);

  const statEntries = Object.entries(stats);

  return (
    <div className="space-y-6">
      {/* Live Status Banner */}
      <motion.div
        className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-sidebar to-sidebar/90 p-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="h-6 w-6 text-primary" />
            {isLive && (
              <motion.span
                className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-success"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </div>
          <div>
            <h3 className="font-display font-semibold text-sidebar-foreground">
              Agent Activity
            </h3>
            <p className="text-sm text-sidebar-foreground/70">
              Live feed of actions logged to your workspace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="gap-2"
          >
            <span
              className={`h-2 w-2 rounded-full ${isLive ? "animate-pulse bg-success" : "bg-muted-foreground"}`}
            />
            {isLive ? "Live" : "Paused"}
          </Button>
        </div>
      </motion.div>

      {/* Agent Stats Grid */}
      {loadState === "loading" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : statEntries.length === 0 ? (
        <EmptyDataState
          title="No agent activity yet"
          description="When your agents take actions (or demo mode logs sample events), per-agent stats and the live timeline will appear here — no placeholder numbers are shown."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statEntries.map(([agent, stat], index) => {
            const Icon = agentIcons[agent] || Bot;
            const color = agentColors[agent] || "text-primary";
            const successPct =
              stat.actions > 0 ? Math.round((stat.success / stat.actions) * 1000) / 10 : 0;
            return (
              <motion.div
                key={agent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className={`rounded-lg bg-muted p-2 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="truncate font-medium text-foreground text-sm">{agent}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-foreground">{stat.actions}</p>
                        <p className="text-xs text-muted-foreground">Actions</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-success">{successPct}%</p>
                        <p className="text-xs text-muted-foreground">Success</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-primary">
                          {stat.revenue > 0 ? `$${stat.revenue.toLocaleString()}` : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Activity Timeline */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Activity Timeline
            </CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {statEntries.map(([agent]) => (
                  <SelectItem key={agent} value={agent}>
                    {agent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadState === "loading" ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <EmptyDataState
              title="No activity to show"
              description="There are no agent events to display for this filter yet."
            />
          ) : (
            <div className="scrollbar-thin max-h-[500px] space-y-1 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {filteredActivities.map((activity, index) => {
                  const AgentIcon = agentIcons[activity.agent_name] || Bot;
                  const agentColor = agentColors[activity.agent_name] || "text-primary";
                  const StatusIcon = statusIcons[activity.status] || Clock;
                  const statusColor = statusColors[activity.status] || "text-muted-foreground";

                  return (
                    <motion.div
                      key={activity.id}
                      className="relative border-l-2 border-border pb-4 pl-6 last:border-l-0 last:pb-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.02 }}
                      layout
                    >
                      <div
                        className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 bg-card ${
                          activity.status === "completed"
                            ? "border-success"
                            : activity.status === "pending"
                              ? "border-warning"
                              : "border-destructive"
                        }`}
                      />
                      <div className="flex flex-col gap-2 rounded-lg p-3 hover:bg-muted/50 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className={`flex-shrink-0 rounded-lg bg-muted p-2 ${agentColor}`}>
                            <AgentIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-foreground">
                                {activity.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {activity.agent_name}
                              </Badge>
                            </div>
                            {activity.description && (
                              <p className="line-clamp-1 text-sm text-muted-foreground">
                                {activity.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 pl-11 text-sm sm:pl-0">
                          <span className="whitespace-nowrap text-muted-foreground">
                            {formatTimeAgo(activity.created_at)}
                          </span>
                          <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
