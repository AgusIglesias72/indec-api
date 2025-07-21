// src/services/api-risk-country.ts
// Servicio actualizado para manejar la nueva API con paginación

import { RiskCountryDataPoint, RiskCountryStats } from '@/types/risk-country';

// Tipos para la respuesta de la API
interface ApiResponse {
  success: boolean;
  data: RiskCountryDataPoint[];
  meta: {
    type: string;
    total_records: number;
    date_range: any;
    order: string;
    limit: number;
    auto_paginated: boolean;
    query_timestamp: string;
  };
  pagination?: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
    has_more: boolean;
    has_previous: boolean;
  };
  stats: RiskCountryStats | null;
  error?: string;
}

// Tipos para los parámetros de consulta
interface QueryParams {
  type?: 'latest' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'year_to_date' | 'last_year' | 'last_5_years' | 'all_time' | 'custom';
  date_from?: string;
  date_to?: string;
  limit?: number;
  page?: number;
  per_page?: number;
  order?: 'asc' | 'desc';
  auto_paginate?: boolean;
}

// Configuración base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const RISK_COUNTRY_ENDPOINT = '/api/riesgo-pais';

/**
 * Función principal para obtener datos del riesgo país
 */
export async function getRiskCountryData(params: QueryParams = {}): Promise<ApiResponse> {
  try {
    // Configurar parámetros por defecto
    const queryParams = {
      type: 'last_30_days',
      order: 'desc',
      auto_paginate: true,
      ...params
    };

    // Construir URL con parámetros
    const searchParams = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}${RISK_COUNTRY_ENDPOINT}?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Configurar cache según el tipo de consulta
      cache: queryParams.type === 'latest' ? 'no-store' : 'default',
      next: {
        revalidate: queryParams.type === 'latest' ? 0 : 300 // 5 minutos para datos históricos
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error desconocido en la API');
    }

    return data;

  } catch (error) {
    console.error('Error in getRiskCountryData:', error);
    
    return {
      success: false,
      data: [],
      meta: {
        type: params.type || 'last_30_days',
        total_records: 0,
        date_range: null,
        order: params.order || 'desc',
        limit: params.limit || 100,
        auto_paginated: false,
        query_timestamp: new Date().toISOString()
      },
      stats: null,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Función específica para obtener el último valor del riesgo país
 */
export async function getLatestRiskCountryRate(): Promise<{
  success: boolean;
  data: RiskCountryDataPoint | null;
  error?: string;
}> {
  try {
    const response = await getRiskCountryData({ type: 'latest' });
    
    if (response.success && response.data.length > 0) {
      return {
        success: true,
        data: response.data[0]
      };
    }
    
    return {
      success: false,
      data: null,
      error: response.error || 'No se encontraron datos'
    };
    
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Función para obtener datos con paginación manual
 */
export async function getRiskCountryDataPaginated(
  page: number = 1, 
  perPage: number = 100, 
  filters: Omit<QueryParams, 'page' | 'per_page' | 'auto_paginate'> = {}
): Promise<ApiResponse> {
  return getRiskCountryData({
    ...filters,
    page,
    per_page: perPage,
    auto_paginate: false
  });
}

/**
 * Función para obtener grandes conjuntos de datos con autopaginación
 */
export async function getRiskCountryDataExtended(
  type: QueryParams['type'] = 'last_year',
  limit: number = 2000,
  order: 'asc' | 'desc' = 'desc'
): Promise<ApiResponse> {
  return getRiskCountryData({
    type,
    limit,
    order,
    auto_paginate: true
  });
}

/**
 * Función para obtener datos de un rango personalizado
 */
export async function getRiskCountryDataCustomRange(
  dateFrom: string,
  dateTo: string,
  limit?: number,
  order: 'asc' | 'desc' = 'desc'
): Promise<ApiResponse> {
  return getRiskCountryData({
    type: 'custom',
    date_from: dateFrom,
    date_to: dateTo,
    limit,
    order,
    auto_paginate: true
  });
}

/**
 * Función para obtener estadísticas rápidas sin datos detallados
 */
export async function getRiskCountryStats(type: QueryParams['type'] = 'last_90_days'): Promise<{
  success: boolean;
  stats: RiskCountryStats | null;
  error?: string;
}> {
  try {
    const response = await getRiskCountryData({ 
      type, 
      limit: 1, // Mínimo para obtener stats
      auto_paginate: false 
    });
    
    return {
      success: response.success,
      stats: response.stats,
      error: response.error
    };
    
  } catch (error) {
    return {
      success: false,
      stats: null,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Función para calcular variaciones entre fechas específicas
 */
export async function calculateRiskCountryVariation(
  baseDateFrom: string,
  baseDateTo: string,
  compareToLatest: boolean = true
): Promise<{
  success: boolean;
  variation: {
    absolute: number;
    percentage: number;
    base_value: number;
    current_value: number;
    base_date: string;
    current_date: string;
  } | null;
  error?: string;
}> {
  try {
    // Obtener valor base
    const baseResponse = await getRiskCountryDataCustomRange(baseDateFrom, baseDateTo, 1, 'desc');
    
    if (!baseResponse.success || baseResponse.data.length === 0) {
      throw new Error('No se encontraron datos para el período base');
    }

    const baseValue = baseResponse.data[0];
    
    // Obtener valor actual
    let currentValue: RiskCountryDataPoint;
    
    if (compareToLatest) {
      const latestResponse = await getLatestRiskCountryRate();
      if (!latestResponse.success || !latestResponse.data) {
        throw new Error('No se pudo obtener el valor actual');
      }
      currentValue = latestResponse.data;
    } else {
      // Si no es latest, usar el mismo valor base (para casos específicos)
      currentValue = baseValue;
    }

    // Calcular variación
    const absoluteChange = currentValue.closing_value - baseValue.closing_value;
    const percentageChange = (absoluteChange / baseValue.closing_value) * 100;

    return {
      success: true,
      variation: {
        absolute: absoluteChange,
        percentage: percentageChange,
        base_value: baseValue.closing_value,
        current_value: currentValue.closing_value,
        base_date: baseValue.closing_date,
        current_date: currentValue.closing_date
      }
    };

  } catch (error) {
    return {
      success: false,
      variation: null,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Funciones de utilidad para formateo
 */
export function formatRiskValue(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercentageChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}%`;
}

export function formatCurrencyARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(value);
}

/**
 * Hook personalizado para usar en componentes React
 */
export function useRiskCountryData(params: QueryParams = {}) {
  const [data, setData] = React.useState<RiskCountryDataPoint[]>([]);
  const [stats, setStats] = React.useState<RiskCountryStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<string>('');

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRiskCountryData(params);
      
      if (response.success) {
        setData(response.data);
        setStats(response.stats);
        setError(null);
        setLastUpdate(new Date().toISOString());
      } else {
        setError(response.error || 'Error al cargar datos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [params]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    stats,
    loading,
    error,
    lastUpdate,
    refetch: fetchData
  };
}

// Importar React para el hook
import React from 'react';