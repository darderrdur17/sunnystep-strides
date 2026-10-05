import { motion } from "framer-motion";
import { 
  Database, 
  Brain, 
  Mail, 
  MessageSquare, 
  Globe, 
  BarChart3,
  RefreshCw,
  ArrowRight,
  Shield,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ArchNode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "data" | "intelligence" | "execution" | "feedback";
}

const nodes: ArchNode[] = [
  { id: "shopline", title: "Shopline", description: "E-commerce data", icon: <Database className="w-4 h-4" />, category: "data" },
  { id: "crm", title: "CRM/CDP", description: "Customer profiles", icon: <Database className="w-4 h-4" />, category: "data" },
  { id: "analytics", title: "GA4", description: "Web analytics", icon: <BarChart3 className="w-4 h-4" />, category: "data" },
  { id: "llm", title: "AI Brain", description: "LLM + Rules Engine", icon: <Brain className="w-4 h-4" />, category: "intelligence" },
  { id: "guardrails", title: "Guardrails", description: "Safety & Compliance", icon: <Shield className="w-4 h-4" />, category: "intelligence" },
  { id: "email", title: "Email", description: "Klaviyo/Braze", icon: <Mail className="w-4 h-4" />, category: "execution" },
  { id: "sms", title: "SMS/WhatsApp", description: "Twilio", icon: <MessageSquare className="w-4 h-4" />, category: "execution" },
  { id: "web", title: "Web", description: "Personalization", icon: <Globe className="w-4 h-4" />, category: "execution" },
  { id: "feedback", title: "Feedback Loop", description: "Continuous learning", icon: <RefreshCw className="w-4 h-4" />, category: "feedback" },
];

const categoryColors = {
  data: "bg-info/15 text-info border-info/30",
  intelligence: "bg-primary/15 text-primary border-primary/30",
  execution: "bg-success/15 text-success border-success/30",
  feedback: "bg-warning/15 text-warning border-warning/30",
};

const categoryLabels = {
  data: "Data Sources",
  intelligence: "Decision Intelligence",
  execution: "Execution Channels",
  feedback: "Learning Loop",
};

export function ArchitectureDiagram() {
  const categories = ["data", "intelligence", "execution", "feedback"] as const;

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">System Architecture</h3>
        <p className="text-sm text-muted-foreground">
          Data → Decision → Action → Feedback loop
        </p>
      </div>

      {/* Architecture Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((category, catIndex) => {
          const categoryNodes = nodes.filter(n => n.category === category);
          return (
            <div key={category} className="relative">
              {/* Category Header */}
              <motion.div
                className="mb-3 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + catIndex * 0.1 }}
              >
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  categoryColors[category]
                )}>
                  {categoryLabels[category]}
                </span>
              </motion.div>

              {/* Nodes */}
              <div className="space-y-2">
                {categoryNodes.map((node, nodeIndex) => (
                  <motion.div
                    key={node.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      categoryColors[category]
                    )}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + catIndex * 0.1 + nodeIndex * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="p-2 rounded-lg bg-card">
                      {node.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{node.title}</p>
                      <p className="text-xs opacity-70">{node.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Arrow between categories */}
              {catIndex < categories.length - 1 && (
                <motion.div
                  className="hidden md:flex absolute -right-3 top-1/2 transform -translate-y-1/2 z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + catIndex * 0.1 }}
                >
                  <div className="bg-card border border-border rounded-full p-1">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flow Description */}
      <motion.div
        className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Continuous Learning Loop</span>
        </div>
        <p className="text-sm text-muted-foreground">
          AI agents continuously perceive customer data, reason about optimal actions, execute personalized campaigns, 
          and learn from results to improve future performance. All actions are logged and governed by brand guardrails.
        </p>
      </motion.div>
    </motion.div>
  );
}
