import { 
  LayoutDashboard, 
  Bot, 
  Workflow, 
  BarChart3, 
  Shield, 
  Settings, 
  Cpu,
  ChevronRight,
  Sliders,
  Megaphone,
  Map,
  FlaskConical,
  Mail,
  User,
  TrendingUp,
  Activity,
  MessageSquare,
  Users,
  Link2,
  Bell,
  Calendar,
  DollarSign,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "agents", label: "AI Agents", icon: Bot },
  { id: "config", label: "Configuration", icon: Sliders },
  { id: "activity", label: "Agent Activity", icon: Activity },
  { id: "roi", label: "ROI Metrics", icon: DollarSign },
  { id: "predictive", label: "Predictive", icon: TrendingUp },
  { id: "calendar", label: "Content Calendar", icon: Calendar },
  { id: "workflows", label: "Workflows", icon: Workflow },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "segments", label: "Segments", icon: Users },
  { id: "journey", label: "Customer Journey", icon: Map },
  { id: "abtests", label: "A/B Testing", icon: FlaskConical },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "templates", label: "Email Templates", icon: Mail },
  { id: "messaging", label: "SMS & WhatsApp", icon: MessageSquare },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "notifications", label: "Push Alerts", icon: Bell },
  { id: "team", label: "Team", icon: Building2 },
  { id: "guardrails", label: "Guardrails", icon: Shield },
  { id: "architecture", label: "Architecture", icon: Cpu },
];

const bottomNavItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange, className }: SidebarProps) {
  return (
    <aside className={cn("w-64 h-full bg-sidebar flex flex-col border-r border-sidebar-border", className)}>
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Sunnystep Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-display font-bold text-base sm:text-lg text-sidebar-foreground">Sunnystep Strides</h1>
            <p className="text-xs text-sidebar-foreground/60">AI Marketing Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 min-h-0 p-3 sm:p-4 space-y-0.5 sm:space-y-1 overflow-y-auto scrollbar-thin overscroll-contain touch-pan-y"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "nav-item w-full relative text-sm sm:text-base py-2 sm:py-2.5",
                isActive && "active"
              )}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 sm:p-4 border-t border-sidebar-border">
        {bottomNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "nav-item w-full relative mb-1 text-sm sm:text-base py-2 sm:py-2.5",
                isActive && "active"
              )}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="flex-1 text-left">{item.label}</span>
            </motion.button>
          );
        })}
        
        {/* System Status */}
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-sidebar-accent">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
            <span className="text-xs font-medium text-sidebar-foreground">System Active</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60">
            4 agents running • 12 campaigns
          </p>
        </div>
      </div>
    </aside>
  );
}
