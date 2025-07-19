// services/api-dollar.ts
import { DollarType, DollarRateData } from '@/types/dollar';

const API_BASE_URL = '';

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
    const response = await fetch('/api/dollar?type=latest&include_variations=true');
    
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
 * Obtiene datos históricos de cotizaciones de dólar (CIERRES DIARIOS)
 * Usa el tipo 'daily' para obtener solo un valor por día
 */
export async function getDollarRatesHistory(
  type: DollarType | DollarType[],
  startDate?: string,
  endDate?: string
): Promise<DollarRateData[]> {
  try {
    // Construir parámetros de consulta
    const typeParam = Array.isArray(type) ? type.join(',') : type;
    
    // Usar 'daily' para obtener cierres diarios
    let url = `/api/dollar?type=daily&dollar_type=${typeParam}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    url += '&limit=1000'; // Asegurar que obtenemos todos los datos
    
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