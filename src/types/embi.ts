// src/types/embi.ts
// Tipos TypeScript para el sistema EMBI (Riesgo País)

/**
 * Estructura de datos de riesgo país desde Google Sheets
 */
export interface EmbiSheetRow {
    id: string;
    fecha: string;
    indice: number;
  }
  
  /**
   * Estructura de datos de riesgo país para la base de datos
   */
  export interface EmbiRiskInsert {
    external_id: string;
    date: string; // ISO string
    value: number;
    created_at?: string;
    updated_at?: string;
  }
  
  /**
   * Estructura completa de datos de riesgo país desde la base de datos
   */
  export interface EmbiRiskRecord {
    id: string;
    external_id: string;
    date: string;
    value: number;
    created_at: string;
    updated_at: string;
  }
  
  /**
   * Vista formateada de datos EMBI
   */
  export interface EmbiRiskFormatted {
    id: string;
    external_id: string;
    date: string;
    date_only: string;
    year: number;
    month: number;
    day: number;
    value: number;
    value_rounded: number;
    risk_level: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
    created_at: string;
    updated_at: string;
  }
  
  /**
   * Estadísticas mensuales del EMBI
   */
  export interface EmbiMonthlyStats {
    year: number;
    month: number;
    month_start: string;
    total_records: number;
    min_value: number;
    max_value: number;
    avg_value: number;
    median_value: number;
    std_deviation: number;
    first_record_date: string;
    last_record_date: string;
  }
  
  /**
   * Último valor del EMBI
   */
  export interface LatestEmbiValue {
    latest_value: number;
    latest_date: string;
    external_id: string;
  }
  
  /**
   * Estadísticas del EMBI para un período
   */
  export interface EmbiPeriodStats {
    period_days: number;
    total_records: number;
    min_value: number;
    max_value: number;
    avg_value: number;
    latest_value: number;
    value_change: number;
    percent_change: number;
  }
  
  /**
   * Resultado de la actualización del cron job
   */
  export interface EmbiUpdateResult {
    newRecords: number;
    totalProcessed: number;
    duplicatesSkipped: number;
    message: string;
    firstRecord: {
      date: string;
      value: number;
      external_id: string;
    } | null;
    lastRecord: {
      date: string;
      value: number;
      external_id: string;
    } | null;
    dateRange: string | null;
  }
  
  /**
   * Parámetros para filtrar datos EMBI
   */
  export interface EmbiQueryParams {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'date' | 'value';
    orderDirection?: 'asc' | 'desc';
    minValue?: number;
    maxValue?: number;
  }
  
  /**
   * Respuesta de la API con datos EMBI
   */
  export interface EmbiApiResponse {
    success: boolean;
    data: EmbiRiskRecord[];
    pagination?: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
    stats?: {
      totalRecords: number;
      dateRange: {
        start: string;
        end: string;
      };
      valueRange: {
        min: number;
        max: number;
      };
    };
    error?: string;
  }
  
  /**
   * Configuración del cron job EMBI
   */
  export interface EmbiCronConfig {
    spreadsheetId: string;
    sheetName: string;
    enabled: boolean;
    schedule: string;
    maxRetries: number;
    timeoutMs: number;
  }
  
  /**
   * Log de ejecución del cron job EMBI
   */
  export interface EmbiCronLog {
    execution_time: string;
    status: 'success' | 'error' | 'warning';
    records_processed: number;
    new_records: number;
    duplicates_skipped: number;
    execution_duration_ms: number;
    error_message?: string;
    data_source: string;
    spreadsheet_id: string;
  }
  
  /**
   * Configuración de alertas EMBI
   */
  export interface EmbiAlertConfig {
    enabled: boolean;
    thresholds: {
      highRisk: number; // Ej: 1000 puntos
      veryHighRisk: number; // Ej: 2000 puntos
      criticalRisk: number; // Ej: 3000 puntos
    };
    changeThresholds: {
      significantChange: number; // Ej: 100 puntos de cambio
      majorChange: number; // Ej: 500 puntos de cambio
    };
    percentageThresholds: {
      significantPercentChange: number; // Ej: 10%
      majorPercentChange: number; // Ej: 25%
    };
    notificationChannels: {
      email: boolean;
      slack: boolean;
      webhook: boolean;
    };
  }
  
  /**
   * Análisis técnico del EMBI
   */
  export interface EmbiAnalysis {
    currentValue: number;
    previousValue: number;
    change: number;
    percentChange: number;
    trend: 'up' | 'down' | 'stable';
    volatility: 'low' | 'medium' | 'high';
    riskLevel: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
    technicalIndicators: {
      sma7: number; // Media móvil 7 días
      sma30: number; // Media móvil 30 días
      rsi: number; // Índice de fuerza relativa
      bollinger: {
        upper: number;
        middle: number;
        lower: number;
      };
    };
    support: number;
    resistance: number;
    recommendation: 'buy' | 'hold' | 'sell' | 'neutral';
  }
  
  /**
   * Datos para gráficos del EMBI
   */
  export interface EmbiChartData {
    date: string;
    value: number;
    sma7?: number;
    sma30?: number;
    volume?: number;
    events?: EmbiEvent[];
  }
  
  /**
   * Eventos importantes relacionados con el EMBI
   */
  export interface EmbiEvent {
    date: string;
    type: 'political' | 'economic' | 'market' | 'policy';
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    severity: 'low' | 'medium' | 'high';
  }
  