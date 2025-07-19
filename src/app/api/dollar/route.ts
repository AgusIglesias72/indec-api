// src/app/api/dollar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { withRateLimit } from '@/lib/rate-limit';

// Configurar runtime
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

const DOLLAR_DESCRIPTIONS: Record<string, string> = {
  'OFICIAL': 'Dólar Oficial',
  'BLUE': 'Dólar Blue (informal)',
  'MEP': 'Mercado Electrónico de Pagos (Bolsa)',
  'CCL': 'Contado con Liquidación',
  'MAYORISTA': 'Dólar Mayorista',
  'CRYPTO': 'Dólar Cripto',
  'TARJETA': 'Dólar Tarjeta/Turista'
};

// Tipos de respuesta de las views
interface DollarRateRow {
  id?: string | null;
  dollar_type: string | null;
  date: string | null;
  buy_price: number | null;
  sell_price: number | null;
  updated_at: string | null;
  created_at: string | null;
}

interface DollarLatestRow {
  dollar_type: string | null;
  date: string | null;
  buy_price: number | null;
  sell_price: number | null;
  spread: number | null;
  updated_at: string | null;
  created_at: string | null;
}

interface DollarWithVariationsRow extends DollarLatestRow {
  yesterday_buy: number | null;
  yesterday_sell: number | null;
  buy_variation: number | null;
  sell_variation: number | null;
}

interface DollarDailyClosingRow {
  id: string | null;
  dollar_type: string | null;
  closing_date: string | null;
  closing_timestamp: string | null;
  buy_price: number | null;
  sell_price: number | null;
  spread: number | null;
  updated_at: string | null;
  created_at: string | null;
}

/**
 * GET /api/dollar
 * 
 * Endpoint unificado para datos del dólar
 * 
 * Query Parameters:
 * - type: 'latest' | 'historical' | 'daily' | 'metadata' (default: 'latest')
 * - dollar_type: string (código del tipo de dólar, separado por comas para múltiples)
 * - start_date: string (YYYY-MM-DD)
 * - end_date: string (YYYY-MM-DD)
 * - limit: number (max: 1000)
 * - page: number
 * - order: 'asc' | 'desc' (default: 'desc')
 * - format: 'json' | 'csv' (default: 'json')
 * - include_variations: boolean (default: true para latest)
 */
async function handler(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Extraer parámetros
    const type = searchParams.get('type') || 'latest';
    const dollarTypeParam = searchParams.get('dollar_type')?.toUpperCase();
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), MAX_LIMIT);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const order = searchParams.get('order') || 'desc';
    const format = searchParams.get('format')?.toLowerCase() || 'json';
    const includeVariations = searchParams.get('include_variations')?.toLowerCase() !== 'false';
    
    // Validar tipo
    const validTypes = ['latest', 'historical', 'daily', 'metadata'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Tipo inválido',
        validTypes
      }, { status: 400 });
    }
    
    // Manejar diferentes tipos de consulta
    let result;
    switch (type) {
      case 'latest':
        result = await getLatestDollarFromView(dollarTypeParam, includeVariations);
        break;
        
      case 'daily':
        result = await getDailyClosingFromView({
          dollarType: dollarTypeParam,
          startDate: startDate ?? undefined,
          endDate: endDate ?? undefined,
          limit,
          page,
          order: order as 'asc' | 'desc'
        });
        break;
        
      case 'metadata':
        result = await getDollarMetadata();
        break;
        
      case 'historical':
      default:
        result = await getHistoricalDollar({
          dollarType: dollarTypeParam,
          startDate: startDate ?? undefined,
          endDate: endDate ?? undefined,
          limit,
          page,
          order: order as 'asc' | 'desc'
        });
        break;
    }
    
    // Manejar errores
    if (result.error) {
      throw result.error;
    }
    
    // Formato CSV si se solicita
    if (format === 'csv' && (type === 'historical' || type === 'daily') && Array.isArray(result.data)) {
      return respondWithCSV(result.data, `dollar_${type}.csv`);
    }
    
    // Respuesta JSON con caché
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': type === 'metadata' 
        ? 'public, max-age=3600, stale-while-revalidate=7200' // 1 hora para metadata
        : 'public, max-age=300, stale-while-revalidate=600' // 5 minutos para datos
    });
    
    return new NextResponse(JSON.stringify({
      success: true,
      type,
      data: result.data,
      meta: (result as any).meta || {
        type,
        timestamp: new Date().toISOString()
      },
      ...(typeof (result as any).pagination !== 'undefined' ? { pagination: (result as any).pagination } : {}),
      ...(typeof (result as any).stats !== 'undefined' ? { stats: (result as any).stats } : {})
    }), { 
      status: 200, 
      headers 
    });
    
  } catch (error) {
    console.error('Error en API Dollar:', error);
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
 * Obtener el último valor de cada tipo de dólar usando la view optimizada
 */
async function getLatestDollarFromView(dollarTypeParam?: string, includeVariations: boolean = true) {
  try {
    // Usar la view con variaciones si se requieren
    const viewName = includeVariations ? 'v_dollar_with_variations' : 'v_dollar_latest';
    
    let query = supabase.from(viewName).select('*');
    
    // Filtrar por tipo si se especifica
    if (dollarTypeParam) {
      if (dollarTypeParam.includes(',')) {
        const types = dollarTypeParam.split(',').map(t => t.trim());
        query = query.in('dollar_type', types);
      } else {
        query = query.eq('dollar_type', dollarTypeParam);
      }
    }
    
    const { data, error } = await query.order('dollar_type');
    
    if (error) {
      return { error, data: null };
    }
    
    if (!data || data.length === 0) {
      return { 
        error: new Error('No se encontraron datos de dólar'),
        data: null 
      };
    }
    
    // Transformar datos según la view utilizada
    const transformedData = (data as (DollarLatestRow | DollarWithVariationsRow)[]).map(item => {
      const baseData = {
        date: item.date || '',
        dollar_type: item.dollar_type || '',
        dollar_name: (item.dollar_type && DOLLAR_DESCRIPTIONS[item.dollar_type]) || item.dollar_type || '',
        buy_price: Number(item.buy_price || 0),
        sell_price: Number(item.sell_price || 0),
        spread: (item.spread !== null && item.spread !== undefined) ? Number(item.spread) : Number((((item.sell_price || 0) - (item.buy_price || 0)) / (item.buy_price || 1) * 100).toFixed(2)),
        last_updated: item.date || '',
        minutes_ago: Math.floor((Date.now() - new Date(item.date || Date.now()).getTime()) / 60000)
      };
      
      // Agregar variaciones si están disponibles
      if (includeVariations && 'buy_variation' in item) {
        return {
          ...baseData,
          buy_variation: (item.buy_variation !== null && item.buy_variation !== undefined) ? Number(item.buy_variation) : 0,
          sell_variation: (item.sell_variation !== null && item.sell_variation !== undefined) ? Number(item.sell_variation) : 0
        };
      }
      
      return baseData;
    });
    
    return { data: transformedData, error: null };
    
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

/**
 * Obtener cierres diarios usando la view optimizada
 */
async function getDailyClosingFromView(params: {
  dollarType?: string;
  startDate?: string;
  endDate?: string;
  limit: number;
  page: number;
  order: 'asc' | 'desc';
}) {
  const { dollarType, startDate, endDate, limit, page, order } = params;
  
  try {
    // Usar la view de cierre diario
    let query = supabase
      .from('v_dollar_daily_closing')
      .select('*', { count: 'exact' });
    
    // Filtros
    if (dollarType) {
      if (dollarType.includes(',')) {
        const types = dollarType.split(',').map(t => t.trim());
        query = query.in('dollar_type', types);
      } else {
        query = query.eq('dollar_type', dollarType);
      }
    }
    
    if (startDate) query = query.gte('closing_date', startDate);
    if (endDate) query = query.lte('closing_date', endDate);
    
    // Ordenar y paginar
    query = query.order('closing_date', { ascending: order === 'asc' });
    query = query.order('dollar_type');
    
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Ejecutar query
    const { data, error, count } = await query;
    
    if (error) {
      return { error, data: null };
    }
    
    // Transformar datos
    const transformedData = ((data || []) as DollarDailyClosingRow[]).map(item => ({
      date: item.closing_date || '',
      closing_timestamp: item.closing_timestamp || '',
      dollar_type: item.dollar_type || '',
      dollar_name: (item.dollar_type && DOLLAR_DESCRIPTIONS[item.dollar_type]) || item.dollar_type || '',
      buy_price: Number(item.buy_price || 0),
      sell_price: Number(item.sell_price || 0),
      spread: (item.spread !== null && item.spread !== undefined) ? Number(item.spread) : Number((((item.sell_price || 0) - (item.buy_price || 0)) / (item.buy_price || 1) * 100).toFixed(2)),
      last_updated: item.updated_at || ''
    }));
    
    // Calcular estadísticas
    const stats = calculateDollarStats(transformedData);
    
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
          dollar_type: dollarType || null,
          start_date: startDate || null,
          end_date: endDate || null
        },
        description: 'Cierre diario de cada tipo de dólar (último valor del día)'
      },
      error: null
    };
    
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

/**
 * Obtener metadata del dólar (sin cambios, usa la tabla directa)
 */
async function getDollarMetadata() {
  try {
    // Obtener tipos únicos de dólar (excluyendo SOLIDARIO)
    const { data: typesData, error: typesError } = await supabase
      .from('dollar_rates')
      .select('dollar_type')
      .neq('dollar_type', 'SOLIDARIO')
      .order('dollar_type');
    
    if (typesError) {
      return { error: typesError, data: null };
    }
    
    // Obtener tipos únicos
    const uniqueTypes = [...new Set(typesData?.map(item => item.dollar_type).filter(Boolean) || [])] as string[];
    
    // Obtener rango de fechas
    const { data: dateRangeData } = await supabase
      .from('dollar_rates')
      .select('date, updated_at')
      .neq('dollar_type', 'SOLIDARIO')
      .order('date', { ascending: false })
      .limit(1);
    
    const { data: firstDateData } = await supabase
      .from('dollar_rates')
      .select('date, updated_at')
      .neq('dollar_type', 'SOLIDARIO')
      .order('date', { ascending: true })
      .limit(1);
    
    // Contar registros por tipo
    const typeCounts: Record<string, number> = {};
    for (const type of uniqueTypes) {
      const { count } = await supabase
        .from('dollar_rates')
        .select('*', { count: 'exact', head: true })
        .eq('dollar_type', type);
      
      typeCounts[type] = count || 0;
    }
    
    // Contar registros únicos por día (para cierres diarios)
    const { count: dailyCount } = await supabase
      .from('v_dollar_daily_closing')
      .select('*', { count: 'exact', head: true });
    
    const firstDate = firstDateData?.[0] as DollarRateRow | undefined;
    const lastDate = dateRangeData?.[0] as DollarRateRow | undefined;
    
    return {
      data: {
        dollar_types: uniqueTypes.map(type => ({
          code: type,
          name: DOLLAR_DESCRIPTIONS[type] || type,
          count: typeCounts[type] || 0
        })),
        date_range: {
          first_date: (firstDate && firstDate.date) || null,
          last_date: (lastDate && lastDate.date) || null,
          first_update: (firstDate && firstDate.updated_at) || null,
          last_update: (lastDate && lastDate.updated_at) || null,
          unique_days: dailyCount || 0
        },
        metadata: {
          data_source: 'dolarapi.com',
          last_updated: new Date().toISOString(),
          available_formats: ['json', 'csv'],
          endpoints: {
            main: '/api/dollar',
            params: {
              type: ['latest', 'historical', 'daily', 'metadata'],
              dollar_types: uniqueTypes
            }
          },
          refresh_frequency: 'Multiple updates per day for active markets',
          views_available: [
            'v_dollar_latest (últimos valores)',
            'v_dollar_with_variations (con variaciones)',
            'v_dollar_daily_closing (cierre diario)'
          ]
        }
      },
      error: null
    };
    
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

/**
 * Obtener datos históricos del dólar (todos los registros intradiarios)
 */
async function getHistoricalDollar(params: {
  dollarType?: string;
  startDate?: string;
  endDate?: string;
  limit: number;
  page: number;
  order: 'asc' | 'desc';
}) {
  const { dollarType, startDate, endDate, limit, page, order } = params;
  
  try {
    // Construir query
    let query = supabase
      .from('dollar_rates')
      .select('*', { count: 'exact' })
      .neq('dollar_type', 'SOLIDARIO'); // Excluir SOLIDARIO
    
    // Filtros
    if (dollarType) {
      if (dollarType.includes(',')) {
        const types = dollarType.split(',').map(t => t.trim());
        query = query.in('dollar_type', types);
      } else {
        query = query.eq('dollar_type', dollarType);
      }
    }
    
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    
    // Ordenar y paginar
    query = query
      .order('date', { ascending: order === 'asc' })
      .order('dollar_type');
    
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Ejecutar query
    const { data, error, count } = await query;
    
    if (error) {
      return { error, data: null };
    }
    
    // Transformar datos
    const transformedData = ((data || []) as DollarRateRow[]).map(item => ({
      date: item.date || '',
      dollar_type: item.dollar_type || '',
      dollar_name: (item.dollar_type && DOLLAR_DESCRIPTIONS[item.dollar_type]) || item.dollar_type || '',
      buy_price: Number(item.buy_price || 0),
      sell_price: Number(item.sell_price || 0),
      spread: Number((((item.sell_price || 0) - (item.buy_price || 0)) / (item.buy_price || 1) * 100).toFixed(2)),
      last_updated: item.date || ''
    }));
    
    // Calcular estadísticas
    const stats = calculateDollarStats(transformedData);
    
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
          dollar_type: dollarType || null,
          start_date: startDate || null,
          end_date: endDate || null
        },
        description: 'Datos históricos completos (incluye múltiples actualizaciones diarias)'
      },
      error: null
    };
    
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

/**
 * Calcular estadísticas del dólar
 */
function calculateDollarStats(data: any[]) {
  if (!data || data.length === 0) return null;
  
  const buyPrices = data.map(item => item.buy_price);
  const sellPrices = data.map(item => item.sell_price);
  
  return {
    buy_price: {
      min: Math.min(...buyPrices),
      max: Math.max(...buyPrices),
      avg: Number((buyPrices.reduce((a, b) => a + b, 0) / buyPrices.length).toFixed(2))
    },
    sell_price: {
      min: Math.min(...sellPrices),
      max: Math.max(...sellPrices),
      avg: Number((sellPrices.reduce((a, b) => a + b, 0) / sellPrices.length).toFixed(2))
    },
    avg_spread: Number((data.reduce((a, b) => a + b.spread, 0) / data.length).toFixed(2)),
    total_records: data.length
  };
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