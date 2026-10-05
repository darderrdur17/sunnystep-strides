import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Moon, 
  Sun, 
  Globe, 
  Bell,
  Shield,
  Database,
  Save,
  Monitor,
  Palette,
  Clock,
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UserSettings {
  theme: string;
  language: string;
  date_format: string;
  sidebar_collapsed: boolean;
}

interface NotificationPrefs {
  email: boolean;
  push: boolean;
  sms: boolean;
  agent_alerts: boolean;
  campaign_updates: boolean;
  weekly_digest: boolean;
}

export function SettingsView() {
  const [settings, setSettings] = useState<UserSettings>({
    theme: "system",
    language: "en",
    date_format: "MM/DD/YYYY",
    sidebar_collapsed: false,
  });
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email: true,
    push: true,
    sms: false,
    agent_alerts: true,
    campaign_updates: true,
    weekly_digest: true,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    // In a real app, save to database
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({ title: "Settings saved successfully!" });
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Manage your preferences and account settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Appearance</h3>
              <p className="text-sm text-muted-foreground">Customize how the dashboard looks</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "light", icon: Sun, label: "Light" },
                  { value: "dark", icon: Moon, label: "Dark" },
                  { value: "system", icon: Monitor, label: "System" },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setSettings({ ...settings, theme: value })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      settings.theme === value 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Language</label>
              <Select value={settings.language} onValueChange={(v) => setSettings({ ...settings, language: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文 (Chinese)</SelectItem>
                  <SelectItem value="ms">Bahasa Melayu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Date Format</label>
              <Select value={settings.date_format} onValueChange={(v) => setSettings({ ...settings, date_format: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-warning/15 text-warning">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
              { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
              { key: "sms", label: "SMS Notifications", desc: "Text message alerts" },
              { key: "agent_alerts", label: "Agent Alerts", desc: "When agents need attention" },
              { key: "campaign_updates", label: "Campaign Updates", desc: "Campaign performance alerts" },
              { key: "weekly_digest", label: "Weekly Digest", desc: "Summary email every week" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={notifications[key as keyof NotificationPrefs]}
                  onCheckedChange={(v) => setNotifications({ ...notifications, [key]: v })}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data & Privacy */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-info/15 text-info">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Data & Privacy</h3>
              <p className="text-sm text-muted-foreground">Manage your data and privacy settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">Data Retention</p>
                <span className="text-sm text-primary">90 days</span>
              </div>
              <p className="text-xs text-muted-foreground">How long we keep your campaign data</p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">Analytics Tracking</p>
                <Switch defaultChecked />
              </div>
              <p className="text-xs text-muted-foreground">Allow collection of usage analytics</p>
            </div>

            <Button variant="outline" className="w-full">
              <Database className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
          </div>
        </motion.div>

        {/* Account */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Account</h3>
              <p className="text-sm text-muted-foreground">Manage your account settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Timezone</label>
              <Select defaultValue="Asia/Singapore">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                  <SelectItem value="Asia/Hong_Kong">Asia/Hong Kong (GMT+8)</SelectItem>
                  <SelectItem value="America/New_York">America/New York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>

            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
