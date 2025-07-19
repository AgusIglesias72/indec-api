// src/app/api/ipc/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { IpcResponse } from '@/types';
import { withRateLimit } from '@/lib/rate-limit';

// Configurar runtime
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Constantes
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

/**
 * GET /api/ipc
 * 
 * Endpoint unificado para datos del IPC
 * 
 * Query Parameters:
 * - type: 'latest' | 'historical' | 'metadata' | 'components'
 * - category: string (default: 'GENERAL')
 * - region: string (default: 'nacional')
 * - component_type: string (opcional)
 * - start_date: string (YYYY-MM-DD)
 * - end_date: string (YYYY-MM-DD)
 * - month: number
 * - year: number
 * - limit: number (max: 1000)
 * - page: number
 * - order: 'asc' | 'desc' (default: 'desc')
 * - format: 'json' | 'csv' (default: 'json')
 * - include_variations: boolean (default: true)
 */
async function handler(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Extraer parámetros
    const type = searchParams.get('type') || 'historical';
    const category = (searchParams.get('category') || 'GENERAL').toUpperCase();
    const region = searchParams.get('region')?.toLowerCase() || 'nacional';
    const componentType = searchParams.get('component_type')?.toLowerCase() || null;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), MAX_LIMIT);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const order = searchParams.get('order') || 'desc';
    const format = searchParams.get('format')?.toLowerCase() || 'json';
    const includeVariations = searchParams.get('include_variations')?.toLowerCase() !== 'false';
    
    // Validar tipo
    const validTypes = ['latest', 'historical', 'metadata', 'components'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Tipo inválido',
        validTypes
      }, { status: 400 });
    }
    
    // Normalizar región
    const normalizedRegion = region === 'gba' ? 'GBA' : 
      region.charAt(0).toUpperCase() + region.slice(1).toLowerCase();
    
    // Manejar diferentes tipos de consulta
    let result;
    switch (type) {
      case 'latest':
        result = await getLatestIPC(category, normalizedRegion);
        break;
        
      case 'metadata':
        result = await getIPCMetadata();
        break;
        
      case 'components':
        result = await getIPCComponents(componentType);
        break;
        
      case 'historical':
      default:
        result = await getHistoricalIPC({
          category,
          region: normalizedRegion,
          componentType: componentType ?? undefined,
          startDate: startDate ?? undefined,
          endDate: endDate ?? undefined,
          month: month ? parseInt(month) : undefined,
          year: year ? parseInt(year) : undefined,
          limit,
          page,
          order: order as 'asc' | 'desc',
          includeVariations
        });
        break;
    }
    
    // Manejar errores
    if (result.error) {
      throw result.error;
    }
    
    // Formato CSV si se solicita
    if (format === 'csv' && type === 'historical') {
      // Asegurarse de que result.data es un array antes de pasar a respondWithCSV
      if (Array.isArray(result.data)) {
        return respondWithCSV(result.data, 'ipc_data.csv');
      } else {
        return NextResponse.json({
          success: false,
          error: 'No se puede exportar a CSV: los datos no son una lista.',
        }, { status: 400 });
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
      meta: (result as any).meta || {
        type,
        region: normalizedRegion,
        category,
        timestamp: new Date().toISOString()
      },
      // Solo incluir paginación y estadísticas si existen en el resultado
      ...(typeof (result as any).pagination !== 'undefined' ? { pagination: (result as any).pagination } : {}),
      ...(typeof (result as any).stats !== 'undefined' ? { stats: (result as any).stats } : {})
    }), { 
      status: 200, 
      headers 
    });
    
  } catch (error) {
    console.error('Error en API IPC:', error);
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
 * Obtener el último valor del IPC
 */
async function getLatestIPC(category: string, region: string) {
  // Obtener último dato
  const { data: latestData, error } = await supabase
    .from('ipc_with_variations')
    .select('*')
    .eq('component_code', category)
    .eq('region', region)
    .order('date', { ascending: false })
    .limit(1)
    .single();
    
  if (error) {
    return { error, data: null };
  }
  
  if (!latestData) {
    return { 
      error: new Error('No se encontraron datos para los parámetros especificados'),
      data: null 
    };
  }
  
  // Calcular variación del cambio mensual
  const currentDate = new Date(latestData.date || '');
  currentDate.setMonth(currentDate.getMonth() - 1);
  const prevDateStr = currentDate.toISOString().split('T')[0];
  
  const { data: prevMonthData } = await supabase
    .from('ipc_with_variations')
    .select('monthly_pct_change')
    .eq('component_code', category)
    .eq('region', region)
    .eq('date', prevDateStr)
    .single();
  
  // Transformar resultado
  const result: IpcResponse = {
    date: latestData.date || '',
    category: latestData.component || '',
    category_code: latestData.component_code || '',
    category_type: latestData.component_type || '',
    index_value: latestData.index_value || 0,
    region: latestData.region || '',
    monthly_pct_change: latestData.monthly_pct_change || undefined,
    yearly_pct_change: latestData.yearly_pct_change || undefined,
    accumulated_pct_change: latestData.accumulated_pct_change || undefined,
    monthly_change_variation: 0
  };
  
  if (prevMonthData?.monthly_pct_change !== null && prevMonthData?.monthly_pct_change !== undefined) {
    result.monthly_change_variation = (latestData.monthly_pct_change || 0) - prevMonthData.monthly_pct_change;
  }
  
  return { data: result, error: null };
}

/**
 * Obtener metadata del IPC
 */
async function getIPCMetadata() {
  const { data: componentsData, error } = await supabase
    .from('ipc_components_metadata')
    .select('*');
    
  if (error) {
    return { error, data: null };
  }
  
  // Procesar datos
  const regions = new Set<string>();
  const componentsByType: Record<string, Array<{ code: string; name: string }>> = {};
  
  componentsData?.forEach(item => {
    if (item.region) regions.add(item.region);
    
    if (item.component_type && item.component_code) {
      if (!componentsByType[item.component_type]) {
        componentsByType[item.component_type] = [];
      }
      
      const exists = componentsByType[item.component_type].some(
        c => c.code === item.component_code
      );
      
      if (!exists) {
        componentsByType[item.component_type].push({
          code: item.component_code,
          name: item.component || ''
        });
      }
    }
  });
  
  // Obtener última actualización
  const { data: lastUpdate } = await supabase
    .from('ipc')
    .select('date')
    .order('date', { ascending: false })
    .limit(1)
    .single();
  
  return {
    data: {
      regions: Array.from(regions).sort(),
      components: componentsByType,
      metadata: {
        last_updated: lastUpdate?.date || null,
        available_formats: ['json', 'csv'],
        endpoints: {
          main: '/api/ipc',
          params: {
            type: ['latest', 'historical', 'metadata', 'components'],
            regions: Array.from(regions),
            categories: Object.values(componentsByType).flat()
          }
        }
      }
    },
    error: null
  };
}

/**
 * Obtener componentes del IPC
 */
async function getIPCComponents(componentType?: string | null) {
  let query = supabase
    .from('ipc_components_metadata')
    .select('*');
    
  if (componentType) {
    query = query.eq('component_type', componentType.toUpperCase());
  }
  
  const { data, error } = await query;
  
  if (error) {
    return { error, data: null };
  }
  
  // Agrupar por tipo
  const grouped = data?.reduce((acc, item) => {
    const type = item.component_type || 'OTROS';
    if (!acc[type]) acc[type] = [];
    acc[type].push({
      code: item.component_code,
      name: item.component,
      region: item.region
    });
    return acc;
  }, {} as Record<string, any[]>);
  
  return { data: grouped, error: null };
}

/**
 * Obtener datos históricos del IPC con paginación
 */
async function getHistoricalIPC(params: {
  category: string;
  region: string;
  componentType?: string | null;
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  limit: number;
  page: number;
  order: 'asc' | 'desc';
  includeVariations: boolean;
}) {
  const { 
    category, region, componentType, startDate, endDate, 
    month, year, limit, page, order, includeVariations 
  } = params;
  
  // Construir query
  let query = supabase
    .from('ipc_with_variations')
    .select('*', { count: 'exact' })
    .eq('component_code', category)
    .eq('region', region);
  
  // Aplicar filtros
  if (componentType) {
    query = query.eq('component_type', componentType.toUpperCase());
  }
  
  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);
  if (month) query = query.eq('month', month);
  if (year) query = query.eq('year', year);
  
  // Ordenar y paginar
  query = query.order('date', { ascending: order === 'asc' });
  
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);
  
  // Ejecutar query
  const { data, error, count } = await query;
  
  if (error) {
    return { error, data: null };
  }
  
  // Transformar datos
  const transformedData = (data || []).map(item => {
    const result: IpcResponse = {
      date: item.date || '',
      category: item.component || '',
      category_code: item.component_code || '',
      category_type: item.component_type || '',
      index_value: item.index_value || 0,
      region: item.region || '',
      monthly_change_variation: item.monthly_pct_change || 0,
    };
    
    if (includeVariations) {
      result.monthly_pct_change = item.monthly_pct_change || undefined;
      result.yearly_pct_change = item.yearly_pct_change || undefined;
      result.accumulated_pct_change = item.accumulated_pct_change || undefined;
    }
    
    return result;
  });
  
  // Calcular estadísticas
  const stats = calculateIPCStats(transformedData);
  
  // Metadata de paginación
  const totalPages = Math.ceil((count || 0) / limit);
  
  return {
    data: transformedData,
    pagination: {
      current_page: page,
      per_page: limit,
      total_pages: totalPages,
      total_records: count || 0,
      has_more: page < totalPages,
      has_previous: page > 1
    },
    stats,
    meta: {
      filtered_by: {
        category,
        region,
        component_type: componentType,
        start_date: startDate,
        end_date: endDate,
        month,
        year,
        include_variations: includeVariations
      }
    },
    error: null
  };
}

/**
 * Calcular estadísticas del IPC
 */
function calculateIPCStats(data: IpcResponse[]) {
  if (!data || data.length === 0) return null;
  
  const values = data.map(item => item.index_value).filter(v => v !== null);
  const monthlyChanges = data
    .map(item => item.monthly_pct_change)
    .filter((v): v is number => v !== undefined && v !== null);
  
  if (values.length === 0) return null;
  
  const latest = data[0];
  const oldest = data[data.length - 1];
  
  return {
    latest_value: latest?.index_value || null,
    latest_date: latest?.date || null,
    latest_monthly_change: latest?.monthly_pct_change || null,
    latest_yearly_change: latest?.yearly_pct_change || null,
    min_value: Math.min(...values),
    max_value: Math.max(...values),
    avg_value: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    total_records: data.length,
    period_change: latest && oldest ? {
      absolute: latest.index_value - oldest.index_value,
      percentage: oldest.index_value > 0 ? 
        parseFloat(((latest.index_value - oldest.index_value) / oldest.index_value * 100).toFixed(2)) : null
    } : null,
    volatility: monthlyChanges.length > 1 ? {
      avg_monthly_change: parseFloat((monthlyChanges.reduce((a, b) => a + b, 0) / monthlyChanges.length).toFixed(2)),
      std_deviation: calculateStdDev(monthlyChanges)
    } : null
  };
}

/**
 * Calcular desviación estándar
 */
function calculateStdDev(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  return parseFloat(Math.sqrt(avgSquareDiff).toFixed(2));
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