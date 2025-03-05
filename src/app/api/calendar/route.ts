import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

// Límite por defecto de eventos por página
const DEFAULT_LIMIT = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parámetros de filtro
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const start_date = searchParams.get('start_date');
  const end_date = searchParams.get('end_date');
  
  // Parámetros de paginación
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT));
  
  // Validar parámetros de paginación
  const validPage = page > 0 ? page : 1;
  const validLimit = limit > 0 && limit <= 500 ? limit : DEFAULT_LIMIT;
  const offset = (validPage - 1) * validLimit;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Consulta base
  let query = supabase.from('economic_calendar').select('*', { count: 'exact' });
  
  // Aplicar filtros según los parámetros proporcionados
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
  
  // Aplicar paginación
  const { data, error, count } = await query
    .range(offset, offset + validLimit - 1);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dataWithDates = data?.map(item => ({
    ...item,
    date: item.date + 'T00:00:00'
  }));
  
  // Calcular información de paginación
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / validLimit);
  
  // Preparar la respuesta con datos, metadata y paginación
  const response = {
    data: dataWithDates || [],
    metadata: {
      count: data?.length || 0,
      total_count: totalCount,
      filtered_by: {
        ...(month ? { month: Number(month) } : {}),
        ...(year ? { year: Number(year) } : {}),
        ...(start_date ? { start_date } : {}),
        ...(end_date ? { end_date } : {})
      },
    },
    pagination: {
      page: validPage,
      limit: validLimit,
      total_pages: totalPages,
      has_more: validPage < totalPages
    }
  };
  
  return NextResponse.json(response);
}