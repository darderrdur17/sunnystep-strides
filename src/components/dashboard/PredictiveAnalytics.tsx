import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  DollarSign,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock
} from "lucide-react";
import { 
  AreaChart, Area, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DemoDataBanner } from "@/components/DataProvenance";

const forecastData = [
  { month: "Jan", actual: 245000, forecast: null },
  { month: "Feb", actual: 268000, forecast: null },
  { month: "Mar", actual: 312000, forecast: null },
  { month: "Apr", actual: 287000, forecast: null },
  { month: "May", actual: 342000, forecast: null },
  { month: "Jun", actual: 378000, forecast: null },
  { month: "Jul", actual: null, forecast: 410000 },
  { month: "Aug", actual: null, forecast: 445000 },
  { month: "Sep", actual: null, forecast: 478000 },
  { month: "Oct", actual: null, forecast: 512000 },
];

const churnRiskCustomers = [
  { id: 1, name: "TechCorp Solutions", risk: 87, value: "$45,000", reason: "No engagement 45 days", action: "Personalized re-engagement" },
  { id: 2, name: "Digital First Inc", risk: 72, value: "$32,000", reason: "Declining purchases", action: "Loyalty offer campaign" },
  { id: 3, name: "MarketPro Agency", risk: 65, value: "$28,000", reason: "Support tickets up 200%", action: "Account health check" },
  { id: 4, name: "GrowthScale Ltd", risk: 58, value: "$21,000", reason: "Competitor activity", action: "Value reinforcement" },
  { id: 5, name: "Innovate Studios", risk: 45, value: "$18,000", reason: "Payment delays", action: "Payment plan offer" },
];

const recommendedActions = [
  { 
    id: 1, 
    title: "Launch cart abandonment blitz", 
    impact: "+$24,500 projected", 
    confidence: 94, 
    effort: "Low",
    status: "ready",
    icon: Target
  },
  { 
    id: 2, 
    title: "Activate VIP re-engagement flow", 
    impact: "+$18,200 projected", 
    confidence: 87, 
    effort: "Medium",
    status: "ready",
    icon: Users
  },
  { 
    id: 3, 
    title: "Optimize email send times", 
    impact: "+12% open rate", 
    confidence: 82, 
    effort: "Low",
    status: "pending",
    icon: Zap
  },
  { 
    id: 4, 
    title: "Cross-sell campaign for Q2 buyers", 
    impact: "+$31,000 projected", 
    confidence: 78, 
    effort: "High",
    status: "ready",
    icon: DollarSign
  },
];

const kpiForecasts = [
  { 
    label: "Revenue Forecast", 
    current: "$378,000", 
    forecast: "$512,000", 
    change: 35.4, 
    trend: "up",
    confidence: 89
  },
  { 
    label: "Customer LTV", 
    current: "$2,450", 
    forecast: "$2,890", 
    change: 18.0, 
    trend: "up",
    confidence: 85
  },
  { 
    label: "Churn Rate", 
    current: "4.2%", 
    forecast: "3.1%", 
    change: -26.2, 
    trend: "down",
    confidence: 78
  },
  { 
    label: "Conversion Rate", 
    current: "5.4%", 
    forecast: "6.8%", 
    change: 25.9, 
    trend: "up",
    confidence: 82
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload[0]?.value && (
          <p className="text-sm">
            <span className="text-muted-foreground">Actual: </span>
            <span className="font-semibold text-primary">${(payload[0].value / 1000).toFixed(0)}k</span>
          </p>
        )}
        {payload[1]?.value && (
          <p className="text-sm">
            <span className="text-muted-foreground">Forecast: </span>
            <span className="font-semibold text-success">${(payload[1].value / 1000).toFixed(0)}k</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function PredictiveAnalytics() {
  return (
    <div className="space-y-6">
      <DemoDataBanner message="Revenue forecasts, churn-risk accounts, and recommended actions shown here are illustrative examples. They are not generated from your workspace data — connect live data and an forecasting model to produce real predictions." />

      {/* KPI Forecast Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiForecasts.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{kpi.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {kpi.confidence}% conf.
                  </Badge>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{kpi.forecast}</p>
                    <p className="text-xs text-muted-foreground">from {kpi.current}</p>
                  </div>
                  <div className={`flex items-center gap-1 ${kpi.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {kpi.change > 0 ? '+' : ''}{kpi.change}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Forecast Chart */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="font-display text-lg">Revenue Forecast</CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Forecast</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="month" 
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
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#actualGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="forecast"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#forecastGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <action.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{action.title}</span>
                    </div>
                    {action.status === 'ready' ? (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-warning flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-success font-medium">{action.impact}</span>
                    <Badge variant="secondary" className="text-xs">
                      {action.confidence}% conf.
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Churn Risk Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Churn Risk Analysis
              </CardTitle>
              <Badge variant="outline" className="text-warning border-warning/30 w-fit">
                5 at-risk accounts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Value at Risk</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Reason</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {churnRiskCustomers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground text-sm">{customer.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={customer.risk} 
                            className="w-16 h-2" 
                          />
                          <span className={`text-sm font-medium ${
                            customer.risk >= 70 ? 'text-destructive' : 
                            customer.risk >= 50 ? 'text-warning' : 'text-muted-foreground'
                          }`}>
                            {customer.risk}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground text-sm">{customer.value}</span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{customer.reason}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="text-primary text-xs sm:text-sm">
                          {customer.action}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
