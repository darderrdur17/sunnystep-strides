-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  company TEXT,
  timezone TEXT DEFAULT 'Asia/Singapore',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by the owner
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create A/B tests table
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'paused')),
  test_type TEXT DEFAULT 'email' CHECK (test_type IN ('email', 'sms', 'web', 'push')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  winning_variant TEXT,
  confidence_level NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A/B test variants
CREATE TABLE public.ab_test_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.ab_tests(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  is_control BOOLEAN DEFAULT false,
  impressions INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT,
  content JSONB DEFAULT '[]'::jsonb,
  preview_text TEXT,
  category TEXT DEFAULT 'marketing',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  dashboard_layout JSONB DEFAULT '{}'::jsonb,
  sidebar_collapsed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies for demo
CREATE POLICY "Allow public read on ab_tests" ON public.ab_tests FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ab_tests" ON public.ab_tests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ab_tests" ON public.ab_tests FOR UPDATE USING (true);

CREATE POLICY "Allow public read on ab_test_variants" ON public.ab_test_variants FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ab_test_variants" ON public.ab_test_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ab_test_variants" ON public.ab_test_variants FOR UPDATE USING (true);

CREATE POLICY "Allow public read on email_templates" ON public.email_templates FOR SELECT USING (true);
CREATE POLICY "Allow public insert on email_templates" ON public.email_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on email_templates" ON public.email_templates FOR UPDATE USING (true);

CREATE POLICY "Allow public read on user_settings" ON public.user_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on user_settings" ON public.user_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on user_settings" ON public.user_settings FOR UPDATE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON public.ab_tests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();