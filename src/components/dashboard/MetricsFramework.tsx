import { motion } from "framer-motion";
import { Target, TrendingUp, Users, DollarSign, Repeat, Activity, Zap } from "lucide-react";

interface Metric {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "north-star" | "engagement" | "conversion" | "retention";
}

const metrics: Metric[] = [
  {
    id: "revenue",
    name: "Marketing-Driven Revenue",
    description: "Primary metric: Revenue directly attributed to AI-automated campaigns",
    icon: <DollarSign className="w-5 h-5" />,
    category: "north-star",
  },
  {
    id: "conversion",
    name: "Conversion Rate",
    description: "Percentage of leads/visitors that convert to customers",
    icon: <Target className="w-5 h-5" />,
    category: "north-star",
  },
  {
    id: "open-rate",
    name: "Open Rate",
    description: "Percentage of recipients who open emails/messages",
    icon: <Activity className="w-5 h-5" />,
    category: "engagement",
  },
  {
    id: "ctr",
    name: "Click-Through Rate",
    description: "Percentage of recipients who click on links",
    icon: <Zap className="w-5 h-5" />,
    category: "engagement",
  },
  {
    id: "mql-sql",
    name: "MQL to SQL Rate",
    description: "Marketing qualified leads that become sales qualified",
    icon: <TrendingUp className="w-5 h-5" />,
    category: "conversion",
  },
  {
    id: "cac",
    name: "Customer Acquisition Cost",
    description: "Total cost to acquire a new customer",
    icon: <DollarSign className="w-5 h-5" />,
    category: "conversion",
  },
  {
    id: "repeat-rate",
    name: "Repeat Purchase Rate",
    description: "Percentage of customers who make multiple purchases",
    icon: <Repeat className="w-5 h-5" />,
    category: "retention",
  },
  {
    id: "ltv",
    name: "Customer Lifetime Value",
    description: "Total revenue expected from a customer relationship",
    icon: <Users className="w-5 h-5" />,
    category: "retention",
  },
];

const categoryLabels = {
  "north-star": "North Star Metrics",
  engagement: "Engagement",
  conversion: "Conversion",
  retention: "Retention",
};

const categoryColors = {
  "north-star": "bg-primary/15 text-primary border-primary/30",
  engagement: "bg-info/15 text-info border-info/30",
  conversion: "bg-success/15 text-success border-success/30",
  retention: "bg-warning/15 text-warning border-warning/30",
};

export function MetricsFramework() {
  const categories = ["north-star", "engagement", "conversion", "retention"] as const;

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Success Metrics Framework</h3>
        <p className="text-sm text-muted-foreground">
          KPIs aligned with business outcomes across the funnel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category, catIndex) => {
          const categoryMetrics = metrics.filter(m => m.category === category);
          return (
            <motion.div
              key={category}
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + catIndex * 0.1 }}
            >
              <h4 className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-lg inline-block ${categoryColors[category]}`}>
                {categoryLabels[category]}
              </h4>
              
              <div className="space-y-2">
                {categoryMetrics.map((metric, i) => (
                  <motion.div
                    key={metric.id}
                    className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + catIndex * 0.1 + i * 0.05 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${categoryColors[category].split(' ')[1]}`}>
                        {metric.icon}
                      </span>
                      <span className="font-medium text-sm text-foreground">{metric.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
