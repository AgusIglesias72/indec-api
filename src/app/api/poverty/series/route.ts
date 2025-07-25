// src/app/api/poverty/series/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Obtiene series temporales de pobreza
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const indicator = searchParams.get('indicator'); // poverty_persons, poverty_households, etc.
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    let query = supabase
      .from('poverty_data')
      .select('date, period, year, semester, poverty_rate_persons, poverty_rate_households, indigence_rate_persons, indigence_rate_households')
      .order('date', { ascending: true });
    
    // Filtrar por región
    if (region) {
      query = query.eq('region', region);
    } else {
      query = query.eq('region', 'Total 31 aglomerados');
    }
    
    // Filtrar por fechas
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Solo incluir cuadros principales
    query = query.in('cuadro_source', ['Cuadro 1', 'Cuadro 4.3', 'Cuadro 4.4']);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching poverty series:', error);
      return NextResponse.json({ error: 'Error al obtener series' }, { status: 500 });
    }
    
    // Procesar datos según indicador solicitado  
    let processedData: any = data;
    if (indicator && data) {
      processedData = data.map(item => ({
        date: item.date,
        period: item.period,
        year: item.year,
        semester: item.semester,
        poverty_rate_persons: null,
        poverty_rate_households: null,
        indigence_rate_persons: null,
        indigence_rate_households: null,
        value: (item as any)[indicator] || null
      })).filter(item => item.value !== null);
    }
    
    return NextResponse.json({
      data: processedData,
      metadata: {
        count: processedData?.length || 0,
        region: region || 'Total 31 aglomerados',
        indicator: indicator || 'all',
        date_range: data && data.length > 0 ? {
          start: data[0].date,
          end: data[data.length - 1].date
        } : null
      }
    });
    
  } catch (error) {
    console.error('Error in poverty series API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}