// src/app/api/riesgo-pais/route.ts
// Endpoint principal para consultar datos del riesgo país (EMBI) con paginación

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { withRateLimit } from '@/lib/rate-limit';

//export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Límites por defecto
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 5000; // Aumentado para gráficos más completos
const MAX_LIMIT_SINGLE_REQUEST = 1000;

/**
 * GET /api/riesgo-pais
 * 
 * Query Parameters:
 * - type: 'latest' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'year_to_date' | 'last_year' | 'last_5_years' | 'all_time' | 'custom'
 * - date_from: string (YYYY-MM-DD) - requerido si type='custom'
 * - date_to: string (YYYY-MM-DD) - requerido si type='custom'
 * - limit: number (opcional, máximo 5000, se maneja con paginación automática si es mayor a 1000)
 * - page: number (opcional, para paginación manual, default: 1)
 * - per_page: number (opcional, para paginación manual, default: 100, máximo: 1000)
 * - order: 'asc' | 'desc' (default: 'desc')
 * - auto_paginate: boolean (default: true) - si es true, maneja automáticamente la paginación para límites grandes
 */
async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extraer parámetros
    const type = searchParams.get('type') || 'last_30_days';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    const perPageParam = searchParams.get('per_page');
    const order = searchParams.get('order') || 'desc';
    const autoPaginate = searchParams.get('auto_paginate') !== 'false';
    const useRawData = searchParams.get('raw_data') === 'true';
    // console.info('useRawData parameter:', useRawData); // Debug log deshabilitado
    
    // Validar parámetros
    const validTypes = [
      'latest', 'last_7_days', 'last_30_days', 'last_90_days', 
      'year_to_date', 'last_year', 'last_5_years', 'all_time', 'custom'
    ];
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
    
    // Configurar paginación
    const limit = limitParam ? Math.min(parseInt(limitParam), MAX_LIMIT) : DEFAULT_LIMIT;
    const page = pageParam ? Math.max(parseInt(pageParam), 1) : 1;
    const perPage = perPageParam ? Math.min(parseInt(perPageParam), MAX_LIMIT_SINGLE_REQUEST) : DEFAULT_LIMIT;
    
    // Validar parámetros numéricos
    if (limit && (limit < 1 || limit > MAX_LIMIT)) {
      return NextResponse.json({
        success: false,
        error: `Limit debe estar entre 1 y ${MAX_LIMIT}`
      }, { status: 400 });
    }
    
    if (!['asc', 'desc'].includes(order)) {
      return NextResponse.json({
        success: false,
        error: 'Order debe ser "asc" o "desc"'
      }, { status: 400 });
    }
    
    // Determinar si usar autopaginación
    const useAutoPagination = autoPaginate && limit > MAX_LIMIT_SINGLE_REQUEST;
    
    let data: any[] = [];
    let totalRecords = 0;
    let hasMore = false;
    const currentPage = page;
    let totalPages = 1;
    
    if (useAutoPagination) {
      // Manejo automático de paginación para datasets grandes
      const result = await fetchAllData(type, dateFrom, dateTo, limit, order, useRawData);
      if (result.error) {
        throw result.error;
      }
      data = result.data || [];
      totalRecords = data.length;
      totalPages = 1;
      hasMore = false;
    } else {
      // Paginación manual o consulta simple
      const result = await buildQuery(type, dateFrom, dateTo, perPage, order, page, useRawData);
      if (result.error) {
        throw result.error;
      }
      
      data = result.data || [];
      
      // Obtener total de registros para paginación
      const countResult = await getRecordCount(type, dateFrom, dateTo, useRawData);
      totalRecords = countResult.count || 0;
      totalPages = Math.ceil(totalRecords / perPage);
      hasMore = currentPage < totalPages;
    }
    
    // Calcular estadísticas
    const stats = calculateStats(data, type);
    
    // Preparar metadata de paginación
    const pagination = useAutoPagination ? null : {
      current_page: currentPage,
      per_page: perPage,
      total_pages: totalPages,
      total_records: totalRecords,
      has_more: hasMore,
      has_previous: currentPage > 1
    };
    
    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        type,
        total_records: data?.length || 0,
        date_range: type === 'custom' ? { from: dateFrom, to: dateTo } : getDateRange(type),
        order,
        limit: useAutoPagination ? limit : perPage,
        auto_paginated: useAutoPagination,
        query_timestamp: new Date().toISOString()
      },
      pagination,
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
 * Maneja la obtención automática de todos los datos necesarios mediante paginación interna
 */
async function fetchAllData(
  type: string, 
  dateFrom: string | null, 
  dateTo: string | null, 
  totalLimit: number, 
  order: string,
  useRawData: boolean = false
) {
  const allData: any[] = [];
  let currentPage = 1;
  let hasMore = true;
  const perPage = MAX_LIMIT_SINGLE_REQUEST;
  
  while (hasMore && allData.length < totalLimit) {
    const remainingLimit = Math.min(perPage, totalLimit - allData.length);
    
    const result = await buildQuery(type, dateFrom, dateTo, remainingLimit, order, currentPage, useRawData);
    
    if (result.error) {
      return { error: result.error, data: null };
    }
    
    const pageData = result.data || [];
    allData.push(...pageData);
    
    // Verificar si hay más datos
    hasMore = pageData.length === remainingLimit;
    currentPage++;
    
    // Protección contra loops infinitos
    if (currentPage > 100) {
      console.warn('Reached maximum page limit in auto-pagination');
      break;
    }
  }
  
  return { data: allData, error: null };
}

/**
 * Obtiene el conteo total de registros para paginación
 */
async function getRecordCount(
  type: string,
  dateFrom: string | null,
  dateTo: string | null,
  useRawData: boolean = false
) {
  // Choose table based on whether raw data is requested
  let query;
  if (useRawData) {
    query = supabase
      .from('embi_risk')
      .select('*', { count: 'exact', head: true });
  } else {
    query = supabase
      .from('v_embi_daily_closing')
      .select('*', { count: 'exact', head: true });
  }

  // Choose date field based on table (use original field names for filtering)
  const dateField = useRawData ? 'date' : 'closing_date';
  
  // Aplicar los mismos filtros que en la query principal
  switch (type) {
    case 'latest':
      return { count: 1 };
      
    case 'last_7_days':
      query = query.gte(dateField, getDateDaysAgo(7));
      break;
      
    case 'last_30_days':
      query = query.gte(dateField, getDateDaysAgo(30));
      break;
      
    case 'last_90_days':
      query = query.gte(dateField, getDateDaysAgo(90));
      break;
      
    case 'year_to_date':
      const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      query = query.gte(dateField, yearStart);
      break;
      
    case 'last_year':
      const lastYear = new Date().getFullYear() - 1;
      const lastYearStart = `${lastYear}-01-01`;
      const lastYearEnd = `${lastYear}-12-31`;
      query = query.gte(dateField, lastYearStart).lte(dateField, lastYearEnd);
      break;
      
    case 'last_5_years':
      query = query.gte(dateField, getDateDaysAgo(5 * 365));
      break;
      
    case 'all_time':
      // Sin filtros adicionales
      break;
      
    case 'custom':
      if (dateFrom && dateTo) {
        query = query.gte(dateField, dateFrom).lte(dateField, dateTo);
      }
      break;
  }

  const { count, error } = await query;
  return { count: count || 0, error };
}

/**
 * Construye la query de Supabase según el tipo solicitado
 */
async function buildQuery(
  type: string, 
  dateFrom: string | null, 
  dateTo: string | null, 
  limit: number, 
  order: string,
  page: number = 1,
  useRawData: boolean = false
) {
  // Choose table based on raw data request and specific types
  let query;
  
  if (useRawData && (type === 'last_7_days' || type === 'custom')) {
    console.info('Using raw data for period:', type);
    // Implement raw data for both 7D and 1D (custom) periods
    query = supabase
      .from('embi_risk')  
      .select('date, value, created_at, updated_at');
  } else {
    // Use daily closing view for all other cases
    query = supabase
      .from('v_embi_daily_closing')
      .select('*');
    
    if (useRawData) {
      console.info('Raw data requested but not implemented yet for type:', type);
    }
  }

  // Choose field names based on which table we're using
  const isUsingRawData = useRawData && (type === 'last_7_days' || type === 'custom');
  const filterDateField = isUsingRawData ? 'date' : 'closing_date';
  const orderField = isUsingRawData ? 'created_at' : 'closing_date';
  
  // Aplicar filtros de fecha según el tipo
  switch (type) {
    case 'latest':
      query = query.order(orderField, { ascending: false }).limit(1);
      break;
      
    case 'last_7_days':
      query = query
        .gte(filterDateField, getDateDaysAgo(7))
        .order(orderField, { ascending: order === 'asc' });
      break;
      
    case 'last_30_days':
      query = query
        .gte(filterDateField, getDateDaysAgo(30))
        .order(orderField, { ascending: order === 'asc' });
      break;
      
    case 'last_90_days':
      query = query
        .gte(filterDateField, getDateDaysAgo(90))
        .order(orderField, { ascending: order === 'asc' });
      break;
      
    case 'year_to_date':
      const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      query = query
        .gte(filterDateField, yearStart)
        .order(orderField, { ascending: order === 'asc' });
      break;
      
    case 'last_year':
      const lastYear = new Date().getFullYear() - 1;
      const lastYearStart = `${lastYear}-01-01`;
      const lastYearEnd = `${lastYear}-12-31`;
      query = query
        .gte(filterDateField, lastYearStart)
        .lte(filterDateField, lastYearEnd)
        .order(orderField, { ascending: order === 'asc' });
      break;
      
    case 'last_5_years':
      query = query
        .gte(filterDateField, getDateDaysAgo(5 * 365))
        .order(orderField, { ascending: order === 'asc' });
      break;
      
    case 'all_time':
      query = query.order(orderField, { ascending: order === 'asc' });
      break;
      
    case 'custom':
      if (dateFrom && dateTo) {
        query = query
          .gte(filterDateField, dateFrom)
          .lte(filterDateField, dateTo)
          .order(orderField, { ascending: order === 'asc' });
      }
      break;
      
    default:
      throw new Error(`Tipo no implementado: ${type}`);
  }
  
  // Aplicar paginación (excepto para 'latest' que ya tiene limit 1)
  if (type !== 'latest') {
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
  }
  
  const { data, error } = await query;
  
  // Post-process raw data to add missing fields if needed
  if (isUsingRawData && data) {
    console.info(`Processing ${data.length} raw data points for ${type} period`);
    // Map raw data fields to expected format and add missing fields
    const processedData = data.map((item: any) => ({
      closing_date: item.date,        // Map date -> closing_date
      closing_value: item.value,      // Map value -> closing_value
      created_at: item.created_at,
      updated_at: item.updated_at,
      change_percentage: null,        // Raw data doesn't have this
      change_value: null
    }));
    return { data: processedData, error, query };
  }
  
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
    case 'last_5_years':
      return { from: getDateDaysAgo(5 * 365), to: today };
    case 'all_time':
      return { description: 'Todos los datos disponibles' };
    default:
      return null;
  }
}

/**
 * Calcula estadísticas básicas de los datos incluyendo variaciones temporales
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
  
  const latest = data.find(item => item.closing_value !== null);
  const oldest = [...data].reverse().find(item => item.closing_value !== null);
  
  // Calcular variaciones específicas si tenemos datos suficientes
  let monthlyVariation = null;
  let yearlyVariation = null;
  
  if (data.length > 20) { // Aproximadamente un mes de datos laborables
    const monthAgoData = data[Math.min(20, data.length - 1)];
    if (monthAgoData && latest) {
      monthlyVariation = ((latest.closing_value - monthAgoData.closing_value) / monthAgoData.closing_value * 100);
    }
  }
  
  if (data.length > 250) { // Aproximadamente un año de datos laborables
    const yearAgoData = data[Math.min(250, data.length - 1)];
    if (yearAgoData && latest) {
      yearlyVariation = ((latest.closing_value - yearAgoData.closing_value) / yearAgoData.closing_value * 100);
    }
  }
  
  return {
    latest_value: latest?.closing_value || null,
    latest_date: latest?.closing_date || null,
    latest_change: latest?.change_percentage || null,
    monthly_variation: monthlyVariation,
    yearly_variation: yearlyVariation,
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

// IMPORTANTE: Exportar con rate limiting
export const GET = withRateLimit(handler);