import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  EmaeRow, 
  EmaeByActivityRow,
  TimeSeriesQueryParams,
  ApiResponse,
  ApiError,
  TimeSeries,
  Frequency,
  EmaeByActivityInsert
} from '../../../types';
import { Database } from '../../../types/supabase';

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Maneja solicitudes GET para obtener datos de indicadores económicos
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const indicator = searchParams.get('indicator') || 'emae';
    
    // Mapear parámetros de consulta
    const queryParams: TimeSeriesQueryParams = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      frequency: searchParams.get('frequency') as Frequency || undefined,
      seasonally_adjusted: searchParams.get('seasonally_adjusted') === 'true',
      include_trend: searchParams.get('include_trend') === 'true',
      include_activities: searchParams.get('include_activities') === 'true'
    };

    // Buscar indicador apropiado
    switch (indicator.toLowerCase()) {
      case 'emae':
        return await getEmaeData(queryParams);
      case 'emae_by_activity':
        return await getEmaeByActivityData(queryParams);
      default:
        return NextResponse.json<ApiError>(
          { error: 'Indicador no soportado' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    return NextResponse.json<ApiError>(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Obtiene datos del EMAE general
 */
async function getEmaeData(params: TimeSeriesQueryParams) {
  let query = supabase
    .from('emae')
    .select('*');

  // Aplicar filtros de fecha si existen
  if (params.start_date) {
    query = query.gte('date', params.start_date);
  }
  if (params.end_date) {
    query = query.lte('date', params.end_date);
  }

  // Ordenar por fecha
  query = query.order('date', { ascending: true });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json<ApiError>(
      { error: 'Error al obtener datos del EMAE', details: error.message },
      { status: 500 }
    );
  }

  // Transformar datos según los parámetros
  const transformedData = transformEmaeData(data as EmaeRow[], params);

  // Obtener metadatos
  const lastUpdated = data && data.length > 0 
    ? new Date(Math.max(...data.map(d => new Date(d.created_at).getTime()))).toISOString() 
    : new Date().toISOString();

  // Construir respuesta
  const response: ApiResponse<TimeSeries> = {
    data: {
      id: 'emae',
      name: 'Estimador Mensual de Actividad Económica',
      frequency: 'monthly',
      data: transformedData
    },
    metadata: {
      count: transformedData.length,
      lastUpdated
    }
  };

  return NextResponse.json(response);
}

/**
 * Obtiene datos del EMAE por actividad económica
 */
async function getEmaeByActivityData(params: TimeSeriesQueryParams) {
  let query = supabase
    .from('emae_by_activty')
    .select('*');

  // Aplicar filtros
  if (params.start_date) {
    query = query.gte('date', params.start_date);
  }
  if (params.end_date) {
    query = query.lte('date', params.end_date);
  }

  // Ordenar por sector y fecha
  query = query.order('economy_sector', { ascending: true })
               .order('date', { ascending: true });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json<ApiError>(
      { error: 'Error al obtener datos del EMAE por actividad', details: error.message },
      { status: 500 }
    );
  }

  // Agrupar por sector económico
  const sectorGroups = groupByEconomySector(data as EmaeByActivityRow[]);

  // Obtener metadatos
  const lastUpdated = data && data.length > 0 
    ? new Date(Math.max(...data.map(d => new Date(d.created_at).getTime()))).toISOString() 
    : new Date().toISOString();

  // Construir respuesta
  const response: ApiResponse<TimeSeries[]> = {
    data: sectorGroups,
    metadata: {
      count: sectorGroups.length,
      lastUpdated
    }
  };

  return NextResponse.json(response);
}

/**
 * Transforma datos del EMAE según los parámetros solicitados
 */
function transformEmaeData(data: EmaeRow[], params: TimeSeriesQueryParams) {
  return data.map(item => {
    const point = {
      date: item.date,
      value: params.seasonally_adjusted ? item.seasonally_adjusted_value : item.original_value,
      original_value: item.original_value,
      is_seasonally_adjusted: params.seasonally_adjusted || false
    };

    // Incluir tendencia-ciclo si se solicita
    if (params.include_trend) {
      return {
        ...point,
        cycle_trend_value: item.cycle_trend_value
      };
    }

    return point;
  });
}

/**
 * Agrupa los datos de EMAE por sector económico
 */
function groupByEconomySector(data: EmaeByActivityRow[]): TimeSeries[] {
  const sectors = new Map<string, EmaeByActivityRow[]>();
  
  // Agrupar datos por sector
  data.forEach(item => {
    if (!item.economy_sector) return;
    
    if (!sectors.has(item.economy_sector)) {
      sectors.set(item.economy_sector, []);
    }
    
    sectors.get(item.economy_sector)?.push(item);
  });
  
  // Transformar a series temporales
  return Array.from(sectors.entries()).map(([sector, items]) => {
    const sectorData = items.map(item => ({
      date: item.date,
      value: item.original_value || 0,
      original_value: item.original_value || 0,
      is_seasonally_adjusted: false
    }));
    
    return {
      id: items[0]?.economy_sector_code || sector,
      name: sector,
      frequency: 'monthly',
      data: sectorData
    };
  });
}

/**
 * Maneja solicitudes POST para actualizar o crear indicadores
 * (Se implementaría para administradores o tareas programadas)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || 
        authHeader.split(' ')[1] !== process.env.API_SECRET_KEY) {
      return NextResponse.json<ApiError>(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Determinar el tipo de datos a insertar
    switch (body.indicator) {
      case 'emae':
        return await updateEmaeData(body.data);
      case 'emae_by_activity':
        return await updateEmaeByActivityData(body.data);
      default:
        return NextResponse.json<ApiError>(
          { error: 'Indicador no soportado para actualización' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error al procesar actualización:', error);
    return NextResponse.json<ApiError>(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Actualiza datos del EMAE
 */
async function updateEmaeData(data: EmaeRow[]) {
  if (!Array.isArray(data) || data.length === 0) {
    return NextResponse.json<ApiError>(
      { error: 'Datos inválidos' },
      { status: 400 }
    );
  }

  const { data: result, error } = await supabase
    .from('emae')
    .upsert(data, { onConflict: 'date' })
    .select();

  if (error) {
    return NextResponse.json<ApiError>(
      { error: 'Error al actualizar datos', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: 'Datos actualizados correctamente',
    count: result.length
  });
}

/**
 * Actualiza datos del EMAE por actividad
 */
async function updateEmaeByActivityData(data: EmaeByActivityInsert[]) {
  if (!Array.isArray(data) || data.length === 0) {
    return NextResponse.json<ApiError>(
      { error: 'Datos inválidos' },
      { status: 400 }
    );
  }

  const { data: result, error } = await supabase
    .from('emae_by_activty')
    .upsert(data, { onConflict: 'id' })
    .select();

  if (error) {
    return NextResponse.json<ApiError>(
      { error: 'Error al actualizar datos por actividad', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: 'Datos por actividad actualizados correctamente',
    count: result.length
  });
}