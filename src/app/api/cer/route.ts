// src/app/api/cer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { withRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

/**
 * GET /api/cer
 * 
 * Endpoint para obtener datos del CER (Coeficiente de Estabilización de Referencia)
 * 
 * Query Parameters:
 * - type: 'latest' | 'historical' | 'range' | 'specific-date'
 * - start_date: string (YYYY-MM-DD)
 * - end_date: string (YYYY-MM-DD)
 * - date: string (YYYY-MM-DD) para consulta específica
 * - limit: number (max: 1000)
 * - page: number
 * - order: 'asc' | 'desc' (default: 'desc')
 * - include_variations: boolean (default: true)
 * - format: 'json' | 'csv' (default: 'json')
 */
async function handler(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Extraer parámetros
    const type = searchParams.get('type') || 'historical';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const specificDate = searchParams.get('date');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), MAX_LIMIT);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const order = searchParams.get('order') || 'desc';
    const includeVariations = searchParams.get('include_variations')?.toLowerCase() !== 'false';
    const format = searchParams.get('format')?.toLowerCase() || 'json';
    
    // Validar tipo
    const validTypes = ['latest', 'historical', 'range', 'specific-date'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Tipo inválido',
        validTypes
      }, { status: 400 });
    }
    
    let result;
    switch (type) {
      case 'latest':
        result = await getLatestCER();
        break;
        
      case 'specific-date':
        if (!specificDate) {
          return NextResponse.json({
            success: false,
            error: 'Se requiere el parámetro "date" para consultas específicas'
          }, { status: 400 });
        }
        result = await getCERByDate(specificDate);
        break;
        
      case 'range':
        if (!startDate || !endDate) {
          return NextResponse.json({
            success: false,
            error: 'Se requieren los parámetros "start_date" y "end_date" para consultas por rango'
          }, { status: 400 });
        }
        result = await getCERRange(startDate, endDate, includeVariations);
        break;
        
      case 'historical':
      default:
        result = await getHistoricalCER({
          startDate: startDate ?? undefined,
          endDate: endDate ?? undefined,
          limit,
          page,
          order: order as 'asc' | 'desc',
          includeVariations
        });
        break;
    }
    
    // Manejar errores
    if ('error' in result && result.error) {
      throw result.error;
    }
    
    // Formato CSV si se solicita
    if (format === 'csv' && type !== 'latest' && type !== 'specific-date') {
      if (Array.isArray(result.data)) {
        return respondWithCSV(result.data, 'cer_data.csv');
      }
    }
    
    // Respuesta JSON con caché
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
    });
    
    return new NextResponse(JSON.stringify({
      success: true,
      type,
      data: result.data,
      meta: {
        type,
        timestamp: new Date().toISOString(),
        source: 'BCRA',
        description: 'Coeficiente de Estabilización de Referencia (Base 2.2.2002=1)'
      },
      ...('pagination' in result ? { pagination: result.pagination } : {}),
      ...('stats' in result ? { stats: result.stats } : {})
    }), { 
      status: 200, 
      headers 
    });
    
  } catch (error) {
    console.error('Error en API CER:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: (error as Error).message
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
}

/**
 * Obtener el último valor del CER
 */
async function getLatestCER() {
  const tableName = 'cer_with_variations';
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single();
    
  if (error) {
    return { error, data: null };
  }
  
  return { data, error: null };
}

/**
 * Obtener CER por fecha específica
 */
async function getCERByDate(date: string) {
  const tableName = 'cer_with_variations';
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('date', date)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return { 
        error: new Error(`No se encontró dato del CER para la fecha ${date}`),
        data: null 
      };
    }
    return { error, data: null };
  }
  
  return { data, error: null };
}

/**
 * Obtener CER en un rango de fechas
 */
async function getCERRange(startDate: string, endDate: string, includeVariations: boolean) {
  let data, error;
  
  if (includeVariations) {
    const result = await supabase
      .from('cer_with_variations')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    data = result.data;
    error = result.error;
  } else {
    const result = await supabase
      .from('cer')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    data = result.data;
    error = result.error;
  }
    
  if (error) {
    return { error, data: null };
  }
  
  // Calcular estadísticas del período
  const stats = calculateStats(data || []);
  
  return { 
    data,
    stats,
    error: null 
  };
}

/**
 * Obtener datos históricos del CER con paginación
 */
async function getHistoricalCER(params: {
  startDate?: string;
  endDate?: string;
  limit: number;
  page: number;
  order: 'asc' | 'desc';
  includeVariations: boolean;
}) {
  const { startDate, endDate, limit, page, order, includeVariations } = params;
  
  let data, error, count;
  const offset = (page - 1) * limit;
  
  if (includeVariations) {
    let query = supabase
      .from('cer_with_variations')
      .select('*', { count: 'exact' });
    
    // Aplicar filtros
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    
    // Ordenar y paginar
    query = query.order('date', { ascending: order === 'asc' });
    query = query.range(offset, offset + limit - 1);
    
    const result = await query;
    data = result.data;
    error = result.error;
    count = result.count;
  } else {
    let query = supabase
      .from('cer')
      .select('*', { count: 'exact' });
    
    // Aplicar filtros
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    
    // Ordenar y paginar
    query = query.order('date', { ascending: order === 'asc' });
    query = query.range(offset, offset + limit - 1);
    
    const result = await query;
    data = result.data;
    error = result.error;
    count = result.count;
  }
  
  if (error) {
    return { error, data: null };
  }
  
  // Calcular estadísticas
  const stats = calculateStats(data || []);
  
  // Metadata de paginación
  const totalPages = Math.ceil((count || 0) / limit);
  
  return {
    data,
    pagination: {
      current_page: page,
      per_page: limit,
      total_pages: totalPages,
      total_records: count || 0,
      has_more: page < totalPages,
      has_previous: page > 1
    },
    stats,
    error: null
  };
}

/**
 * Calcular estadísticas del CER
 */
function calculateStats(data: any[]) {
  if (!data || data.length === 0) return null;
  
  const values = data.map(item => item.value).filter(v => v !== null);
  
  if (values.length === 0) return null;
  
  const latest = data[0];
  const oldest = data[data.length - 1];
  
  const stats: any = {
    latest_value: latest?.value || null,
    latest_date: latest?.date || null,
    min_value: Math.min(...values),
    max_value: Math.max(...values),
    avg_value: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(4)),
    total_records: data.length
  };
  
  // Agregar estadísticas de variaciones si están disponibles
  if (latest?.daily_pct_change !== undefined) {
    stats.latest_daily_change = latest.daily_pct_change;
    stats.latest_monthly_change = latest.monthly_pct_change;
    stats.latest_yearly_change = latest.yearly_pct_change;
  }
  
  // Calcular variación del período
  if (latest && oldest && oldest.value > 0) {
    stats.period_change = {
      absolute: parseFloat((latest.value - oldest.value).toFixed(4)),
      percentage: parseFloat(((latest.value - oldest.value) / oldest.value * 100).toFixed(4))
    };
  }
  
  return stats;
}

/**
 * Generar CSV
 */
function respondWithCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: 'No hay datos para exportar' },
      { status: 404 }
    );
  }
  
  const headers = Object.keys(data[0]);
  let csvContent = headers.join(',') + '\n';
  
  csvContent += data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value !== null && value !== undefined ? value : '';
    }).join(',');
  }).join('\n');
  
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  
  return new NextResponse(csvWithBOM, {
    headers: {
      'Content-Type': 'text/csv; charset=UTF-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}

// Exportar con rate limiting
export const GET = withRateLimit(handler);