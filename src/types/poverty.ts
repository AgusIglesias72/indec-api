// src/types/poverty.ts - Tipos para datos de pobreza e indigencia

export interface PovertyData {
  id?: string;
  
  // Identificación temporal
  date: string; // YYYY-MM-DD (último día del semestre)
  period: string; // "S1 2025", "S2 2025", etc.
  semester: number; // 1 o 2
  year: number; // Año del período
  
  // Dimensiones de análisis
  data_type: 'national' | 'regional';
  region: string; // "Total 31 aglomerados", "Gran Buenos Aires", "Cuyo", etc.
  cuadro_source: string; // "Cuadro 1", "Cuadro 2.1", etc.
  
  // Indicadores principales (en porcentajes) - Cuadro 1
  poverty_rate_persons: number | null; // Tasa de pobreza por personas
  poverty_rate_households: number | null; // Tasa de pobreza por hogares
  indigence_rate_persons: number | null; // Tasa de indigencia por personas
  indigence_rate_households: number | null; // Tasa de indigencia por hogares
  
  // Indicadores de brecha (Cuadros 2.1 y 2.2)
  indigence_gap: number | null; // Brecha de indigencia
  poverty_gap: number | null; // Brecha de pobreza
  indigence_severity: number | null; // Severidad de indigencia
  poverty_severity: number | null; // Severidad de pobreza
  
  // Variables adicionales (desde fila 18 de Cuadros 2.1 y 2.2)
  variable_name: string | null; // Nombre de la variable específica
  variable_value: number | null; // Valor de la variable
  
  // Metadatos
  source_file?: string; // Para tracking del archivo origen
  created_at?: string;
  updated_at?: string;
}

export interface PovertyLatestData {
  date: string;
  period: string;
  data_type: string;
  region: string;
  poverty_rate_persons: number;
  poverty_rate_households: number;
  indigence_rate_persons: number;
  indigence_rate_households: number;
}

export interface PovertyMetadata {
  regions: string[];
  data_types: string[];
  indicators: string[];
  date_range: {
    first_date: string;
    last_date: string;
  };
  period_range: {
    first: string;
    last: string;
  };
  record_counts: {
    national: number;
    regional: number;
    provincial: number;
    total: number;
  };
}

export interface PovertyApiResponse {
  data: PovertyData[];
  metadata: {
    count: number;
    filtered_by: {
      start_date?: string;
      end_date?: string;
      data_type?: string;
      region?: string;
      indicator?: string;
    };
    period_range?: {
      first: string;
      last: string;
    };
  };
}

export interface PovertyLatestApiResponse {
  data: PovertyLatestData;
  metadata: {
    last_updated: string;
    period: string;
    data_type: string;
  };
}

// Tipos específicos para filtros
export type PovertyDataType = 'national' | 'regional';

export type PovertyRegion = 
  | "Total 31 aglomerados"
  | "Gran Buenos Aires"
  | "Cuyo"
  | "Noreste"
  | "Noroeste"
  | "Pampeana"
  | "Patagonia";

export type PovertyIndicator = 
  | "poverty_rate_persons"
  | "poverty_rate_households"
  | "indigence_rate_persons"
  | "indigence_rate_households"
  | "indigence_gap"
  | "poverty_gap"
  | "indigence_severity"
  | "poverty_severity"
  | "variable_value";

// Mapeo de regiones para normalización
export const POVERTY_REGION_MAPPINGS = {
  'Total 31 aglomerados urbanos': 'Total 31 aglomerados',
  'Gran Buenos Aires': 'Gran Buenos Aires',
  'Cuyo': 'Cuyo',
  'Noreste': 'Noreste',
  'Noroeste': 'Noroeste', 
  'Pampeana': 'Pampeana',
  'Patagonia': 'Patagonia'
} as const;

// Configuración de las dimensiones
export const POVERTY_DATA_TYPE_CONFIG = {
  national: {
    name: 'Nacional',
    description: 'Datos del total de 31 aglomerados urbanos',
    source: 'cuadros_informe_pobreza',
    expected_records_per_period: 1
  },
  regional: {
    name: 'Regional',
    description: 'Datos por regiones geográficas',
    source: 'cuadros_informe_pobreza',
    expected_records_per_period: 6
  }
} as const;

// Regiones objetivo
export const POVERTY_TARGET_REGIONS = [
  'Total 31 aglomerados',
  'Gran Buenos Aires',
  'Cuyo',
  'Noreste',
  'Noroeste',
  'Pampeana',
  'Patagonia'
] as const;

// Helper types para queries
export interface PovertyQueryFilters {
  start_date?: string;
  end_date?: string;
  data_type?: PovertyDataType;
  region?: string;
  indicator?: PovertyIndicator;
  limit?: number;
  format?: 'json' | 'csv';
}

// Tipo para los datos crudos del fetcher
export interface PovertyRawRow {
  date: string;
  period: string;
  data_type: PovertyDataType;
  region: string;
  poverty_rate_persons?: number;
  poverty_rate_households?: number;
  indigence_rate_persons?: number;
  indigence_rate_households?: number;
  poor_persons?: number;
  poor_households?: number;
  indigent_persons?: number;
  indigent_households?: number;
  total_persons?: number;
  total_households?: number;
  source_file: string;
}

// Interface para período de datos
export interface PeriodMapping {
  colIndex: number;
  year: string;
  semester: string;
  period: string;
  date: string;
}