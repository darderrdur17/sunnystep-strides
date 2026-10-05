import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SampleDataBadge } from "@/components/DataProvenance";

export interface PerformancePoint {
  name: string;
  revenue: number;
  conversions: number;
}

/** Fallback illustrative series — only shown when no live data exists. */
const sampleData: PerformancePoint[] = [
  { name: "Jan", revenue: 32400, conversions: 420 },
  { name: "Feb", revenue: 38200, conversions: 480 },
  { name: "Mar", revenue: 45600, conversions: 560 },
  { name: "Apr", revenue: 52100, conversions: 620 },
  { name: "May", revenue: 48900, conversions: 580 },
  { name: "Jun", revenue: 58400, conversions: 710 },
  { name: "Jul", revenue: 67200, conversions: 850 },
];

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string; name?: string }>;
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="mb-2 font-medium text-foreground">{label}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="text-muted-foreground">Revenue: </span>
            <span className="font-semibold text-primary">
              ${payload[0]?.value?.toLocaleString()}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Conversions: </span>
            <span className="font-semibold text-success">{payload[1]?.value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function PerformanceChart({
  data,
}: {
  /** When omitted, an illustrative sample series is shown (clearly labeled). */
  data?: PerformancePoint[];
}) {
  const isSample = !data || data.length === 0;
  const points = isSample ? sampleData : data!;

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-foreground">
              Revenue &amp; Conversions
            </h3>
            {isSample && <SampleDataBadge />}
          </div>
          <p className="text-sm text-muted-foreground">
            {isSample
              ? "Illustrative sample — connect data to see live performance"
              : "Marketing performance over time"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Conversions</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="conversionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
            <Area
              type="monotone"
              dataKey="conversions"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#conversionsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
