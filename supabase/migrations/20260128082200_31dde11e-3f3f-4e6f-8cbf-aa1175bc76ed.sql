-- Agent Configurations table
CREATE TABLE public.agent_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  confidence_threshold NUMERIC NOT NULL DEFAULT 0.7,
  max_actions_per_day INTEGER NOT NULL DEFAULT 100,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT true,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
  web_push_enabled BOOLEAN NOT NULL DEFAULT true,
  frequency_cap_hours INTEGER NOT NULL DEFAULT 24,
  custom_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent Notifications / Activity Log
CREATE TABLE public.agent_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'info',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'draft',
  sent_count INTEGER NOT NULL DEFAULT 0,
  open_rate NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  agent_name TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customer Journey Events
CREATE TABLE public.customer_journey_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  agent_name TEXT,
  channel TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_created_at ON public.agent_notifications(created_at DESC);
CREATE INDEX idx_notifications_agent ON public.agent_notifications(agent_name);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_dates ON public.campaigns(start_date, end_date);
CREATE INDEX idx_journey_customer ON public.customer_journey_events(customer_id);
CREATE INDEX idx_journey_created ON public.customer_journey_events(created_at DESC);

-- Enable RLS on all tables (public read for demo purposes)
ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_journey_events ENABLE ROW LEVEL SECURITY;

-- Public read policies for demo
CREATE POLICY "Allow public read on agent_configurations" ON public.agent_configurations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on agent_configurations" ON public.agent_configurations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on agent_configurations" ON public.agent_configurations FOR UPDATE USING (true);

CREATE POLICY "Allow public read on agent_notifications" ON public.agent_notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert on agent_notifications" ON public.agent_notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public insert on campaigns" ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on campaigns" ON public.campaigns FOR UPDATE USING (true);

CREATE POLICY "Allow public read on customer_journey_events" ON public.customer_journey_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert on customer_journey_events" ON public.customer_journey_events FOR INSERT WITH CHECK (true);

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_agent_configurations_updated_at
  BEFORE UPDATE ON public.agent_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default agent configurations
INSERT INTO public.agent_configurations (agent_name, is_active, confidence_threshold, max_actions_per_day) VALUES
  ('Campaign Agent', true, 0.75, 150),
  ('Lifecycle Agent', true, 0.70, 200),
  ('Abandoned Cart Agent', true, 0.65, 300),
  ('Creative Agent', true, 0.80, 50);

-- Insert sample campaigns
INSERT INTO public.campaigns (name, type, status, sent_count, open_rate, conversion_rate, revenue, agent_name, start_date, end_date) VALUES
  ('CNY Dream Collection Launch', 'email', 'active', 12450, 42.3, 8.7, 24560, 'Campaign Agent', '2026-01-15', '2026-02-15'),
  ('Abandoned Cart Recovery', 'email', 'active', 3280, 58.2, 15.4, 18920, 'Abandoned Cart Agent', '2026-01-01', NULL),
  ('Win-Back: 60-Day Inactive', 'sms', 'active', 1890, 89.5, 6.2, 8340, 'Lifecycle Agent', '2026-01-10', '2026-02-10'),
  ('VIP Membership Welcome', 'email', 'completed', 856, 67.8, 22.1, 12480, 'Lifecycle Agent', '2025-12-01', '2026-01-01'),
  ('Flash Sale Notification', 'whatsapp', 'scheduled', 0, 0, 0, 0, 'Campaign Agent', '2026-02-01', '2026-02-03'),
  ('Product Review Request', 'email', 'active', 4520, 35.2, 12.8, 6720, 'Lifecycle Agent', '2026-01-05', NULL);

-- Insert sample notifications
INSERT INTO public.agent_notifications (agent_name, action_type, title, description, status) VALUES
  ('Campaign Agent', 'campaign_launched', 'CNY Campaign Launched', 'Successfully launched to 12,450 recipients', 'success'),
  ('Abandoned Cart Agent', 'cart_reminder_sent', 'Cart Reminder Sent', 'Personalized reminder sent to customer #4582', 'success'),
  ('Creative Agent', 'ab_test_started', 'A/B Test Started', 'Testing 3 subject line variants', 'info'),
  ('Lifecycle Agent', 'churn_risk_detected', 'Churn Risk Detected', 'Customer #2891 flagged for win-back sequence', 'warning'),
  ('Campaign Agent', 'high_discount_blocked', 'Discount Blocked', '25% discount exceeded threshold, requires approval', 'error');

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE agent_notifications;