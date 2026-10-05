import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Link2, 
  CheckCircle2, 
  XCircle, 
  Settings,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Zap,
  ShoppingBag,
  BarChart3,
  Mail,
  MessageSquare,
  Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "connected" | "disconnected" | "error";
  category: "ecommerce" | "analytics" | "marketing" | "communication";
  lastSync?: string;
  features: string[];
}

const integrations: Integration[] = [
  {
    id: "shopify",
    name: "Shopify",
    description: "Sync products, orders, and customer data",
    icon: ShoppingBag,
    status: "disconnected",
    category: "ecommerce",
    features: ["Product catalog sync", "Order management", "Customer data", "Inventory tracking"]
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    description: "Email and SMS marketing automation",
    icon: Mail,
    status: "disconnected",
    category: "marketing",
    features: ["Email campaigns", "SMS automation", "Flow triggers", "Segment sync"]
  },
  {
    id: "google_analytics",
    name: "Google Analytics",
    description: "Website traffic and conversion tracking",
    icon: BarChart3,
    status: "disconnected",
    category: "analytics",
    features: ["Traffic analysis", "Conversion tracking", "Audience insights", "Goal monitoring"]
  },
  {
    id: "meta_ads",
    name: "Meta Ads",
    description: "Facebook and Instagram advertising",
    icon: MessageSquare,
    status: "disconnected",
    category: "marketing",
    features: ["Ad management", "Audience sync", "Conversion API", "Creative testing"]
  },
  {
    id: "google_ads",
    name: "Google Ads",
    description: "Search and display advertising",
    icon: Zap,
    status: "disconnected",
    category: "marketing",
    features: ["Campaign sync", "Conversion tracking", "Audience lists", "Smart bidding"]
  },
  {
    id: "segment",
    name: "Segment",
    description: "Customer data platform",
    icon: Database,
    status: "disconnected",
    category: "analytics",
    features: ["Event tracking", "Identity resolution", "Data routing", "Real-time sync"]
  },
];

const categoryLabels: Record<string, string> = {
  ecommerce: "E-Commerce",
  analytics: "Analytics",
  marketing: "Marketing",
  communication: "Communication",
};

export function APIIntegrationsPanel() {
  const [integrationsList, setIntegrationsList] = useState<Integration[]>(integrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    
    setIsConnecting(true);
    // Simulate API connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIntegrationsList(prev => 
      prev.map(i => i.id === selectedIntegration?.id 
        ? { ...i, status: "connected" as const, lastSync: new Date().toISOString() } 
        : i
      )
    );
    
    toast.success(`${selectedIntegration?.name} connected successfully!`);
    setIsConnecting(false);
    setApiKey("");
    setSelectedIntegration(null);
  };

  const handleDisconnect = (id: string) => {
    setIntegrationsList(prev =>
      prev.map(i => i.id === id ? { ...i, status: "disconnected" as const, lastSync: undefined } : i)
    );
    toast.success("Integration disconnected");
  };

  const handleSync = async (id: string) => {
    const integration = integrationsList.find(i => i.id === id);
    toast.info(`Syncing ${integration?.name}...`);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIntegrationsList(prev =>
      prev.map(i => i.id === id ? { ...i, lastSync: new Date().toISOString() } : i)
    );
    toast.success(`${integration?.name} synced successfully`);
  };

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-success text-success-foreground gap-1"><CheckCircle2 className="w-3 h-3" /> Connected</Badge>;
      case "error":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" /> Error</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><XCircle className="w-3 h-3" /> Not Connected</Badge>;
    }
  };

  const groupedIntegrations = Object.entries(
    integrationsList.reduce((acc, i) => {
      if (!acc[i.category]) acc[i.category] = [];
      acc[i.category].push(i);
      return acc;
    }, {} as Record<string, Integration[]>)
  );

  const connectedCount = integrationsList.filter(i => i.status === "connected").length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-sidebar to-sidebar/90 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20">
            <Link2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sidebar-foreground">
              API Integrations
            </h3>
            <p className="text-sm text-sidebar-foreground/70">
              {connectedCount} of {integrationsList.length} integrations active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            <span>Auto-sync</span>
          </div>
        </div>
      </motion.div>

      {/* Integration Categories */}
      {groupedIntegrations.map(([category, items], categoryIndex) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {categoryLabels[category]}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
              >
                <Card className="glass-card h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          integration.status === 'connected' 
                            ? 'bg-success/15 text-success' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <integration.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{integration.name}</h4>
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      {getStatusBadge(integration.status)}
                    </div>

                    {integration.status === 'connected' && integration.lastSync && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Last synced: {new Date(integration.lastSync).toLocaleString()}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-4">
                      {integration.features.slice(0, 3).map(feature => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.features.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 gap-1"
                            onClick={() => handleSync(integration.id)}
                          >
                            <RefreshCw className="w-3 h-3" />
                            Sync
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="w-full gap-2"
                              onClick={() => setSelectedIntegration(integration)}
                            >
                              <Link2 className="w-4 h-4" />
                              Connect
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <integration.icon className="w-5 h-5" />
                                Connect {integration.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <p className="text-sm text-muted-foreground">
                                Enter your {integration.name} API credentials to enable the integration.
                              </p>
                              <div className="space-y-2">
                                <Label>API Key</Label>
                                <Input 
                                  type="password"
                                  placeholder={`Enter ${integration.name} API key`}
                                  value={apiKey}
                                  onChange={(e) => setApiKey(e.target.value)}
                                />
                              </div>
                              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                <h5 className="text-sm font-medium text-foreground mb-2">Features enabled:</h5>
                                <ul className="space-y-1">
                                  {integration.features.map(feature => (
                                    <li key={feature} className="text-xs text-muted-foreground flex items-center gap-2">
                                      <CheckCircle2 className="w-3 h-3 text-success" />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="gap-2"
                              >
                                {isConnecting ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Connecting...
                                  </>
                                ) : (
                                  <>
                                    <Link2 className="w-4 h-4" />
                                    Connect
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Webhook Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Webhook Endpoint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Use this endpoint to receive real-time events from external services:
            </p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
              <code className="text-sm text-foreground flex-1 break-all">
                https://api.sunnystep.ai/webhooks/v1/events
              </code>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText("https://api.sunnystep.ai/webhooks/v1/events");
                  toast.success("Webhook URL copied!");
                }}
              >
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
