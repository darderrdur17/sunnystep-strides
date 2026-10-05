import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Phone, 
  Plus, 
  Send, 
  Clock, 
  Users,
  Sparkles,
  Copy,
  Trash2,
  Calendar,
  Target,
  CheckCircle2,
  Image,
  Link as LinkIcon,
  Globe,
  Smartphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  channel: "sms" | "whatsapp";
  content: string;
  category: string;
  variables: string[];
}

const templateLibrary: Template[] = [
  {
    id: "1",
    name: "Cart Abandonment",
    channel: "sms",
    content: "Hi {{name}}! You left {{items}} in your cart. Complete your order now and get 10% off with code SAVE10. Shop: {{link}}",
    category: "Recovery",
    variables: ["name", "items", "link"]
  },
  {
    id: "2",
    name: "Order Confirmation",
    channel: "whatsapp",
    content: "🎉 Order confirmed! Hi {{name}}, your order #{{order_id}} is being processed. Track it here: {{tracking_link}}",
    category: "Transactional",
    variables: ["name", "order_id", "tracking_link"]
  },
  {
    id: "3",
    name: "Flash Sale Alert",
    channel: "sms",
    content: "⚡ FLASH SALE! {{discount}}% off everything for the next 24 hours. Don't miss out! Shop now: {{link}}",
    category: "Promotional",
    variables: ["discount", "link"]
  },
  {
    id: "4",
    name: "Welcome Message",
    channel: "whatsapp",
    content: "👋 Welcome to Sunnystep, {{name}}! Thanks for joining us. Here's 15% off your first order: {{code}}. Need help? Just reply to this message!",
    category: "Onboarding",
    variables: ["name", "code"]
  },
  {
    id: "5",
    name: "Delivery Update",
    channel: "whatsapp",
    content: "📦 Your package is out for delivery! Expected arrival: {{time}}. Track live: {{link}}",
    category: "Transactional",
    variables: ["time", "link"]
  },
  {
    id: "6",
    name: "Restock Alert",
    channel: "sms",
    content: "Good news, {{name}}! {{product}} is back in stock. Get yours before it sells out again: {{link}}",
    category: "Recovery",
    variables: ["name", "product", "link"]
  },
];

const segments = [
  { id: "all", name: "All Customers", count: 12847 },
  { id: "vip", name: "VIP Customers", count: 1245 },
  { id: "cart", name: "Cart Abandoners", count: 892 },
  { id: "inactive", name: "Inactive (30d+)", count: 2156 },
  { id: "new", name: "New Customers", count: 567 },
];

export function SMSWhatsAppBuilder() {
  const [activeChannel, setActiveChannel] = useState<"sms" | "whatsapp">("sms");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const charCount = messageContent.length;
  const maxChars = activeChannel === "sms" ? 160 : 1024;
  const smsSegments = Math.ceil(charCount / 160);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setMessageContent(template.content);
    setActiveChannel(template.channel);
    toast.success(`Template "${template.name}" loaded`);
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const suggestions = [
      "Hey {{name}}! 🌟 Your favorites are waiting. Complete your purchase and enjoy free shipping today! {{link}}",
      "{{name}}, we saved your cart! Use code COMEBACK15 for 15% off. Limited time only! {{link}}",
      "Don't let your cart get lonely, {{name}}! 🛒 Finish your order and get a surprise gift. {{link}}"
    ];
    
    setMessageContent(suggestions[Math.floor(Math.random() * suggestions.length)]);
    setIsGenerating(false);
    toast.success("AI generated new content");
  };

  const handleSendCampaign = () => {
    if (!campaignName || !messageContent || !selectedSegment) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const segment = segments.find(s => s.id === selectedSegment);
    toast.success(`Campaign "${campaignName}" ${scheduleEnabled ? 'scheduled' : 'sent'} to ${segment?.count.toLocaleString()} recipients`);
  };

  const filteredTemplates = templateLibrary.filter(t => t.channel === activeChannel);

  return (
    <div className="space-y-6">
      {/* Channel Tabs */}
      <Tabs value={activeChannel} onValueChange={(v) => setActiveChannel(v as "sms" | "whatsapp")} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sms" className="gap-2">
            <Phone className="w-4 h-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Template Library */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Copy className="w-5 h-5 text-primary" />
                Template Library
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground text-sm">{template.name}</span>
                    <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{template.content}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {template.variables.map(v => (
                      <Badge key={v} variant="outline" className="text-xs">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Message Composer */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Compose Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input 
                  placeholder="e.g., Summer Sale SMS Blast"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Message Content</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="gap-2"
                  >
                    <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generating...' : 'AI Generate'}
                  </Button>
                </div>
                <Textarea 
                  placeholder={activeChannel === "sms" 
                    ? "Type your SMS message... Use {{variable}} for personalization"
                    : "Type your WhatsApp message... Emojis and rich text supported!"
                  }
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {charCount}/{maxChars} characters
                    {activeChannel === "sms" && charCount > 160 && (
                      <span className="text-warning ml-2">({smsSegments} SMS segments)</span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Image className="w-3 h-3 mr-1" />
                      Media
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Link
                    </Button>
                  </div>
                </div>
              </div>

              {/* Audience Segment */}
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                  <SelectTrigger>
                    <Users className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select audience segment" />
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

              {/* Scheduling */}
              <div className="space-y-3 p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Label className="font-medium">Schedule for later</Label>
                  </div>
                  <Switch checked={scheduleEnabled} onCheckedChange={setScheduleEnabled} />
                </div>
                
                <AnimatePresence>
                  {scheduleEnabled && (
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input 
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Time</Label>
                        <Input 
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${activeChannel === 'whatsapp' ? 'bg-[#25D366]/20' : 'bg-primary/20'}`}>
                      {activeChannel === 'whatsapp' ? (
                        <MessageSquare className="w-5 h-5 text-[#25D366]" />
                      ) : (
                        <Smartphone className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">Sunnystep</span>
                        <span className="text-xs text-muted-foreground">Now</span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {messageContent || "Your message preview will appear here..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  className="flex-1 gap-2"
                  onClick={handleSendCampaign}
                >
                  {scheduleEnabled ? (
                    <>
                      <Calendar className="w-4 h-4" />
                      Schedule Campaign
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Now
                    </>
                  )}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Target className="w-4 h-4" />
                  Send Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Campaigns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Channel</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sent</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Delivered</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Clicked</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Weekend Flash Sale", channel: "sms", sent: 8547, delivered: 8423, clicked: 1245, status: "completed" },
                    { name: "Order Shipped Notification", channel: "whatsapp", sent: 1256, delivered: 1248, clicked: 892, status: "completed" },
                    { name: "VIP Early Access", channel: "sms", sent: 1200, delivered: 1189, clicked: 456, status: "completed" },
                    { name: "Cart Recovery", channel: "whatsapp", sent: 567, delivered: 554, clicked: 187, status: "active" },
                  ].map((campaign, index) => (
                    <motion.tr
                      key={campaign.name}
                      className="border-b border-border/50 hover:bg-muted/30"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <td className="py-3 px-4 font-medium text-foreground text-sm">{campaign.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {campaign.channel === 'whatsapp' ? (
                            <MessageSquare className="w-3 h-3 mr-1" />
                          ) : (
                            <Phone className="w-3 h-3 mr-1" />
                          )}
                          {campaign.channel.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{campaign.sent.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{campaign.delivered.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-primary">{campaign.clicked.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={campaign.status === 'completed' ? 'secondary' : 'default'}
                          className={campaign.status === 'active' ? 'bg-success text-success-foreground' : ''}
                        >
                          {campaign.status}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
