import { motion } from "framer-motion";
import { 
  User, 
  Eye, 
  ShoppingCart, 
  Mail, 
  MessageSquare, 
  CreditCard, 
  Heart,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyStage {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  agentTouchpoints: string[];
  conversionRate: number;
  dropoffRate: number;
}

const journeyStages: JourneyStage[] = [
  {
    id: "awareness",
    name: "Awareness",
    icon: <Eye className="w-5 h-5" />,
    description: "First visit to website or social",
    agentTouchpoints: ["Campaign Agent (Paid Ads)", "Creative Agent (Content)"],
    conversionRate: 100,
    dropoffRate: 0,
  },
  {
    id: "interest",
    name: "Interest",
    icon: <User className="w-5 h-5" />,
    description: "Browses products, signs up",
    agentTouchpoints: ["Lifecycle Agent (Welcome)", "Creative Agent (A/B Test)"],
    conversionRate: 42,
    dropoffRate: 58,
  },
  {
    id: "consideration",
    name: "Consideration",
    icon: <ShoppingCart className="w-5 h-5" />,
    description: "Adds to cart, compares",
    agentTouchpoints: ["Abandoned Cart Agent", "Campaign Agent (Retargeting)"],
    conversionRate: 18.5,
    dropoffRate: 23.5,
  },
  {
    id: "purchase",
    name: "Purchase",
    icon: <CreditCard className="w-5 h-5" />,
    description: "Completes transaction",
    agentTouchpoints: ["Lifecycle Agent (Order)", "Campaign Agent (Upsell)"],
    conversionRate: 5.4,
    dropoffRate: 13.1,
  },
  {
    id: "loyalty",
    name: "Loyalty",
    icon: <Heart className="w-5 h-5" />,
    description: "Repeat purchase, referral",
    agentTouchpoints: ["Lifecycle Agent (Retention)", "Campaign Agent (VIP)"],
    conversionRate: 2.8,
    dropoffRate: 2.6,
  },
];

interface TouchpointLine {
  from: string;
  to: string;
  agent: string;
  channel: string;
  label: string;
}

const touchpointLines: TouchpointLine[] = [
  { from: "awareness", to: "interest", agent: "Campaign Agent", channel: "Social Ad", label: "12,450 visitors" },
  { from: "interest", to: "consideration", agent: "Lifecycle Agent", channel: "Welcome Email", label: "5,228 engaged" },
  { from: "consideration", to: "purchase", agent: "Abandoned Cart Agent", channel: "Cart Reminder", label: "28.7% recovered" },
  { from: "purchase", to: "loyalty", agent: "Lifecycle Agent", channel: "Thank You + Review", label: "72% retained" },
];

export function CustomerJourneyMap() {
  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Customer Journey Map</h3>
        <p className="text-sm text-muted-foreground">
          How customers flow through different agent touchpoints
        </p>
      </div>

      {/* Funnel Visualization */}
      <div className="relative">
        {/* Journey Stages - Horizontal scroll on mobile, grid on larger screens */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile: Horizontal scroll */}
          <div className="block sm:hidden overflow-x-auto -mx-6 px-6 pb-4 scrollbar-thin">
            <div className="flex gap-4 min-w-max">
              {journeyStages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  className="relative flex-shrink-0 w-[280px]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Stage Card */}
                  <div className="bg-secondary/30 rounded-xl p-4 border border-border hover:border-primary/30 transition-colors h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        {stage.icon}
                      </div>
                      <h4 className="font-medium text-foreground text-sm">{stage.name}</h4>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">{stage.description}</p>
                    
                    {/* Conversion Rate Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Conversion</span>
                        <span className="font-medium text-foreground">{stage.conversionRate}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.conversionRate}%` }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Agent Touchpoints */}
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1.5">Agents:</p>
                      <div className="flex flex-wrap gap-1">
                        {stage.agentTouchpoints.map((agent, i) => (
                          <span 
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                          >
                            {agent.split(" ")[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Arrow to next stage */}
                  {index < journeyStages.length - 1 && (
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="bg-card border border-border rounded-full p-1">
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {journeyStages.map((stage, index) => (
              <motion.div
                key={stage.id}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Stage Card */}
                <div className="bg-secondary/30 rounded-xl p-4 border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {stage.icon}
                    </div>
                    <h4 className="font-medium text-foreground text-sm">{stage.name}</h4>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">{stage.description}</p>
                  
                  {/* Conversion Rate Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Conversion</span>
                      <span className="font-medium text-foreground">{stage.conversionRate}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.conversionRate}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Agent Touchpoints */}
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-1.5">Agents:</p>
                    <div className="flex flex-wrap gap-1">
                      {stage.agentTouchpoints.map((agent, i) => (
                        <span 
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                        >
                          {agent.split(" ")[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arrow to next stage */}
                {index < journeyStages.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="bg-card border border-border rounded-full p-1">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Touchpoint Details - Stack on mobile, grid on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {touchpointLines.map((line, index) => (
            <motion.div
              key={`${line.from}-${line.to}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="p-1.5 rounded-lg bg-success/15 text-success flex-shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{line.agent}</p>
                <p className="text-xs text-muted-foreground truncate">{line.channel}</p>
                <p className="text-xs font-semibold text-primary mt-0.5">{line.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <motion.div
        className="mt-6 pt-4 border-t border-border flex flex-wrap gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Campaign Agent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Lifecycle Agent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-xs text-muted-foreground">Abandoned Cart Agent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-info" />
          <span className="text-xs text-muted-foreground">Creative Agent</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
