import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Bot,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  CheckCircle2,
  ShoppingCart,
  Target,
  TrendingUp,
  Zap,
  Mail,
  MessageSquare,
  Bell,
  Sliders,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  suggested: boolean;
  defaultConfig: {
    confidenceThreshold: number;
    maxActionsPerDay: number;
    frequencyCapHours: number;
    channels: { email: boolean; sms: boolean; whatsapp: boolean; webPush: boolean };
  };
}

const agentTemplates: AgentTemplate[] = [
  {
    id: "campaign",
    name: "Campaign Agent",
    description: "Orchestrates end-to-end marketing campaigns with AI-driven optimization",
    icon: Target,
    category: "Marketing",
    suggested: true,
    defaultConfig: {
      confidenceThreshold: 0.85,
      maxActionsPerDay: 200,
      frequencyCapHours: 24,
      channels: { email: true, sms: true, whatsapp: true, webPush: true }
    }
  },
  {
    id: "cart_recovery",
    name: "Abandoned Cart Agent",
    description: "Recovers lost sales with personalized multi-channel follow-ups",
    icon: ShoppingCart,
    category: "Recovery",
    suggested: true,
    defaultConfig: {
      confidenceThreshold: 0.75,
      maxActionsPerDay: 500,
      frequencyCapHours: 8,
      channels: { email: true, sms: true, whatsapp: false, webPush: true }
    }
  },
  {
    id: "lifecycle",
    name: "Lifecycle Agent",
    description: "Manages customer lifecycle from onboarding to retention",
    icon: TrendingUp,
    category: "Lifecycle",
    suggested: true,
    defaultConfig: {
      confidenceThreshold: 0.80,
      maxActionsPerDay: 300,
      frequencyCapHours: 48,
      channels: { email: true, sms: false, whatsapp: false, webPush: true }
    }
  },
  {
    id: "creative",
    name: "Creative Agent",
    description: "Generates and optimizes marketing creative content with AI",
    icon: Sparkles,
    category: "Content",
    suggested: false,
    defaultConfig: {
      confidenceThreshold: 0.90,
      maxActionsPerDay: 100,
      frequencyCapHours: 72,
      channels: { email: true, sms: false, whatsapp: false, webPush: false }
    }
  },
  {
    id: "analytics",
    name: "Analytics Agent",
    description: "Monitors performance and surfaces insights automatically",
    icon: TrendingUp,
    category: "Analytics",
    suggested: false,
    defaultConfig: {
      confidenceThreshold: 0.70,
      maxActionsPerDay: 50,
      frequencyCapHours: 24,
      channels: { email: false, sms: false, whatsapp: false, webPush: true }
    }
  },
];

interface AgentCreatorProps {
  onAgentCreated?: () => void;
}

export function AgentCreator({ onAgentCreated }: AgentCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [creationType, setCreationType] = useState<"template" | "custom">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  
  // Agent configuration
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.80);
  const [maxActionsPerDay, setMaxActionsPerDay] = useState(200);
  const [frequencyCapHours, setFrequencyCapHours] = useState(24);
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    whatsapp: false,
    webPush: true
  });
  const [isActive, setIsActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const resetForm = () => {
    setStep(1);
    setCreationType("template");
    setSelectedTemplate(null);
    setAgentName("");
    setAgentDescription("");
    setConfidenceThreshold(0.80);
    setMaxActionsPerDay(200);
    setFrequencyCapHours(24);
    setChannels({ email: true, sms: false, whatsapp: false, webPush: true });
    setIsActive(true);
  };

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setAgentName(template.name);
    setAgentDescription(template.description);
    setConfidenceThreshold(template.defaultConfig.confidenceThreshold);
    setMaxActionsPerDay(template.defaultConfig.maxActionsPerDay);
    setFrequencyCapHours(template.defaultConfig.frequencyCapHours);
    setChannels(template.defaultConfig.channels);
    setStep(2);
  };

  const handleCreateAgent = async () => {
    if (!agentName.trim()) {
      toast.error("Please enter an agent name");
      return;
    }
    
    setIsCreating(true);
    
    try {
      const { error } = await supabase.from("agent_configurations").insert({
        agent_name: agentName,
        is_active: isActive,
        confidence_threshold: confidenceThreshold,
        max_actions_per_day: maxActionsPerDay,
        frequency_cap_hours: frequencyCapHours,
        email_enabled: channels.email,
        sms_enabled: channels.sms,
        whatsapp_enabled: channels.whatsapp,
        web_push_enabled: channels.webPush,
      });
      
      if (error) throw error;
      
      // Also create a notification for the new agent
      await supabase.from("agent_notifications").insert({
        agent_name: agentName,
        action_type: "agent_created",
        title: `${agentName} created`,
        description: `New agent configured and ${isActive ? 'activated' : 'created as inactive'}`,
        status: "completed",
      });
      
      toast.success(`Agent "${agentName}" created successfully!`);
      setIsOpen(false);
      resetForm();
      onAgentCreated?.();
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error("Failed to create agent");
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <RadioGroup value={creationType} onValueChange={(v) => setCreationType(v as "template" | "custom")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    creationType === 'template' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setCreationType("template")}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="template" id="template-agent" className="mt-1" />
                    <div>
                      <Label htmlFor="template-agent" className="font-medium cursor-pointer">Use Template</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start with a pre-configured agent type
                      </p>
                    </div>
                  </div>
                </div>
                <div 
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    creationType === 'custom' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setCreationType("custom")}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="custom" id="custom-agent" className="mt-1" />
                    <div>
                      <Label htmlFor="custom-agent" className="font-medium cursor-pointer">Custom Agent</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Build a custom agent from scratch
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>

            {creationType === "template" && (
              <div className="space-y-3 mt-6">
                <Label>Select Agent Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-2">
                  {agentTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/30'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <template.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground text-sm">{template.name}</span>
                        {template.suggested && (
                          <Badge variant="outline" className="text-xs ml-auto">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Suggested
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                      <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {creationType === "custom" && (
              <Button 
                className="w-full mt-4" 
                onClick={() => setStep(2)}
              >
                Continue to Configuration
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Agent Name</Label>
              <Input 
                placeholder="e.g., VIP Customer Agent"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe what this agent does..."
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Thresholds */}
            <div className="space-y-4 p-4 rounded-lg border border-border">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Thresholds & Limits
              </h4>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Confidence Threshold</Label>
                  <span className="text-sm font-mono text-primary">{(confidenceThreshold * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[confidenceThreshold * 100]}
                  onValueChange={([v]) => setConfidenceThreshold(v / 100)}
                  max={100}
                  min={50}
                  step={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Actions below this confidence escalate to human review
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Max Actions/Day</Label>
                  <span className="text-sm font-mono text-primary">{maxActionsPerDay}</span>
                </div>
                <Slider
                  value={[maxActionsPerDay]}
                  onValueChange={([v]) => setMaxActionsPerDay(v)}
                  max={500}
                  min={10}
                  step={10}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Frequency Cap (hours)</Label>
                  <span className="text-sm font-mono text-primary">{frequencyCapHours}h</span>
                </div>
                <Slider
                  value={[frequencyCapHours]}
                  onValueChange={([v]) => setFrequencyCapHours(v)}
                  max={72}
                  min={4}
                  step={4}
                />
              </div>
            </div>

            {/* Channel Toggles */}
            <div className="space-y-3 p-4 rounded-lg border border-border">
              <h4 className="font-medium text-foreground">Enabled Channels</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm">Email</span>
                  </div>
                  <Switch
                    checked={channels.email}
                    onCheckedChange={(v) => setChannels({ ...channels, email: v })}
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-success" />
                    <span className="text-sm">SMS</span>
                  </div>
                  <Switch
                    checked={channels.sms}
                    onCheckedChange={(v) => setChannels({ ...channels, sms: v })}
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <span className="text-sm">WhatsApp</span>
                  </div>
                  <Switch
                    checked={channels.whatsapp}
                    onCheckedChange={(v) => setChannels({ ...channels, whatsapp: v })}
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-warning" />
                    <span className="text-sm">Web Push</span>
                  </div>
                  <Switch
                    checked={channels.webPush}
                    onCheckedChange={(v) => setChannels({ ...channels, webPush: v })}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Activate Agent</Label>
                  <p className="text-xs text-muted-foreground">Start running immediately after creation</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={handleCreateAgent}
              disabled={isCreating}
            >
              {isCreating ? (
                <>Creating...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Agent
                </>
              )}
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Create New Agent
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 2 && <div className={`w-16 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step Navigation */}
        {step > 1 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStep(step - 1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
