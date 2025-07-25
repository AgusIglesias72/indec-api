// src/app/api/poverty/comparison/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Compara pobreza entre regiones o períodos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'regional'; // regional, temporal
    const period = searchParams.get('period');
    
    if (type === 'regional') {
      // Comparación entre regiones para un período (incluir datos nacionales)
      let query = supabase
        .from('poverty_data')
        .select('region, poverty_rate_persons, poverty_rate_households, indigence_rate_persons, indigence_rate_households, period, date')
        .in('data_type', ['regional', 'national'])
        .order('poverty_rate_persons', { ascending: false });
      
      if (period) {
        query = query.eq('period', period);
      } else {
        // Usar el último período disponible
        const { data: latestPeriod } = await supabase
          .from('poverty_data')
          .select('period')
          .in('data_type', ['regional', 'national'])
          .order('date', { ascending: false })
          .limit(1)
          .single();
          
        if (latestPeriod) {
          query = query.eq('period', latestPeriod.period);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        return NextResponse.json({ error: 'Error al obtener comparación' }, { status: 500 });
      }
      
      // Agregar ranking
      const rankedData = data?.map((item, index) => ({
        ...item,
        poverty_rank: index + 1,
        above_national: (item.poverty_rate_persons || 0) > (data.find(d => d.region === 'Total 31 aglomerados')?.poverty_rate_persons || 0)
      }));
      
      return NextResponse.json({
        data: rankedData,
        metadata: {
          type: 'regional',
          period: data?.[0]?.period,
          date: data?.[0]?.date,
          regions_count: data?.length || 0,
          national_average: data?.find(d => d.region === 'Total 31 aglomerados')?.poverty_rate_persons || null
        }
      });
      
    } else if (type === 'temporal') {
      // Comparación temporal entre semestres
      const regions = searchParams.get('regions')?.split(',') || ['Total 31 aglomerados'];
      
      const { data, error } = await supabase
        .from('poverty_data')
        .select('*')
        .in('region', regions)
        .in('cuadro_source', ['Cuadro 1', 'Cuadro 4.3', 'Cuadro 4.4'])
        .order('date', { ascending: true });
        
      if (error) {
        return NextResponse.json({ error: 'Error al obtener comparación temporal' }, { status: 500 });
      }
      
      // Agrupar por región
      const groupedData = regions.reduce((acc, region) => {
        acc[region] = data?.filter(d => d.region === region) || [];
        return acc;
      }, {} as Record<string, any[]>);
      
      return NextResponse.json({
        data: groupedData,
        metadata: {
          type: 'temporal',
          regions: regions,
          periods_count: data?.length || 0,
          date_range: data && data.length > 0 ? {
            start: data[0].date,
            end: data[data.length - 1].date
          } : null
        }
      });
    }
    
    return NextResponse.json({ error: 'Tipo de comparación no válido' }, { status: 400 });
    
  } catch (error) {
    console.error('Error in poverty comparison API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}