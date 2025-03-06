import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing environment variables for Supabase connection');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Obtener datos de sectores económicos
    const { data: sectorsData, error: sectorsError } = await supabase
      .from('emae_by_activity')
      .select('economy_sector, economy_sector_code')
      .order('date', { ascending: true })
      .limit(100);

    if (sectorsError) {
      throw new Error(`Error fetching sectors data: ${sectorsError.message}`);
    }

    // Crear lista de sectores con sus códigos, eliminando duplicados
    const sectorsMap = new Map();
    sectorsData?.forEach(item => {
      if (item.economy_sector && item.economy_sector_code) {
        sectorsMap.set(item.economy_sector_code, item.economy_sector);
      }
    });
    
    const sectors = Array.from(sectorsMap).map(([code, name]) => ({
      code,
      name
    }));

    // Obtener rango de fechas disponibles
    const { data: dateRangeData, error: dateRangeError } = await supabase
      .from('emae')
      .select('date')
      .order('date', { ascending: true });

    if (dateRangeError) {
      throw new Error(`Error fetching date range: ${dateRangeError.message}`);
    }

    // Obtener la primera y última fecha
    const dates = dateRangeData?.map(item => item.date) || [];
    const firstDate = dates.length > 0 ? dates[0] : null;
    const lastDate = dates.length > 0 ? dates[dates.length - 1] : null;

   

    // Construir respuesta
    const response = {
      sectors,
      date_range: {
        first_date: firstDate,
        last_date: lastDate,
        total_months: dates.length
      },
      available_series: {
        general: ['original_value', 'seasonal_adjusted_value', 'cycle_trend_value'],
        by_activity: ['original_value'] // Solo serie original para sectores
      },
      metadata: {
        last_updated: lastDate,
        available_formats: ['json', 'csv'],
        endpoints: {
          main: '/api/emae',
          sectors: '/api/emae/sectors',
          metadata: '/api/emae/metadata'
        }
      }
    };

    // Configurar caché para 1 hora
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    });

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('Error in EMAE metadata endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 