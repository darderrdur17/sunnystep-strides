import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { SampleDataBadge, DemoDataBanner } from "@/components/DataProvenance";

interface ChannelDatum { name: string; revenue: number; }
interface AgentDatum { name: string; value: number; color: string; }
interface FunnelDatum { stage: string; value: number; rate: number; }
interface TrendDatum { day: string; automated: number; manual: number; }

const AGENT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
];

const CHANNEL_LABEL: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  web_push: "Web Push",
};

/* Illustrative fallbacks — only shown when no live data exists. */
const sampleChannel: ChannelDatum[] = [
  { name: "Email", revenue: 124500 },
  { name: "SMS", revenue: 48200 },
  { name: "WhatsApp", revenue: 31800 },
  { name: "Web Push", revenue: 62400 },
];

const sampleAgent: AgentDatum[] = [
  { name: "Campaign Agent", value: 42, color: AGENT_COLORS[0] },
  { name: "Abandoned Cart", value: 28, color: AGENT_COLORS[1] },
  { name: "Lifecycle", value: 18, color: AGENT_COLORS[2] },
  { name: "Creative", value: 12, color: AGENT_COLORS[3] },
];

const sampleFunnel: FunnelDatum[] = [
  { stage: "Impressions", value: 100000, rate: 100 },
  { stage: "Clicks", value: 42000, rate: 42 },
  { stage: "Add to Cart", value: 18500, rate: 18.5 },
  { stage: "Checkout", value: 8200, rate: 8.2 },
  { stage: "Purchase", value: 5400, rate: 5.4 },
];

const sampleTrend: TrendDatum[] = [
  { day: "Mon", automated: 2400, manual: 800 },
  { day: "Tue", automated: 2800, manual: 750 },
  { day: "Wed", automated: 3200, manual: 600 },
  { day: "Thu", automated: 2900, manual: 550 },
  { day: "Fri", automated: 3500, manual: 480 },
  { day: "Sat", automated: 4200, manual: 400 },
  { day: "Sun", automated: 3800, manual: 350 },
];

function buildChannels(rows: Array<{ type: string | null; revenue: number | null }>): ChannelDatum[] {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const label = (r.type && CHANNEL_LABEL[r.type]) || r.type || "Other";
    map.set(label, (map.get(label) ?? 0) + Number(r.revenue ?? 0));
  });
  return Array.from(map.entries()).map(([name, revenue]) => ({ name, revenue }));
}

function buildAgents(rows: Array<{ agent_name: string; revenue: number }>): AgentDatum[] {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    map.set(r.agent_name, (map.get(r.agent_name) ?? 0) + Number(r.revenue ?? 0));
  });
  const total = Array.from(map.values()).reduce((a, b) => a + b, 0) || 1;
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 100),
      color: AGENT_COLORS[i % AGENT_COLORS.length],
    }));
}

export function AnalyticsCharts() {
  const [channel, setChannel] = useState<ChannelDatum[] | null>(null);
  const [agent, setAgent] = useState<AgentDatum[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [campaigns, revenue] = await Promise.all([
          supabase.from("campaigns").select("type, revenue"),
          supabase.from("agent_revenue").select("agent_name, revenue"),
        ]);
        if (!active) return;
        setChannel(buildChannels((campaigns.data ?? []) as Array<{ type: string | null; revenue: number | null }>));
        setAgent(buildAgents((revenue.data ?? []) as Array<{ agent_name: string; revenue: number }>));
      } catch {
        // Network/permission failure -> fall back to labeled sample data.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const channelData = channel && channel.length ? channel : sampleChannel;
  const agentData = agent && agent.length ? agent : sampleAgent;
  const channelIsSample = !channel || !channel.length;
  const agentIsSample = !agent || !agent.length;
  const allSample = channelIsSample && agentIsSample;

  return (
    <div className="space-y-6">
      {allSample && !loading && (
        <DemoDataBanner message="Channel and agent revenue shown here are illustrative samples. Click 'Demo Tools → Load Demo Data' to populate real, internally-consistent figures." />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-5 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-foreground">Channel Performance</h3>
              <p className="text-sm text-muted-foreground">Revenue by marketing channel</p>
            </div>
            {channelIsSample && <SampleDataBadge />}
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Agent Contribution */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="mb-5 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-foreground">Agent Contribution</h3>
              <p className="text-sm text-muted-foreground">Revenue share by AI agent</p>
            </div>
            {agentIsSample && <SampleDataBadge />}
          </div>
          <div className="h-[280px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {agentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value}%`, "Share"]}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Conversion Funnel (illustrative — no live source yet) */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="mb-5 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-foreground">Conversion Funnel</h3>
              <p className="text-sm text-muted-foreground">Customer journey performance</p>
            </div>
            <SampleDataBadge />
          </div>
          <div className="space-y-3">
            {sampleFunnel.map((stage, index) => (
              <motion.div
                key={stage.stage}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{stage.stage}</span>
                  <span className="text-sm text-muted-foreground">
                    {stage.value.toLocaleString()} ({stage.rate}%)
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.rate}%` }}
                    transition={{ delay: 0.4 + index * 0.05, duration: 0.6 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Automation vs Manual (illustrative — no live source yet) */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="mb-5 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-foreground">Automation Impact</h3>
              <p className="text-sm text-muted-foreground">AI-driven vs manual campaigns</p>
            </div>
            <SampleDataBadge />
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="automated"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="manual"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 0 }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-sm text-foreground capitalize">
                      {value === "automated" ? "AI Automated" : "Manual"}
                    </span>
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
