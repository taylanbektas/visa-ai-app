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
      advisor_applications: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          linkedin_url: string | null
          phone: string | null
          resume_url: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      advisor_assignments: {
        Row: {
          advisor_id: string
          application_id: string
          assigned_at: string | null
          assigned_by: string | null
          id: string
        }
        Insert: {
          advisor_id: string
          application_id: string
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
        }
        Update: {
          advisor_id?: string
          application_id?: string
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_assignments_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_assignments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_availability: {
        Row: {
          advisor_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          start_time: string
        }
        Insert: {
          advisor_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
        }
        Update: {
          advisor_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_availability_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_blocked_slots: {
        Row: {
          advisor_id: string
          created_at: string | null
          end_time: string
          id: string
          reason: string | null
          start_time: string
        }
        Insert: {
          advisor_id: string
          created_at?: string | null
          end_time: string
          id?: string
          reason?: string | null
          start_time: string
        }
        Update: {
          advisor_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          reason?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_blocked_slots_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      advisors: {
        Row: {
          about_me: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          max_clients: number | null
          phone: string | null
          photo_url: string | null
          specializations: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          about_me?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          max_clients?: number | null
          phone?: string | null
          photo_url?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          about_me?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          max_clients?: number | null
          phone?: string | null
          photo_url?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      application_documents: {
        Row: {
          advisor_id: string | null
          application_id: string | null
          created_at: string | null
          id: string
          name: string
          url: string
        }
        Insert: {
          advisor_id?: string | null
          application_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          url: string
        }
        Update: {
          advisor_id?: string | null
          application_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          created_at: string | null
          destination: string
          id: string
          notes: string | null
          payment_status: string | null
          plan: string
          reference_id: string
          status: string | null
          travel_date: string | null
          updated_at: string | null
          used_package_id: string | null
          user_id: string
          visa_type: string
        }
        Insert: {
          created_at?: string | null
          destination: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          plan: string
          reference_id: string
          status?: string | null
          travel_date?: string | null
          updated_at?: string | null
          used_package_id?: string | null
          user_id: string
          visa_type: string
        }
        Update: {
          created_at?: string | null
          destination?: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          plan?: string
          reference_id?: string
          status?: string | null
          travel_date?: string | null
          updated_at?: string | null
          used_package_id?: string | null
          user_id?: string
          visa_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_used_package_id_fkey"
            columns: ["used_package_id"]
            isOneToOne: false
            referencedRelation: "customer_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          advisor_id: string
          created_at: string | null
          customer_id: string
          end_time: string
          id: string
          is_advisor_request: boolean | null
          notes: string | null
          start_time: string
          status: string
        }
        Insert: {
          advisor_id: string
          created_at?: string | null
          customer_id: string
          end_time: string
          id?: string
          is_advisor_request?: boolean | null
          notes?: string | null
          start_time: string
          status?: string
        }
        Update: {
          advisor_id?: string
          created_at?: string | null
          customer_id?: string
          end_time?: string
          id?: string
          is_advisor_request?: boolean | null
          notes?: string | null
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_packages: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          package_type: string
          purchased_at: string | null
          remaining_count: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          package_type: string
          purchased_at?: string | null
          remaining_count?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          package_type?: string
          purchased_at?: string | null
          remaining_count?: number
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_package: string | null
          assigned_advisor_id: string | null
          created_at: string
          full_name: string | null
          id: string
          is_suspended: boolean | null
          last_seen: string | null
          package_assigned_at: string | null
          phone: string | null
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_package?: string | null
          assigned_advisor_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          last_seen?: string | null
          package_assigned_at?: string | null
          phone?: string | null
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_package?: string | null
          assigned_advisor_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          last_seen?: string | null
          package_assigned_at?: string | null
          phone?: string | null
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_assign_advisor: {
        Args: { p_advisor_id: string; p_user_id: string }
        Returns: undefined
      }
      delete_user: { Args: { user_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_own_application: {
        Args: { _application_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "agency"
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
      app_role: ["admin", "moderator", "user", "agency"],
    },
  },
} as const
