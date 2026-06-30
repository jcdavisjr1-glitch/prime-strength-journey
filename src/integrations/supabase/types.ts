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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      exercise_swaps: {
        Row: {
          block_id: string
          id: string
          original_exercise: string
          replacement_exercise: string
          swap_reason: string
          swapped_at: string
          user_id: string
        }
        Insert: {
          block_id: string
          id?: string
          original_exercise: string
          replacement_exercise: string
          swap_reason: string
          swapped_at?: string
          user_id: string
        }
        Update: {
          block_id?: string
          id?: string
          original_exercise?: string
          replacement_exercise?: string
          swap_reason?: string
          swapped_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_swaps_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "training_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      mailing_list: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          subscribed: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          subscribed?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          subscribed?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      one_time_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          environment: string
          grants_lifetime_access: boolean
          id: string
          price_id: string
          product_id: string
          stripe_customer_id: string
          stripe_session_id: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          environment?: string
          grants_lifetime_access?: boolean
          id?: string
          price_id: string
          product_id: string
          stripe_customer_id: string
          stripe_session_id: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          environment?: string
          grants_lifetime_access?: boolean
          id?: string
          price_id?: string
          product_id?: string
          stripe_customer_id?: string
          stripe_session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          equipment_type: string | null
          fitness_level: string | null
          full_name: string | null
          goal: string | null
          id: string
          onboarding_completed: boolean
          partner_id: string | null
          updated_at: string
          weekly_walking_goal_minutes: number
        }
        Insert: {
          created_at?: string
          equipment_type?: string | null
          fitness_level?: string | null
          full_name?: string | null
          goal?: string | null
          id: string
          onboarding_completed?: boolean
          partner_id?: string | null
          updated_at?: string
          weekly_walking_goal_minutes?: number
        }
        Update: {
          created_at?: string
          equipment_type?: string | null
          fitness_level?: string | null
          full_name?: string | null
          goal?: string | null
          id?: string
          onboarding_completed?: boolean
          partner_id?: string | null
          updated_at?: string
          weekly_walking_goal_minutes?: number
        }
        Relationships: []
      }
      progression_recommendations: {
        Row: {
          applied: boolean
          based_on_session_date: string
          exercise_name: string
          generated_at: string
          id: string
          recommendation_reason: string
          recommended_weight: number | null
          user_id: string
        }
        Insert: {
          applied?: boolean
          based_on_session_date: string
          exercise_name: string
          generated_at?: string
          id?: string
          recommendation_reason: string
          recommended_weight?: number | null
          user_id: string
        }
        Update: {
          applied?: boolean
          based_on_session_date?: string
          exercise_name?: string
          generated_at?: string
          id?: string
          recommendation_reason?: string
          recommended_weight?: number | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      training_blocks: {
        Row: {
          block_number: number
          created_at: string
          end_date: string | null
          equipment_type: string
          fitness_level: string
          id: string
          outcome: string | null
          review_score: number | null
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          block_number?: number
          created_at?: string
          end_date?: string | null
          equipment_type: string
          fitness_level: string
          id?: string
          outcome?: string | null
          review_score?: number | null
          start_date?: string
          status?: string
          user_id: string
        }
        Update: {
          block_number?: number
          created_at?: string
          end_date?: string | null
          equipment_type?: string
          fitness_level?: string
          id?: string
          outcome?: string | null
          review_score?: number | null
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      walking_logs: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          logged_date: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          id?: string
          logged_date?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          logged_date?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          difficulty: string | null
          exercise_name: string
          id: string
          logged_at: string
          reps: number | null
          reps_completed: number | null
          sets: number | null
          user_id: string
          weight: number | null
        }
        Insert: {
          difficulty?: string | null
          exercise_name: string
          id?: string
          logged_at?: string
          reps?: number | null
          reps_completed?: number | null
          sets?: number | null
          user_id: string
          weight?: number | null
        }
        Update: {
          difficulty?: string | null
          exercise_name?: string
          id?: string
          logged_at?: string
          reps?: number | null
          reps_completed?: number | null
          sets?: number | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_progression: {
        Args: { _exercise_name: string; _user_id: string }
        Returns: undefined
      }
      daily_review_check: { Args: never; Returns: undefined }
      exercise_category: { Args: { _name: string }; Returns: string }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_member_access: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      next_fitness_level: {
        Args: { _direction: string; _level: string }
        Returns: string
      }
      run_three_week_review: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
