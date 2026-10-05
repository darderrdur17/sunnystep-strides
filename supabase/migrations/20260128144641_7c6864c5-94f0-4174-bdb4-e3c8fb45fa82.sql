-- Create enum for team roles
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table (junction table for users and teams)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role team_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create user_roles table for app-wide roles (following security best practices)
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create content_calendar table for scheduling
CREATE TABLE public.content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'email',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  ai_recommended BOOLEAN DEFAULT false,
  engagement_score NUMERIC DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_revenue table for ROI tracking
CREATE TABLE public.agent_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  revenue NUMERIC NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  actions_taken INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_revenue ENABLE ROW LEVEL SECURITY;

-- Security definer function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

-- Security definer function to check team role
CREATE OR REPLACE FUNCTION public.has_team_role(_user_id UUID, _team_id UUID, _role team_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND role = _role
  )
$$;

-- Security definer function to check app role
CREATE OR REPLACE FUNCTION public.has_app_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for teams
CREATE POLICY "Users can view teams they belong to"
ON public.teams FOR SELECT
USING (public.is_team_member(auth.uid(), id) OR public.has_app_role(auth.uid(), 'super_admin'));

CREATE POLICY "Team owners and admins can update team"
ON public.teams FOR UPDATE
USING (public.has_team_role(auth.uid(), id, 'owner') OR public.has_team_role(auth.uid(), id, 'admin'));

CREATE POLICY "Authenticated users can create teams"
ON public.teams FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for team_members
CREATE POLICY "Team members can view other members"
ON public.team_members FOR SELECT
USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team owners and admins can manage members"
ON public.team_members FOR INSERT
WITH CHECK (public.has_team_role(auth.uid(), team_id, 'owner') OR public.has_team_role(auth.uid(), team_id, 'admin'));

CREATE POLICY "Team owners and admins can update members"
ON public.team_members FOR UPDATE
USING (public.has_team_role(auth.uid(), team_id, 'owner') OR public.has_team_role(auth.uid(), team_id, 'admin'));

CREATE POLICY "Team owners can delete members"
ON public.team_members FOR DELETE
USING (public.has_team_role(auth.uid(), team_id, 'owner'));

-- RLS Policies for user_roles (only super_admin can manage)
CREATE POLICY "Super admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_app_role(auth.uid(), 'super_admin') OR user_id = auth.uid());

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_app_role(auth.uid(), 'super_admin'));

-- RLS Policies for content_calendar
CREATE POLICY "Team members can view calendar"
ON public.content_calendar FOR SELECT
USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team editors and above can manage calendar"
ON public.content_calendar FOR INSERT
WITH CHECK (team_id IS NULL OR public.has_team_role(auth.uid(), team_id, 'editor') OR public.has_team_role(auth.uid(), team_id, 'admin') OR public.has_team_role(auth.uid(), team_id, 'owner'));

CREATE POLICY "Team editors and above can update calendar"
ON public.content_calendar FOR UPDATE
USING (team_id IS NULL OR public.has_team_role(auth.uid(), team_id, 'editor') OR public.has_team_role(auth.uid(), team_id, 'admin') OR public.has_team_role(auth.uid(), team_id, 'owner'));

-- RLS Policies for agent_revenue (public read for dashboard)
CREATE POLICY "Anyone can view agent revenue"
ON public.agent_revenue FOR SELECT
USING (true);

CREATE POLICY "System can insert revenue data"
ON public.agent_revenue FOR INSERT
WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_calendar_updated_at
BEFORE UPDATE ON public.content_calendar
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();