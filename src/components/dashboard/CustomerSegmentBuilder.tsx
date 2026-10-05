import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  Users, 
  Plus, 
  Trash2, 
  GripVertical,
  Sparkles,
  Save,
  Play,
  Filter,
  Calendar,
  DollarSign,
  ShoppingCart,
  Mail,
  Clock,
  Target,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SegmentRule {
  id: string;
  field: string;
  operator: string;
  value: string;
  connector: "AND" | "OR";
}

interface Segment {
  id: string;
  name: string;
  description: string;
  rules: SegmentRule[];
  estimatedSize: number;
  isAISuggested?: boolean;
}

const fieldOptions = [
  { value: "total_purchases", label: "Total Purchases", icon: DollarSign, type: "number" },
  { value: "purchase_count", label: "Purchase Count", icon: ShoppingCart, type: "number" },
  { value: "last_purchase_days", label: "Days Since Last Purchase", icon: Calendar, type: "number" },
  { value: "email_opens", label: "Email Opens (30d)", icon: Mail, type: "number" },
  { value: "cart_abandonment", label: "Cart Abandonment Count", icon: ShoppingCart, type: "number" },
  { value: "customer_lifetime", label: "Customer Lifetime (days)", icon: Clock, type: "number" },
  { value: "avg_order_value", label: "Avg Order Value", icon: DollarSign, type: "number" },
  { value: "engagement_score", label: "Engagement Score", icon: Target, type: "number" },
];

const operatorOptions = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "greater_than", label: "is greater than" },
  { value: "less_than", label: "is less than" },
  { value: "between", label: "is between" },
];

const aiSuggestedSegments: Segment[] = [
  {
    id: "ai-1",
    name: "High-Value At-Risk",
    description: "Customers with high LTV who haven't purchased in 45+ days",
    rules: [
      { id: "1", field: "total_purchases", operator: "greater_than", value: "500", connector: "AND" },
      { id: "2", field: "last_purchase_days", operator: "greater_than", value: "45", connector: "AND" },
    ],
    estimatedSize: 234,
    isAISuggested: true
  },
  {
    id: "ai-2",
    name: "Cart Abandoners",
    description: "Users who abandoned cart 2+ times in last 30 days",
    rules: [
      { id: "1", field: "cart_abandonment", operator: "greater_than", value: "2", connector: "AND" },
      { id: "2", field: "last_purchase_days", operator: "less_than", value: "30", connector: "AND" },
    ],
    estimatedSize: 892,
    isAISuggested: true
  },
  {
    id: "ai-3",
    name: "VIP Customers",
    description: "Top 10% by total purchases with high engagement",
    rules: [
      { id: "1", field: "total_purchases", operator: "greater_than", value: "1000", connector: "AND" },
      { id: "2", field: "engagement_score", operator: "greater_than", value: "80", connector: "AND" },
    ],
    estimatedSize: 1245,
    isAISuggested: true
  },
];

export function CustomerSegmentBuilder() {
  const [segmentName, setSegmentName] = useState("");
  const [segmentDescription, setSegmentDescription] = useState("");
  const [rules, setRules] = useState<SegmentRule[]>([
    { id: "1", field: "total_purchases", operator: "greater_than", value: "", connector: "AND" }
  ]);
  const [savedSegments, setSavedSegments] = useState<Segment[]>([]);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const addRule = () => {
    const newRule: SegmentRule = {
      id: Date.now().toString(),
      field: "total_purchases",
      operator: "greater_than",
      value: "",
      connector: "AND"
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    if (rules.length > 1) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const updateRule = (id: string, field: keyof SegmentRule, value: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const calculateEstimate = async () => {
    setIsCalculating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const estimate = Math.floor(Math.random() * 5000) + 100;
    setEstimatedSize(estimate);
    setIsCalculating(false);
  };

  const saveSegment = () => {
    if (!segmentName.trim()) {
      toast.error("Please enter a segment name");
      return;
    }
    
    const newSegment: Segment = {
      id: Date.now().toString(),
      name: segmentName,
      description: segmentDescription,
      rules: [...rules],
      estimatedSize: estimatedSize || 0
    };
    
    setSavedSegments([newSegment, ...savedSegments]);
    setSegmentName("");
    setSegmentDescription("");
    setRules([{ id: "1", field: "total_purchases", operator: "greater_than", value: "", connector: "AND" }]);
    setEstimatedSize(null);
    toast.success(`Segment "${segmentName}" saved successfully`);
  };

  const useAISuggestion = (segment: Segment) => {
    setSegmentName(segment.name);
    setSegmentDescription(segment.description);
    setRules([...segment.rules]);
    setEstimatedSize(segment.estimatedSize);
    toast.success(`Loaded "${segment.name}" template`);
  };

  return (
    <div className="space-y-6">
      {/* AI Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI-Recommended Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiSuggestedSegments.map((segment, index) => (
                <motion.div
                  key={segment.id}
                  className="p-4 rounded-xl border border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => useAISuggestion(segment)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{segment.name}</span>
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{segment.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary font-medium">
                      ~{segment.estimatedSize.toLocaleString()} customers
                    </span>
                    <span className="text-muted-foreground">{segment.rules.length} rules</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Segment Builder */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Build Segment Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Segment Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Segment Name</Label>
                  <Input 
                    placeholder="e.g., VIP Customers"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input 
                    placeholder="Brief description..."
                    value={segmentDescription}
                    onChange={(e) => setSegmentDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Rules */}
              <div className="space-y-3">
                <Label>Rules</Label>
                <Reorder.Group axis="y" values={rules} onReorder={setRules} className="space-y-2">
                  <AnimatePresence>
                    {rules.map((rule, index) => (
                      <Reorder.Item key={rule.id} value={rule}>
                        <motion.div
                          className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          
                          {index > 0 && (
                            <Select 
                              value={rule.connector}
                              onValueChange={(v) => updateRule(rule.id, "connector", v)}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          
                          <Select 
                            value={rule.field}
                            onValueChange={(v) => updateRule(rule.id, "field", v)}
                          >
                            <SelectTrigger className="flex-1 min-w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <div className="flex items-center gap-2">
                                    <opt.icon className="w-4 h-4" />
                                    {opt.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select 
                            value={rule.operator}
                            onValueChange={(v) => updateRule(rule.id, "operator", v)}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {operatorOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Input 
                            className="w-24"
                            placeholder="Value"
                            value={rule.value}
                            onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                          />

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRule(rule.id)}
                            disabled={rules.length <= 1}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>

                <Button variant="outline" onClick={addRule} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add Rule
                </Button>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={calculateEstimate}
                  disabled={isCalculating}
                  className="flex-1 gap-2"
                >
                  <TrendingUp className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
                  {isCalculating ? "Calculating..." : "Estimate Size"}
                </Button>
                <Button onClick={saveSegment} className="flex-1 gap-2">
                  <Save className="w-4 h-4" />
                  Save Segment
                </Button>
              </div>

              {/* Estimate Result */}
              {estimatedSize !== null && (
                <motion.div
                  className="p-4 rounded-lg bg-success/10 border border-success/30"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-success" />
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        ~{estimatedSize.toLocaleString()} customers
                      </p>
                      <p className="text-sm text-muted-foreground">Match this segment criteria</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Saved Segments */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Saved Segments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
              {savedSegments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No segments saved yet</p>
                  <p className="text-xs">Build your first segment above</p>
                </div>
              ) : (
                savedSegments.map((segment, index) => (
                  <motion.div
                    key={segment.id}
                    className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground text-sm">{segment.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {segment.rules.length} rules
                      </Badge>
                    </div>
                    {segment.description && (
                      <p className="text-xs text-muted-foreground mb-2">{segment.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary">
                        ~{segment.estimatedSize.toLocaleString()} customers
                      </span>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Play className="w-3 h-3" />
                        Use
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
