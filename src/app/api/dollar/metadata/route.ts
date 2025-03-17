// src/app/api/dollar/metadata/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Unable to initialize Supabase client. Missing environment variables: ${
      !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : ''
    }${!supabaseKey ? 'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY' : ''}`
  );
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Obtener todos los registros para extraer tipos de dólar únicos
    const { data: dollarRatesData, error: dollarRatesError } = await supabase
      .from('dollar_rates')
      .select('dollar_type, date')
      .order('dollar_type');
      
    if (dollarRatesError) {
      throw new Error(`Error fetching dollar rates: ${dollarRatesError.message}`);
    }
    
    // Extraer tipos únicos y contar manualmente
    const dollarTypesMap = new Map<string, number>();
    
    dollarRatesData?.forEach(item => {
      if (item.dollar_type) {
        const count = dollarTypesMap.get(item.dollar_type) || 0;
        dollarTypesMap.set(item.dollar_type, count + 1);
      }
    });
    
    const dollarTypes = Array.from(dollarTypesMap.keys()).sort();
    
    // Obtener rango de fechas disponibles
    const { data: firstDateData, error: firstDateError } = await supabase
      .from('dollar_rates')
      .select('date')
      .order('date', { ascending: true })
      .limit(1)
      .single();
      
    if (firstDateError && firstDateError.code !== 'PGRST116') { // Ignorar error cuando no hay datos
      throw new Error(`Error fetching first date: ${firstDateError.message}`);
    }
    
    const { data: lastDateData, error: lastDateError } = await supabase
      .from('dollar_rates')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single();
      
    if (lastDateError && lastDateError.code !== 'PGRST116') { // Ignorar error cuando no hay datos
      throw new Error(`Error fetching last date: ${lastDateError.message}`);
    }
    
    // Mapear nombres descriptivos para cada tipo de dólar
    const dollarTypeDescriptions: Record<string, string> = {
      'CCL': 'Contado con Liquidación',
      'MEP': 'Mercado Electrónico de Pagos (Bolsa)',
      'CRYPTO': 'Dólar Cripto',
      'BLUE': 'Dólar Blue (informal)',
      'OFICIAL': 'Dólar Oficial',
      'MAYORISTA': 'Dólar Mayorista',
      'TARJETA': 'Dólar Tarjeta/Turista'
    };
    
    // Construir respuesta con información sobre los tipos de dólar
    const typesInfo = dollarTypes.map(type => ({
      code: type,
      name: dollarTypeDescriptions[type] || type,
      count: dollarTypesMap.get(type) || 0
    }));
    
    // Calcular días entre primera y última fecha
    let daysCount = 0;
    if (firstDateData?.date && lastDateData?.date) {
      const firstDate = new Date(firstDateData.date);
      const lastDate = new Date(lastDateData.date);
      daysCount = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    // Configurar caché para 1 hora
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    });
    
    // Construir respuesta
    const response = {
      dollar_types: typesInfo,
      date_range: {
        first_date: firstDateData?.date || null,
        last_date: lastDateData?.date || null,
        days_count: daysCount
      },
      metadata: {
        data_source: 'Argentina Datos API',
        last_updated: new Date().toISOString(),
        available_formats: ['json', 'csv'],
        endpoints: {
          main: '/api/dollar',
          latest: '/api/dollar/latest',
          metadata: '/api/dollar/metadata'
        },
        refresh_frequency: {
          data_update: 'Daily (Business days)',
          api_cache: '15 minutes'
        }
      }
    };
    
    return NextResponse.json(response, { headers });
    
  } catch (error) {
    console.error('Error in dollar metadata endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Revalidación programada cada hora
export const revalidate = 3600; // 1 hora