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
        }
        Insert: {
          buy_price: number
          created_at?: string | null
          date: string
          dollar_type: string
          id?: string
          sell_price: number
        }
        Update: {
          buy_price?: number
          created_at?: string | null
          date?: string
          dollar_type?: string
          id?: string
          sell_price?: number
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
    }
    Views: {
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
