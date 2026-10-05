import { supabase } from "@/integrations/supabase/client";

/**
 * Central data-access layer for the marketing-analytics surfaces.
 *
 * All dashboard views read through these functions so there is a single source
 * of truth for queries and aggregation (charter §24: reusable services over
 * duplicated logic, and clear UI / data boundaries).
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export interface RevenuePoint {
  name: string;
  revenue: number;
  conversions: number;
}

export interface CampaignSummary {
  id: string;
  name: string;
  type: "email" | "sms" | "web";
  status: "active" | "scheduled" | "completed";
  sent: number;
  openRate: number;
  conversionRate: number;
  revenue: string;
}

export interface OverviewMetrics {
  totalRevenue: number;
  revenueChangePct: number | null;
  activeCampaigns: number;
  avgConversion: number | null;
  agentActions: number;
  monthly: RevenuePoint[];
  campaigns: CampaignSummary[];
  hasAnyData: boolean;
}

const asStr = (v: unknown): string => (typeof v === "string" ? v : "");
const asNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Loads the landing-page (Overview) metrics from the workspace. */
export async function fetchOverview(): Promise<OverviewMetrics> {
  const { data: revenueRows, error: revError } = await supabase
    .from("agent_revenue")
    .select("revenue, date, conversions, actions_taken");
  if (revError) throw revError;

  const { data: campaignRows, error: campError } = await supabase
    .from("campaigns")
    .select("id, name, type, status, sent_count, open_rate, conversion_rate, revenue");
  if (campError) throw campError;

  const rev = revenueRows ?? [];
  const camps = campaignRows ?? [];

  const totalRevenue = rev.reduce((sum, r) => sum + asNum(r.revenue), 0);
  const agentActions = rev.reduce((sum, r) => sum + asNum(r.actions_taken), 0);

  const byMonth = new Map<string, { revenue: number; conversions: number }>();
  for (const r of rev) {
    const d = new Date(asStr(r.date));
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const cur = byMonth.get(key) ?? { revenue: 0, conversions: 0 };
    cur.revenue += asNum(r.revenue);
    cur.conversions += asNum(r.conversions);
    byMonth.set(key, cur);
  }
  const monthly: RevenuePoint[] = [...byMonth.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-12)
    .map(([key, v]) => ({
      name: MONTHS[Number(key.split("-")[1])],
      revenue: Math.round(v.revenue),
      conversions: Math.round(v.conversions),
    }));

  let revenueChangePct: number | null = null;
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1].revenue;
    const prev = monthly[monthly.length - 2].revenue;
    revenueChangePct = prev > 0 ? Math.round(((last - prev) / prev) * 1000) / 10 : null;
  }

  const activeCampaigns = camps.filter((c) => asStr(c.status) === "active").length;
  const conversions = camps.map((c) => asNum(c.conversion_rate)).filter((n) => n > 0);
  const avgConversion =
    conversions.length > 0
      ? Math.round((conversions.reduce((a, b) => a + b, 0) / conversions.length) * 10) / 10
      : null;

  const campaigns: CampaignSummary[] = camps.map((c: Record<string, unknown>) => ({
    id: asStr(c.id),
    name: asStr(c.name),
    type: (["email", "sms", "web"].includes(asStr(c.type)) ? asStr(c.type) : "email") as CampaignSummary["type"],
    status: (["active", "scheduled", "completed"].includes(asStr(c.status))
      ? asStr(c.status)
      : "scheduled") as CampaignSummary["status"],
    sent: asNum(c.sent_count),
    openRate: asNum(c.open_rate),
    conversionRate: asNum(c.conversion_rate),
    revenue: c.revenue != null ? `$${asNum(c.revenue).toLocaleString()}` : "—",
  }));

  return {
    totalRevenue,
    revenueChangePct,
    activeCampaigns,
    avgConversion,
    agentActions,
    monthly,
    campaigns,
    hasAnyData: rev.length > 0 || camps.length > 0,
  };
}

export interface ChannelPerformance {
  channel: string;
  revenue: number;
  sent: number;
  conversions: number;
}

export interface AgentContribution {
  agent_name: string;
  revenue: number;
  share: number;
}

export interface AnalyticsData {
  channels: ChannelPerformance[];
  agents: AgentContribution[];
  hasData: boolean;
}

/** Loads the Analytics tab metrics (channel performance + agent contribution). */
export async function fetchAnalytics(): Promise<AnalyticsData> {
  const [{ data: campRows }, { data: revRows }] = await Promise.all([
    supabase.from("campaigns").select("type, revenue, sent_count, conversion_rate"),
    supabase.from("agent_revenue").select("agent_name, revenue"),
  ]);

  const camps = (campRows ?? []) as Record<string, unknown>[];
  const revs = (revRows ?? []) as Record<string, unknown>[];

  const channelMap = new Map<string, ChannelPerformance>();
  for (const c of camps) {
    const ch = asStr(c.type) || "email";
    const cur = channelMap.get(ch) ?? { channel: ch, revenue: 0, sent: 0, conversions: 0 };
    cur.revenue += asNum(c.revenue);
    cur.sent += asNum(c.sent_count);
    const conv = asNum(c.conversion_rate)
      ? Math.round((asNum(c.conversion_rate) / 100) * asNum(c.sent_count))
      : 0;
    cur.conversions += conv;
    channelMap.set(ch, cur);
  }

  const agentMap = new Map<string, number>();
  for (const r of revs) {
    agentMap.set(asStr(r.agent_name), (agentMap.get(asStr(r.agent_name)) ?? 0) + asNum(r.revenue));
  }
  const total = [...agentMap.values()].reduce((a, b) => a + b, 0) || 1;
  const agents: AgentContribution[] = [...agentMap.entries()].map(([agent_name, revenue]) => ({
    agent_name,
    revenue,
    share: Math.round((revenue / total) * 1000) / 10,
  }));

  return {
    channels: [...channelMap.values()],
    agents,
    hasData: camps.length > 0 || revs.length > 0,
  };
}
