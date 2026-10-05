import { motion } from "framer-motion";
import { 
  Brain, 
  Database, 
  Mail, 
  BarChart3, 
  Link, 
  DollarSign,
  Zap,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TechItem {
  id: string;
  category: string;
  name: string;
  description: string;
  costImpact: "low" | "medium" | "high";
  businessImpact: "low" | "medium" | "high";
  icon: React.ReactNode;
}

const techStack: TechItem[] = [
  {
    id: "llm",
    category: "LLM / AI Framework",
    name: "Google Gemini via Vertex AI",
    description: "State-of-the-art multilingual LLM for planning, copywriting, and coordination. Competitive pricing with high reasoning capability.",
    costImpact: "medium",
    businessImpact: "high",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    id: "data",
    category: "Data Store & ETL",
    name: "Google BigQuery + Cloud Dataflow",
    description: "Scalable cloud data warehouse with unified analytics. Pay-per-query pricing, integrates with all marketing tools.",
    costImpact: "low",
    businessImpact: "high",
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: "crm",
    category: "CRM / ESP / Messaging",
    name: "Klaviyo + Twilio",
    description: "E-commerce-focused platform with native email, SMS, and predictive features. Twilio for WhatsApp delivery.",
    costImpact: "medium",
    businessImpact: "high",
    icon: <Mail className="w-5 h-5" />,
  },
  {
    id: "analytics",
    category: "Tracking & Analytics",
    name: "Google Analytics 4 + Looker Studio",
    description: "Full-funnel tracking with e-commerce attribution. Split.io for experimentation framework.",
    costImpact: "low",
    businessImpact: "medium",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: "integrations",
    category: "Integrations",
    name: "APIs & Webhooks",
    description: "Connectors to email/SMS providers, Facebook Ads API, Google Ads API, and website backend.",
    costImpact: "low",
    businessImpact: "high",
    icon: <Link className="w-5 h-5" />,
  },
];

const impactColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/15 text-warning",
  high: "bg-success/15 text-success",
};

export function TechStackPanel() {
  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Recommended Tech Stack</h3>
          <p className="text-sm text-muted-foreground">Cost vs. impact analysis for key components</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Cost</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Impact</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {techStack.map((item, index) => (
          <motion.div
            key={item.id}
            className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              {item.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{item.category}</p>
                  <h4 className="font-medium text-foreground">{item.name}</h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Cost</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                      impactColors[item.costImpact]
                    )}>
                      {item.costImpact}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Impact</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                      impactColors[item.businessImpact]
                    )}>
                      {item.businessImpact}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
