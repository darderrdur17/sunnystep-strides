-- Team invites for email-based onboarding
CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_team_invites_team ON public.team_invites(team_id);
CREATE INDEX idx_team_invites_email ON public.team_invites(email);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view invites"
ON public.team_invites FOR SELECT
USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team owners and admins can manage invites"
ON public.team_invites FOR ALL
USING (
  public.has_team_role(auth.uid(), team_id, 'owner')
  OR public.has_team_role(auth.uid(), team_id, 'admin')
)
WITH CHECK (
  public.has_team_role(auth.uid(), team_id, 'owner')
  OR public.has_team_role(auth.uid(), team_id, 'admin')
);

-- Audit logs for compliance tracking
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  actor_id UUID,
  actor_email TEXT,
  action_type TEXT NOT NULL,
  action_summary TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_team_created ON public.audit_logs(team_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team members can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (public.is_team_member(auth.uid(), team_id));

-- Triggers for updated_at
CREATE TRIGGER update_team_invites_updated_at
BEFORE UPDATE ON public.team_invites
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for collaboration views
ALTER PUBLICATION supabase_realtime ADD TABLE agent_revenue;
ALTER PUBLICATION supabase_realtime ADD TABLE team_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
