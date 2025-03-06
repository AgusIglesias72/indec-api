export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
    }
    Views: {
      emae_by_activity_with_variations: {
        Row: {
          date: string | null
          id: string | null
          monthly_pct_change: number | null
          original_value: number | null
          sector: string | null
          sector_code: string | null
          yearly_pct_change: number | null
        }
        Relationships: []
      }
      emae_with_variations: {
        Row: {
          cycle_trend_value: number | null
          date: string | null
          id: string | null
          monthly_pct_change: number | null
          original_value: number | null
          seasonally_adjusted_value: number | null
          sector: string | null
          sector_code: string | null
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
          monthly_pct_change: number | null
          region: string | null
          yearly_pct_change: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
