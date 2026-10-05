import { motion } from "framer-motion";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { TechStackPanel } from "./TechStackPanel";
import { RolloutPlan } from "./RolloutPlan";
import { MetricsFramework } from "./MetricsFramework";

export function ArchitectureView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-display text-xl font-bold text-foreground mb-1">
          System Architecture & Implementation
        </h2>
        <p className="text-muted-foreground">
          Complete technical overview: architecture, tech stack, metrics, and rollout plan
        </p>
      </motion.div>

      {/* Architecture Diagram */}
      <ArchitectureDiagram />

      {/* Metrics Framework */}
      <MetricsFramework />

      {/* Tech Stack */}
      <TechStackPanel />

      {/* Rollout Plan */}
      <RolloutPlan />
    </div>
  );
}
