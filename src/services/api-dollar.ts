// src/services/api-dollar.ts
import { DollarType } from '@/types/dollar';

/**
 * Interfaces para los datos de las cotizaciones
 */
export interface DollarRateData {
  date: string;
  dollar_type: DollarType;
  buy_price: number;
  sell_price: number;
  spread?: number;
  last_updated: string;
}

export interface DollarRatesResponse {
  success: boolean;
  type: string;
  data: DollarRateData[];
  meta?: {
    type: string;
    timestamp: string;
  };
  metadata?: {
    count: number;
    filtered_by?: Record<string, any>;
    last_updated?: string;
    dollar_type?: string;
  };
}

/**
 * Obtiene las últimas cotizaciones de todos los tipos de dólar
 */
export async function getLatestDollarRates(): Promise<DollarRateData[]> {
  try {
    const response = await fetch('/api/dollar?type=latest');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json() as DollarRatesResponse;
    return result.data || [];
  } catch (error) {
    console.error('Error al obtener cotizaciones de dólar:', error);
    return [];
  }
}

/**
 * Obtiene la última cotización de un tipo específico de dólar
 */
export async function getLatestDollarRate(type: DollarType): Promise<DollarRateData | null> {
  try {
    const response = await fetch(`/api/dollar?type=latest&dollar_type=${type}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json() as DollarRatesResponse;
    
    // La API devuelve un array de datos, tomamos el primero
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error al obtener cotización del dólar ${type}:`, error);
    return null;
  }
}

/**
 * Obtiene datos históricos de cotizaciones de dólar
 */
export async function getDollarRatesHistory(
  type: DollarType | DollarType[],
  startDate?: string,
  endDate?: string
): Promise<DollarRateData[]> {
  try {
    // Construir parámetros de consulta
    const typeParam = Array.isArray(type) ? type.join(',') : type;
    
    // Usar 'historical' como tipo y 'dollar_type' para el tipo de dólar
    let url = `/api/dollar?type=historical&dollar_type=${typeParam}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json() as DollarRatesResponse;
    return result.data || [];
  } catch (error) {
    console.error('Error al obtener historial de cotizaciones:', error);
    return [];
  }
}