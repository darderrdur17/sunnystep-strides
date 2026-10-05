import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type WorkflowStep } from "./workflowExamplesData";

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
