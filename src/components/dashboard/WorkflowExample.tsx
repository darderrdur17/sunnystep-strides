import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Mail, MessageSquare, CheckCircle, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "trigger" | "decision" | "action" | "measure";
}

interface WorkflowExampleProps {
  title: string;
  description: string;
  steps: WorkflowStep[];
  delay?: number;
}

const stepColors = {
  trigger: "bg-warning/15 text-warning border-warning/30",
  decision: "bg-info/15 text-info border-info/30",
  action: "bg-primary/15 text-primary border-primary/30",
  measure: "bg-success/15 text-success border-success/30",
};

export function WorkflowExample({ title, description, steps, delay = 0 }: WorkflowExampleProps) {
  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="mb-5">
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            <motion.div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border",
                stepColors[step.type]
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {step.icon}
              <div>
                <p className="text-xs font-medium">{step.title}</p>
                <p className="text-xs opacity-70 line-clamp-1">{step.description}</p>
              </div>
            </motion.div>
            
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.15 + index * 0.1 }}
              >
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Pre-configured workflow examples for Sunnystep
export const abandonedCartWorkflow: WorkflowStep[] = [
  {
    id: "1",
    title: "Cart Abandoned",
    description: "User leaves without checkout",
    icon: <ShoppingCart className="w-4 h-4" />,
    type: "trigger",
  },
  {
    id: "2",
    title: "Evaluate Profile",
    description: "Check value & history",
    icon: <User className="w-4 h-4" />,
    type: "decision",
  },
  {
    id: "3",
    title: "Send Reminder",
    description: "Personalized email",
    icon: <Mail className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "4",
    title: "Follow-up SMS",
    description: "If unopened in 6h",
    icon: <MessageSquare className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "5",
    title: "Track Conversion",
    description: "Measure recovery rate",
    icon: <CheckCircle className="w-4 h-4" />,
    type: "measure",
  },
];

export const welcomeWorkflow: WorkflowStep[] = [
  {
    id: "1",
    title: "New Signup",
    description: "Account created",
    icon: <User className="w-4 h-4" />,
    type: "trigger",
  },
  {
    id: "2",
    title: "Segment User",
    description: "Product preference",
    icon: <Clock className="w-4 h-4" />,
    type: "decision",
  },
  {
    id: "3",
    title: "Welcome Email",
    description: "Brand story + 10% off",
    icon: <Mail className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "4",
    title: "Follow-up",
    description: "Shoe care tips",
    icon: <Mail className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "5",
    title: "Track 2nd Purchase",
    description: "Measure onboarding",
    icon: <CheckCircle className="w-4 h-4" />,
    type: "measure",
  },
];
