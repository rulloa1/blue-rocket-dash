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
      deal_stage_history: {
        Row: {
          deal_id: string
          entered_at: string
          id: string
          notes: string | null
          stage: Database["public"]["Enums"]["deal_stage"]
        }
        Insert: {
          deal_id: string
          entered_at?: string
          id?: string
          notes?: string | null
          stage: Database["public"]["Enums"]["deal_stage"]
        }
        Update: {
          deal_id?: string
          entered_at?: string
          id?: string
          notes?: string | null
          stage?: Database["public"]["Enums"]["deal_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "deal_stage_history_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          lead_id: string | null
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          proposal_url: string | null
          services: string[] | null
          stage: Database["public"]["Enums"]["deal_stage"]
          stage_entered_at: string
          title: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          proposal_url?: string | null
          services?: string[] | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          stage_entered_at?: string
          title: string
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          proposal_url?: string | null
          services?: string[] | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          stage_entered_at?: string
          title?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enrollment_step_tracking: {
        Row: {
          bounced_at: string | null
          enrollment_id: string
          id: string
          opened_at: string | null
          replied_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          step_id: string
        }
        Insert: {
          bounced_at?: string | null
          enrollment_id: string
          id?: string
          opened_at?: string | null
          replied_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          step_id: string
        }
        Update: {
          bounced_at?: string | null
          enrollment_id?: string
          id?: string
          opened_at?: string | null
          replied_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_step_tracking_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "sequence_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_step_tracking_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "sequence_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          lead_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lead_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lead_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_score: number | null
          business_name: string
          created_at: string
          email: string | null
          id: string
          industry: string | null
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          ai_score?: number | null
          business_name: string
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          ai_score?: number | null
          business_name?: string
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      proposal_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          proposal_id: string
          quantity: number
          sort_order: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          proposal_id: string
          quantity?: number
          sort_order?: number
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          proposal_id?: string
          quantity?: number
          sort_order?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_line_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          created_at: string
          default_services: Json | null
          default_terms: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          default_services?: Json | null
          default_terms?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          default_services?: Json | null
          default_terms?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          client_business: string | null
          client_email: string | null
          client_name: string
          created_at: string
          deal_id: string | null
          delivery_date: string | null
          discount_type: string | null
          discount_value: number | null
          expires_at: string | null
          id: string
          lead_id: string | null
          notes: string | null
          public_id: string | null
          sent_at: string | null
          signed_at: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          subtotal: number
          template_id: string | null
          terms: string | null
          total: number
          updated_at: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          client_business?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          deal_id?: string | null
          delivery_date?: string | null
          discount_type?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          public_id?: string | null
          sent_at?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          subtotal?: number
          template_id?: string | null
          terms?: string | null
          total?: number
          updated_at?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          client_business?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          deal_id?: string | null
          delivery_date?: string | null
          discount_type?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          public_id?: string | null
          sent_at?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          subtotal?: number
          template_id?: string | null
          terms?: string | null
          total?: number
          updated_at?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "proposal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_enrollments: {
        Row: {
          completed_at: string | null
          current_step: number
          enrolled_at: string
          id: string
          lead_id: string
          sequence_id: string
          status: Database["public"]["Enums"]["enrollment_status"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number
          enrolled_at?: string
          id?: string
          lead_id: string
          sequence_id: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number
          enrolled_at?: string
          id?: string
          lead_id?: string
          sequence_id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_enrollments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_steps: {
        Row: {
          body: string
          created_at: string
          delay_days: number
          id: string
          sequence_id: string
          step_order: number
          subject: string
        }
        Insert: {
          body: string
          created_at?: string
          delay_days?: number
          id?: string
          sequence_id: string
          step_order: number
          subject: string
        }
        Update: {
          body?: string
          created_at?: string
          delay_days?: number
          id?: string
          sequence_id?: string
          step_order?: number
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      sequences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["sequence_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["sequence_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["sequence_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          role: string
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          role: string
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          role?: string
          token?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          member_id: string
          owner_id: string
          role: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          owner_id: string
          role: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          owner_id?: string
          role?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          business_address: string | null
          company_logo_url: string | null
          company_name: string | null
          contact_email: string | null
          created_at: string
          email_notifications: boolean | null
          email_signature: string | null
          id: string
          inbound_webhook_token: string | null
          notify_deal_stage_change: boolean | null
          notify_lead_status_change: boolean | null
          notify_new_lead: boolean | null
          notify_proposal_signed: boolean | null
          notify_proposal_viewed: boolean | null
          smtp_from_email: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          email_notifications?: boolean | null
          email_signature?: string | null
          id?: string
          inbound_webhook_token?: string | null
          notify_deal_stage_change?: boolean | null
          notify_lead_status_change?: boolean | null
          notify_new_lead?: boolean | null
          notify_proposal_signed?: boolean | null
          notify_proposal_viewed?: boolean | null
          smtp_from_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          email_notifications?: boolean | null
          email_signature?: string | null
          id?: string
          inbound_webhook_token?: string | null
          notify_deal_stage_change?: boolean | null
          notify_lead_status_change?: boolean | null
          notify_new_lead?: boolean | null
          notify_proposal_signed?: boolean | null
          notify_proposal_viewed?: boolean | null
          smtp_from_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_status_code: number | null
          last_triggered_at: string | null
          name: string
          trigger_event: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          name: string
          trigger_event: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          name?: string
          trigger_event?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_user_settings: { Args: never; Returns: string }
    }
    Enums: {
      deal_stage:
        | "lead"
        | "proposal_sent"
        | "negotiation"
        | "contract_signed"
        | "onboarding"
        | "active_client"
      enrollment_status:
        | "active"
        | "paused"
        | "completed"
        | "bounced"
        | "replied"
      lead_status: "new" | "contacted" | "qualified" | "not_interested"
      proposal_status: "draft" | "sent" | "viewed" | "signed" | "expired"
      sequence_status: "draft" | "active" | "paused"
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
      deal_stage: [
        "lead",
        "proposal_sent",
        "negotiation",
        "contract_signed",
        "onboarding",
        "active_client",
      ],
      enrollment_status: [
        "active",
        "paused",
        "completed",
        "bounced",
        "replied",
      ],
      lead_status: ["new", "contacted", "qualified", "not_interested"],
      proposal_status: ["draft", "sent", "viewed", "signed", "expired"],
      sequence_status: ["draft", "active", "paused"],
    },
  },
} as const
