// src/lib/db-queries.ts
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

// ============= DOLLAR QUERIES =============

export async function getAllDollarRates() {
  try {
    // Get latest rates for each dollar type using the correct view
    const { data, error } = await supabase
      .from('v_dollar_with_variations')
      .select('*')
      .order('dollar_type');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching dollar rates:', error);
    return [];
  }
}

export async function getDollarHistoricalData(dollarType: string = 'OFICIAL', days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('dollar_rates')
      .select('*')
      .eq('dollar_type', dollarType)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching dollar historical data:', error);
    return [];
  }
}

// ============= IPC QUERIES =============

export async function getLatestIPCData() {
  try {
    const { data, error } = await supabase
      .from('ipc_with_variations')
      .select('*')
      .eq('component_code', 'GENERAL')
      .eq('region', 'Nacional')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching latest IPC data:', error);
    return null;
  }
}

export async function getIPCHistoricalData(months: number = 12) {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await supabase
      .from('ipc_with_variations')
      .select('*')
      .eq('component_code', 'GENERAL')
      .eq('region', 'Nacional')
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching IPC historical data:', error);
    return [];
  }
}

export async function getIPCByCategories() {
  try {
    // Get latest date first
    const { data: latestDate } = await supabase
      .from('ipc_with_variations')
      .select('date')
      .eq('region', 'Nacional')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (!latestDate || !latestDate.date) return [];

    // Get all categories for the latest date
    const { data, error } = await supabase
      .from('ipc_with_variations')
      .select('*')
      .eq('date', latestDate.date)
      .eq('region', 'Nacional')
      .order('component_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching IPC categories:', error);
    return [];
  }
}

// ============= EMAE QUERIES =============

export async function getLatestEMAEData() {
  try {
    const { data, error } = await supabase
      .from('emae_with_variations')
      .select('*')
      .eq('sector_code', 'GENERAL')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching latest EMAE data:', error);
    return null;
  }
}

export async function getEMAEHistoricalData(months: number = 24) {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await supabase
      .from('emae_with_variations')
      .select('*')
      .eq('sector_code', 'GENERAL')
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching EMAE historical data:', error);
    return [];
  }
}

export async function getEMAEBySectors() {
  try {
    // Get latest date first
    const { data: latestDate } = await supabase
      .from('emae_with_variations')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (!latestDate || !latestDate.date) return [];

    // Get all sectors for the latest date
    const { data, error } = await supabase
      .from('emae_with_variations')
      .select('*')
      .eq('date', latestDate.date)
      .neq('sector_code', 'GENERAL')
      .order('sector_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching EMAE sectors:', error);
    return [];
  }
}

// ============= RISK COUNTRY QUERIES =============

export async function getLatestRiskCountryData() {
  try {
    const { data: latest, error } = await supabase
      .from('v_embi_daily_closing')
      .select('*')
      .order('closing_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !latest) throw error;

    // Calculate monthly and yearly variations
    const currentDate = new Date(latest.closing_date!);
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneYearAgo = new Date(currentDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const [monthlyResult, yearlyResult] = await Promise.all([
      supabase
        .from('v_embi_daily_closing')
        .select('closing_value')
        .gte('closing_date', new Date(oneMonthAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .lte('closing_date', new Date(oneMonthAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('closing_date', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('v_embi_daily_closing')
        .select('closing_value')
        .gte('closing_date', new Date(oneYearAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .lte('closing_date', new Date(oneYearAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('closing_date', { ascending: false })
        .limit(1)
        .single()
    ]);

    let monthlyVariation = null;
    let yearlyVariation = null;

    if (monthlyResult.data && latest.closing_value && monthlyResult.data.closing_value) {
      monthlyVariation = ((latest.closing_value - monthlyResult.data.closing_value) / monthlyResult.data.closing_value * 100);
    }

    if (yearlyResult.data && latest.closing_value && yearlyResult.data.closing_value) {
      yearlyVariation = ((latest.closing_value - yearlyResult.data.closing_value) / yearlyResult.data.closing_value * 100);
    }

    return {
      ...latest,
      monthlyVariation,
      yearlyVariation
    };
  } catch (error) {
    console.error('Error fetching risk country data:', error);
    return null;
  }
}

export async function getRiskCountryHistoricalData(days: number = 365) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('v_embi_daily_closing')
      .select('*')
      .gte('closing_date', startDate.toISOString().split('T')[0])
      .order('closing_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching risk country historical data:', error);
    return [];
  }
}

// ============= EMPLOYMENT QUERIES =============

export async function getLatestEmploymentData() {
  try {
    const { data, error } = await supabase
      .from('labor_market')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching latest employment data:', error);
    return null;
  }
}

export async function getEmploymentHistoricalData(quarters: number = 8) {
  try {
    const { data, error } = await supabase
      .from('labor_market')
      .select('*')
      .order('date', { ascending: false })
      .limit(quarters);

    if (error) throw error;
    return data?.reverse() || [];
  } catch (error) {
    console.error('Error fetching employment historical data:', error);
    return [];
  }
}

// ============= POVERTY QUERIES =============
// Commented out until correct table name is determined
/*
export async function getLatestPovertyData() {
  try {
    const { data, error } = await supabase
      .from('poverty_rates')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching latest poverty data:', error);
    return null;
  }
}
*/

/*
export async function getPovertyHistoricalData() {
  try {
    const { data, error } = await supabase
      .from('poverty_rates')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching poverty historical data:', error);
    return [];
  }
}
*/