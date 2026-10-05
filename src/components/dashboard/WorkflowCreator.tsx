import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Workflow,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  Play,
  CheckCircle2,
  ShoppingCart,
  User,
  Tag,
  Mail,
  MessageSquare,
  Clock,
  GitBranch,
  Zap,
  Target,
  Trash2,
  GripVertical
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

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  steps: number;
  suggested: boolean;
}

interface WorkflowStep {
  id: string;
  type: "trigger" | "condition" | "action" | "wait";
  name: string;
  config: Record<string, unknown>;
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "cart_abandonment",
    name: "Cart Abandonment Recovery",
    description: "Recover lost sales with automated email sequence and dynamic incentives",
    category: "Recovery",
    icon: ShoppingCart,
    steps: 5,
    suggested: true
  },
  {
    id: "welcome_series",
    name: "New Customer Welcome",
    description: "Onboard new customers with personalized content and offers",
    category: "Onboarding",
    icon: User,
    steps: 4,
    suggested: true
  },
  {
    id: "product_launch",
    name: "Product Launch",
    description: "Multi-channel campaign for new product announcements",
    category: "Marketing",
    icon: Tag,
    steps: 6,
    suggested: false
  },
  {
    id: "win_back",
    name: "Win-Back Campaign",
    description: "Re-engage inactive customers with progressive offers",
    category: "Recovery",
    icon: Target,
    steps: 4,
    suggested: true
  },
  {
    id: "post_purchase",
    name: "Post-Purchase Follow-up",
    description: "Thank customers and encourage reviews and referrals",
    category: "Retention",
    icon: Mail,
    steps: 3,
    suggested: false
  },
  {
    id: "birthday",
    name: "Birthday Campaign",
    description: "Celebrate customer birthdays with special offers",
    category: "Lifecycle",
    icon: Sparkles,
    steps: 2,
    suggested: false
  },
];

const stepTypes = [
  { type: "trigger", label: "Trigger", icon: Zap, color: "text-warning bg-warning/15" },
  { type: "condition", label: "Condition", icon: GitBranch, color: "text-info bg-info/15" },
  { type: "action", label: "Action", icon: Play, color: "text-primary bg-primary/15" },
  { type: "wait", label: "Wait", icon: Clock, color: "text-muted-foreground bg-muted" },
];

const triggerOptions = [
  { id: "cart_abandoned", label: "Cart Abandoned" },
  { id: "order_placed", label: "Order Placed" },
  { id: "signup", label: "Customer Signup" },
  { id: "segment_entered", label: "Entered Segment" },
  { id: "date_based", label: "Date/Time Trigger" },
];

const actionOptions = [
  { id: "send_email", label: "Send Email" },
  { id: "send_sms", label: "Send SMS" },
  { id: "send_whatsapp", label: "Send WhatsApp" },
  { id: "add_tag", label: "Add Tag" },
  { id: "update_segment", label: "Update Segment" },
];

interface WorkflowCreatorProps {
  onWorkflowCreated?: () => void;
}

export function WorkflowCreator({ onWorkflowCreated }: WorkflowCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [creationType, setCreationType] = useState<"template" | "custom">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  
  // Workflow details
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { id: "1", type: "trigger", name: "Cart Abandoned", config: { trigger: "cart_abandoned" } }
  ]);
  const [isActive, setIsActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const resetForm = () => {
    setStep(1);
    setCreationType("template");
    setSelectedTemplate(null);
    setWorkflowName("");
    setWorkflowDescription("");
    setWorkflowSteps([{ id: "1", type: "trigger", name: "Cart Abandoned", config: { trigger: "cart_abandoned" } }]);
    setIsActive(true);
  };

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    
    // Set up template steps based on selection
    const templateSteps: WorkflowStep[] = [
      { id: "1", type: "trigger", name: template.category === "Recovery" ? "Cart Abandoned" : "Customer Signup", config: {} },
      { id: "2", type: "wait", name: "Wait 1 hour", config: { duration: 60 } },
      { id: "3", type: "action", name: "Send Email", config: { action: "send_email" } },
    ];
    setWorkflowSteps(templateSteps);
    setStep(2);
  };

  const addStep = (type: WorkflowStep["type"]) => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      type,
      name: type === "trigger" ? "New Trigger" : 
            type === "condition" ? "Check Condition" :
            type === "action" ? "New Action" : "Wait",
      config: {}
    };
    setWorkflowSteps([...workflowSteps, newStep]);
  };

  const removeStep = (id: string) => {
    if (workflowSteps.length > 1) {
      setWorkflowSteps(workflowSteps.filter(s => s.id !== id));
    }
  };

  const updateStep = (id: string, updates: Partial<WorkflowStep>) => {
    setWorkflowSteps(workflowSteps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleCreateWorkflow = async () => {
    if (!workflowName.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }
    
    setIsCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Workflow "${workflowName}" created successfully!`);
    setIsOpen(false);
    resetForm();
    onWorkflowCreated?.();
    setIsCreating(false);
  };

  const getStepStyle = (type: WorkflowStep["type"]) => {
    const stepType = stepTypes.find(s => s.type === type);
    return stepType?.color || "text-muted-foreground bg-muted";
  };

  const getStepIcon = (type: WorkflowStep["type"]) => {
    const stepType = stepTypes.find(s => s.type === type);
    return stepType?.icon || Zap;
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
                    <RadioGroupItem value="template" id="template-wf" className="mt-1" />
                    <div>
                      <Label htmlFor="template-wf" className="font-medium cursor-pointer">Use Template</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start with a proven automation workflow
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
                    <RadioGroupItem value="custom" id="custom-wf" className="mt-1" />
                    <div>
                      <Label htmlFor="custom-wf" className="font-medium cursor-pointer">Custom Workflow</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Build your own automation from scratch
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
                  {workflowTemplates.map((template) => (
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
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                        <span className="text-xs text-muted-foreground">{template.steps} steps</span>
                      </div>
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
                Continue to Builder
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
                <Label>Workflow Name</Label>
                <Input 
                  placeholder="e.g., Welcome Series"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Brief description..."
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Workflow Steps Builder */}
            <div className="space-y-3">
              <Label>Workflow Steps</Label>
              <div className="space-y-2">
                {workflowSteps.map((wfStep, index) => {
                  const StepIcon = getStepIcon(wfStep.type);
                  return (
                    <motion.div
                      key={wfStep.id}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <div className={`p-2 rounded-lg ${getStepStyle(wfStep.type)}`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <Input 
                          value={wfStep.name}
                          onChange={(e) => updateStep(wfStep.id, { name: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {wfStep.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(wfStep.id)}
                        disabled={workflowSteps.length <= 1}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Add Step Buttons */}
              <div className="flex flex-wrap gap-2">
                {stepTypes.map(({ type, label, icon: Icon, color }) => (
                  <Button 
                    key={type}
                    variant="outline" 
                    size="sm"
                    onClick={() => addStep(type as WorkflowStep["type"])}
                    className="gap-1"
                  >
                    <Icon className="w-3 h-3" />
                    Add {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Activate Workflow</Label>
                  <p className="text-xs text-muted-foreground">Start running immediately after creation</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={handleCreateWorkflow}
              disabled={isCreating}
            >
              {isCreating ? (
                <>Creating...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Workflow
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
          New Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            Create New Workflow
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
