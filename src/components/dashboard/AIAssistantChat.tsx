import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { AIGeneratedNote } from "@/components/DataProvenance";

interface Message {
  role: "user" | "assistant";
  content: string;
  /** True when the assistant bubble represents an error, not a real reply. */
  error?: boolean;
}

/** Translate transport / function / gateway errors into a useful message. */
function describeError(err: unknown): string {
  const raw = typeof err === "string" ? err : (err as any)?.message || "Unknown error";
  const msg = String(raw);
  if (/rate limit/i.test(msg))
    return "The AI service is rate-limited right now. Please wait a moment and try again.";
  if (/usage limit|quota|credits/i.test(msg))
    return "The AI service has reached its usage limit. Please add credits or contact an administrator.";
  if (/not configured|api key/i.test(msg))
    return "The AI assistant is not configured on the server (missing API key). Contact an administrator.";
  if (/failed to fetch|network|timeout/i.test(msg))
    return "Could not reach the AI service. Check your connection and try again.";
  return `AI assistant error: ${msg}`;
}

export function AIAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-marketing-assistant", {
        body: { messages: history },
      });

      // The Supabase client surfaces transport/HTTP failures via `error`.
      // The edge function also returns structured errors in the body (`data.error`).
      // Both must be handled — previously only `error` was checked, which let
      // gateway failures get silently masked into a cheerful fallback message.
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const assistantContent: string = data?.response;
      if (!assistantContent || !assistantContent.trim()) {
        throw new Error("The assistant returned an empty response.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantContent },
      ]);
    } catch (error) {
      console.error("AI Assistant error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          error: true,
          content: describeError(error),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className={cn(
          "fixed bottom-4 right-4 z-40 rounded-full p-4 shadow-lg transition-colors sm:bottom-6 sm:right-6",
          isOpen ? "bg-muted" : "bg-primary text-primary-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>

      {/* Chat Panel */}
      {isOpen && (
        <motion.div
          className="fixed bottom-24 left-4 right-4 z-40 flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:bottom-6 sm:left-auto sm:right-6 sm:h-[500px] sm:w-96"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 p-4">
            <div className="rounded-xl bg-primary/15 p-2">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">
                AI Marketing Assistant
              </h3>
              <p className="text-xs text-muted-foreground">Powered by Lovable AI</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="py-8 text-center">
                <Sparkles className="mx-auto mb-3 h-12 w-12 text-primary/50" />
                <p className="mb-4 text-sm text-muted-foreground">
                  Ask me anything about your marketing campaigns, agent strategies,
                  or optimization tips!
                </p>
                <div className="space-y-2">
                  {[
                    "How can I improve cart recovery?",
                    "What's the best time to send emails?",
                    "Suggest a win-back strategy",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="block w-full rounded-lg bg-secondary/50 p-2 text-left text-sm transition-colors hover:bg-secondary"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <AIGeneratedNote className="mt-4 justify-center" />
              </div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message.role === "assistant" && (
                  <div className="h-fit rounded-lg bg-primary/15 p-1.5">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl p-3 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.error
                        ? "border border-destructive/30 bg-destructive/10 text-foreground"
                        : "bg-secondary text-foreground prose prose-sm prose-p:m-0 prose-ul:m-0"
                  )}
                >
                  {message.role === "assistant" ? (
                    message.error ? (
                      <span className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        <span>{message.content}</span>
                      </span>
                    ) : (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    )
                  ) : (
                    message.content
                  )}
                  {message.role === "assistant" && !message.error && (
                    <AIGeneratedNote />
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="h-fit rounded-lg bg-primary/15 p-1.5">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about marketing strategies..."
                className="max-h-[120px] min-h-[44px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
