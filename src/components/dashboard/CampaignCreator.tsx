import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Mail, 
  MessageSquare, 
  Globe,
  Sparkles,
  Calendar,
  Users,
  Target,
  ArrowRight,
  ArrowLeft,
  Save,
  Play,
  Copy,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: React.ElementType;
  suggested: boolean;
  metrics?: { label: string; value: string }[];
}

const campaignTemplates: CampaignTemplate[] = [
  {
    id: "cart_recovery",
    name: "Cart Abandonment Recovery",
    description: "Multi-touch sequence to recover abandoned carts with progressive incentives",
    type: "email",
    icon: Mail,
    suggested: true,
    metrics: [{ label: "Avg Recovery Rate", value: "28.7%" }]
  },
  {
    id: "welcome_series",
    name: "Welcome Series",
    description: "Onboard new customers with brand storytelling and first purchase incentive",
    type: "email",
    icon: Mail,
    suggested: true,
    metrics: [{ label: "Avg Open Rate", value: "65%" }]
  },
  {
    id: "winback",
    name: "Win-Back Campaign",
    description: "Re-engage inactive customers with personalized offers",
    type: "email",
    icon: Mail,
    suggested: false,
    metrics: [{ label: "Avg Reactivation", value: "15%" }]
  },
  {
    id: "flash_sale",
    name: "Flash Sale Alert",
    description: "Time-sensitive promotion with urgency messaging",
    type: "sms",
    icon: MessageSquare,
    suggested: true,
    metrics: [{ label: "Avg CTR", value: "12%" }]
  },
  {
    id: "product_launch",
    name: "Product Launch",
    description: "Multi-channel campaign for new product announcements",
    type: "email",
    icon: Globe,
    suggested: false,
    metrics: [{ label: "Avg Revenue", value: "$45k" }]
  },
  {
    id: "vip_exclusive",
    name: "VIP Exclusive",
    description: "Special offers for top-tier customers",
    type: "email",
    icon: Sparkles,
    suggested: false,
    metrics: [{ label: "Avg AOV Lift", value: "+25%" }]
  },
];

const segments = [
  { id: "all", name: "All Customers", count: 12847 },
  { id: "vip", name: "VIP Customers", count: 1245 },
  { id: "cart", name: "Cart Abandoners", count: 892 },
  { id: "inactive", name: "Inactive (30d+)", count: 2156 },
  { id: "new", name: "New Customers", count: 567 },
];

interface CampaignCreatorProps {
  onCampaignCreated?: () => void;
}

export function CampaignCreator({ onCampaignCreated }: CampaignCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [creationType, setCreationType] = useState<"template" | "custom">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  
  // Campaign details
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState("email");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [scheduleNow, setScheduleNow] = useState(true);
  const [scheduleDate, setScheduleDate] = useState("");
  const [assignAgent, setAssignAgent] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const resetForm = () => {
    setStep(1);
    setCreationType("template");
    setSelectedTemplate(null);
    setCampaignName("");
    setCampaignType("email");
    setSubject("");
    setContent("");
    setSelectedSegment("");
    setScheduleNow(true);
    setScheduleDate("");
    setAssignAgent(true);
  };

  const handleTemplateSelect = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setCampaignName(template.name);
    setCampaignType(template.type);
    setStep(2);
  };

  const handleCreateCampaign = async () => {
    if (!campaignName.trim() || !selectedSegment) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsCreating(true);
    
    try {
      const segment = segments.find(s => s.id === selectedSegment);
      
      const { error } = await supabase.from("campaigns").insert({
        name: campaignName,
        type: campaignType,
        status: scheduleNow ? "active" : "scheduled",
        sent_count: 0,
        open_rate: 0,
        conversion_rate: 0,
        revenue: 0,
        agent_name: assignAgent ? "Campaign Agent" : null,
        start_date: scheduleNow ? new Date().toISOString() : scheduleDate || null,
      });
      
      if (error) throw error;
      
      toast.success(`Campaign "${campaignName}" created successfully!`);
      setIsOpen(false);
      resetForm();
      onCampaignCreated?.();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
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
            <RadioGroup value={creationType} onValueChange={(v) => setCreationType(v as any)}>
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
                    <RadioGroupItem value="template" id="template" className="mt-1" />
                    <div>
                      <Label htmlFor="template" className="font-medium cursor-pointer">Use Template</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start with a pre-built campaign optimized for performance
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
                    <RadioGroupItem value="custom" id="custom" className="mt-1" />
                    <div>
                      <Label htmlFor="custom" className="font-medium cursor-pointer">Custom Campaign</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Build from scratch with full control
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>

            {creationType === "template" && (
              <div className="space-y-3 mt-6">
                <Label>Select Template</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-2">
                  {campaignTemplates.map((template) => (
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
                      {template.metrics && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-success font-medium">
                            {template.metrics[0].label}: {template.metrics[0].value}
                          </span>
                        </div>
                      )}
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
                Continue to Details
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input 
                  placeholder="e.g., Summer Sale 2024"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={campaignType} onValueChange={setCampaignType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        SMS
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        WhatsApp
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {campaignType === "email" && (
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input 
                  placeholder="Enter email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message Content</Label>
              <Textarea 
                placeholder="Write your campaign message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={() => setStep(3)}
            >
              Continue to Targeting
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger>
                  <Users className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select segment" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map(segment => (
                    <SelectItem key={segment.id} value={segment.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{segment.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {segment.count.toLocaleString()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Label className="font-medium">Send immediately</Label>
                </div>
                <Switch checked={scheduleNow} onCheckedChange={setScheduleNow} />
              </div>

              <AnimatePresence>
                {!scheduleNow && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input 
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="font-medium">Assign to AI Agent</Label>
                    <p className="text-xs text-muted-foreground">Campaign Agent will optimize delivery</p>
                  </div>
                </div>
                <Switch checked={assignAgent} onCheckedChange={setAssignAgent} />
              </div>
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={handleCreateCampaign}
              disabled={isCreating}
            >
              {isCreating ? (
                <>Creating...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Campaign
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
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Create New Campaign
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
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
