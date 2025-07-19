// src/app/api/dollar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
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

// Mapeo de tipos de dólar
const DOLLAR_TYPE_MAP: Record<string, string> = {
  'oficial': 'OFICIAL',
  'blue': 'BLUE',
  'bolsa': 'MEP',
  'contadoconliqui': 'CCL',
  'mayorista': 'MAYORISTA',
  'cripto': 'CRYPTO',
  'tarjeta': 'TARJETA'
};

const DOLLAR_DESCRIPTIONS: Record<string, string> = {
  'OFICIAL': 'Dólar Oficial',
  'BLUE': 'Dólar Blue (informal)',
  'MEP': 'Mercado Electrónico de Pagos (Bolsa)',
  'CCL': 'Contado con Liquidación',
  'MAYORISTA': 'Dólar Mayorista',
  'CRYPTO': 'Dólar Cripto',
  'TARJETA': 'Dólar Tarjeta/Turista'
};

/**
 * GET /api/dollar
 * 
 * Endpoint unificado para datos del dólar
 * 
 * Query Parameters:
 * - type: 'latest' | 'historical' | 'metadata' (default: 'latest')
 * - dollar_type: string (código del tipo de dólar, separado por comas para múltiples)
 * - start_date: string (YYYY-MM-DD)
 * - end_date: string (YYYY-MM-DD)
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
    const validTypes = ['latest', 'historical', 'metadata'];
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
        result = await getLatestDollar(dollarTypeParam, includeVariations);
        break;
        
      case 'metadata':
        result = await getDollarMetadata();
        break;
        
      case 'historical':
      default:
        result = await getHistoricalDollar({
          dollarType: dollarTypeParam ?? undefined,
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
    if (result.error) {
      throw result.error;
    }
    
    // Formato CSV si se solicita
    if (format === 'csv' && type === 'historical' && Array.isArray(result.data)) {
      return respondWithCSV(result.data, 'dollar_rates.csv');
    }
    
    // Respuesta JSON con caché
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' // 5 minutos
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
 * Obtener el último valor de cada tipo de dólar con variaciones
 */
async function getLatestDollar(dollarTypeParam?: string, includeVariations: boolean = true) {
  try {
    // Obtener los últimos valores
    let query = supabase
      .from('dollar_rates')
      .select('*');
    
    // Si se especifica tipo de dólar
    if (dollarTypeParam) {
      if (dollarTypeParam.includes(',')) {
        const types = dollarTypeParam.split(',').map(t => t.trim());
        query = query.in('dollar_type', types);
      } else {
        query = query.eq('dollar_type', dollarTypeParam);
      }
    }
    
    // Obtener los datos más recientes por tipo
    const { data: latestData, error } = await query
      .order('updated_at', { ascending: false })
      .order('dollar_type');
    
    if (error) {
      return { error, data: null };
    }
    
    if (!latestData || latestData.length === 0) {
      return { 
        error: new Error('No se encontraron datos de dólar'),
        data: null 
      };
    }
    
    // Agrupar por tipo de dólar y obtener el más reciente de cada uno
    const latestByType: Record<string, any> = {};
    latestData.forEach(item => {
      // Usar created_at en vez de updated_at, ya que updated_at no existe en el tipo
      if (
        !latestByType[item.dollar_type] ||
        new Date(item.created_at ?? 0) > new Date(latestByType[item.dollar_type].created_at ?? 0)
      ) {
        latestByType[item.dollar_type] = item;
      }
    });
    // Convertir a array
    const latestRates = Object.values(latestByType);
    
    // Si se requieren variaciones, calcularlas
    if (includeVariations) {
      const ratesWithVariations = await Promise.all(
        latestRates.map(async (rate) => {
          // Obtener el cierre del día anterior
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(23, 59, 59, 999);
          
          const { data: yesterdayData } = await supabase
            .from('dollar_rates')
            .select('*')
            .eq('dollar_type', rate.dollar_type)
            .lte('updated_at', yesterday.toISOString())
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();
          
          let buyVariation = null;
          let sellVariation = null;
          
          if (yesterdayData) {
            buyVariation = ((rate.buy_price - yesterdayData.buy_price) / yesterdayData.buy_price * 100);
            sellVariation = ((rate.sell_price - yesterdayData.sell_price) / yesterdayData.sell_price * 100);
          }
          
          return {
            date: rate.date,
            dollar_type: rate.dollar_type,
            dollar_name: DOLLAR_DESCRIPTIONS[rate.dollar_type] || rate.dollar_type,
            buy_price: Number(rate.buy_price),
            sell_price: Number(rate.sell_price),
            spread: Number(((rate.sell_price - rate.buy_price) / rate.buy_price * 100).toFixed(2)),
            buy_variation: buyVariation !== null ? Number(buyVariation.toFixed(2)) : null,
            sell_variation: sellVariation !== null ? Number(sellVariation.toFixed(2)) : null,
            last_updated: rate.updated_at
          };
        })
      );
      
      return { data: ratesWithVariations, error: null };
    }
    
    // Sin variaciones
    const transformedData = latestRates.map(rate => ({
      date: rate.date,
      dollar_type: rate.dollar_type,
      dollar_name: DOLLAR_DESCRIPTIONS[rate.dollar_type] || rate.dollar_type,
      buy_price: Number(rate.buy_price),
      sell_price: Number(rate.sell_price),
      spread: Number(((rate.sell_price - rate.buy_price) / rate.buy_price * 100).toFixed(2)),
      last_updated: rate.updated_at
    }));
    
    return { data: transformedData, error: null };
    
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

/**
 * Obtener metadata del dólar
 */
async function getDollarMetadata() {
  try {
    // Obtener tipos únicos de dólar
    const { data: typesData, error: typesError } = await supabase
      .from('dollar_rates')
      .select('dollar_type')
      .order('dollar_type');
    
    if (typesError) {
      return { error: typesError, data: null };
    }
    
    // Obtener tipos únicos
    const uniqueTypes = [...new Set(typesData?.map(item => item.dollar_type) || [])];
    
    // Obtener rango de fechas
    const { data: dateRangeData, error: dateRangeError } = await supabase
      .from('dollar_rates')
      .select('date, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (dateRangeError) {
      return { error: dateRangeError, data: null };
    }
    
    const { data: firstDateData } = await supabase
      .from('dollar_rates')
      .select('date, updated_at')
      .order('updated_at', { ascending: true })
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
    
    return {
      data: {
        dollar_types: uniqueTypes.map(type => ({
          code: type,
          name: DOLLAR_DESCRIPTIONS[type] || type,
          count: typeCounts[type] || 0
        })),
        date_range: {
          first_date: Array.isArray(firstDateData) && firstDateData[0] && 'date' in firstDateData[0] ? (firstDateData[0] as any).date || null : null,
          last_date: Array.isArray(dateRangeData) && dateRangeData[0] && 'date' in dateRangeData[0] ? (dateRangeData[0] as any).date || null : null,
          first_update: Array.isArray(firstDateData) && firstDateData[0] && 'updated_at' in firstDateData[0] ? (firstDateData[0] as any).updated_at || null : null,
          last_update: Array.isArray(dateRangeData) && dateRangeData[0] && 'updated_at' in dateRangeData[0] ? (dateRangeData[0] as any).updated_at || null : null
        },
        metadata: {
          data_source: 'dolarapi.com',
          last_updated: new Date().toISOString(),
          available_formats: ['json', 'csv'],
          endpoints: {
            main: '/api/dollar',
            params: {
              type: ['latest', 'historical', 'metadata'],
              dollar_types: uniqueTypes
            }
          },
          refresh_frequency: 'Every 5 minutes'
        }
      },
      error: null
    };
    
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

/**
 * Obtener datos históricos del dólar
 */
async function getHistoricalDollar(params: {
  dollarType?: string;
  startDate?: string;
  endDate?: string;
  limit: number;
  page: number;
  order: 'asc' | 'desc';
  includeVariations: boolean;
}) {
  const { dollarType, startDate, endDate, limit, page, order, includeVariations } = params;
  
  try {
    // Construir query
    let query = supabase
      .from('dollar_rates')
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
    
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    
    // Ordenar y paginar
    query = query.order('date', { ascending: order === 'asc' })
      .order('dollar_type');
    
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Ejecutar query
    const { data, error, count } = await query;
    
    if (error) {
      return { error, data: null };
    }
    
    // Transformar datos
    const transformedData = (data || []).map(item => ({
      date: item.date,
      dollar_type: item.dollar_type,
      dollar_name: DOLLAR_DESCRIPTIONS[item.dollar_type] || item.dollar_type,
      buy_price: Number(item.buy_price),
      sell_price: Number(item.sell_price),
      spread: Number(((item.sell_price - item.buy_price) / item.buy_price * 100).toFixed(2)),
      last_updated: item.created_at // Corregido: usar 'created_at' en vez de 'updated_at'
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
          dollar_type: dollarType,
          start_date: startDate,
          end_date: endDate
        }
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