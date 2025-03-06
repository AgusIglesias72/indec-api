import { Database } from './supabase';

// Tipos básicos de Supabase
export type EmaeRow = Database['public']['Tables']['emae']['Row'];
export type EmaeInsert = Database['public']['Tables']['emae']['Insert'];
export type EmaeUpdate = Database['public']['Tables']['emae']['Update'];

export type EmaeByActivityRow = Database['public']['Tables']['emae_by_activity']['Row'];
export type EmaeByActivityInsert = Database['public']['Tables']['emae_by_activity']['Insert'];
export type EmaeByActivityUpdate = Database['public']['Tables']['emae_by_activity']['Update'];

// Extensiones y tipos adicionales para la API

// Enumeración para los métodos de desestacionalización
export type SeasonalAdjustmentMethod = 
  | 'x13-arima-seats'   // Método estándar del INDEC
  | 'tramo-seats'       // Método alternativo
  | 'moving-average'    // Promedio móvil simple
  | 'ratio-to-moving-average'; // Método de ratio a promedio móvil

// Frecuencia de los datos
export type Frequency = 'monthly' | 'quarterly' | 'yearly';

// Opciones para desestacionalización
export interface SeasonalAdjustmentOptions {
  method: SeasonalAdjustmentMethod;
  windowSize?: number;  // Para promedios móviles
  params?: Record<string, any>;  // Parámetros adicionales
}

// Interfaz para datos económicos genéricos
export interface EconomicTimeSeriesPoint {
  date: string;
  value: number;
  original_value: number;
  is_seasonally_adjusted: boolean;
  cycle_trend_value?: number;
}

// Interfaz para resultados de análisis
export interface AnalysisResult {
  data: EconomicTimeSeriesPoint[];
  metadata: {
    startDate: string;
    endDate: string;
    frequency: Frequency;
    adjustmentMethod: SeasonalAdjustmentMethod;
    lastUpdated: string;
  };
}

// Interfaz para actividades económicas del EMAE
export interface ActivityData {
  code: string;
  name: string;
  value: number;
  weight: number;
  contribution: number;
}

// Interfaz para datos completos del EMAE
export interface EmaeData extends EconomicTimeSeriesPoint {
  activities_data: ActivityData[] | null;
}

// Interfaz para una serie temporal completa
export interface TimeSeries {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  frequency: Frequency;
  data: EconomicTimeSeriesPoint[];
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

// Estado del pipeline de datos
export interface DataPipelineStatus {
  lastRun: string;
  nextScheduledRun: string;
  dataSources: {
    name: string;
    lastSuccess: string;
    status: 'active' | 'warning' | 'error';
    recordCount: number;
  }[];
}

// Tipos para la normalización de datos (desestacionalización)
export interface NormalizationJob {
  id: string;
  seriesId: string;
  method: SeasonalAdjustmentMethod;
  params: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  result_id?: string;
}

// Informes de datos económicos
export interface EconomicReport {
  id: string;
  title: string;
  date: string;
  period: string;
  indicators: {
    name: string;
    value: number;
    change: number;
    changeType: 'monthly' | 'yearly';
  }[];
  highlights: string[];
  sectors: {
    name: string;
    performance: 'positive' | 'negative' | 'neutral';
    value: number;
    change: number;
  }[];
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