import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Save, 
  RotateCcw,
  Mail, 
  MessageSquare, 
  Bell, 
  Globe,
  Sliders,
  Zap,
  AlertTriangle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AgentCreator } from "./AgentCreator";

interface AgentConfig {
  id: string;
  agent_name: string;
  is_active: boolean;
  confidence_threshold: number;
  max_actions_per_day: number;
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  web_push_enabled: boolean;
  frequency_cap_hours: number;
}

export function AgentConfigurationPanel() {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("agent_configurations")
      .select("*")
      .order("agent_name");
    
    if (error) {
      toast({ title: "Error loading configurations", variant: "destructive" });
    } else {
      setConfigs(data || []);
    }
    setLoading(false);
  };

  const updateConfig = (id: string, field: keyof AgentConfig, value: any) => {
    setConfigs(prev => 
      prev.map(c => c.id === id ? { ...c, [field]: value } : c)
    );
  };

  const saveConfigs = async () => {
    setSaving(true);
    for (const config of configs) {
      await supabase
        .from("agent_configurations")
        .update({
          is_active: config.is_active,
          confidence_threshold: config.confidence_threshold,
          max_actions_per_day: config.max_actions_per_day,
          email_enabled: config.email_enabled,
          sms_enabled: config.sms_enabled,
          whatsapp_enabled: config.whatsapp_enabled,
          web_push_enabled: config.web_push_enabled,
          frequency_cap_hours: config.frequency_cap_hours,
        })
        .eq("id", config.id);
    }
    
    // Create notification for activity sync
    if (configs.length > 0) {
      await supabase.from("agent_notifications").insert({
        agent_name: "System",
        action_type: "config_updated",
        title: "Agent configurations updated",
        description: `${configs.length} agent(s) configuration saved`,
        status: "completed",
      });
    }
    
    toast({ title: "Configurations saved successfully" });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Agent Configuration</h2>
          <p className="text-muted-foreground">Adjust parameters, thresholds, and channel preferences</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchConfigs} size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveConfigs} disabled={saving} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save All"}
          </Button>
          <AgentCreator onAgentCreated={fetchConfigs} />
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {configs.map((config, index) => (
          <motion.div
            key={config.id}
            className="glass-card p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Agent Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2.5 rounded-xl",
                  config.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                )}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{config.agent_name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {config.is_active ? "Active" : "Paused"}
                  </p>
                </div>
              </div>
              <Switch
                checked={config.is_active}
                onCheckedChange={(v) => updateConfig(config.id, "is_active", v)}
              />
            </div>

            {/* Thresholds */}
            <div className="space-y-4 mb-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-muted-foreground" />
                    Confidence Threshold
                  </label>
                  <span className="text-sm font-mono text-primary">{(config.confidence_threshold * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[config.confidence_threshold * 100]}
                  onValueChange={([v]) => updateConfig(config.id, "confidence_threshold", v / 100)}
                  max={100}
                  min={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Actions below this confidence escalate to human review
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                    Max Actions/Day
                  </label>
                  <span className="text-sm font-mono text-primary">{config.max_actions_per_day}</span>
                </div>
                <Slider
                  value={[config.max_actions_per_day]}
                  onValueChange={([v]) => updateConfig(config.id, "max_actions_per_day", v)}
                  max={500}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Frequency Cap (hours)</label>
                  <span className="text-sm font-mono text-primary">{config.frequency_cap_hours}h</span>
                </div>
                <Slider
                  value={[config.frequency_cap_hours]}
                  onValueChange={([v]) => updateConfig(config.id, "frequency_cap_hours", v)}
                  max={72}
                  min={4}
                  step={4}
                  className="w-full"
                />
              </div>
            </div>

            {/* Channel Toggles */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-3">Enabled Channels</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm">Email</span>
                  </div>
                  <Switch
                    checked={config.email_enabled}
                    onCheckedChange={(v) => updateConfig(config.id, "email_enabled", v)}
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-success" />
                    <span className="text-sm">SMS</span>
                  </div>
                  <Switch
                    checked={config.sms_enabled}
                    onCheckedChange={(v) => updateConfig(config.id, "sms_enabled", v)}
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-success" />
                    <span className="text-sm">WhatsApp</span>
                  </div>
                  <Switch
                    checked={config.whatsapp_enabled}
                    onCheckedChange={(v) => updateConfig(config.id, "whatsapp_enabled", v)}
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-warning" />
                    <span className="text-sm">Web Push</span>
                  </div>
                  <Switch
                    checked={config.web_push_enabled}
                    onCheckedChange={(v) => updateConfig(config.id, "web_push_enabled", v)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
