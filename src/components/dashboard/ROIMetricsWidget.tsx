import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Bot,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  BarChart3,
  ArrowUpRight
} from "lucide-react";
import { addDays, format, formatISO, parseISO, startOfDay, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { SampleDataBadge } from "@/components/DataProvenance";

interface AgentRevenue {
  agent_name: string;
  total_revenue: number;
  total_conversions: number;
  total_actions: number;
  total_cost: number;
  roi: number;
  trend: number;
}

interface DrillDownData {
  date: string;
  revenue: number;
  conversions: number;
  actions: number;
}

// Demo data for visualization
const demoAgentRevenue: AgentRevenue[] = [
  { agent_name: "Campaign Agent", total_revenue: 124560, total_conversions: 892, total_actions: 2456, total_cost: 15200, roi: 7.2, trend: 12.5 },
  { agent_name: "Abandoned Cart Agent", total_revenue: 48900, total_conversions: 412, total_actions: 1567, total_cost: 8500, roi: 4.75, trend: 18.2 },
  { agent_name: "Lifecycle Agent", total_revenue: 67800, total_conversions: 523, total_actions: 1890, total_cost: 12000, roi: 4.65, trend: -3.4 },
  { agent_name: "Creative Agent", total_revenue: 26180, total_conversions: 189, total_actions: 678, total_cost: 6800, roi: 2.85, trend: 8.7 },
];

const demoDrillDown: Record<string, DrillDownData[]> = {
  "Campaign Agent": [
    { date: "Jan 21", revenue: 18500, conversions: 132, actions: 345 },
    { date: "Jan 22", revenue: 16200, conversions: 118, actions: 312 },
    { date: "Jan 23", revenue: 19800, conversions: 145, actions: 378 },
    { date: "Jan 24", revenue: 17400, conversions: 128, actions: 334 },
    { date: "Jan 25", revenue: 21300, conversions: 156, actions: 398 },
    { date: "Jan 26", revenue: 15600, conversions: 112, actions: 298 },
    { date: "Jan 27", revenue: 15760, conversions: 101, actions: 391 },
  ],
  "Abandoned Cart Agent": [
    { date: "Jan 21", revenue: 7200, conversions: 58, actions: 234 },
    { date: "Jan 22", revenue: 6800, conversions: 52, actions: 218 },
    { date: "Jan 23", revenue: 7500, conversions: 62, actions: 245 },
    { date: "Jan 24", revenue: 6900, conversions: 55, actions: 221 },
    { date: "Jan 25", revenue: 7800, conversions: 68, actions: 256 },
    { date: "Jan 26", revenue: 6400, conversions: 56, actions: 198 },
    { date: "Jan 27", revenue: 6300, conversions: 61, actions: 195 },
  ],
};

export function ROIMetricsWidget() {
  const [agentData, setAgentData] = useState<AgentRevenue[]>(demoAgentRevenue);
  const [drillDownByAgent, setDrillDownByAgent] = useState<Record<string, DrillDownData[]>>(demoDrillDown);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<DrillDownData[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usingDemo, setUsingDemo] = useState(true);

  const totalRevenue = agentData.reduce((sum, a) => sum + a.total_revenue, 0);
  const totalROI = agentData.length
    ? agentData.reduce((sum, a) => sum + a.roi, 0) / agentData.length
    : 0;
  const totalConversions = agentData.reduce((sum, a) => sum + a.total_conversions, 0);

  const loadAgentRevenue = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const today = startOfDay(new Date());
      const rangeStart = subDays(today, 13);
      const last7Start = subDays(today, 6);
      const dateSeries = Array.from({ length: 7 }, (_, index) => addDays(last7Start, index));

      const { data, error } = await supabase
        .from("agent_revenue")
        .select("agent_name, date, revenue, conversions, actions_taken, cost")
        .gte("date", formatISO(rangeStart, { representation: "date" }))
        .order("date", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setAgentData(demoAgentRevenue);
        setDrillDownByAgent(demoDrillDown);
        setUsingDemo(true);
        return;
      }

      const agentTotals = new Map<string, {
        total_revenue: number;
        total_conversions: number;
        total_actions: number;
        total_cost: number;
        previous_revenue: number;
        drilldown: Record<string, DrillDownData>;
      }>();

      data.forEach((row) => {
        const rowDate = parseISO(row.date);
        if (rowDate < rangeStart) return;

        const agentName = row.agent_name;
        const dateKey = formatISO(rowDate, { representation: "date" });
        const totals = agentTotals.get(agentName) || {
          total_revenue: 0,
          total_conversions: 0,
          total_actions: 0,
          total_cost: 0,
          previous_revenue: 0,
          drilldown: {},
        };

        const revenue = Number(row.revenue ?? 0);
        const conversions = Number(row.conversions ?? 0);
        const actions = Number(row.actions_taken ?? 0);
        const cost = Number(row.cost ?? 0);

        if (rowDate >= last7Start) {
          totals.total_revenue += revenue;
          totals.total_conversions += conversions;
          totals.total_actions += actions;
          totals.total_cost += cost;

          const existing = totals.drilldown[dateKey] || {
            date: format(rowDate, "MMM d"),
            revenue: 0,
            conversions: 0,
            actions: 0,
          };
          totals.drilldown[dateKey] = {
            date: existing.date,
            revenue: existing.revenue + revenue,
            conversions: existing.conversions + conversions,
            actions: existing.actions + actions,
          };
        } else {
          totals.previous_revenue += revenue;
        }

        agentTotals.set(agentName, totals);
      });

      const updatedAgentData: AgentRevenue[] = [];
      const updatedDrillDown: Record<string, DrillDownData[]> = {};

      agentTotals.forEach((totals, agentName) => {
        const trend = totals.previous_revenue > 0
          ? ((totals.total_revenue - totals.previous_revenue) / totals.previous_revenue) * 100
          : 0;
        const roi = totals.total_cost > 0 ? totals.total_revenue / totals.total_cost : 0;

        updatedAgentData.push({
          agent_name: agentName,
          total_revenue: totals.total_revenue,
          total_conversions: totals.total_conversions,
          total_actions: totals.total_actions,
          total_cost: totals.total_cost,
          roi,
          trend: Number(trend.toFixed(1)),
        });

        updatedDrillDown[agentName] = dateSeries.map((date) => {
          const dateKey = formatISO(date, { representation: "date" });
          return totals.drilldown[dateKey] || {
            date: format(date, "MMM d"),
            revenue: 0,
            conversions: 0,
            actions: 0,
          };
        });
      });

      if (updatedAgentData.length > 0) {
        updatedAgentData.sort((a, b) => b.total_revenue - a.total_revenue);
        setAgentData(updatedAgentData);
        setDrillDownByAgent(updatedDrillDown);
        setUsingDemo(false);
      } else {
        setAgentData(demoAgentRevenue);
        setDrillDownByAgent(demoDrillDown);
        setUsingDemo(true);
      }
    } catch (error) {
      console.error("Failed to load ROI metrics:", error);
      setErrorMessage("Live metrics unavailable. Showing illustrative sample values.");
      setAgentData(demoAgentRevenue);
      setDrillDownByAgent(demoDrillDown);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentRevenue();

    const channel = supabase
      .channel("agent_revenue_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_revenue" },
        () => {
          loadAgentRevenue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (expandedAgent) {
      setDrillDownData(drillDownByAgent[expandedAgent] || []);
    }
  }, [expandedAgent, drillDownByAgent]);

  const handleDrillDown = (agentName: string) => {
    if (expandedAgent === agentName) {
      setExpandedAgent(null);
      setDrillDownData([]);
    } else {
      setExpandedAgent(agentName);
      setDrillDownData(drillDownByAgent[agentName] || []);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const maxRevenue = Math.max(1, ...agentData.map(a => a.total_revenue));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              Revenue Attribution by Agent
            </CardTitle>
            <Badge variant="outline" className="text-xs flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${loading ? "bg-warning animate-pulse" : usingDemo ? "bg-warning" : "bg-success animate-pulse"}`} />
              {loading ? "Syncing" : usingDemo ? "Sample" : "Live"}
            </Badge>
            {usingDemo && !loading && <SampleDataBadge />}
          </div>
          {errorMessage && (
            <p className="text-xs text-muted-foreground mt-2">{errorMessage}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-gradient-to-r from-success/10 to-primary/10 border border-success/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
            <div className="text-center sm:border-x sm:border-border sm:px-4">
              <p className="text-2xl font-bold text-foreground">{totalROI.toFixed(1)}x</p>
              <p className="text-xs text-muted-foreground">Avg ROI</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalConversions.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Conversions</p>
            </div>
          </div>

          {/* Agent Breakdown */}
          <div className="space-y-2">
            {agentData.map((agent, index) => (
              <motion.div
                key={agent.agent_name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    expandedAgent === agent.agent_name
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30 hover:bg-muted/30'
                  }`}
                  onClick={() => handleDrillDown(agent.agent_name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground text-sm">{agent.agent_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-semibold text-foreground">{formatCurrency(agent.total_revenue)}</span>
                        <div className={`flex items-center text-xs ${agent.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {agent.trend >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                          {Math.abs(agent.trend)}%
                        </div>
                      </div>
                      {expandedAgent === agent.agent_name ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Revenue bar */}
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(agent.total_revenue / maxRevenue) * 100} 
                      className="h-2 flex-1"
                    />
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      {agent.roi.toFixed(1)}x ROI
                    </Badge>
                  </div>

                  {/* Metrics row */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {agent.total_conversions} conv
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {agent.total_actions} actions
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(agent.total_cost)} cost
                    </span>
                  </div>
                </div>

                {/* Drill-down panel */}
                <AnimatePresence>
                  {expandedAgent === agent.agent_name && drillDownData.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 mt-1 rounded-lg bg-muted/50 border border-border">
                        <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          7-Day Performance Breakdown
                        </h5>
                        <div className="space-y-2">
                          {drillDownData.map((day, i) => (
                            <div key={day.date} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm">
                              <span className="w-full sm:w-14 text-muted-foreground">{day.date}</span>
                              <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-success to-primary"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(day.revenue / Math.max(1, ...drillDownData.map(d => d.revenue))) * 100}%` }}
                                  transition={{ delay: i * 0.05, duration: 0.3 }}
                                />
                              </div>
                              <span className="w-full sm:w-20 text-right font-medium text-foreground">
                                {formatCurrency(day.revenue)}
                              </span>
                              <span className="w-full sm:w-16 text-right text-muted-foreground text-xs">
                                {day.conversions} conv
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* View full report link */}
          <Button variant="ghost" className="w-full gap-2 text-primary">
            View Full Revenue Report
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
