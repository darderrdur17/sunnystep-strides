import { Bell, Search, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  subtitle?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export function Header({ title, subtitle, notificationCount = 0, onNotificationClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Title */}
        <div>
          <motion.h1 
            className="font-display text-2xl font-bold text-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            key={title}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              className="text-sm text-muted-foreground mt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Assistant Hint */}
          <motion.div 
            className="hidden lg:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium"
            whileHover={{ scale: 1.02 }}
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>AI-Powered</span>
          </motion.div>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search campaigns, agents..."
              className="w-48 lg:w-64 pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-sm 
                       focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
                       transition-all duration-200"
            />
          </div>

          {/* Notifications */}
          <motion.button 
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNotificationClick}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {notificationCount > 0 && (
              <motion.span 
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {notificationCount > 99 ? "99+" : notificationCount}
              </motion.span>
            )}
          </motion.button>

          {/* User */}
          <motion.button 
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
