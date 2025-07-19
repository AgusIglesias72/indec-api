export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          admin_notes: string | null
          contact_type: string
          created_at: string | null
          email: string
          id: number
          ip_address: unknown | null
          is_spam: boolean | null
          message: string
          name: string
          priority: string | null
          referrer: string | null
          replied_at: string | null
          resolved_at: string | null
          spam_score: number | null
          status: string | null
          subject: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          admin_notes?: string | null
          contact_type: string
          created_at?: string | null
          email: string
          id?: number
          ip_address?: unknown | null
          is_spam?: boolean | null
          message: string
          name: string
          priority?: string | null
          referrer?: string | null
          replied_at?: string | null
          resolved_at?: string | null
          spam_score?: number | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          admin_notes?: string | null
          contact_type?: string
          created_at?: string | null
          email?: string
          id?: number
          ip_address?: unknown | null
          is_spam?: boolean | null
          message?: string
          name?: string
          priority?: string | null
          referrer?: string | null
          replied_at?: string | null
          resolved_at?: string | null
          spam_score?: number | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      cron_executions: {
        Row: {
          created_at: string
          execution_time: string
          id: string
          results: Json
          status: string
        }
        Insert: {
          created_at?: string
          execution_time?: string
          id?: string
          results?: Json
          status: string
        }
        Update: {
          created_at?: string
          execution_time?: string
          id?: string
          results?: Json
          status?: string
        }
        Relationships: []
      }
      dollar_rates: {
        Row: {
          buy_price: number
          created_at: string | null
          date: string
          dollar_type: string
          id: string
          sell_price: number
          updated_at: string
        }
        Insert: {
          buy_price: number
          created_at?: string | null
          date: string
          dollar_type: string
          id?: string
          sell_price: number
          updated_at?: string
        }
        Update: {
          buy_price?: number
          created_at?: string | null
          date?: string
          dollar_type?: string
          id?: string
          sell_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      economic_calendar: {
        Row: {
          date: string
          day_week: string
          id: number
          indicator: string
          period: string
          source: string | null
        }
        Insert: {
          date: string
          day_week: string
          id?: number
          indicator: string
          period: string
          source?: string | null
        }
        Update: {
          date?: string
          day_week?: string
          id?: number
          indicator?: string
          period?: string
          source?: string | null
        }
        Relationships: []
      }
      emae: {
        Row: {
          activities_data: Json[] | null
          created_at: string
          cycle_trend_value: number
          date: string
          id: string
          original_value: number
          seasonally_adjusted_value: number
        }
        Insert: {
          activities_data?: Json[] | null
          created_at?: string
          cycle_trend_value?: number
          date?: string
          id?: string
          original_value?: number
          seasonally_adjusted_value?: number
        }
        Update: {
          activities_data?: Json[] | null
          created_at?: string
          cycle_trend_value?: number
          date?: string
          id?: string
          original_value?: number
          seasonally_adjusted_value?: number
        }
        Relationships: []
      }
      emae_by_activity: {
        Row: {
          created_at: string
          date: string
          economy_sector: string | null
          economy_sector_code: string | null
          id: string
          original_value: number | null
        }
        Insert: {
          created_at?: string
          date: string
          economy_sector?: string | null
          economy_sector_code?: string | null
          id?: string
          original_value?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          economy_sector?: string | null
          economy_sector_code?: string | null
          id?: string
          original_value?: number | null
        }
        Relationships: []
      }
      embi_risk: {
        Row: {
          created_at: string
          date: string
          external_id: string
          id: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          date: string
          external_id: string
          id?: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          date?: string
          external_id?: string
          id?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      ipc: {
        Row: {
          component: string
          component_code: string
          component_type: string
          created_at: string | null
          date: string
          id: string
          index_value: number
          region: string
        }
        Insert: {
          component: string
          component_code: string
          component_type: string
          created_at?: string | null
          date: string
          id?: string
          index_value: number
          region?: string
        }
        Update: {
          component?: string
          component_code?: string
          component_type?: string
          created_at?: string | null
          date?: string
          id?: string
          index_value?: number
          region?: string
        }
        Relationships: []
      }
      labor_market: {
        Row: {
          activity_rate: number | null
          age_group: string | null
          created_at: string | null
          data_type: string
          date: string
          demographic_segment: string | null
          economically_active_population: number | null
          employed_population: number | null
          employment_rate: number | null
          gender: string | null
          id: string
          inactive_population: number | null
          period: string
          region: string
          source_file: string | null
          total_population: number | null
          unemployed_population: number | null
          unemployment_rate: number | null
          updated_at: string | null
        }
        Insert: {
          activity_rate?: number | null
          age_group?: string | null
          created_at?: string | null
          data_type: string
          date: string
          demographic_segment?: string | null
          economically_active_population?: number | null
          employed_population?: number | null
          employment_rate?: number | null
          gender?: string | null
          id?: string
          inactive_population?: number | null
          period: string
          region: string
          source_file?: string | null
          total_population?: number | null
          unemployed_population?: number | null
          unemployment_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          activity_rate?: number | null
          age_group?: string | null
          created_at?: string | null
          data_type?: string
          date?: string
          demographic_segment?: string | null
          economically_active_population?: number | null
          employed_population?: number | null
          employment_rate?: number | null
          gender?: string | null
          id?: string
          inactive_population?: number | null
          period?: string
          region?: string
          source_file?: string | null
          total_population?: number | null
          unemployed_population?: number | null
          unemployment_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          source: string | null
          status: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          indicator_code: string | null
          indicator_type: string
          is_active: boolean | null
          last_triggered_at: string | null
          threshold_value: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          indicator_code?: string | null
          indicator_type: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          threshold_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          indicator_code?: string | null
          indicator_type?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          threshold_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          indicator_code: string | null
          indicator_name: string | null
          indicator_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          indicator_code?: string | null
          indicator_name?: string | null
          indicator_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          indicator_code?: string | null
          indicator_name?: string | null
          indicator_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          api_key: string | null
          clerk_user_id: string
          created_at: string | null
          daily_requests_count: number | null
          email: string
          id: string
          image_url: string | null
          last_request_reset_at: string | null
          name: string | null
          plan_type: string | null
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          clerk_user_id: string
          created_at?: string | null
          daily_requests_count?: number | null
          email: string
          id?: string
          image_url?: string | null
          last_request_reset_at?: string | null
          name?: string | null
          plan_type?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          clerk_user_id?: string
          created_at?: string | null
          daily_requests_count?: number | null
          email?: string
          id?: string
          image_url?: string | null
          last_request_reset_at?: string | null
          name?: string | null
          plan_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      contact_stats: {
        Row: {
          avg_resolution_hours: number | null
          contact_type: string | null
          last_30_days: number | null
          last_7_days: number | null
          resolved_count: number | null
          total_submissions: number | null
        }
        Relationships: []
      }
      emae_by_activity_with_variations: {
        Row: {
          date: string | null
          id: string | null
          month: number | null
          monthly_pct_change: number | null
          original_value: number | null
          sector: string | null
          sector_code: string | null
          year: number | null
          yearly_pct_change: number | null
        }
        Relationships: []
      }
      emae_with_variations: {
        Row: {
          cycle_trend_value: number | null
          date: string | null
          id: string | null
          month: number | null
          monthly_pct_change: number | null
          original_value: number | null
          seasonally_adjusted_value: number | null
          sector: string | null
          sector_code: string | null
          year: number | null
          yearly_pct_change: number | null
        }
        Relationships: []
      }
      ipc_bienes_servicios: {
        Row: {
          component: string | null
          component_code: string | null
          created_at: string | null
          date: string | null
          id: string | null
          index_value: number | null
          region: string | null
        }
        Insert: {
          component?: string | null
          component_code?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          index_value?: number | null
          region?: string | null
        }
        Update: {
          component?: string | null
          component_code?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          index_value?: number | null
          region?: string | null
        }
        Relationships: []
      }
      ipc_categorias: {
        Row: {
          component: string | null
          component_code: string | null
          created_at: string | null
          date: string | null
          id: string | null
          index_value: number | null
          region: string | null
        }
        Insert: {
          component?: string | null
          component_code?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          index_value?: number | null
          region?: string | null
        }
        Update: {
          component?: string | null
          component_code?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          index_value?: number | null
          region?: string | null
        }
        Relationships: []
      }
      ipc_components_metadata: {
        Row: {
          component: string | null
          component_code: string | null
          component_type: string | null
          region: string | null
        }
        Relationships: []
      }
      ipc_general: {
        Row: {
          component: string | null
          component_code: string | null
          created_at: string | null
          date: string | null
          id: string | null
          index_value: number | null
          region: string | null
        }
        Insert: {
          component?: string | null
          component_code?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          index_value?: number | null
          region?: string | null
        }
        Update: {
          component?: string | null
          component_code?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          index_value?: number | null
          region?: string | null
        }
        Relationships: []
      }
      ipc_rubros: {
        Row: {
          component: string | null
          component_code: string | null
          created_at: string | null
          date: string | null
          id: string | null
          index_value: number | null
          region: string | null
        }
        Insert: {
          component?: string | null
          component_code?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          index_value?: number | null
          region?: string | null
        }
        Update: {
          component?: string | null
          component_code?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          index_value?: number | null
          region?: string | null
        }
        Relationships: []
      }
      ipc_with_variations: {
        Row: {
          accumulated_pct_change: number | null
          component: string | null
          component_code: string | null
          component_type: string | null
          date: string | null
          id: string | null
          index_value: number | null
          month: number | null
          monthly_pct_change: number | null
          region: string | null
          year: number | null
          yearly_pct_change: number | null
        }
        Relationships: []
      }
      labor_market_annual: {
        Row: {
          age_group: string | null
          annual_variation_activity: number | null
          annual_variation_employment: number | null
          annual_variation_unemployment: number | null
          avg_activity_rate: number | null
          avg_employment_rate: number | null
          avg_unemployment_rate: number | null
          avg_yoy_variation_activity: number | null
          avg_yoy_variation_employment: number | null
          avg_yoy_variation_unemployment: number | null
          data_type: string | null
          demographic_segment: string | null
          gender: string | null
          quarters_count: number | null
          region: string | null
          year: number | null
          year_end_date: string | null
          year_start_date: string | null
        }
        Relationships: []
      }
      labor_market_by_type: {
        Row: {
          activity_rate: number | null
          age_group: string | null
          data_type: string | null
          data_type_label: string | null
          date: string | null
          demographic_segment: string | null
          employment_rate: number | null
          gender: string | null
          period: string | null
          prev_yoy_activity_rate: number | null
          prev_yoy_employment_rate: number | null
          prev_yoy_period: string | null
          prev_yoy_unemployment_rate: number | null
          region: string | null
          segment_id: string | null
          unemployment_rate: number | null
          variation_qtq_activity_rate: number | null
          variation_qtq_employment_rate: number | null
          variation_qtq_unemployment_rate: number | null
          variation_yoy_activity_rate: number | null
          variation_yoy_employment_rate: number | null
          variation_yoy_unemployment_rate: number | null
        }
        Relationships: []
      }
      labor_market_comparison: {
        Row: {
          brecha_genero_activity: number | null
          brecha_genero_variation_yoy_activity: number | null
          date: string | null
          dispersion_regional_activity: number | null
          gba_activity_rate: number | null
          gba_variation_yoy_activity: number | null
          jefes_hogar_activity_rate: number | null
          jefes_hogar_variation_yoy_activity: number | null
          mujeres_activity_rate: number | null
          mujeres_variation_yoy_activity: number | null
          nacional_activity_rate: number | null
          nacional_employment_rate: number | null
          nacional_unemployment_rate: number | null
          nacional_variation_yoy_activity: number | null
          nacional_variation_yoy_employment: number | null
          nacional_variation_yoy_unemployment: number | null
          pampeana_activity_rate: number | null
          pampeana_variation_yoy_activity: number | null
          period: string | null
          prev_yoy_period: string | null
          varones_activity_rate: number | null
          varones_variation_yoy_activity: number | null
        }
        Relationships: []
      }
      labor_market_latest: {
        Row: {
          activity_rate: number | null
          age_group: string | null
          created_at: string | null
          data_type: string | null
          date: string | null
          demographic_segment: string | null
          economically_active_population: number | null
          employed_population: number | null
          employment_rate: number | null
          gender: string | null
          id: string | null
          inactive_population: number | null
          period: string | null
          prev_yoy_activity_rate: number | null
          prev_yoy_employment_rate: number | null
          prev_yoy_period: string | null
          prev_yoy_unemployment_rate: number | null
          region: string | null
          source_file: string | null
          total_population: number | null
          unemployed_population: number | null
          unemployment_rate: number | null
          updated_at: string | null
          variation_qtq_activity_rate: number | null
          variation_qtq_employment_rate: number | null
          variation_qtq_unemployment_rate: number | null
          variation_yoy_activity_rate: number | null
          variation_yoy_employment_rate: number | null
          variation_yoy_unemployment_rate: number | null
        }
        Relationships: []
      }
      labor_market_temporal: {
        Row: {
          activity_rate: number | null
          age_group: string | null
          created_at: string | null
          data_type: string | null
          date: string | null
          demographic_segment: string | null
          economically_active_population: number | null
          employed_population: number | null
          employment_rate: number | null
          gender: string | null
          id: string | null
          inactive_population: number | null
          period: string | null
          prev_yoy_activity_rate: number | null
          prev_yoy_employment_rate: number | null
          prev_yoy_period: string | null
          prev_yoy_unemployment_rate: number | null
          region: string | null
          source_file: string | null
          total_population: number | null
          unemployed_population: number | null
          unemployment_rate: number | null
          updated_at: string | null
          variation_qtq_activity_rate: number | null
          variation_qtq_employment_rate: number | null
          variation_qtq_unemployment_rate: number | null
          variation_yoy_activity_rate: number | null
          variation_yoy_employment_rate: number | null
          variation_yoy_unemployment_rate: number | null
        }
        Relationships: []
      }
      v_dollar_daily_closing: {
        Row: {
          buy_price: number | null
          closing_date: string | null
          closing_timestamp: string | null
          created_at: string | null
          dollar_type: string | null
          id: string | null
          sell_price: number | null
          spread: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_dollar_latest: {
        Row: {
          buy_price: number | null
          created_at: string | null
          date: string | null
          dollar_type: string | null
          sell_price: number | null
          spread: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_dollar_with_variations: {
        Row: {
          buy_price: number | null
          buy_variation: number | null
          date: string | null
          dollar_type: string | null
          sell_price: number | null
          sell_variation: number | null
          updated_at: string | null
          yesterday_buy: number | null
          yesterday_sell: number | null
        }
        Relationships: []
      }
      v_embi_daily_closing: {
        Row: {
          change_percentage: number | null
          change_value: number | null
          closing_date: string | null
          closing_value: number | null
          latest_timestamp: string | null
          previous_date: string | null
          previous_day_value: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_embi_history: {
        Args: { days_count?: number }
        Returns: {
          closing_date: string
          closing_value: number
          change_value: number
          change_percentage: number
          trend: string
          risk_level: string
        }[]
      }
      get_latest_embi_closing: {
        Args: Record<PropertyKey, never>
        Returns: {
          latest_date: string
          latest_value: number
          change_value: number
          change_percentage: number
          trend: string
          risk_level: string
        }[]
      }
      reset_daily_requests: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
