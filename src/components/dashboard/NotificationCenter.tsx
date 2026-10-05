import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Zap,
  Bot
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  agent_name: string;
  action_type: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

const statusConfig = {
  success: { icon: CheckCircle, color: "text-success bg-success/15", label: "Success" },
  warning: { icon: AlertTriangle, color: "text-warning bg-warning/15", label: "Warning" },
  error: { icon: XCircle, color: "text-destructive bg-destructive/15", label: "Error" },
  info: { icon: Info, color: "text-info bg-info/15", label: "Info" },
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel("agent_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_notifications" },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("agent_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    
    setNotifications(data || []);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-card border-l border-border z-50 shadow-lg overflow-hidden flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-foreground">Agent Activity</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-success">Real-time updates enabled</span>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No agent activity yet</p>
                </div>
              ) : (
                notifications.map((notification, index) => {
                  const config = statusConfig[notification.status as keyof typeof statusConfig] || statusConfig.info;
                  const Icon = config.icon;
                  
                  return (
                    <motion.div
                      key={notification.id}
                      className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("p-1.5 rounded-lg", config.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-primary">{notification.agent_name}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{notification.title}</p>
                          {notification.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{notification.description}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Floating notification badge component
export function NotificationBadge({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <motion.button
      className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Bell className="w-5 h-5 text-muted-foreground" />
      {count > 0 && (
        <motion.span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {count > 9 ? "9+" : count}
        </motion.span>
      )}
    </motion.button>
  );
}
