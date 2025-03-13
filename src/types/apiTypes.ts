// src/types/apiTypes.ts
export interface SectorData {
  value: number;
  monthly_pct_change: number;
  yearly_pct_change: number;
  weight: number;
}

export interface SectorHistoricalData {
  date: string;
  sectors: {
    [key: string]: SectorData;
  };
}

// Interfaz para los datos recibidos de la API de sectores del EMAE
export interface EmaeSectorData {
  date: string;
  economy_sector: string;
  economy_sector_code: string;
  original_value: number;
  year_over_year_change?: number;
}

// Interfaz para datos históricos de EMAE
export interface EmaeHistoricalData {
  date: string;
  original_value: number;
  seasonally_adjusted_value: number;
  cycle_trend_value?: number;
  monthly_pct_change?: number;
  yearly_pct_change?: number;
}

// Interfaz para solicitudes de datos sectoriales
export interface SectorDataRequest {
  sector_codes: string[];
  start_date?: string;
  end_date?: string;
  month?: number;
  year?: number;
  include_variations?: boolean;
}