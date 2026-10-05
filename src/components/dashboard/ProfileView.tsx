import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Building, 
  Camera,
  Save,
  Shield,
  Key,
  Clock,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  display_name: string;
  email: string;
  company: string;
  avatar_url: string;
  role: string;
  bio: string;
}

export function ProfileView() {
  const [profile, setProfile] = useState<Profile>({
    display_name: "",
    email: "",
    company: "Sunnystep",
    avatar_url: "",
    role: "Marketing Manager",
    bio: "",
  });
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (data) {
        setProfile({
          display_name: data.display_name || "",
          email: data.email || user.email || "",
          company: data.company || "Sunnystep",
          avatar_url: data.avatar_url || "",
          role: data.role || "user",
          bio: "",
        });
      } else {
        setProfile(prev => ({ ...prev, email: user.email || "" }));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          display_name: profile.display_name,
          email: profile.email,
          company: profile.company,
          avatar_url: profile.avatar_url,
        });

      if (error) {
        toast({ title: "Failed to save profile", variant: "destructive" });
      } else {
        toast({ title: "Profile updated successfully!" });
      }
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast({ title: "Failed to update password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Profile</h2>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          className="glass-card p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(profile.display_name || "U")}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <h3 className="font-display text-xl font-bold text-foreground">
            {profile.display_name || "User"}
          </h3>
          <p className="text-muted-foreground">{profile.role}</p>
          <p className="text-sm text-muted-foreground mt-1">{profile.company}</p>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Email verified</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
              <Clock className="w-4 h-4" />
              <span>Member since Jan 2026</span>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          className="lg:col-span-2 glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Personal Information</h3>
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="pl-10"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="pl-10"
                  placeholder="your@email.com"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Company</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  className="pl-10"
                  placeholder="Company name"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Role</label>
              <Input
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                placeholder="Your role"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground mb-1.5 block">Avatar URL</label>
              <Input
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          className="lg:col-span-3 glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-warning/15 text-warning">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Security</h3>
              <p className="text-sm text-muted-foreground">Manage your password and security settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Current Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={handlePasswordChange} variant="outline" className="w-full">
                Update Password
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-info/10 border border-info/20">
            <h4 className="font-medium text-foreground mb-1">Two-Factor Authentication</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
