import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Bell, 
  BellOff, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Smartphone,
  Settings,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  isPushSupported, 
  getNotificationPermission, 
  requestNotificationPermission,
  showLocalNotification 
} from "@/lib/pushNotifications";

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category: "agent" | "campaign" | "system";
}

const defaultPreferences: NotificationPreference[] = [
  {
    id: "agent_action",
    label: "Agent Actions",
    description: "When an AI agent takes an important action",
    enabled: true,
    category: "agent"
  },
  {
    id: "agent_error",
    label: "Agent Errors",
    description: "When an agent encounters an error or needs attention",
    enabled: true,
    category: "agent"
  },
  {
    id: "campaign_start",
    label: "Campaign Start",
    description: "When a scheduled campaign begins",
    enabled: true,
    category: "campaign"
  },
  {
    id: "campaign_complete",
    label: "Campaign Complete",
    description: "When a campaign finishes execution",
    enabled: false,
    category: "campaign"
  },
  {
    id: "high_revenue",
    label: "Revenue Milestones",
    description: "When significant revenue thresholds are reached",
    enabled: true,
    category: "system"
  },
  {
    id: "churn_alert",
    label: "Churn Risk Alerts",
    description: "When high-value customers show churn risk",
    enabled: true,
    category: "system"
  },
];

export function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [preferences, setPreferences] = useState<NotificationPreference[]>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported(isPushSupported());
    setPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    const result = await requestNotificationPermission();
    setPermission(result);
    setIsLoading(false);
    
    if (result === 'granted') {
      toast.success("Push notifications enabled!");
      // Send test notification
      await showLocalNotification({
        title: "Notifications Enabled",
        body: "You'll now receive real-time agent alerts",
        tag: "test-notification"
      });
    } else if (result === 'denied') {
      toast.error("Permission denied. Please enable in browser settings.");
    }
  };

  const handleTestNotification = async () => {
    const success = await showLocalNotification({
      title: "Test Notification",
      body: "Campaign Agent completed 5 actions in the last hour",
      tag: "test-notification",
      data: { route: "activity" }
    });
    
    if (success) {
      toast.success("Test notification sent!");
    } else {
      toast.error("Failed to send notification");
    }
  };

  const togglePreference = (id: string) => {
    setPreferences(prev => 
      prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const getStatusBadge = () => {
    if (!isSupported) {
      return <Badge variant="destructive">Not Supported</Badge>;
    }
    switch (permission) {
      case 'granted':
        return <Badge className="bg-success text-success-foreground">Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="secondary">Not Enabled</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (!isSupported || permission === 'denied') {
      return <XCircle className="w-5 h-5 text-destructive" />;
    }
    if (permission === 'granted') {
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    }
    return <AlertTriangle className="w-5 h-5 text-warning" />;
  };

  const groupedPreferences = {
    agent: preferences.filter(p => p.category === 'agent'),
    campaign: preferences.filter(p => p.category === 'campaign'),
    system: preferences.filter(p => p.category === 'system'),
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Push Notification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Browser Notifications</span>
                    {getStatusBadge()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {!isSupported && "Your browser doesn't support push notifications"}
                    {isSupported && permission === 'granted' && "Receiving real-time agent alerts"}
                    {isSupported && permission === 'denied' && "Notifications blocked in browser settings"}
                    {isSupported && permission === 'default' && "Enable to receive real-time alerts"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {permission === 'granted' && (
                  <Button variant="outline" size="sm" onClick={handleTestNotification}>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                )}
                {permission !== 'granted' && isSupported && (
                  <Button onClick={handleRequestPermission} disabled={isLoading}>
                    <Bell className="w-4 h-4 mr-2" />
                    {isLoading ? "Requesting..." : "Enable Notifications"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Preferences */}
      {permission === 'granted' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Agent Notifications */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Agent Notifications
                </h4>
                <div className="space-y-3">
                  {groupedPreferences.agent.map((pref) => (
                    <div 
                      key={pref.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <Label className="font-medium">{pref.label}</Label>
                        <p className="text-xs text-muted-foreground">{pref.description}</p>
                      </div>
                      <Switch 
                        checked={pref.enabled}
                        onCheckedChange={() => togglePreference(pref.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Campaign Notifications */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-success" />
                  Campaign Notifications
                </h4>
                <div className="space-y-3">
                  {groupedPreferences.campaign.map((pref) => (
                    <div 
                      key={pref.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <Label className="font-medium">{pref.label}</Label>
                        <p className="text-xs text-muted-foreground">{pref.description}</p>
                      </div>
                      <Switch 
                        checked={pref.enabled}
                        onCheckedChange={() => togglePreference(pref.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* System Notifications */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  System Alerts
                </h4>
                <div className="space-y-3">
                  {groupedPreferences.system.map((pref) => (
                    <div 
                      key={pref.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <Label className="font-medium">{pref.label}</Label>
                        <p className="text-xs text-muted-foreground">{pref.description}</p>
                      </div>
                      <Switch 
                        checked={pref.enabled}
                        onCheckedChange={() => togglePreference(pref.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
