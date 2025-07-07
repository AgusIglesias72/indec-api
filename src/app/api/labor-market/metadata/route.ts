// src/app/api/labor-market/metadata/route.ts
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
    // Obtener regiones únicas
    const { data: regionData, error: regionError } = await supabase
      .from('labor_market')
      .select('region')
      .not('region', 'is', null);

    if (regionError) {
      throw new Error(`Error fetching regions: ${regionError.message}`);
    }

    // Obtener grupos etarios únicos
    const { data: ageGroupData, error: ageGroupError } = await supabase
      .from('labor_market')
      .select('age_group')
      .not('age_group', 'is', null);

    if (ageGroupError) {
      throw new Error(`Error fetching age groups: ${ageGroupError.message}`);
    }

    // Obtener géneros únicos
    const { data: genderData, error: genderError } = await supabase
      .from('labor_market')
      .select('gender')
      .not('gender', 'is', null);

    if (genderError) {
      throw new Error(`Error fetching genders: ${genderError.message}`);
    }

    // Obtener rango de fechas
    const { data: dateRangeData, error: dateRangeError } = await supabase
      .from('labor_market')
      .select('date, period')
      .order('date', { ascending: true });

    if (dateRangeError) {
      throw new Error(`Error fetching date range: ${dateRangeError.message}`);
    }

    // Obtener última fecha de actualización
    const { data: lastUpdateData, error: lastUpdateError } = await supabase
      .from('labor_market')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (lastUpdateError) {
      throw new Error(`Error fetching last update: ${lastUpdateError.message}`);
    }

    // Procesar datos
    const regions = Array.from(new Set(
      regionData?.map(item => item.region).filter(Boolean) || []
    )).sort();

    const ageGroups = Array.from(new Set(
      ageGroupData?.map(item => item.age_group).filter(Boolean) || []
    )).sort();

    const genders = Array.from(new Set(
      genderData?.map(item => item.gender).filter(Boolean) || []
    )).sort();

    // Indicadores disponibles
    const indicators = [
      'unemployment_rate',
      'activity_rate', 
      'employment_rate',
      'economically_active_population',
      'employed_population',
      'unemployed_population',
      'total_population',
      'inactive_population'
    ];

    // Procesar rango de fechas y períodos
    let dateRange = null;
    let periodRange = null;

    if (dateRangeData && dateRangeData.length > 0) {
      const sortedData = dateRangeData.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      dateRange = {
        first_date: sortedData[0]?.date ?? null,
        last_date: sortedData[sortedData.length - 1]?.date ?? null
      };

      // Extraer períodos únicos y ordenarlos
      const periods = Array.from(new Set(
        sortedData.map(item => item.period).filter(Boolean)
      )).sort((a, b) => {
        // Ordenar períodos por año y trimestre
        const parseTrismester = (period: string) => {
          const match = period.match(/T(\d)\s*(\d{4})/);
          if (match) {
            return { year: parseInt(match[2]), quarter: parseInt(match[1]) };
          }
          return { year: 0, quarter: 0 };
        };

        const aData = parseTrismester(a);
        const bData = parseTrismester(b);

        if (aData.year !== bData.year) {
          return aData.year - bData.year;
        }
        return aData.quarter - bData.quarter;
      });

      if (periods.length > 0) {
        periodRange = {
          first: periods[0] ?? null,
          last: periods[periods.length - 1] ?? null
        } as any; // Se fuerza el tipo para evitar el error de asignación
      }
    }

    // Obtener estadísticas adicionales
    const { data: statsData, error: statsError } = await supabase
      .from('labor_market')
      .select('region')
      .not('unemployment_rate', 'is', null);

    const recordCount = statsData?.length || 0;

    // Configurar caché para 6 horas
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=21600, stale-while-revalidate=43200' // 6 horas
    });

    return NextResponse.json({
      regions,
      age_groups: ageGroups,
      genders,
      indicators,
      date_range: dateRange,
      period_range: periodRange,
      metadata: {
        total_records: recordCount,
        last_updated: lastUpdateData?.[0]?.updated_at || null,
        data_source: 'INDEC - Encuesta Permanente de Hogares (EPH)',
        update_frequency: 'Trimestral',
        coverage: 'Argentina - 31 aglomerados urbanos',
        notes: [
          'Los datos corresponden a la Encuesta Permanente de Hogares del INDEC',
          'Se incluyen los 31 principales aglomerados urbanos de Argentina',
          'Los datos se actualizan trimestralmente',
          'Las tasas se expresan como porcentajes',
          'Las poblaciones se expresan en miles de personas'
        ]
      }
    }, { headers });

  } catch (error) {
    console.error('Error in labor market metadata endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Configurar revalidación programada cada 6 horas
export const revalidate = 21600;