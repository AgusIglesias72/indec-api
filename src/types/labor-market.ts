// src/types/labor-market.ts

export interface LaborMarketData {
    id?: string;
    date: string; // YYYY-MM-DD (último día del trimestre)
    period: string; // "T1 2025", "T2 2025", etc.
    region: string; // "Total 31 aglomerados", "GBA", "Interior", etc.
    age_group: string | null; // "Total", "14-29 años", "30-64 años", "65+ años"
    gender: string | null; // "Total", "Varones", "Mujeres"
    
    // Población (en miles de personas)
    total_population: number | null;
    economically_active_population: number | null; // PEA
    employed_population: number | null;
    unemployed_population: number | null;
    inactive_population: number | null;
    
    // Tasas (en porcentajes)
    activity_rate: number | null; // Tasa de actividad
    employment_rate: number | null; // Tasa de empleo
    unemployment_rate: number | null; // Tasa de desocupación
    
    // Metadatos
    created_at?: string;
    updated_at?: string;
  }
  
  export interface LaborMarketLatestData {
    date: string;
    period: string;
    region: string;
    unemployment_rate: number;
    activity_rate: number;
    employment_rate: number;
    economically_active_population: number;
    employed_population: number;
    unemployed_population: number;
    total_population: number;
  }
  
  export interface LaborMarketMetadata {
    regions: string[];
    age_groups: string[];
    genders: string[];
    indicators: string[];
    date_range: {
      first_date: string;
      last_date: string;
    };
    period_range: {
      first: string;
      last: string;
    };
  }
  
  export interface LaborMarketApiResponse {
    data: LaborMarketData[];
    metadata: {
      count: number;
      filtered_by: {
        start_date?: string;
        end_date?: string;
        region?: string;
        age_group?: string;
        gender?: string;
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
    };
  }
  
  export type LaborMarketRegion = 
    | "Total 31 aglomerados"
    | "GBA" 
    | "Interior"
    | "Región Pampeana"
    | "Región NOA"
    | "Región NEA"
    | "Región Cuyo"
    | "Región Patagónica";
  
  export type LaborMarketAgeGroup = 
    | "Total"
    | "14-29 años"
    | "30-64 años" 
    | "65+ años";
  
  export type LaborMarketGender = 
    | "Total"
    | "Varones"
    | "Mujeres";
  
  export type LaborMarketIndicator = 
    | "unemployment_rate"
    | "activity_rate"
    | "employment_rate"
    | "economically_active_population"
    | "employed_population"
    | "unemployed_population"
    | "total_population";
  
  // Tipos para el fetcher
  export interface LaborMarketRawRow {
    region: string;
    age_group?: string;
    gender?: string;
    [key: string]: any; // Para las columnas de períodos dinámicos
  }
  
  // Para el procesamiento del Excel
  export interface LaborMarketExcelSection {
    name: string;
    startRow: number;
    endRow: number;
    region: string;
    age_group?: string;
    gender?: string;
  }