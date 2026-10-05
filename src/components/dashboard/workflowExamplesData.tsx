import type { ReactNode } from "react";
import { ShoppingCart, Mail, MessageSquare, CheckCircle, Clock, User } from "lucide-react";

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  type: "trigger" | "decision" | "action" | "measure";
}

// Pre-configured workflow examples for Sunnystep
export const abandonedCartWorkflow: WorkflowStep[] = [
  {
    id: "1",
    title: "Cart Abandoned",
    description: "User leaves without checkout",
    icon: <ShoppingCart className="w-4 h-4" />,
    type: "trigger",
  },
  {
    id: "2",
    title: "Evaluate Profile",
    description: "Check value & history",
    icon: <User className="w-4 h-4" />,
    type: "decision",
  },
  {
    id: "3",
    title: "Send Reminder",
    description: "Personalized email",
    icon: <Mail className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "4",
    title: "Follow-up SMS",
    description: "If unopened in 6h",
    icon: <MessageSquare className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "5",
    title: "Track Conversion",
    description: "Measure recovery rate",
    icon: <CheckCircle className="w-4 h-4" />,
    type: "measure",
  },
];

export const welcomeWorkflow: WorkflowStep[] = [
  {
    id: "1",
    title: "New Signup",
    description: "Account created",
    icon: <User className="w-4 h-4" />,
    type: "trigger",
  },
  {
    id: "2",
    title: "Segment User",
    description: "Product preference",
    icon: <Clock className="w-4 h-4" />,
    type: "decision",
  },
  {
    id: "3",
    title: "Welcome Email",
    description: "Brand story + 10% off",
    icon: <Mail className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "4",
    title: "Follow-up",
    description: "Shoe care tips",
    icon: <Mail className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "5",
    title: "Track 2nd Purchase",
    description: "Measure onboarding",
    icon: <CheckCircle className="w-4 h-4" />,
    type: "measure",
  },
];
