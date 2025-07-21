import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros de filtro
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Consulta base
    let query = supabase.from('economic_calendar').select('date, day_week, indicator, period, source');
    
    // Aplicar filtros directamente en la base de datos
    if (start_date) {
      query = query.gte('date', start_date);
    } else if (month || year) {
      // Manejar casos donde solo tenemos month o year
      const currentDate = new Date();
      const filterYear = year ? parseInt(year) : currentDate.getFullYear();
      const filterMonth = month ? parseInt(month) - 1 : month ? parseInt(month) - 1 : 0;
      
      if (month && !year) {
        // Solo mes: filtrar por el mes en el año actual
        const startDate = new Date(currentDate.getFullYear(), filterMonth, 1);
        const endDate = new Date(currentDate.getFullYear(), filterMonth + 1, 0);
        query = query.gte('date', startDate.toISOString().split('T')[0])
                     .lte('date', endDate.toISOString().split('T')[0]);
      } else if (!month && year) {
        // Solo año: filtrar por todo el año
        const startDate = new Date(filterYear, 0, 1);
        const endDate = new Date(filterYear, 11, 31);
        query = query.gte('date', startDate.toISOString().split('T')[0])
                     .lte('date', endDate.toISOString().split('T')[0]);
      } else {
        // Ambos month y year
        const startDate = new Date(filterYear, filterMonth, 1);
        const endDate = new Date(filterYear, filterMonth + 1, 0);
        query = query.gte('date', startDate.toISOString().split('T')[0])
                     .lte('date', endDate.toISOString().split('T')[0]);
      }
    }
    
    if (end_date) {
      query = query.lte('date', end_date);
    }
    
    // Ordenar por fecha
    query = query.order('date', { ascending: true });
    
    // Ejecutar consulta sin paginación
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(`Error fetching calendar data: ${error.message}`);
    }

    // Formatear fechas para incluir la hora
    const dataWithDates = data?.map(item => ({
      ...item,
      date: item.date + 'T19:00:00'
    })) || [];
    
    // Construir respuesta
    const calendarData = {
      data: dataWithDates,
      metadata: {
        count: dataWithDates.length,
        filtered_by: {
          ...(month ? { month: Number(month) } : {}),
          ...(year ? { year: Number(year) } : {}),
          ...(start_date ? { start_date } : {}),
          ...(end_date ? { end_date } : {})
        }
      }
    };
    
    // Configurar caché para 1 hora
    const CACHE_MAX_AGE = 3600; // 1 hora en segundos
    const CACHE_STALE_WHILE_REVALIDATE = 86400; // 24 horas
    
    // Configurar encabezados de caché
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`);
    
    return new NextResponse(JSON.stringify(calendarData), { 
      status: 200, 
      headers 
    });
    
  } catch (error) {
    console.error('Error en API de calendario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}

// Revalidación programada cada hora
export const revalidate = 3600; // 1 hora