import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Type, 
  Image, 
  Square, 
  Columns, 
  MousePointer,
  GripVertical,
  Trash2,
  Copy,
  Sparkles,
  Save,
  Eye,
  Plus,
  Mail,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailBlock {
  id: string;
  type: "text" | "image" | "button" | "divider" | "columns";
  content: string;
  styles?: Record<string, string>;
}

const blockTypes = [
  { type: "text", icon: Type, label: "Text Block" },
  { type: "image", icon: Image, label: "Image" },
  { type: "button", icon: MousePointer, label: "Button" },
  { type: "divider", icon: Square, label: "Divider" },
  { type: "columns", icon: Columns, label: "2 Columns" },
];

const defaultContent: Record<string, string> = {
  text: "Add your text here. Click to edit.",
  image: "https://placehold.co/600x200/FF6B4A/white?text=Your+Image+Here",
  button: "Shop Now",
  divider: "",
  columns: "Column content",
};

export function EmailTemplateBuilder() {
  const [templateName, setTemplateName] = useState("Untitled Template");
  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<EmailBlock[]>([
    { id: "1", type: "text", content: "Welcome to Sunnystep! 👋" },
    { id: "2", type: "image", content: "https://placehold.co/600x200/FF6B4A/white?text=Sunnystep+Comfort+Collection" },
    { id: "3", type: "text", content: "Experience the joy of walking with our MIT-engineered comfort technology. Every step feels like a dream." },
    { id: "4", type: "button", content: "Shop the Collection" },
  ]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const { toast } = useToast();

  const addBlock = (type: EmailBlock["type"]) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: defaultContent[type],
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock.id);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      const newBlock = { ...block, id: Date.now().toString() };
      const index = blocks.findIndex(b => b.id === id);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
    }
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    setBlocks(newBlocks);
  };

  const generateAICopy = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-marketing-assistant", {
        body: { 
          message: `Generate email marketing copy for Sunnystep (a comfort footwear brand). The email should be about: ${aiPrompt}. 
          
          Format the response as JSON with these fields:
          - subject: A compelling subject line (max 50 chars)
          - headline: Main headline text
          - body: Body copy paragraph
          - cta: Call-to-action button text (max 20 chars)
          
          Keep the tone warm, friendly, and focused on comfort and joy of movement.`
        }
      });

      if (error) throw error;

      // Parse the AI response
      const content = data.message || data.content || "";
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        if (parsed.subject) setSubject(parsed.subject);
        
        const newBlocks: EmailBlock[] = [];
        if (parsed.headline) {
          newBlocks.push({ id: Date.now().toString(), type: "text", content: `# ${parsed.headline}` });
        }
        if (parsed.body) {
          newBlocks.push({ id: (Date.now() + 1).toString(), type: "text", content: parsed.body });
        }
        if (parsed.cta) {
          newBlocks.push({ id: (Date.now() + 2).toString(), type: "button", content: parsed.cta });
        }
        
        if (newBlocks.length > 0) {
          setBlocks([...blocks, ...newBlocks]);
          toast({ title: "AI copy generated!", description: "Content added to your template" });
        }
      } else {
        // Fallback: add as text block
        setBlocks([...blocks, { id: Date.now().toString(), type: "text", content }]);
        toast({ title: "AI copy generated!" });
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast({ title: "AI generation failed", description: "Please try again", variant: "destructive" });
    }
    setIsGenerating(false);
    setAiPrompt("");
  };

  const saveTemplate = async () => {
    try {
      await supabase.from("email_templates").insert([{
        name: templateName,
        subject,
        content: blocks as any,
        category: "marketing"
      }]);
      toast({ title: "Template saved successfully!" });
    } catch (error) {
      toast({ title: "Failed to save template", variant: "destructive" });
    }
  };

  const renderBlock = (block: EmailBlock, index: number) => {
    const isSelected = selectedBlock === block.id;

    return (
      <motion.div
        key={block.id}
        className={cn(
          "relative group border-2 rounded-lg transition-all",
          isSelected ? "border-primary" : "border-transparent hover:border-border",
          draggedBlock === block.id && "opacity-50"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        draggable
        onDragStart={() => setDraggedBlock(block.id)}
        onDragEnd={() => setDraggedBlock(null)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (draggedBlock && draggedBlock !== block.id) {
            const fromIndex = blocks.findIndex(b => b.id === draggedBlock);
            moveBlock(fromIndex, index);
          }
        }}
        onClick={() => setSelectedBlock(block.id)}
      >
        {/* Block Controls */}
        <div className={cn(
          "absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected && "opacity-100"
        )}>
          <button className="p-1 rounded hover:bg-secondary cursor-grab">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className={cn(
          "absolute -right-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected && "opacity-100"
        )}>
          <button 
            className="p-1 rounded hover:bg-secondary"
            onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
          >
            <Copy className="w-4 h-4 text-muted-foreground" />
          </button>
          <button 
            className="p-1 rounded hover:bg-destructive/20"
            onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>

        {/* Block Content */}
        <div className="p-4">
          {block.type === "text" && (
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              className="min-h-[80px] border-none bg-transparent resize-none focus:ring-0"
              placeholder="Enter your text..."
            />
          )}
          {block.type === "image" && (
            <div className="space-y-2">
              <img 
                src={block.content} 
                alt="Email content" 
                className="w-full rounded-lg"
              />
              {isSelected && (
                <Input
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  placeholder="Image URL"
                  className="text-sm"
                />
              )}
            </div>
          )}
          {block.type === "button" && (
            <div className="flex justify-center">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
                {isSelected ? (
                  <Input
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, e.target.value)}
                    className="w-32 text-center bg-transparent border-none text-primary-foreground"
                  />
                ) : (
                  block.content
                )}
              </button>
            </div>
          )}
          {block.type === "divider" && (
            <hr className="border-border my-4" />
          )}
          {block.type === "columns" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/30 rounded-lg text-center text-muted-foreground">
                Column 1
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg text-center text-muted-foreground">
                Column 2
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
            <Mail className="w-5 h-5" />
          </div>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="text-xl font-display font-bold border-none bg-transparent focus:ring-0 w-64"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button onClick={saveTemplate}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Block Types */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="font-medium text-foreground mb-3">Add Blocks</h3>
            <div className="grid grid-cols-2 gap-2">
              {blockTypes.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type as EmailBlock["type"])}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Copy Generator */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-foreground">AI Copy Assistant</h3>
            </div>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe what you want to write about... e.g., 'Lunar New Year sale with 20% discount on Dream collection'"
              className="min-h-[100px] mb-3"
            />
            <Button 
              className="w-full" 
              onClick={generateAICopy}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Email Canvas */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6">
            {/* Subject Line */}
            <div className="mb-6 pb-4 border-b border-border">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Subject Line</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject line..."
                className="text-lg font-medium"
              />
            </div>

            {/* Email Body */}
            <div className={cn(
              "min-h-[500px] p-6 rounded-lg bg-white border border-border",
              isPreview && "pointer-events-none"
            )}>
              {blocks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Plus className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Start building your email</p>
                  <p className="text-sm">Add blocks from the sidebar or use AI to generate copy</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blocks.map((block, index) => renderBlock(block, index))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
