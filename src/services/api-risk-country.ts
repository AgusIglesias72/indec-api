// src/services/api-risk-country.ts
// Servicio para conectarse a la API del Riesgo País

// Tipos para el Riesgo País basados en tu API
export interface RiskCountryDataPoint {
  closing_date: string;
  closing_value: number;
  change_percentage: number | null;
  previous_value?: number | null;
  volume?: number | null;
  high_value?: number | null;
  low_value?: number | null;
}

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
    total_records: number;
    date_range: any;
    order: string;
    limit: number | null;
    query_timestamp: string;
  };
  stats: RiskCountryStats | null;
  error?: string;
  details?: string;
}

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

/**
 * Función principal para obtener datos del riesgo país
 */
export async function getRiskCountryData(
  params: RiskCountryQueryParams = {}
): Promise<RiskCountryResponse> {
  try {
    // Parámetros por defecto
    const {
      type = 'last_30_days',
      date_from,
      date_to,
      limit,
      order = 'desc'
    } = params;

    // Construir URL con parámetros
    const searchParams = new URLSearchParams();
    searchParams.append('type', type);
    
    if (date_from) searchParams.append('date_from', date_from);
    if (date_to) searchParams.append('date_to', date_to);
    if (limit) searchParams.append('limit', limit.toString());
    if (order) searchParams.append('order', order);

    const response = await fetch(`/api/riesgo-pais?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // No cache para datos en tiempo real
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RiskCountryResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error desconocido en la API');
    }

    return data;

  } catch (error) {
    console.error('Error fetching risk country data:', error);
    
    // Retornar respuesta de error consistente
    return {
      success: false,
      data: [],
      meta: {
        type: params.type || 'last_30_days',
        total_records: 0,
        date_range: null,
        order: params.order || 'desc',
        limit: params.limit || null,
        query_timestamp: new Date().toISOString()
      },
      stats: null,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Obtener el último valor del riesgo país
 */
export async function getLatestRiskCountryRate(): Promise<RiskCountryDataPoint | null> {
  try {
    const response = await getRiskCountryData({ type: 'latest' });
    
    if (response.success && response.data.length > 0) {
      return response.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching latest risk country rate:', error);
    return null;
  }
}

/**
 * Obtener datos históricos del riesgo país
 */
export async function getHistoricalRiskCountryData(
  days: number = 30,
  limit?: number
): Promise<RiskCountryDataPoint[]> {
  try {
    let type: RiskCountryQueryType;
    
    if (days <= 7) type = 'last_7_days';
    else if (days <= 30) type = 'last_30_days';
    else if (days <= 90) type = 'last_90_days';
    else type = 'last_year';

    const response = await getRiskCountryData({ 
      type, 
      limit,
      order: 'asc' // Para gráficos es mejor orden ascendente
    });
    
    if (response.success) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching historical risk country data:', error);
    return [];
  }
}

/**
 * Obtener datos del riesgo país en un rango de fechas personalizado
 */
export async function getRiskCountryDataByDateRange(
  dateFrom: string,
  dateTo: string,
  limit?: number
): Promise<RiskCountryDataPoint[]> {
  try {
    const response = await getRiskCountryData({
      type: 'custom',
      date_from: dateFrom,
      date_to: dateTo,
      limit,
      order: 'asc'
    });
    
    if (response.success) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching risk country data by date range:', error);
    return [];
  }
}

/**
 * Funciones de utilidad para el riesgo país
 */

// Determinar el nivel de riesgo basado en el valor
export function getRiskLevel(value: number) {
  if (value < 500) {
    return {
      level: 'Bajo',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      description: 'Riesgo soberano bajo - Acceso favorable a mercados internacionales'
    };
  } else if (value < 1000) {
    return {
      level: 'Moderado',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      description: 'Riesgo soberano moderado - Condiciones de financiamiento normales'
    };
  } else if (value < 1500) {
    return {
      level: 'Alto',
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      description: 'Riesgo soberano alto - Acceso limitado y costoso a financiamiento'
    };
  } else {
    return {
      level: 'Muy Alto',
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      description: 'Riesgo soberano muy alto - Acceso severamente restringido'
    };
  }
}

// Formatear valor del riesgo país
export function formatRiskValue(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Formatear cambio porcentual
export function formatPercentageChange(change: number | null): string {
  if (change === null) return 'N/A';
  
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

// Calcular tendencia basada en datos históricos
export function calculateTrend(data: RiskCountryDataPoint[]): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable';
  
  const recent = data.slice(-5); // Últimos 5 puntos
  const avg = recent.reduce((sum, point) => sum + point.closing_value, 0) / recent.length;
  const latest = data[data.length - 1].closing_value;
  
  const threshold = avg * 0.02; // 2% de variación se considera estable
  
  if (latest > avg + threshold) return 'up';
  if (latest < avg - threshold) return 'down';
  return 'stable';
}