import { motion } from "framer-motion";
import { WorkflowExample } from "./WorkflowExample";
import { abandonedCartWorkflow, welcomeWorkflow } from "./workflowExamplesData";
import { ShoppingCart, User, Tag, Sparkles, ArrowRight, Zap, Gift } from "lucide-react";
import { WorkflowCreator } from "./WorkflowCreator";

const productLaunchWorkflow = [
  {
    id: "1",
    title: "New Product",
    description: "CNY Edition added",
    icon: <Tag className="w-4 h-4" />,
    type: "trigger" as const,
  },
  {
    id: "2",
    title: "Set Goals",
    description: "Sell 500 units",
    icon: <Zap className="w-4 h-4" />,
    type: "decision" as const,
  },
  {
    id: "3",
    title: "Generate Creative",
    description: "A/B test images",
    icon: <Sparkles className="w-4 h-4" />,
    type: "action" as const,
  },
  {
    id: "4",
    title: "Launch Campaign",
    description: "Email + Social + SMS",
    icon: <Gift className="w-4 h-4" />,
    type: "action" as const,
  },
  {
    id: "5",
    title: "Track Sales",
    description: "Compare vs target",
    icon: <ArrowRight className="w-4 h-4" />,
    type: "measure" as const,
  },
];

export function WorkflowsView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            Automation Workflows
          </h2>
          <p className="text-muted-foreground">
            AI-orchestrated marketing automation sequences
          </p>
        </div>
        <WorkflowCreator />
      </motion.div>

      {/* Workflow Legend */}
      <motion.div
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className="px-3 py-1 rounded-lg bg-warning/15 text-warning border border-warning/30 text-sm font-medium">
          Trigger
        </span>
        <span className="px-3 py-1 rounded-lg bg-info/15 text-info border border-info/30 text-sm font-medium">
          Decision
        </span>
        <span className="px-3 py-1 rounded-lg bg-primary/15 text-primary border border-primary/30 text-sm font-medium">
          Action
        </span>
        <span className="px-3 py-1 rounded-lg bg-success/15 text-success border border-success/30 text-sm font-medium">
          Measure
        </span>
      </motion.div>

      {/* Workflows */}
      <div className="space-y-4">
        <WorkflowExample
          title="Abandoned Cart Recovery"
          description="Recovers lost sales with personalized multi-channel follow-ups and dynamic incentives"
          steps={abandonedCartWorkflow}
          delay={0.15}
        />
        
        <WorkflowExample
          title="New Customer Welcome & Onboarding"
          description="Nurtures new signups with brand storytelling, tips, and personalized cross-sell offers"
          steps={welcomeWorkflow}
          delay={0.25}
        />
        
        <WorkflowExample
          title="Product Launch Campaign"
          description="AI-orchestrated multi-channel launch with goal-driven optimization and creative testing"
          steps={productLaunchWorkflow}
          delay={0.35}
        />
      </div>

      {/* Workflow Details */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <h3 className="font-display font-semibold text-foreground mb-4">Workflow Automation Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">Personalization Capabilities</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Dynamic content based on user profile, purchase history, and behavior</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>LLM-generated copy consistent with Sunnystep's "Comfort" messaging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Smart timing optimization based on engagement patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Dynamic incentives (discounts, free gifts) based on user value</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-2">Measurement & Learning</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
                <span>Real-time tracking of opens, clicks, conversions, and revenue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
                <span>Automatic A/B testing with multi-armed bandit optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
                <span>Continuous model retraining based on performance data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
                <span>Closed feedback loop ensures ongoing optimization</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
