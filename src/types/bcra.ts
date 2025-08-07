// src/types/bcra.ts

export interface BCRAIndexData {
  id?: number;
  date: string;
  value: number;
  daily_pct_change?: number;
  monthly_pct_change?: number;
  yearly_pct_change?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BCRAIndexResponse {
  success: boolean;
  type: 'latest' | 'historical' | 'range' | 'specific-date';
  data: BCRAIndexData | BCRAIndexData[];
  meta: {
    type: string;
    timestamp: string;
    source: string;
    description: string;
  };
  pagination?: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
    has_more: boolean;
    has_previous: boolean;
  };
  stats?: {
    latest_value: number;
    latest_date: string;
    min_value: number;
    max_value: number;
    avg_value: number;
    total_records: number;
    latest_daily_change?: number;
    latest_monthly_change?: number;
    latest_yearly_change?: number;
    period_change?: {
      absolute: number;
      percentage: number;
    };
  };
  error?: string;
}