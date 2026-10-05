import { motion } from "framer-motion";
import { CheckCircle, Circle, ArrowRight, Rocket, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  id: string;
  name: string;
  status: "completed" | "current" | "upcoming";
  description: string;
  milestones: string[];
  duration: string;
}

const phases: Phase[] = [
  {
    id: "mvp",
    name: "MVP (Proof of Concept)",
    status: "current",
    description: "Start small with highest-impact use cases to validate the AI loop",
    milestones: [
      "Implement Abandoned Cart Agent",
      "Basic Welcome sequence (email only)",
      "Integrate with Klaviyo ESP",
      "Validate data collection & AI loop",
      "Measure cart recovery improvement",
    ],
    duration: "4-6 weeks",
  },
  {
    id: "scale",
    name: "Scale-Up",
    status: "upcoming",
    description: "Expand to cross-channel campaigns and more sophisticated agents",
    milestones: [
      "Add SMS/WhatsApp channels",
      "Launch Lifecycle & Campaign agents",
      "Web personalization integration",
      "Value-based segmentation",
      "Retrain models with new data",
    ],
    duration: "8-12 weeks",
  },
  {
    id: "optimize",
    name: "Optimize & Evolve",
    status: "upcoming",
    description: "Advanced personalization, new creative formats, and deeper governance",
    milestones: [
      "Dynamic pricing/offers (1:1)",
      "AI-generated images/video scripts",
      "Paid ad bidding agents",
      "Predictive uplift modeling",
      "Role-based approval workflows",
    ],
    duration: "Ongoing",
  },
];

const phaseIcons = {
  mvp: Rocket,
  scale: TrendingUp,
  optimize: Sparkles,
};

const statusStyles = {
  completed: "bg-success text-success-foreground",
  current: "bg-primary text-primary-foreground",
  upcoming: "bg-muted text-muted-foreground",
};

export function RolloutPlan() {
  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">3-Phase Rollout Plan</h3>
        <p className="text-sm text-muted-foreground">
          Iterative delivery: MVP → Scale → Optimize
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {phases.map((phase, index) => {
          const Icon = phaseIcons[phase.id as keyof typeof phaseIcons];
          return (
            <motion.div
              key={phase.id}
              className={cn(
                "relative p-5 rounded-xl border-2 transition-all duration-300",
                phase.status === "current" 
                  ? "border-primary bg-primary/5" 
                  : "border-border bg-secondary/20"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              {/* Phase Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    phase.status === "current" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{phase.name}</h4>
                    <p className="text-xs text-muted-foreground">{phase.duration}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                  statusStyles[phase.status]
                )}>
                  {phase.status}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{phase.description}</p>

              {/* Milestones */}
              <ul className="space-y-2">
                {phase.milestones.map((milestone, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {phase.status === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <Circle className={cn(
                        "w-4 h-4 shrink-0 mt-0.5",
                        phase.status === "current" && i === 0 ? "text-primary" : "text-muted-foreground"
                      )} />
                    )}
                    <span className={cn(
                      phase.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {milestone}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Arrow connector */}
              {index < phases.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="bg-card border border-border rounded-full p-1">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Experimentation Note */}
      <motion.div
        className="mt-6 p-4 rounded-lg bg-info/10 border border-info/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h4 className="font-medium text-foreground mb-1">Experimentation Approach</h4>
        <p className="text-sm text-muted-foreground">
          Built-in A/B tests in every agent workflow. Control groups (10% manual flow, 90% AI flow) 
          measure lift. Multi-arm bandit optimization for new strategies. Continuous comparison of 
          automated vs. manual results.
        </p>
      </motion.div>
    </motion.div>
  );
}
