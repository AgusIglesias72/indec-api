// src/types/risk-country.ts
// Tipos específicos para Riesgo País integrados con Supabase

import { Database } from './supabase';

// Tipo base de la vista v_embi_daily_closing
export type EmbiDailyClosingRow = {
  closing_date: string;
  closing_value: number;
  change_percentage: number | null;
  previous_value?: number | null;
  volume?: number | null;
  high_value?: number | null;
  low_value?: number | null;
  created_at?: string;
  updated_at?: string;
};

// Extendido para incluir datos calculados
export interface RiskCountryDataPoint extends EmbiDailyClosingRow {
  // Campos adicionales que pueden ser calculados
  variation_points?: number;
  trend?: 'up' | 'down' | 'stable';
  risk_level?: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
}

// Estadísticas agregadas del riesgo país
export interface RiskCountryStats {
  latest_value: number;
  latest_date: string;
  latest_change: number | null;
  min_value: number;
  max_value: number;
  avg_value: number;
  total_records: number;
  period_change: {
    absolute: number;
    percentage: number | null;
  } | null;
  volatility: {
    avg_daily_change: number;
    max_daily_increase: number;
    max_daily_decrease: number;
  } | null;
}

export interface RiskCountryResponse {
  success: boolean;
  data: RiskCountryDataPoint[];
  meta: {
    type: string;
    total_records?: number; // Hacemos opcional para la nueva estructura
    date_range: any;
    order: string;
    limit: number | null;
    query_timestamp: string;
  };
  stats: RiskCountryStats | null;
  error?: string;
  details?: string;
  // Añadir este objeto para la paginación
  pagination?: {
    page: number;
    limit: number;
    total_records: number;
    total_pages: number;
  };
}

// Parámetros de consulta
export type RiskCountryQueryType = 
  | 'latest' 
  | 'last_7_days' 
  | 'last_30_days' 
  | 'last_90_days' 
  | 'year_to_date' 
  | 'last_year' 
  | 'custom';

export interface RiskCountryQueryParams {
  type?: RiskCountryQueryType;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;   // YYYY-MM-DD
  limit?: number;     // Max 1000
  order?: 'asc' | 'desc';
}

// Niveles de riesgo con metadata
export interface RiskLevel {
  level: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
  color: 'green' | 'yellow' | 'orange' | 'red';
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  threshold: {
    min: number;
    max: number;
  };
}

// Configuración de niveles de riesgo
export const RISK_LEVELS: Record<string, RiskLevel> = {
  LOW: {
    level: 'Bajo',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    description: 'Riesgo soberano bajo - Acceso favorable a mercados internacionales',
    threshold: { min: 0, max: 499 }
  },
  MODERATE: {
    level: 'Moderado',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    description: 'Riesgo soberano moderado - Condiciones de financiamiento normales',
    threshold: { min: 500, max: 999 }
  },
  HIGH: {
    level: 'Alto',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    description: 'Riesgo soberano alto - Acceso limitado y costoso a financiamiento',
    threshold: { min: 1000, max: 1499 }
  },
  VERY_HIGH: {
    level: 'Muy Alto',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    description: 'Riesgo soberano muy alto - Acceso severamente restringido',
    threshold: { min: 1500, max: Infinity }
  }
};

// Datos para gráficos
export interface RiskCountryChartData {
  date: string;
  value: number;
  change?: number;
  formattedDate?: string;
  riskLevel?: string;
}

// Datos agregados por período
export interface RiskCountryPeriodData {
  period: string;
  avg_value: number;
  min_value: number;
  max_value: number;
  volatility: number;
  trend: 'up' | 'down' | 'stable';
}

// Comparación histórica
export interface RiskCountryComparison {
  current: RiskCountryDataPoint;
  previous_week: RiskCountryDataPoint | null;
  previous_month: RiskCountryDataPoint | null;
  previous_year: RiskCountryDataPoint | null;
  changes: {
    weekly: number | null;
    monthly: number | null;
    yearly: number | null;
  };
}

// Eventos o noticias que puedan afectar el riesgo país
export interface RiskCountryEvent {
  date: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high';
}

// Agregarlo a tu archivo src/types/supabase.ts en la sección Views:
/*
v_embi_daily_closing: {
  Row: {
    closing_date: string | null
    closing_value: number | null
    change_percentage: number | null
    previous_value: number | null
    volume: number | null
    high_value: number | null
    low_value: number | null
    created_at: string | null
    updated_at: string | null
  }
  Relationships: []
}
*/