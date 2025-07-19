// services/api-dollar.ts
import { DollarType, DollarRateData } from '@/types/dollar';

const API_BASE_URL = 'https://argenstats.com/api';

export async function getLatestDollarRate(dollarType: DollarType): Promise<DollarRateData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/dollar`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      // Buscar el tipo de dólar específico en la respuesta
      const dollarData = result.data.find(
        (item: DollarRateData) => item.dollar_type === dollarType
      );
      
      return dollarData || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching dollar rate:', error);
    return null;
  }
}

// También podrías agregar una función para obtener todos los tipos de una vez
export async function getAllDollarRates(): Promise<DollarRateData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dollar`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching dollar rates:', error);
    return [];
  }
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