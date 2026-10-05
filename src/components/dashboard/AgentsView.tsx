import { motion } from "framer-motion";
import { AgentCard, AgentStatus } from "./AgentCard";
import { 
  Megaphone, 
  ShoppingCart, 
  Heart, 
  Paintbrush, 
  Brain,
  Zap,
  TrendingUp,
  Settings
} from "lucide-react";

const agents = [
  {
    name: "Campaign Planning Agent",
    description: "Orchestrates end-to-end campaigns including product launches, seasonal promos, and targeted offers",
    status: "active" as AgentStatus,
    icon: Megaphone,
    metrics: [
      { label: "Active Campaigns", value: "12" },
      { label: "Campaign ROI", value: "5.2x" },
      { label: "Avg. Conversion", value: "8.7%" },
      { label: "Revenue Impact", value: "$124k" },
    ],
    actions: 48,
    lastAction: "CNY Dream Collection",
  },
  {
    name: "Lifecycle / Retention Agent",
    description: "Nurtures customers through welcome series, re-engagement flows, and churn prevention",
    status: "active" as AgentStatus,
    icon: Heart,
    metrics: [
      { label: "Retention Rate", value: "72%" },
      { label: "Churn Prevented", value: "340" },
      { label: "Repeat Purchases", value: "+18%" },
      { label: "LTV Increase", value: "+$42" },
    ],
    actions: 89,
    lastAction: "Win-back sequence",
  },
  {
    name: "Abandoned Cart Agent",
    description: "Recovers lost sales with personalized reminders, dynamic incentives, and multi-channel follow-ups",
    status: "active" as AgentStatus,
    icon: ShoppingCart,
    metrics: [
      { label: "Recovery Rate", value: "28.7%" },
      { label: "Carts Recovered", value: "1,245" },
      { label: "Revenue Saved", value: "$48.9k" },
      { label: "Avg. Time", value: "4.2h" },
    ],
    actions: 156,
    lastAction: "Personalized reminder",
  },
  {
    name: "Creative Testing Agent",
    description: "Generates and A/B tests content variants, subject lines, and visuals for optimal engagement",
    status: "learning" as AgentStatus,
    icon: Paintbrush,
    metrics: [
      { label: "Active Tests", value: "8" },
      { label: "Winning Variants", value: "23" },
      { label: "CTR Lift", value: "+34%" },
      { label: "Open Rate Lift", value: "+28%" },
    ],
    actions: 34,
    lastAction: "Subject line test",
  },
];

export function AgentsView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            AI Agent Fleet
          </h2>
          <p className="text-muted-foreground">
            4 specialized agents working together to automate your marketing operations
          </p>
        </div>
        <button className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          <Settings className="w-4 h-4" />
          Configure Agents
        </button>
      </motion.div>

      {/* Agent Summary Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-success" />
            <span className="font-display text-2xl font-bold text-foreground">4</span>
          </div>
          <p className="text-sm text-muted-foreground">Active Agents</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-info" />
            <span className="font-display text-2xl font-bold text-foreground">327</span>
          </div>
          <p className="text-sm text-muted-foreground">Actions Today</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">5.8x</span>
          </div>
          <p className="text-sm text-muted-foreground">Combined ROI</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-warning" />
            <span className="font-display text-2xl font-bold text-foreground">98.2%</span>
          </div>
          <p className="text-sm text-muted-foreground">System Health</p>
        </div>
      </motion.div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent, index) => (
          <AgentCard key={agent.name} {...agent} delay={0.15 + index * 0.1} />
        ))}
      </div>

      {/* Agent Architecture Info */}
      <motion.div
        className="glass-card p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-display font-semibold text-foreground mb-3">How Agents Collaborate</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Each agent operates autonomously with its own purpose, inputs, logic, and success metrics. 
          They share data through a unified customer data platform and coordinate actions through 
          the central AI orchestration layer. When confidence is low or risk is high, agents 
          automatically escalate to humans for review.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Perceive → Reason → Act → Learn
          </span>
          <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
            Multi-Agent Coordination
          </span>
          <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium">
            Human-in-the-Loop
          </span>
        </div>
      </motion.div>
    </div>
  );
}
