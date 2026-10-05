import { supabase } from "@/integrations/supabase/client";

// Demo mode: generates fake agent notifications for demonstration
const demoNotifications = [
  { agent_name: "Campaign Agent", action_type: "campaign_launched", title: "Flash Sale Campaign Started", description: "Email blast sent to 8,450 VIP customers", status: "success" },
  { agent_name: "Abandoned Cart Agent", action_type: "cart_recovered", title: "Cart Recovered!", description: "Customer #7234 completed $189 purchase after reminder", status: "success" },
  { agent_name: "Lifecycle Agent", action_type: "segment_created", title: "New Segment Identified", description: "342 customers matched 'High LTV at Risk' criteria", status: "info" },
  { agent_name: "Creative Agent", action_type: "ab_winner", title: "A/B Test Winner", description: "Subject line B won with 34% higher open rate", status: "success" },
  { agent_name: "Campaign Agent", action_type: "budget_alert", title: "Budget Threshold Reached", description: "Daily ad spend at 85% of limit", status: "warning" },
  { agent_name: "Abandoned Cart Agent", action_type: "reminder_sent", title: "Cart Reminder Sent", description: "Personalized SMS to customer with $245 cart", status: "info" },
  { agent_name: "Lifecycle Agent", action_type: "churn_prevented", title: "Churn Risk Mitigated", description: "Win-back offer accepted by dormant customer", status: "success" },
  { agent_name: "Creative Agent", action_type: "content_blocked", title: "Content Flagged", description: "Discount claim exceeded brand guidelines", status: "error" },
];

let demoInterval: NodeJS.Timeout | null = null;

export const startDemoMode = () => {
  if (demoInterval) return;
  
  let index = 0;
  demoInterval = setInterval(async () => {
    const notification = demoNotifications[index % demoNotifications.length];
    
    await supabase.from("agent_notifications").insert({
      agent_name: notification.agent_name,
      action_type: notification.action_type,
      title: notification.title,
      description: notification.description,
      status: notification.status,
    });
    
    index++;
  }, 5000); // New notification every 5 seconds
};

export const stopDemoMode = () => {
  if (demoInterval) {
    clearInterval(demoInterval);
    demoInterval = null;
  }
};

export const isDemoModeRunning = () => demoInterval !== null;
