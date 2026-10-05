import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Sparkles, Database, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startDemoMode, stopDemoMode, isDemoModeRunning } from "@/lib/demoMode";
import { seedDemoData, clearDemoData, hasDemoData } from "@/lib/demoSeed";
import { useToast } from "@/hooks/use-toast";

/**
 * Floating "Demo Tools" control.
 *
 * Consolidates the three demo affordances the platform needs for showcasing:
 *   1. Load Demo Data  — seeds a realistic, internally-consistent dataset.
 *   2. Clear Demo Data — removes the seeded rows.
 *   3. Start/Stop live synthetic activity (legacy "Demo Mode").
 */
export function DemoModeToggle() {
  const [isRunning, setIsRunning] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsRunning(isDemoModeRunning());
    hasDemoData().then(setHasData).catch(() => setHasData(false));
  }, []);

  const refreshHasData = () => hasDemoData().then(setHasData).catch(() => setHasData(false));

  const handleLoad = async () => {
    setBusy(true);
    const res = await seedDemoData();
    setBusy(false);
    if (res.ok) {
      setHasData(true);
      toast({
        title: "Demo data loaded",
        description: "Sample campaigns, revenue, A/B tests & notifications added.",
      });
    } else {
      toast({
        title: "Could not load demo data",
        description: res.error ?? "Check your Supabase connection and RLS permissions.",
      });
    }
  };

  const handleClear = async () => {
    setBusy(true);
    const res = await clearDemoData();
    setBusy(false);
    if (res.ok) {
      setHasData(false);
      toast({ title: "Demo data cleared", description: "Seeded rows removed." });
    } else {
      toast({
        title: "Could not clear demo data",
        description: res.error ?? "You may lack delete permission on these tables.",
      });
    }
  };

  const handleActivity = () => {
    if (isRunning) {
      stopDemoMode();
      setIsRunning(false);
      toast({ title: "Live activity stopped", description: "Real-time notifications paused." });
    } else {
      startDemoMode();
      setIsRunning(true);
      toast({
        title: "Live activity started!",
        description: "Watch the notification panel for simulated AI agent activity.",
      });
    }
  };

  return (
    <motion.div
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-72 z-30 flex flex-col items-start gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="w-60 rounded-xl border border-border bg-card/95 backdrop-blur p-3 shadow-xl space-y-2"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-foreground">Demo Tools</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  hasData ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {hasData ? "Data loaded" : "No demo data"}
              </span>
            </div>

            <Button
              onClick={handleLoad}
              disabled={busy}
              variant="default"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Database className="w-4 h-4" />
              Load Demo Data
            </Button>

            <Button
              onClick={handleClear}
              disabled={busy || !hasData}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Demo Data
            </Button>

            <div className="border-t border-border my-1" />

            <Button
              onClick={handleActivity}
              disabled={busy}
              variant={isRunning ? "destructive" : "secondary"}
              size="sm"
              className="w-full justify-start gap-2"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? "Stop Live Activity" : "Start Live Activity"}
            </Button>

            <p className="text-[10px] leading-snug text-muted-foreground px-1">
              "Live Activity" streams synthetic notifications. "Load Demo Data" populates the
              analytics, ROI and A/B views with realistic numbers.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setOpen((v) => !v)}
        variant="default"
        className="shadow-lg gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Demo Tools
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </Button>

      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/15 text-success text-xs font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live Demo Active
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
