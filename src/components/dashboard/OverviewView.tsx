import { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Megaphone,
  ShoppingCart,
  Target,
  Zap,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "./MetricCard";
import { PerformanceChart, type PerformancePoint } from "./PerformanceChart";
import { CampaignList, type Campaign } from "./CampaignList";
import { AgentCard, type AgentStatus } from "./AgentCard";
import { DemoDataBanner, EmptyDataState } from "@/components/DataProvenance";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface OverviewData {
  totalRevenue: number;
  revenueChangePct: number | null;
  activeCampaigns: number;
  avgConversion: number | null;
  agentActions: number;
  monthly: PerformancePoint[];
  campaigns: Campaign[];
  hasAnyData: boolean;
}

type LoadState = "loading" | "ready" | "error";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Static agent roster (configuration exists regardless of logged activity).
const agentsPreview = [
  {
    name: "Campaign Agent",
    description: "Orchestrates end-to-end marketing campaigns",
    status: "active" as AgentStatus,
    icon: Megaphone,
    metrics: [
      { label: "Active Campaigns", value: "—" },
      { label: "ROI", value: "—" },
    ],
    actions: 0,
    lastAction: "—",
  },
  {
    name: "Abandoned Cart Agent",
    description: "Recovers lost sales with personalized nudges",
    status: "active" as AgentStatus,
    icon: ShoppingCart,
    metrics: [
      { label: "Recovery Rate", value: "—" },
      { label: "Revenue", value: "—" },
    ],
    actions: 0,
    lastAction: "—",
  },
];

async function loadOverview(): Promise<OverviewData> {
  // Revenue + actions from the agent_revenue ledger.
  const { data: revenueRows, error: revError } = await supabase
    .from("agent_revenue")
    .select("revenue, date, conversions, actions_taken");
  if (revError) throw revError;

  // Campaigns from the campaigns table.
  const { data: campaignRows, error: campError } = await supabase
    .from("campaigns")
    .select("id, name, type, status, sent_count, open_rate, conversion_rate, revenue");
  if (campError) throw campError;

  const rev = revenueRows ?? [];
  const camps = campaignRows ?? [];

  const totalRevenue = rev.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0);
  const agentActions = rev.reduce((sum, r) => sum + (Number(r.actions_taken) || 0), 0);

  // Monthly aggregation (last 12 months present in the data).
  const byMonth = new Map<string, { revenue: number; conversions: number }>();
  for (const r of rev) {
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const cur = byMonth.get(key) ?? { revenue: 0, conversions: 0 };
    cur.revenue += Number(r.revenue) || 0;
    cur.conversions += Number(r.conversions) || 0;
    byMonth.set(key, cur);
  }
  const monthly: PerformancePoint[] = [...byMonth.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-12)
    .map(([key, v]) => ({
      name: MONTHS[Number(key.split("-")[1])],
      revenue: Math.round(v.revenue),
      conversions: Math.round(v.conversions),
    }));

  // Month-over-month revenue change.
  let revenueChangePct: number | null = null;
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1].revenue;
    const prev = monthly[monthly.length - 2].revenue;
    revenueChangePct = prev > 0 ? Math.round(((last - prev) / prev) * 1000) / 10 : null;
  }

  const activeCampaigns = camps.filter((c: any) => c.status === "active").length;
  const conversions = camps
    .map((c: any) => Number(c.conversion_rate))
    .filter((n: number) => !Number.isNaN(n));
  const avgConversion =
    conversions.length > 0
      ? Math.round((conversions.reduce((a, b) => a + b, 0) / conversions.length) * 10) / 10
      : null;

  const campaigns: Campaign[] = camps.map((c: any) => ({
    id: c.id,
    name: c.name,
    type: (["email", "sms", "web"].includes(c.type) ? c.type : "email") as Campaign["type"],
    status: (["active", "scheduled", "completed"].includes(c.status)
      ? c.status
      : "scheduled") as Campaign["status"],
    sent: Number(c.sent_count) || 0,
    openRate: Number(c.open_rate) || 0,
    conversionRate: Number(c.conversion_rate) || 0,
    revenue: c.revenue != null ? `$${Number(c.revenue).toLocaleString()}` : "—",
  }));

  const hasAnyData = rev.length > 0 || camps.length > 0;

  return {
    totalRevenue,
    revenueChangePct,
    activeCampaigns,
    avgConversion,
    agentActions,
    monthly,
    campaigns,
    hasAnyData,
  };
}

export function OverviewView() {
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<OverviewData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fetchData = useCallback(async () => {
    setState("loading");
    setErrorMsg("");
    try {
      const result = await loadOverview();
      setData(result);
      setState("ready");
    } catch (err) {
      console.error("Overview load failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to load overview data.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isSample = state === "ready" && !data?.hasAnyData;

  const kpis = data
    ? [
        {
          title: "Attributed Revenue",
          value: `$${data.totalRevenue.toLocaleString()}`,
          change: data.revenueChangePct,
          changeLabel: "vs last month",
          icon: DollarSign,
          iconColor: "text-success",
        },
        {
          title: "Active Campaigns",
          value: `${data.activeCampaigns}`,
          change: null,
          changeLabel: "currently running",
          icon: Target,
          iconColor: "text-primary",
        },
        {
          title: "Avg Conversion Rate",
          value: data.avgConversion != null ? `${data.avgConversion}%` : "—",
          change: null,
          changeLabel: "across campaigns",
          icon: TrendingUp,
          iconColor: "text-info",
        },
        {
          title: "Automated Actions",
          value: `${data.agentActions.toLocaleString()}`,
          change: null,
          changeLabel: "agent actions logged",
          icon: Zap,
          iconColor: "text-accent",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Provenance / state banner */}
      {state === "ready" && isSample && (
        <DemoDataBanner message="Your workspace has no recorded activity yet. The figures below are illustrative samples — connect a data source or run demo mode to populate real, attributed metrics." />
      )}

      {/* Welcome Banner */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sidebar to-sidebar/90 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="mb-2 font-display text-2xl font-bold text-sidebar-foreground">
              {state === "loading"
                ? "Loading your marketing workspace…"
                : "Welcome back to your AI marketing engine."}
            </h2>
            <p className="max-w-2xl text-sidebar-foreground/70">
              {state === "ready" && data?.hasAnyData
                ? `Track attributed revenue, live campaigns, and autonomous agent activity — all derived from your workspace data.`
                : `Your AI agents are ready. Once campaigns and revenue are logged, real performance metrics appear here.`}
            </p>
          </div>
          <motion.div
            className="hidden h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 lg:flex"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <Zap className="h-10 w-10 text-primary" />
          </motion.div>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-48 w-48 translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </motion.div>

      {/* KPI Grid */}
      {state === "loading" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : state === "error" ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="font-medium text-foreground">Couldn't load overview data</p>
          <p className="max-w-sm text-xs text-muted-foreground">{errorMsg}</p>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((metric, index) => (
            <MetricCard key={metric.title} {...metric} delay={0.1 + index * 0.05} />
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {state === "loading" ? (
            <Skeleton className="h-[380px] w-full rounded-xl" />
          ) : (
            <PerformanceChart data={data?.monthly} />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">Active Agents</h3>
            <span className="cursor-pointer text-sm font-medium text-primary hover:underline">
              View All
            </span>
          </div>
          {agentsPreview.map((agent, index) => (
            <AgentCard key={agent.name} {...agent} delay={0.2 + index * 0.1} />
          ))}
        </div>
      </div>

      {/* Campaign List */}
      {state === "loading" ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : state === "error" ? (
        <EmptyDataState
          title="Campaign data unavailable"
          description="We couldn't retrieve your campaigns. Use Retry on the metrics above, or check your connection."
        />
      ) : (
        <CampaignList campaigns={data?.campaigns} />
      )}
    </div>
  );
}
