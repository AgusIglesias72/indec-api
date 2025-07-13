// src/app/api/riesgo-pais/route.ts
// Endpoint principal para consultar datos del riesgo país (EMBI)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * GET /api/riesgo-pais
 * 
 * Query Parameters:
 * - type: 'latest' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'year_to_date' | 'last_year' | 'custom'
 * - date_from: string (YYYY-MM-DD) - requerido si type='custom'
 * - date_to: string (YYYY-MM-DD) - requerido si type='custom'
 * - limit: number (opcional, máximo 1000)
 * - order: 'asc' | 'desc' (default: 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extraer parámetros
    const type = searchParams.get('type') || 'last_30_days';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limitParam = searchParams.get('limit');
    const order = searchParams.get('order') || 'desc';
    
    // Validar parámetros
    const validTypes = ['latest', 'last_7_days', 'last_30_days', 'last_90_days', 'year_to_date', 'last_year', 'custom'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Tipo inválido',
        validTypes
      }, { status: 400 });
    }
    
    // Validar custom date range
    if (type === 'custom' && (!dateFrom || !dateTo)) {
      return NextResponse.json({
        success: false,
        error: 'Para type="custom" se requieren date_from y date_to'
      }, { status: 400 });
    }
    
    // Validar limit
    const limit = limitParam ? parseInt(limitParam) : null;
    if (limit && (limit < 1 || limit > 1000)) {
      return NextResponse.json({
        success: false,
        error: 'Limit debe estar entre 1 y 1000'
      }, { status: 400 });
    }
    
    // Validar order
    if (!['asc', 'desc'].includes(order)) {
      return NextResponse.json({
        success: false,
        error: 'Order debe ser "asc" o "desc"'
      }, { status: 400 });
    }
    
    // Construir query según el tipo
    const { data, error, query } = await buildQuery(type, dateFrom, dateTo, limit, order);
    
    if (error) {
      console.error('Error querying riesgo país:', error);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      }, { status: 500 });
    }
    
    // Calcular estadísticas
    const stats = calculateStats(data || [], type);
    
    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        type,
        total_records: data?.length || 0,
        date_range: type === 'custom' ? { from: dateFrom, to: dateTo } : getDateRange(type),
        order,
        limit: limit || null,
        query_timestamp: new Date().toISOString()
      },
      stats
    });

  } catch (error) {
    console.error('Error in riesgo-pais API:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: (error as Error).message
    }, { status: 500 });
  }
}

/**
 * Construye la query de Supabase según el tipo solicitado
 */
async function buildQuery(
  type: string, 
  dateFrom: string | null, 
  dateTo: string | null, 
  limit: number | null, 
  order: string
) {
  let query = supabase
    .from('v_embi_daily_closing')
    .select('*');

  // Aplicar filtros de fecha según el tipo
  switch (type) {
    case 'latest':
      query = query.order('closing_date', { ascending: false }).limit(1);
      break;
      
    case 'last_7_days':
      query = query
        .gte('closing_date', getDateDaysAgo(7))
        .order('closing_date', { ascending: order === 'asc' });
      break;
      
    case 'last_30_days':
      query = query
        .gte('closing_date', getDateDaysAgo(30))
        .order('closing_date', { ascending: order === 'asc' });
      break;
      
    case 'last_90_days':
      query = query
        .gte('closing_date', getDateDaysAgo(90))
        .order('closing_date', { ascending: order === 'asc' });
      break;
      
    case 'year_to_date':
      const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      query = query
        .gte('closing_date', yearStart)
        .order('closing_date', { ascending: order === 'asc' });
      break;
      
    case 'last_year':
      const lastYear = new Date().getFullYear() - 1;
      const lastYearStart = `${lastYear}-01-01`;
      const lastYearEnd = `${lastYear}-12-31`;
      query = query
        .gte('closing_date', lastYearStart)
        .lte('closing_date', lastYearEnd)
        .order('closing_date', { ascending: order === 'asc' });
      break;
      
    case 'custom':
      if (dateFrom && dateTo) {
        query = query
          .gte('closing_date', dateFrom)
          .lte('closing_date', dateTo)
          .order('closing_date', { ascending: order === 'asc' });
      }
      break;
      
    default:
      throw new Error(`Tipo no implementado: ${type}`);
  }
  
  // Aplicar limit si se especifica (excepto para 'latest' que ya tiene limit 1)
  if (limit && type !== 'latest') {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  return { data, error, query };
}

/**
 * Obtiene una fecha X días atrás en formato YYYY-MM-DD
 */
function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Obtiene el rango de fechas para mostrar en metadata
 */
function getDateRange(type: string) {
  const today = new Date().toISOString().split('T')[0];
  
  switch (type) {
    case 'latest':
      return { description: 'Último valor disponible' };
    case 'last_7_days':
      return { from: getDateDaysAgo(7), to: today };
    case 'last_30_days':
      return { from: getDateDaysAgo(30), to: today };
    case 'last_90_days':
      return { from: getDateDaysAgo(90), to: today };
    case 'year_to_date':
      return { from: `${new Date().getFullYear()}-01-01`, to: today };
    case 'last_year':
      const lastYear = new Date().getFullYear() - 1;
      return { from: `${lastYear}-01-01`, to: `${lastYear}-12-31` };
    default:
      return null;
  }
}

/**
 * Calcula estadísticas básicas de los datos
 */
function calculateStats(data: any[], type: string) {
  if (!data || data.length === 0) {
    return null;
  }
  
  const values = data.map(item => item.closing_value).filter(v => v !== null);
  const changes = data.map(item => item.change_percentage).filter(v => v !== null);
  
  if (values.length === 0) {
    return null;
  }
  
  const latest = data[0]; // Asumiendo order desc por defecto
  const oldest = data[data.length - 1];
  
  return {
    latest_value: latest?.closing_value || null,
    latest_date: latest?.closing_date || null,
    latest_change: latest?.change_percentage || null,
    min_value: Math.min(...values),
    max_value: Math.max(...values),
    avg_value: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    total_records: data.length,
    period_change: latest && oldest ? {
      absolute: latest.closing_value - oldest.closing_value,
      percentage: oldest.closing_value > 0 ? 
        parseFloat(((latest.closing_value - oldest.closing_value) / oldest.closing_value * 100).toFixed(2)) : null
    } : null,
    volatility: changes.length > 0 ? {
      avg_daily_change: parseFloat((changes.reduce((a, b) => a + b, 0) / changes.length).toFixed(2)),
      max_daily_increase: Math.max(...changes.filter(c => c > 0)),
      max_daily_decrease: Math.min(...changes.filter(c => c < 0))
    } : null
  };
}