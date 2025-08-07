import { Database } from './supabase';

// Tipos básicos de Supabase
export type EmaeRow = Database['public']['Tables']['emae']['Row'];
export type EmaeInsert = Database['public']['Tables']['emae']['Insert'];
export type EmaeUpdate = Database['public']['Tables']['emae']['Update'];

export type EmaeByActivityRow = Database['public']['Tables']['emae_by_activity']['Row'];
export type EmaeByActivityInsert = Database['public']['Tables']['emae_by_activity']['Insert'];
export type EmaeByActivityUpdate = Database['public']['Tables']['emae_by_activity']['Update'];

// Extensiones y tipos adicionales para la API

// Frecuencia de los datos
export type Frequency = 'monthly' | 'quarterly' | 'yearly';

// Interfaz para actividades económicas del EMAE
export interface ActivityData {
  code: string;
  name: string;
  value: number;
  weight: number;
  contribution: number;
}

// Interfaz para datos completos del EMAE
export interface EmaeData {
  date: string;
  value: number;
  original_value: number;
  activities_data: ActivityData[] | null;
}

// Parámetros para solicitudes de API
export interface TimeSeriesQueryParams {
  start_date?: string;
  end_date?: string;
  frequency?: Frequency;
  seasonally_adjusted?: boolean;
  include_trend?: boolean;
  include_activities?: boolean;
}

// Respuesta de error de la API
export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}

// Respuesta exitosa de la API
export interface ApiResponse<T> {
  data: T;
  metadata?: {
    count: number;
    page?: number;
    pages?: number;
    lastUpdated: string;
  };
}

// Resultado de la tarea cron
export interface CronTaskResult {
  taskId: string;
  dataSource: string;
  startTime: string;
  endTime: string;
  recordsProcessed: number;
  status: 'success' | 'partial' | 'error';
  details?: string;
}

// Tipos para el IPC (sin campos de variación almacenados)
export type IpcRow = {
  id: string;
  date: string;
  component: string;
  component_code: string;
  component_type: string; // 'GENERAL', 'RUBRO', 'CATEGORIA', 'BYS'
  index_value: number;
  region: string; // Región (Nacional, GBA, etc.)
  created_at: string;
};

// Tipo para las respuestas de API que incluye variaciones calculadas dinámicamente
export type IpcResponse = {
  monthly_change_variation: number;
  date: string;
  category: string;
  category_code: string;
  category_type: string;
  index_value: number;
  region: string;
  // Variaciones calculadas dinámicamente
  monthly_pct_change?: number;
  yearly_pct_change?: number;
  accumulated_pct_change?: number;
};

export type IpcInsert = Omit<IpcRow, 'id'>;
export type IpcUpdate = Partial<IpcInsert>;

// Actualizar la interfaz EmaeResponse
export interface EmaeResponse {
  date: string;
  sector: string;
  sector_code: string;
  original_value: number;
  seasonally_adjusted_value?: number;
  trend_cycle_value?: number;
  monthly_pct_change?: number;
  yearly_pct_change?: number;
}

// Exportar tipos del BCRA
export * from './bcra';