import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Plus, 
  Crown, 
  Shield, 
  Edit2, 
  Eye, 
  Trash2,
  Mail,
  Check,
  X,
  Building2,
  UserPlus,
  Settings,
  MoreHorizontal,
  History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "active" | "pending" | "inactive";
  joinedAt: string;
  source?: "member" | "invite";
  userId?: string;
}

interface Team {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  memberCount: number;
}

interface AuditLogEntry {
  id: string;
  team_id: string;
  actor_id: string | null;
  actor_email: string | null;
  action_type: string;
  action_summary: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

const roleIcons: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  editor: Edit2,
  viewer: Eye,
};

const roleColors: Record<string, string> = {
  owner: "bg-warning/15 text-warning border-warning/30",
  admin: "bg-primary/15 text-primary border-primary/30",
  editor: "bg-success/15 text-success border-success/30",
  viewer: "bg-muted text-muted-foreground border-border",
};

const roleDescriptions: Record<string, string> = {
  owner: "Full access to all settings, billing, and team management",
  admin: "Can manage team members, settings, and all content",
  editor: "Can create and edit campaigns, workflows, and content",
  viewer: "Read-only access to dashboards and reports",
};

// Demo data
const demoTeam: Team = {
  id: "1",
  name: "Sunnystep Marketing",
  slug: "sunnystep-marketing",
  memberCount: 5,
};

const demoMembers: TeamMember[] = [
  { id: "1", name: "Sarah Chen", email: "sarah@sunnystep.ai", role: "owner", status: "active", joinedAt: "2024-01-15", source: "member" },
  { id: "2", name: "Michael Wong", email: "michael@sunnystep.ai", role: "admin", status: "active", joinedAt: "2024-02-20", source: "member" },
  { id: "3", name: "Emily Tan", email: "emily@sunnystep.ai", role: "editor", status: "active", joinedAt: "2024-03-10", source: "member" },
  { id: "4", name: "David Lee", email: "david@sunnystep.ai", role: "editor", status: "active", joinedAt: "2024-04-05", source: "member" },
  { id: "5", name: "Jessica Lim", email: "jessica@sunnystep.ai", role: "viewer", status: "pending", joinedAt: "2024-05-12", source: "invite" },
];

export function TeamManagement() {
  const [team, setTeam] = useState<Team>(demoTeam);
  const [members, setMembers] = useState<TeamMember[]>(demoMembers);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string; name?: string } | null>(null);
  const [loadingTeamData, setLoadingTeamData] = useState(false);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("viewer");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState(team.name);

  useEffect(() => {
    setNewTeamName(team.name);
  }, [team.name]);

  const loadAuditLogs = useCallback(async (teamId: string) => {
    setLoadingAuditLogs(true);
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(50);

    setAuditLogs((data as unknown as AuditLogEntry[]) || []);
    setLoadingAuditLogs(false);
  }, []);

  const loadTeamData = useCallback(async () => {
    setLoadingTeamData(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setCurrentUser(null);
      setActiveTeamId(null);
      setLoadingTeamData(false);
      return;
    }

    const displayName = user.user_metadata?.full_name
      || user.user_metadata?.name
      || user.email?.split("@")[0]
      || "Team member";

    setCurrentUser({ id: user.id, email: user.email, name: displayName });

    const { data: teams, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: true });

    if (teamError || !teams || teams.length === 0) {
      setLoadingTeamData(false);
      return;
    }

    const selectedTeam = teams[0];
    setActiveTeamId(selectedTeam.id);

    const [membersResponse, invitesResponse, profileResponse] = await Promise.all([
      supabase
        .from("team_members")
        .select("id, user_id, role, created_at")
        .eq("team_id", selectedTeam.id),
      supabase
        .from("team_invites")
        .select("id, email, role, status, created_at")
        .eq("team_id", selectedTeam.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("display_name, email, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const profile = profileResponse.data;
    const memberRows = membersResponse.data || [];
    const inviteRows = (invitesResponse.data || []).filter((invite) => invite.status === "pending");

    const mappedMembers: TeamMember[] = memberRows.map((member) => {
      const isCurrentUser = member.user_id === user.id;
      const name = isCurrentUser
        ? profile?.display_name || displayName
        : `Member ${member.user_id.slice(0, 6)}`;
      const email = isCurrentUser
        ? profile?.email || user.email || ""
        : `ID: ${member.user_id.slice(0, 6)}`;
      return {
        id: member.id,
        name,
        email,
        avatar: isCurrentUser ? profile?.avatar_url || undefined : undefined,
        role: member.role,
        status: "active",
        joinedAt: member.created_at,
        source: "member",
        userId: member.user_id,
      };
    });

    const mappedInvites: TeamMember[] = inviteRows.map((invite) => ({
      id: invite.id,
      name: invite.email.split("@")[0],
      email: invite.email,
      role: invite.role,
      status: "pending",
      joinedAt: invite.created_at,
      source: "invite",
    }));

    const combinedMembers = [...mappedMembers, ...mappedInvites].sort((a, b) => {
      const orderA = a.status === "pending" ? 1 : 0;
      const orderB = b.status === "pending" ? 1 : 0;
      return orderA - orderB;
    });

    setTeam({
      id: selectedTeam.id,
      name: selectedTeam.name,
      slug: selectedTeam.slug,
      logoUrl: selectedTeam.logo_url || undefined,
      memberCount: mappedMembers.length,
    });
    setMembers(combinedMembers);

    await loadAuditLogs(selectedTeam.id);
    setLoadingTeamData(false);
  }, [loadAuditLogs]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  useEffect(() => {
    if (!activeTeamId) return;

    const rosterChannel = supabase
      .channel(`team_roster_${activeTeamId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_members", filter: `team_id=eq.${activeTeamId}` },
        () => loadTeamData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_invites", filter: `team_id=eq.${activeTeamId}` },
        () => loadTeamData()
      )
      .subscribe();

    const auditChannel = supabase
      .channel(`team_audit_${activeTeamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "audit_logs", filter: `team_id=eq.${activeTeamId}` },
        (payload) => {
          setAuditLogs(prev => [payload.new as AuditLogEntry, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rosterChannel);
      supabase.removeChannel(auditChannel);
    };
  }, [activeTeamId, loadTeamData]);

  const logAuditEvent = useCallback(async (params: {
    actionType: string;
    summary: string;
    metadata?: Json;
  }) => {
    if (!activeTeamId || !currentUser) return;

    await supabase.from("audit_logs").insert({
      team_id: activeTeamId,
      actor_id: currentUser.id,
      actor_email: currentUser.email ?? null,
      action_type: params.actionType,
      action_summary: params.summary,
      metadata: params.metadata ?? {},
    });
  }, [activeTeamId, currentUser]);

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!team?.id) {
      toast.error("Select a team before inviting members");
      return;
    }

    setSendingInvite(true);

    try {
      const inviteId = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Date.now().toString();
      const inviteUrl = `${window.location.origin}/auth?invite=${inviteId}&team=${team.slug}`;
      const inviterName = currentUser?.name || "Team admin";

      const { error: inviteError } = await supabase.functions.invoke("team-invite", {
        body: {
          email: inviteEmail.trim(),
          inviterName,
          teamName: team.name,
          inviteUrl,
          role: inviteRole,
        },
      });

      if (inviteError) {
        throw inviteError;
      }

      if (activeTeamId) {
        const { data, error } = await supabase
          .from("team_invites")
          .insert({
            id: inviteId,
            team_id: activeTeamId,
            email: inviteEmail.trim(),
            role: inviteRole,
            status: "pending",
            invited_by: currentUser?.id ?? null,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        await loadTeamData();
      } else {
        const newMember: TeamMember = {
          id: inviteId,
          name: inviteEmail.split("@")[0],
          email: inviteEmail.trim(),
          role: inviteRole,
          status: "pending",
          joinedAt: new Date().toISOString(),
          source: "invite",
        };
        setMembers(prev => [newMember, ...prev]);
      }

      await logAuditEvent({
        actionType: "team.invite_sent",
        summary: `Invited ${inviteEmail.trim()} as ${inviteRole}`,
        metadata: { email: inviteEmail.trim(), role: inviteRole },
      });

      setIsInviting(false);
      setInviteEmail("");
      setInviteRole("viewer");
      toast.success(`Invitation sent to ${inviteEmail.trim()}`);
    } catch (error) {
      console.error("Invite failed:", error);
      toast.error("Unable to send invitation. Please try again.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamMember["role"]) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    try {
      if (activeTeamId && member.source !== "invite") {
        const { error } = await supabase
          .from("team_members")
          .update({ role: newRole })
          .eq("id", memberId);

        if (error) {
          throw error;
        }
      }

      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      toast.success("Role updated successfully");
      setEditingMember(null);

      await logAuditEvent({
        actionType: "team.role_updated",
        summary: `Updated ${member.name}'s role from ${member.role} to ${newRole}`,
        metadata: { member_id: memberId, previous_role: member.role, new_role: newRole },
      });
    } catch (error) {
      console.error("Role update failed:", error);
      toast.error("Unable to update role. Please try again.");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member?.role === "owner") {
      toast.error("Cannot remove the team owner");
      return;
    }

    try {
      if (member?.status === "pending" && member.source === "invite") {
        if (activeTeamId) {
          const { error } = await supabase
            .from("team_invites")
            .update({ status: "cancelled" })
            .eq("id", memberId);

          if (error) {
            throw error;
          }
        }
        setMembers(members.filter(m => m.id !== memberId));
        toast.success("Invitation cancelled");

        await logAuditEvent({
          actionType: "team.invite_cancelled",
          summary: `Cancelled invitation for ${member?.email}`,
          metadata: { invite_id: memberId, email: member?.email },
        });
        return;
      }

      if (activeTeamId) {
        const { error } = await supabase
          .from("team_members")
          .delete()
          .eq("id", memberId);

        if (error) {
          throw error;
        }
      }

      setMembers(members.filter(m => m.id !== memberId));
      toast.success("Team member removed");

      await logAuditEvent({
        actionType: "team.member_removed",
        summary: `Removed ${member?.name || "team member"} from the team`,
        metadata: { member_id: memberId, email: member?.email },
      });
    } catch (error) {
      console.error("Remove member failed:", error);
      toast.error("Unable to remove team member. Please try again.");
    }
  };

  const handleUpdateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    try {
      if (activeTeamId) {
        const { data, error } = await supabase
          .from("teams")
          .update({ name: newTeamName.trim() })
          .eq("id", activeTeamId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setTeam(prev => ({
          ...prev,
          name: data.name,
          slug: data.slug,
          logoUrl: data.logo_url || undefined,
        }));

        await logAuditEvent({
          actionType: "team.settings_updated",
          summary: `Updated team name to ${data.name}`,
          metadata: { team_id: activeTeamId, name: data.name },
        });
      } else {
        setTeam({ ...team, name: newTeamName.trim() });
      }

      setIsEditingTeam(false);
      toast.success("Team settings updated");
    } catch (error) {
      console.error("Team update failed:", error);
      toast.error("Unable to update team settings. Please try again.");
    }
  };

  const getRoleIcon = (role: TeamMember["role"]) => {
    const Icon = roleIcons[role];
    return <Icon className="w-4 h-4" />;
  };

  const activeMemberCount = members.filter(member => member.status === "active").length;
  const pendingInvitesCount = members.filter(member => member.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-bold text-2xl">
                  {(team.name || "T").charAt(0)}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">{team.name || "Team"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {activeMemberCount} team member{activeMemberCount !== 1 ? "s" : ""}
                    {pendingInvitesCount > 0 ? ` • ${pendingInvitesCount} pending` : ""} • Enterprise Plan
                  </p>
                </div>
              </div>
              {loadingTeamData && (
                <Badge variant="outline" className="text-xs">
                  Syncing team data
                </Badge>
              )}
              <Dialog open={isEditingTeam} onOpenChange={setIsEditingTeam}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Team Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Team Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Team Name</Label>
                      <Input
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Team Slug</Label>
                      <Input
                        value={team.slug}
                        disabled
                        className="opacity-60"
                      />
                      <p className="text-xs text-muted-foreground">
                        Used for team URLs. Cannot be changed.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpdateTeam}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="w-4 h-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="w-4 h-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="font-display text-lg">Team Members</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {activeTeamId ? "Live" : "Demo"}
                    </Badge>
                  </div>
                  <Dialog open={isInviting} onOpenChange={setIsInviting}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            placeholder="colleague@company.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamMember["role"])}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            {roleDescriptions[inviteRole]}
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleInviteMember} className="gap-2" disabled={sendingInvite}>
                          <Mail className="w-4 h-4" />
                          {sendingInvite ? "Sending..." : "Send Invitation"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {members.map((member, index) => (
                    <motion.div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{member.name}</span>
                            {member.status === "pending" && (
                              <Badge variant="outline" className="text-xs">Pending</Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{member.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <Badge className={`gap-1 ${roleColors[member.role]}`}>
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role}</span>
                        </Badge>
                        {member.role !== "owner" && member.status === "active" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingMember(member)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="roles">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">Roles & Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(roleDescriptions).map(([role, description]) => {
                    const Icon = roleIcons[role];
                    const memberCount = members.filter(m => m.role === role).length;

                    return (
                      <div
                        key={role}
                        className="p-4 rounded-lg border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${roleColors[role]}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-medium text-foreground capitalize">{role}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {memberCount} member{memberCount !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{description}</p>

                        {/* Permissions list */}
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                          {role === "owner" || role === "admin" ? (
                            <>
                              <PermissionBadge label="Manage team" allowed />
                              <PermissionBadge label="Billing access" allowed={role === "owner"} />
                              <PermissionBadge label="Edit content" allowed />
                              <PermissionBadge label="View reports" allowed />
                            </>
                          ) : role === "editor" ? (
                            <>
                              <PermissionBadge label="Manage team" allowed={false} />
                              <PermissionBadge label="Billing access" allowed={false} />
                              <PermissionBadge label="Edit content" allowed />
                              <PermissionBadge label="View reports" allowed />
                            </>
                          ) : (
                            <>
                              <PermissionBadge label="Manage team" allowed={false} />
                              <PermissionBadge label="Billing access" allowed={false} />
                              <PermissionBadge label="Edit content" allowed={false} />
                              <PermissionBadge label="View reports" allowed />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="audit">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-lg">Audit Log</CardTitle>
                  {loadingAuditLogs && (
                    <Badge variant="outline" className="text-xs">
                      Loading updates
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingAuditLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : auditLogs.length > 0 ? (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-border"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{log.action_summary}</p>
                          <p className="text-xs text-muted-foreground">
                            {(log.actor_email || "System")} • {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {log.action_type.replace(/\./g, " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No audit events yet. Team actions will appear here as they happen.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role for {editingMember?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {(["admin", "editor", "viewer"] as const).map(role => {
                const Icon = roleIcons[role];
                return (
                  <div
                    key={role}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      editingMember?.role === role
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => editingMember && handleUpdateRole(editingMember.id, role)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${roleColors[role]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium capitalize">{role}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{roleDescriptions[role]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PermissionBadge({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${allowed ? 'text-success' : 'text-muted-foreground'}`}>
      {allowed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {label}
    </div>
  );
}
