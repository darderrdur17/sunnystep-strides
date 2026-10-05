import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { AgentsView } from "@/components/dashboard/AgentsView";
import { WorkflowsView } from "@/components/dashboard/WorkflowsView";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { GuardrailsPanel } from "@/components/dashboard/GuardrailsPanel";
import { ArchitectureView } from "@/components/dashboard/ArchitectureView";
import { AgentConfigurationPanel } from "@/components/dashboard/AgentConfigurationPanel";
import { FilterableCampaignList } from "@/components/dashboard/FilterableCampaignList";
import { CustomerJourneyMap } from "@/components/dashboard/CustomerJourneyMap";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { AIAssistantChat } from "@/components/dashboard/AIAssistantChat";
import { DemoModeToggle } from "@/components/dashboard/DemoModeToggle";
import { ABTestResults } from "@/components/dashboard/ABTestResults";
import { EmailTemplateBuilder } from "@/components/dashboard/EmailTemplateBuilder";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { ProfileView } from "@/components/dashboard/ProfileView";
import { PredictiveAnalytics } from "@/components/dashboard/PredictiveAnalytics";
import { AgentActivityDashboard } from "@/components/dashboard/AgentActivityDashboard";
import { SMSWhatsAppBuilder } from "@/components/dashboard/SMSWhatsAppBuilder";
import { PushNotificationSettings } from "@/components/dashboard/PushNotificationSettings";
import { CustomerSegmentBuilder } from "@/components/dashboard/CustomerSegmentBuilder";
import { APIIntegrationsPanel } from "@/components/dashboard/APIIntegrationsPanel";
import { ROIMetricsWidget } from "@/components/dashboard/ROIMetricsWidget";
import { ContentCalendar } from "@/components/dashboard/ContentCalendar";
import { TeamManagement } from "@/components/dashboard/TeamManagement";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const views: Record<string, { title: string; subtitle: string; component: React.ReactNode }> = {
  overview: {
    title: "Dashboard Overview",
    subtitle: "AI-driven marketing performance at a glance",
    component: <OverviewView />,
  },
  agents: {
    title: "AI Agents",
    subtitle: "Autonomous agents powering your marketing automation",
    component: <AgentsView />,
  },
  config: {
    title: "Agent Configuration",
    subtitle: "Adjust parameters, thresholds, and channel preferences",
    component: <AgentConfigurationPanel />,
  },
  activity: {
    title: "Agent Activity",
    subtitle: "Real-time monitoring of agent decisions and actions",
    component: <AgentActivityDashboard />,
  },
  roi: {
    title: "ROI Metrics",
    subtitle: "Live revenue attribution per agent with drill-down capabilities",
    component: <ROIMetricsWidget />,
  },
  predictive: {
    title: "Predictive Analytics",
    subtitle: "AI-powered forecasting, churn prediction, and recommendations",
    component: <PredictiveAnalytics />,
  },
  calendar: {
    title: "Content Calendar",
    subtitle: "AI-powered scheduling recommendations based on engagement data",
    component: <ContentCalendar />,
  },
  workflows: {
    title: "Automation Workflows",
    subtitle: "Create and manage marketing automation sequences",
    component: <WorkflowsView />,
  },
  campaigns: {
    title: "Campaign Manager",
    subtitle: "Create, filter, and manage all marketing campaigns",
    component: <FilterableCampaignList />,
  },
  journey: {
    title: "Customer Journey",
    subtitle: "Visualize how customers flow through agent touchpoints",
    component: <CustomerJourneyMap />,
  },
  segments: {
    title: "Customer Segments",
    subtitle: "Build and manage audience segments with AI recommendations",
    component: <CustomerSegmentBuilder />,
  },
  abtests: {
    title: "A/B Testing",
    subtitle: "Experiment results with statistical significance analysis",
    component: <ABTestResults />,
  },
  analytics: {
    title: "Analytics & Metrics",
    subtitle: "Deep dive into campaign performance and KPIs",
    component: <AnalyticsCharts />,
  },
  templates: {
    title: "Email Templates",
    subtitle: "Build and manage email templates with AI-powered copy suggestions",
    component: <EmailTemplateBuilder />,
  },
  messaging: {
    title: "SMS & WhatsApp",
    subtitle: "Build and schedule SMS and WhatsApp campaigns",
    component: <SMSWhatsAppBuilder />,
  },
  integrations: {
    title: "API Integrations",
    subtitle: "Connect external tools like Shopify, Klaviyo, and Google Analytics",
    component: <APIIntegrationsPanel />,
  },
  notifications: {
    title: "Push Notifications",
    subtitle: "Configure real-time alerts for agent actions",
    component: <PushNotificationSettings />,
  },
  team: {
    title: "Team Management",
    subtitle: "Manage team members, roles, and permissions",
    component: <TeamManagement />,
  },
  guardrails: {
    title: "Guardrails & Compliance",
    subtitle: "Safety controls, brand consistency, and human oversight",
    component: <GuardrailsPanel />,
  },
  architecture: {
    title: "System Architecture",
    subtitle: "Complete technical overview with tech stack and rollout plan",
    component: <ArchitectureView />,
  },
  settings: {
    title: "Settings",
    subtitle: "Manage your preferences and account settings",
    component: <SettingsView />,
  },
  profile: {
    title: "Profile",
    subtitle: "Manage your personal information and security",
    component: <ProfileView />,
  },
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const currentView = views[activeTab];

  useEffect(() => {
    // Fetch initial notification count
    const fetchCount = async () => {
      const { count } = await supabase
        .from("agent_notifications")
        .select("*", { count: "exact", head: true });
      setNotificationCount(count || 0);
    };
    fetchCount();

    // Subscribe to new notifications
    const channel = supabase
      .channel("notification_count")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_notifications" },
        () => {
          setNotificationCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const shouldLock = isMobile && sidebarOpen;
    document.body.classList.toggle("overflow-hidden", shouldLock);
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMobile, sidebarOpen]);

  // Close sidebar when tab changes on mobile
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <h1 className="font-display font-bold text-lg text-foreground">Sunnystep</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      )}

      {/* Sidebar with mobile overlay */}
      <div className={`
        ${isMobile ? 'fixed inset-0 z-50' : 'fixed left-0 top-0 h-screen z-50'} 
        ${isMobile && !sidebarOpen ? 'pointer-events-none' : ''}
      `}>
        {/* Backdrop for mobile */}
        {isMobile && sidebarOpen && (
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className={`
          ${isMobile ? 'absolute left-0 top-0 h-[100dvh]' : 'h-full'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          transition-transform duration-300 ease-in-out
        `}>
          <Sidebar className="h-full" activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>

      {/* Main Content */}
      <main className={`${isMobile ? 'pt-14' : 'pl-64'}`}>
        {!isMobile && (
          <Header 
            title={currentView.title} 
            subtitle={currentView.subtitle}
            notificationCount={notificationCount}
            onNotificationClick={() => setNotificationOpen(true)}
          />
        )}
        
        <div className={`p-4 sm:p-6 lg:p-8 ${isMobile ? 'pb-20' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Mobile title */}
              {isMobile && (
                <div className="mb-4">
                  <h2 className="font-display text-xl font-bold text-foreground">{currentView.title}</h2>
                  <p className="text-sm text-muted-foreground">{currentView.subtitle}</p>
                </div>
              )}
              {currentView.component}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Notification Panel */}
      <NotificationCenter 
        isOpen={notificationOpen} 
        onClose={() => setNotificationOpen(false)} 
      />

      {/* AI Assistant */}
      <AIAssistantChat />

      {/* Demo Tools control */}
      <DemoModeToggle />
    </div>
  );
};

export default Index;
