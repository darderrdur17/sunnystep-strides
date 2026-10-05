import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  MessageSquare,
  Bell,
  Sparkles,
  Clock,
  Target,
  TrendingUp,
  Check,
  X,
  Edit2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  contentType: "email" | "sms" | "push" | "social";
  scheduledAt: Date;
  status: "scheduled" | "sent" | "draft";
  aiRecommended: boolean;
  engagementScore: number;
}

interface AIRecommendation {
  day: Date;
  contentType: string;
  reason: string;
  expectedEngagement: number;
}

const typeIcons: Record<string, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  push: Bell,
  social: Target,
};

const typeColors: Record<string, string> = {
  email: "bg-primary/20 text-primary border-primary/30",
  sms: "bg-success/20 text-success border-success/30",
  push: "bg-warning/20 text-warning border-warning/30",
  social: "bg-info/20 text-info border-info/30",
};

// Demo events
const demoEvents: CalendarEvent[] = [
  { id: "1", title: "CNY Collection Launch", contentType: "email", scheduledAt: new Date(2026, 0, 29, 10, 0), status: "scheduled", aiRecommended: true, engagementScore: 87 },
  { id: "2", title: "Flash Sale Alert", contentType: "sms", scheduledAt: new Date(2026, 0, 30, 12, 0), status: "scheduled", aiRecommended: false, engagementScore: 72 },
  { id: "3", title: "Loyalty Rewards Reminder", contentType: "push", scheduledAt: new Date(2026, 0, 31, 9, 0), status: "scheduled", aiRecommended: true, engagementScore: 81 },
  { id: "4", title: "Weekend Special", contentType: "email", scheduledAt: new Date(2026, 1, 1, 8, 0), status: "scheduled", aiRecommended: false, engagementScore: 68 },
  { id: "5", title: "Valentine's Preview", contentType: "email", scheduledAt: new Date(2026, 1, 5, 10, 0), status: "draft", aiRecommended: true, engagementScore: 92 },
  { id: "6", title: "Cart Recovery", contentType: "sms", scheduledAt: new Date(2026, 1, 3, 14, 0), status: "scheduled", aiRecommended: true, engagementScore: 78 },
];

// AI recommendations based on historical data
const demoRecommendations: AIRecommendation[] = [
  { day: new Date(2026, 0, 28), contentType: "email", reason: "High engagement on Tuesdays at 10am", expectedEngagement: 85 },
  { day: new Date(2026, 1, 2), contentType: "sms", reason: "Users most responsive on Sunday evenings", expectedEngagement: 76 },
  { day: new Date(2026, 1, 7), contentType: "email", reason: "Optimal time before Valentine's Day", expectedEngagement: 91 },
];

export function ContentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 28));
  const [events, setEvents] = useState<CalendarEvent[]>(demoEvents);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", contentType: "email", time: "10:00" });

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.scheduledAt, day));
  };

  const getRecommendationForDay = (day: Date) => {
    return demoRecommendations.find(rec => isSameDay(rec.day, day));
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const [hours, minutes] = newEvent.time.split(":").map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes);

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      contentType: newEvent.contentType as CalendarEvent["contentType"],
      scheduledAt,
      status: "scheduled",
      aiRecommended: false,
      engagementScore: Math.floor(Math.random() * 30) + 60,
    };

    setEvents([...events, event]);
    setIsAddingEvent(false);
    setNewEvent({ title: "", contentType: "email", time: "10:00" });
    toast.success(`Event "${event.title}" scheduled for ${format(scheduledAt, "MMM d 'at' h:mm a")}`);
  };

  const handleAcceptRecommendation = (rec: AIRecommendation) => {
    const scheduledAt = new Date(rec.day);
    scheduledAt.setHours(10, 0);

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: `AI Recommended ${rec.contentType.charAt(0).toUpperCase() + rec.contentType.slice(1)}`,
      contentType: rec.contentType as CalendarEvent["contentType"],
      scheduledAt,
      status: "scheduled",
      aiRecommended: true,
      engagementScore: rec.expectedEngagement,
    };

    setEvents([...events, event]);
    toast.success("AI recommendation accepted and scheduled!");
  };

  const dayOfWeekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDayOfMonth = days[0].getDay();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Content Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium text-foreground min-w-[140px] text-center">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayOfWeekLabels.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before first of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {days.map(day => {
                const dayEvents = getEventsForDay(day);
                const recommendation = getRecommendationForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <motion.div
                    key={day.toISOString()}
                    className={`aspect-square p-1 rounded-lg border transition-all cursor-pointer ${
                      isToday(day) ? 'border-primary bg-primary/5' :
                      isSelected ? 'border-primary/50 bg-primary/10' :
                      'border-transparent hover:border-border hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedDate(day)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="h-full flex flex-col">
                      <span className={`text-xs font-medium ${
                        isToday(day) ? 'text-primary' : 'text-foreground'
                      }`}>
                        {format(day, "d")}
                      </span>
                      <div className="flex-1 overflow-hidden space-y-0.5 mt-0.5">
                        {dayEvents.slice(0, 2).map(event => {
                          const Icon = typeIcons[event.contentType];
                          return (
                            <div
                              key={event.id}
                              className={`text-[10px] px-1 py-0.5 rounded truncate flex items-center gap-0.5 ${typeColors[event.contentType]}`}
                            >
                              <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="truncate">{event.title}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-muted-foreground px-1">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                        {recommendation && dayEvents.length === 0 && (
                          <div className="text-[10px] px-1 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
              {Object.entries(typeIcons).map(([type, Icon]) => (
                <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`p-1 rounded ${typeColors[type]}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="capitalize">{type}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3 text-warning" />
                AI Recommended
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Day Details */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-lg">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </CardTitle>
                  <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <Plus className="w-4 h-4" />
                        Add Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule Content</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            placeholder="e.g., Weekly Newsletter"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Content Type</Label>
                            <Select value={newEvent.contentType} onValueChange={(v) => setNewEvent({ ...newEvent, contentType: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="push">Push Notification</SelectItem>
                                <SelectItem value="social">Social Post</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Time</Label>
                            <Input
                              type="time"
                              value={newEvent.time}
                              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddEvent}>Schedule</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {getEventsForDay(selectedDate).length === 0 && !getRecommendationForDay(selectedDate) ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No content scheduled for this day</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getEventsForDay(selectedDate).map(event => {
                      const Icon = typeIcons[event.contentType];
                      return (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${typeColors[event.contentType]}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{event.title}</span>
                                {event.aiRecommended && (
                                  <Badge variant="outline" className="text-xs">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {format(event.scheduledAt, "h:mm a")}
                                <span className="text-success flex items-center gap-0.5">
                                  <TrendingUp className="w-3 h-3" />
                                  {event.engagementScore}% expected
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={event.status === "scheduled" ? "default" : "secondary"}>
                              {event.status}
                            </Badge>
                            <Button variant="ghost" size="icon">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* AI Recommendation */}
                    {getRecommendationForDay(selectedDate) && (
                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-warning/20">
                              <Sparkles className="w-4 h-4 text-warning" />
                            </div>
                            <div>
                              <span className="font-medium text-foreground">AI Recommendation</span>
                              <p className="text-sm text-muted-foreground mt-1">
                                {getRecommendationForDay(selectedDate)?.reason}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                <span className="text-success flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {getRecommendationForDay(selectedDate)?.expectedEngagement}% expected engagement
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                            >
                              <X className="w-3 h-3" />
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              className="gap-1"
                              onClick={() => handleAcceptRecommendation(getRecommendationForDay(selectedDate)!)}
                            >
                              <Check className="w-3 h-3" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
