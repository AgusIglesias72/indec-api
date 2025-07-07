// src/app/api/labor-market/latest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { LaborMarketRegion, LaborMarketAgeGroup, LaborMarketGender } from '@/types/labor-market';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Obtener parámetros opcionales
    const region = searchParams.get('region') as LaborMarketRegion | null;
    const ageGroup = searchParams.get('age_group') as LaborMarketAgeGroup | null;
    const gender = searchParams.get('gender') as LaborMarketGender | null;

    // Si no se especifica región, obtener datos del Total 31 aglomerados
    const targetRegion = region || 'Total 31 aglomerados';
    const targetAgeGroup = ageGroup || 'Total';
    const targetGender = gender || 'Total';

    // Obtener el dato más reciente
    let query = supabase
      .from('labor_market')
      .select('*')
      .eq('region', targetRegion)
      .eq('age_group', targetAgeGroup)
      .eq('gender', targetGender)
      .order('date', { ascending: false })
      .limit(1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching latest labor market data: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { 
          error: 'No labor market data found for the specified criteria',
          criteria: { region: targetRegion, age_group: targetAgeGroup, gender: targetGender }
        },
        { status: 404 }
      );
    }

    const latestData = data[0];

    // Transformar datos para la respuesta
    const transformedData = {
      date: latestData.date,
      period: latestData.period,
      region: latestData.region,
      age_group: latestData.age_group,
      gender: latestData.gender,
      unemployment_rate: Number(latestData.unemployment_rate) || 0,
      activity_rate: Number(latestData.activity_rate) || 0,
      employment_rate: Number(latestData.employment_rate) || 0,
      economically_active_population: Number(latestData.economically_active_population) || 0,
      employed_population: Number(latestData.employed_population) || 0,
      unemployed_population: Number(latestData.unemployed_population) || 0,
      total_population: Number(latestData.total_population) || 0,
      inactive_population: Number(latestData.inactive_population) || 0
    };

    // Configurar caché para 1 hora
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200' // 1 hora
    });

    return NextResponse.json({
      data: transformedData,
      metadata: {
        last_updated: latestData.updated_at || latestData.created_at,
        period: latestData.period,
        region: latestData.region,
        demographics: {
          age_group: latestData.age_group,
          gender: latestData.gender
        }
      }
    }, { headers });

  } catch (error) {
    console.error('Error in latest labor market endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Configurar revalidación programada
export const revalidate = 3600; // 1 hora