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
  data: DollarRateData[];
  metadata: {
    count: number;
    filtered_by: Record<string, any>;
  };
}

export interface DollarLatestResponse {
  data: DollarRateData[];
  metadata: {
    count: number;
    last_updated: string;
    dollar_type: string;
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
    
    const result = await response.json() as DollarLatestResponse;
    return result.data;
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
    
    return await response.json() as DollarRateData;
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
    
    let url = `/api/dollar?type=${typeParam}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json() as DollarRatesResponse;
    return result.data;
  } catch (error) {
    console.error('Error al obtener historial de cotizaciones:', error);
    return [];
  }
}