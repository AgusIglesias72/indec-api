// src/types/labor-market.ts - Nueva estructura optimizada

export interface LaborMarketData {
    id?: string;
    
    // Identificación temporal
    date: string; // YYYY-MM-DD (último día del trimestre)
    period: string; // "T1 2025", "T2 2025", etc.
    
    // Dimensiones de análisis
    data_type: 'national' | 'regional' | 'demographic';
    region: string; // "Total 31 aglomerados", "GBA", "Región Cuyo", etc.
    
    // Segmentación demográfica
    gender: 'Total' | 'Mujeres' | 'Varones';
    age_group: 'Total' | '14+ años' | '14-29 años' | '30-64 años';
    demographic_segment: 'Total' | 'Jefes de hogar';
    
    // Indicadores principales (en porcentajes)
    activity_rate: number | null; // Tasa de actividad
    employment_rate: number | null; // Tasa de empleo
    unemployment_rate: number | null; // Tasa de desocupación
    
    // Poblaciones (en miles de personas) - para futura expansión
    total_population: number | null;
    economically_active_population: number | null;
    employed_population: number | null;
    unemployed_population: number | null;
    inactive_population: number | null;
    
    // Metadatos
    source_file?: string; // Para tracking del archivo origen
    created_at?: string;
    updated_at?: string;
  }
  
  export interface LaborMarketLatestData {
    date: string;
    period: string;
    data_type: string;
    region: string;
    gender: string;
    age_group: string;
    demographic_segment: string;
    unemployment_rate: number;
    activity_rate: number;
    employment_rate: number;
  }
  
  export interface LaborMarketMetadata {
    regions: string[];
    data_types: string[];
    genders: string[];
    age_groups: string[];
    demographic_segments: string[];
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
      demographic: number;
      total: number;
    };
  }
  
  export interface LaborMarketApiResponse {
    data: LaborMarketData[];
    metadata: {
      count: number;
      filtered_by: {
        start_date?: string;
        end_date?: string;
        data_type?: string;
        region?: string;
        gender?: string;
        age_group?: string;
        demographic_segment?: string;
        indicator?: string;
      };
      period_range?: {
        first: string;
        last: string;
      };
    };
  }
  
  export interface LaborMarketLatestApiResponse {
    data: LaborMarketLatestData;
    metadata: {
      last_updated: string;
      period: string;
      data_type: string;
    };
  }
  
  // Tipos específicos para filtros
  export type LaborMarketDataType = 'national' | 'regional' | 'demographic';
  
  export type LaborMarketRegion = 
    | "Total 31 aglomerados"
    | "GBA" 
    | "Región Cuyo"
    | "Región NEA"
    | "Región NOA"
    | "Región Pampeana"
    | "Región Patagónica";
  
  export type LaborMarketGender = 'Total' | 'Mujeres' | 'Varones';
  
  export type LaborMarketAgeGroup = 'Total' | '14+ años' | '14-29 años' | '30-64 años';
  
  export type LaborMarketDemographicSegment = 'Total' | 'Jefes de hogar';
  
  export type LaborMarketIndicator = 
    | "unemployment_rate"
    | "activity_rate"
    | "employment_rate"
    | "economically_active_population"
    | "employed_population"
    | "unemployed_population"
    | "total_population"
    | "inactive_population";
  
  // Mapeo de regiones para normalización
  export const REGION_MAPPINGS = {
    // Del archivo regional
    'Total 31 aglomerados urbanos': 'Total 31 aglomerados',
    'Gran Buenos Aires': 'GBA',
    'Cuyo': 'Región Cuyo',
    'Noreste': 'Región NEA',
    'Noroeste': 'Región NOA',
    'Pampeana': 'Región Pampeana',
    'Patagonia': 'Región Patagónica'
  } as const;
  
  // Configuración de las 3 dimensiones
  export const DATA_TYPE_CONFIG = {
    national: {
      name: 'Nacional',
      description: 'Datos agregados a nivel país',
      source: 'cuadros_tasas_indicadores_eph',
      expected_records_per_period: 1
    },
    regional: {
      name: 'Regional',
      description: 'Datos por regiones geográficas',
      source: 'cuadros_eph_informe',
      expected_records_per_period: 7
    },
    demographic: {
      name: 'Demográfico',
      description: 'Datos por segmentos de población',
      source: 'cuadros_tasas_indicadores_eph',
      expected_records_per_period: 8
    }
  } as const;
  
  // Segmentos demográficos objetivo (sin el total redundante)
  export const DEMOGRAPHIC_SEGMENTS = [
    { gender: 'Total', age_group: '14+ años', segment: 'Total', name: 'Población de 14+ años' },
    { gender: 'Mujeres', age_group: 'Total', segment: 'Total', name: 'Mujeres' },
    { gender: 'Varones', age_group: 'Total', segment: 'Total', name: 'Varones' },
    { gender: 'Total', age_group: 'Total', segment: 'Jefes de hogar', name: 'Jefes de hogar' },
    { gender: 'Mujeres', age_group: '14-29 años', segment: 'Total', name: 'Mujeres jóvenes (14-29)' },
    { gender: 'Mujeres', age_group: '30-64 años', segment: 'Total', name: 'Mujeres adultas (30-64)' },
    { gender: 'Varones', age_group: '14-29 años', segment: 'Total', name: 'Varones jóvenes (14-29)' },
    { gender: 'Varones', age_group: '30-64 años', segment: 'Total', name: 'Varones adultos (30-64)' }
  ] as const;
  
  // Regiones objetivo
  export const TARGET_REGIONS = [
    'Total 31 aglomerados',
    'GBA',
    'Región Cuyo',
    'Región NEA',
    'Región NOA',
    'Región Pampeana',
    'Región Patagónica'
  ] as const;
  
  // Helper types para queries
  export interface LaborMarketQueryFilters {
    start_date?: string;
    end_date?: string;
    data_type?: LaborMarketDataType;
    region?: LaborMarketRegion;
    gender?: LaborMarketGender;
    age_group?: LaborMarketAgeGroup;
    demographic_segment?: LaborMarketDemographicSegment;
    indicator?: LaborMarketIndicator;
    limit?: number;
    format?: 'json' | 'csv';
  }
  
  // Tipo para los datos crudos del fetcher
  export interface LaborMarketRawRow {
    date: string;
    period: string;
    data_type: LaborMarketDataType;
    region: string;
    gender: LaborMarketGender;
    age_group: LaborMarketAgeGroup;
    demographic_segment: LaborMarketDemographicSegment;
    activity_rate?: number;
    employment_rate?: number;
    unemployment_rate?: number;
    source_file: string;
  }