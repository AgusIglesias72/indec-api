// src/lib/kpi-db-queries.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize Supabase client for server-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Types for KPI data
export interface KPIServerData {
  emae: {
    date: string | null;
    original_value: number | null;
    monthly_pct_change: number | null;
    yearly_pct_change: number | null;
  } | null;
  ipc: {
    date: string | null;
    monthly_change: number | null;
    year_over_year_change: number | null;
    accumulated_change: number | null;
  } | null;
  dollar: {
    date: string | null;
    sell_price: number | null;
    buy_price: number | null;
    sell_variation: number | null;
  } | null;
  riskCountry: {
    closing_date: string | null;
    closing_value: number | null;
    change_percentage: number | null;
    monthlyVariation: number | null;
    yearlyVariation: number | null;
  } | null;
}

/**
 * Obtiene los últimos datos del EMAE directamente de la DB
 */
async function getLatestEMAE() {
  try {
    const { data, error } = await supabase
      .from('emae_with_variations')
      .select('date, original_value, monthly_pct_change, yearly_pct_change')
      .eq('sector_code', 'GENERAL')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching EMAE data:', error);
    return null;
  }
}

/**
 * Obtiene los últimos datos del IPC directamente de la DB
 */
async function getLatestIPC() {
  try {
    const { data, error } = await supabase
      .from('ipc_with_variations')
      .select('date, index_value, monthly_pct_change, yearly_pct_change, accumulated_pct_change')
      .eq('component_code', 'GENERAL')
      .eq('region', 'Nacional')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    
    return {
      date: data.date,
      monthly_change: data.monthly_pct_change,
      year_over_year_change: data.yearly_pct_change,
      accumulated_change: data.accumulated_pct_change
    };
  } catch (error) {
    console.error('Error fetching IPC data:', error);
    return null;
  }
}

/**
 * Obtiene la última cotización del dólar oficial directamente de la DB
 */
async function getLatestDollar() {
  try {
    const { data, error } = await supabase
      .from('dollar_rates')
      .select('date, sell_price, buy_price')
      .eq('dollar_type', 'OFICIAL')
      .order('date', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      sell_variation: null // No tenemos este campo en la tabla
    };
  } catch (error) {
    console.error('Error fetching Dollar data:', error);
    return null;
  }
}

/**
 * Obtiene el último valor del riesgo país con variaciones
 */
async function getLatestRiskCountry() {
  try {
    // Obtener el último valor
    const { data: latest, error } = await supabase
      .from('embi_risk')
      .select('date, value')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error || !latest) throw error;

    // Calcular fechas para variaciones
    const currentDate = new Date(latest.date);
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneYearAgo = new Date(currentDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Obtener valores históricos para calcular variaciones
    const [dailyResult, monthlyResult, yearlyResult] = await Promise.all([
      // Valor del día anterior (más robusto)
      supabase
        .from('embi_risk')
        .select('date, value')
        .lt('date', latest.date)
        .order('date', { ascending: false })
        .limit(1)
        .single(),
      // Valor de hace 1 mes
      supabase
        .from('embi_risk')
        .select('value')
        .gte('date', new Date(oneMonthAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .lte('date', new Date(oneMonthAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(1)
        .single(),
      // Valor de hace 1 año
      supabase
        .from('embi_risk')
        .select('value')
        .gte('date', new Date(oneYearAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .lte('date', new Date(oneYearAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(1)
        .single()
    ]);

    // Calcular variaciones
    let dailyVariation = null;
    let monthlyVariation = null;
    let yearlyVariation = null;

    if (dailyResult.data && dailyResult.data.value) {
      dailyVariation = ((latest.value - dailyResult.data.value) / dailyResult.data.value * 100);
    }

    if (monthlyResult.data) {
      monthlyVariation = ((latest.value - monthlyResult.data.value) / monthlyResult.data.value * 100);
    }

    if (yearlyResult.data) {
      yearlyVariation = ((latest.value - yearlyResult.data.value) / yearlyResult.data.value * 100);
    }

    return {
      closing_date: latest.date,
      closing_value: latest.value,
      change_percentage: dailyVariation,
      monthlyVariation,
      yearlyVariation
    };
  } catch (error) {
    console.error('Error fetching Risk Country data:', error);
    return null;
  }
}

/**
 * Función principal que obtiene todos los datos KPI con queries paralelas
 */
export async function getKPIDataFromDB(): Promise<KPIServerData> {
  try {
    // Ejecutar todas las queries en paralelo para mejor performance
    const [emae, ipc, dollar, riskCountry] = await Promise.all([
      getLatestEMAE(),
      getLatestIPC(),
      getLatestDollar(),
      getLatestRiskCountry()
    ]);

    return {
      emae,
      ipc,
      dollar,
      riskCountry
    };
  } catch (error) {
    console.error('Error fetching KPI data from DB:', error);
    
    // Return empty data on error
    return {
      emae: null,
      ipc: null,
      dollar: null,
      riskCountry: null
    };
  }
}

// Datos de fallback para desarrollo/build
export const fallbackKPIData: KPIServerData = {
  emae: {
    date: new Date().toISOString().split('T')[0],
    original_value: 162.7,
    monthly_pct_change: 0.8,
    yearly_pct_change: 3.5
  },
  ipc: {
    date: new Date().toISOString().split('T')[0],
    monthly_change: 4.2,
    year_over_year_change: 142.7,
    accumulated_change: 8.7
  },
  dollar: {
    date: new Date().toISOString().split('T')[0],
    sell_price: 1185,
    buy_price: 1135,
    sell_variation: 0
  },
  riskCountry: {
    closing_date: new Date().toISOString(),
    closing_value: 705,
    change_percentage: -0.14,
    monthlyVariation: 2.1,
    yearlyVariation: -54.6
  }
};