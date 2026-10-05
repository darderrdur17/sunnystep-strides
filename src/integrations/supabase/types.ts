export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ab_test_variants: {
        Row: {
          conversion_rate: number | null
          conversions: number | null
          created_at: string
          id: string
          impressions: number | null
          is_control: boolean | null
          revenue: number | null
          test_id: string
          variant_name: string
        }
        Insert: {
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          is_control?: boolean | null
          revenue?: number | null
          test_id: string
          variant_name: string
        }
        Update: {
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          is_control?: boolean | null
          revenue?: number | null
          test_id?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          confidence_level: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          test_type: string | null
          updated_at: string
          winning_variant: string | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          test_type?: string | null
          updated_at?: string
          winning_variant?: string | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          test_type?: string | null
          updated_at?: string
          winning_variant?: string | null
        }
        Relationships: []
      }
      agent_configurations: {
        Row: {
          agent_name: string
          confidence_threshold: number
          created_at: string
          custom_settings: Json | null
          email_enabled: boolean
          frequency_cap_hours: number
          id: string
          is_active: boolean
          max_actions_per_day: number
          sms_enabled: boolean
          updated_at: string
          web_push_enabled: boolean
          whatsapp_enabled: boolean
        }
        Insert: {
          agent_name: string
          confidence_threshold?: number
          created_at?: string
          custom_settings?: Json | null
          email_enabled?: boolean
          frequency_cap_hours?: number
          id?: string
          is_active?: boolean
          max_actions_per_day?: number
          sms_enabled?: boolean
          updated_at?: string
          web_push_enabled?: boolean
          whatsapp_enabled?: boolean
        }
        Update: {
          agent_name?: string
          confidence_threshold?: number
          created_at?: string
          custom_settings?: Json | null
          email_enabled?: boolean
          frequency_cap_hours?: number
          id?: string
          is_active?: boolean
          max_actions_per_day?: number
          sms_enabled?: boolean
          updated_at?: string
          web_push_enabled?: boolean
          whatsapp_enabled?: boolean
        }
        Relationships: []
      }
      agent_notifications: {
        Row: {
          action_type: string
          agent_name: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          status: string
          title: string
        }
        Insert: {
          action_type: string
          agent_name: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          title: string
        }
        Update: {
          action_type?: string
          agent_name?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      agent_revenue: {
        Row: {
          actions_taken: number
          agent_name: string
          campaign_id: string | null
          conversions: number
          cost: number | null
          created_at: string
          date: string
          id: string
          revenue: number
        }
        Insert: {
          actions_taken?: number
          agent_name: string
          campaign_id?: string | null
          conversions?: number
          cost?: number | null
          created_at?: string
          date?: string
          id?: string
          revenue?: number
        }
        Update: {
          actions_taken?: number
          agent_name?: string
          campaign_id?: string | null
          conversions?: number
          cost?: number | null
          created_at?: string
          date?: string
          id?: string
          revenue?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_revenue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_summary: string
          action_type: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          team_id: string
        }
        Insert: {
          action_summary: string
          action_type: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          team_id: string
        }
        Update: {
          action_summary?: string
          action_type?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          agent_name: string | null
          conversion_rate: number | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          open_rate: number | null
          revenue: number | null
          sent_count: number
          start_date: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          agent_name?: string | null
          conversion_rate?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          open_rate?: number | null
          revenue?: number | null
          sent_count?: number
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          agent_name?: string | null
          conversion_rate?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          open_rate?: number | null
          revenue?: number | null
          sent_count?: number
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_calendar: {
        Row: {
          ai_recommended: boolean | null
          campaign_id: string | null
          content_type: string
          created_at: string
          created_by: string | null
          engagement_score: number | null
          id: string
          scheduled_at: string
          status: string
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_recommended?: boolean | null
          campaign_id?: string | null
          content_type?: string
          created_at?: string
          created_by?: string | null
          engagement_score?: number | null
          id?: string
          scheduled_at: string
          status?: string
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_recommended?: boolean | null
          campaign_id?: string | null
          content_type?: string
          created_at?: string
          created_by?: string | null
          engagement_score?: number | null
          id?: string
          scheduled_at?: string
          status?: string
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_calendar_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_calendar_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_journey_events: {
        Row: {
          agent_name: string | null
          channel: string | null
          created_at: string
          customer_id: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          agent_name?: string | null
          channel?: string | null
          created_at?: string
          customer_id: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          agent_name?: string | null
          channel?: string | null
          created_at?: string
          customer_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string | null
          content: Json | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          preview_text: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_text?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_text?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          notification_preferences: Json | null
          role: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          notification_preferences?: Json | null
          role?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          notification_preferences?: Json | null
          role?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["team_role"]
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          dashboard_layout: Json | null
          date_format: string | null
          id: string
          language: string | null
          sidebar_collapsed: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_layout?: Json | null
          date_format?: string | null
          id?: string
          language?: string | null
          sidebar_collapsed?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_layout?: Json | null
          date_format?: string | null
          id?: string
          language?: string | null
          sidebar_collapsed?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_app_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_team_role: {
        Args: {
          _role: Database["public"]["Enums"]["team_role"]
          _team_id: string
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
      team_role: "owner" | "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "user"],
      team_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const
