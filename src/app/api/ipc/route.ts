// src/app/api/ipc/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { IpcRow, IpcResponse } from '@/types';
import { cache } from 'react';

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Unable to initialize Supabase client. Missing environment variables: ${
      !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : ''
    }${!supabaseKey ? 'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY' : ''}`
  );
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Función en caché para obtener datos del IPC
const getCachedIpcData = cache(async (
  startDate: string | null,
  endDate: string | null,
  month: number | null,
  year: number | null,
  limit: number,
  page: number,
  format: string,
  componentType: string | null,
  componentCode: string,
  region: string,
  includeVariations: boolean
) => {
  console.log('Fetching IPC data from database');
  
  // Si es formato CSV, usar un límite mucho mayor
  const isCSV = format.toLowerCase() === 'csv';
  const effectiveLimit = isCSV ? 10000 : limit;
  
  // Calcular offset para paginación
  const offset = (page - 1) * effectiveLimit;
  
  // Construir consulta base - ahora usando la vista que incluye variaciones
  let query = supabase
    .from('ipc_with_variations')
    .select('*');
  
  // Aplicar filtros si existen
  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  // Filtrar por tipo de componente si se especifica
  if (componentType) {
    query = query.eq('component_type', componentType);
  }
  
  // Filtrar por código de componente si se especifica
  if (componentCode) {
    query = query.eq('component_code', componentCode);
  }
  
  // Filtrar por región
  if (region) {
    query = query.eq('region', region);
  }
  
  // Ordenar resultados
  query = query.order('date', { ascending: false });
  
  // Ejecutar consulta sin paginación para obtener todos los datos y filtrarlos después
  const { data: allData, error } = await query;
  
  if (error) {
    throw new Error(`Error al consultar datos IPC: ${error.message}`);
  }
  
  // Filtrar por mes y/o año en JavaScript
  let filteredData = allData || [];
  
  if (month !== null || year !== null) {
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.date + 'T00:00:00');
      
      if (month !== null && year !== null) {
        // Filtrar por mes y año
        return itemDate.getMonth() + 1 === month && itemDate.getFullYear() === year;
      } else if (month !== null) {
        // Filtrar solo por mes
        return itemDate.getMonth() + 1 === month;
      } else if (year !== null) {
        // Filtrar solo por año
        return itemDate.getFullYear() === year;
      }
      
      return true;
    });
  }
  
  // Calcular el conteo total después del filtrado
  const totalCount = filteredData.length;
  
  // Aplicar paginación manualmente
  const paginatedData = filteredData.slice(offset, offset + effectiveLimit);
  
  // Transformar datos para la respuesta
  const transformedData = paginatedData.map(item => {
    // Crear objeto base con propiedades obligatorias
    const result: IpcResponse = {
      date: item.date || '', 
      category: item.component || '',
      category_code: item.component_code || '',
      category_type: item.component_type || '',
      index_value: item.index_value || 0,
      region: item.region || ''
    };
    
    // Añadir variaciones solo si se solicitan
    if (includeVariations) {
      result.monthly_pct_change = item.monthly_pct_change || undefined;
      result.yearly_pct_change = item.yearly_pct_change || undefined;
      result.accumulated_pct_change = item.accumulated_pct_change || undefined;
    }
    
    return result;
  });
  
  return {
    data: transformedData,
    totalCount,
    metadata: {
      count: transformedData.length,
      total_count: totalCount,
      page,
      limit: effectiveLimit,
      start_date: startDate,
      end_date: endDate,
      month,
      year,
      component_type: componentType,
      component_code: componentCode,
      region: region,
      include_variations: includeVariations
    }
  };
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Obtener parámetros de consulta y normalizar strings a minúsculas
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '12');
    const page = parseInt(searchParams.get('page') || '1');
    const format = searchParams.get('format')?.toLowerCase() || 'json';
    const componentType = searchParams.get('component_type')?.toLowerCase() || null;
    const componentCode = (searchParams.get('category') || 'GENERAL').toUpperCase();
    const region = searchParams.get('region')?.toLowerCase() || 'nacional';
    const includeVariations = searchParams.get('include_variations')?.toLowerCase() !== 'false';
    
    // Convertir mes y año a números o null
    const month = monthParam ? parseInt(monthParam) : null;
    const year = yearParam ? parseInt(yearParam) : null;
    
    // Normalizar región (primera letra mayúscula, resto minúsculas)
    const normalizedRegion = region.charAt(0).toUpperCase() + region.slice(1).toLowerCase();
    
    // Obtener datos en caché
    const { data: transformedData, totalCount, metadata } = await getCachedIpcData(
      startDate,
      endDate,
      month,
      year,
      limit,
      page,
      format,
      componentType,
      componentCode,
      normalizedRegion,
      includeVariations
    );
    
    // Responder en el formato solicitado 
    if (format === 'csv') {
      return respondWithCSV(transformedData, 'ipc_data.csv');
    }
    
    // Configurar caché para 1 hora
    const CACHE_MAX_AGE = 3600; // 1 hora en segundos
    const CACHE_STALE_WHILE_REVALIDATE = 86400; // 24 horas
    
    // Configurar encabezados de caché
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`);
    
    // Calcular información de paginación
    const totalPages = Math.ceil(totalCount / limit);
    
    // Responder con JSON por defecto
    return new NextResponse(JSON.stringify({
      data: transformedData,
      metadata,
      pagination: {
        page,
        limit,
        total_items: totalCount,
        total_pages: totalPages,
        has_more: page < totalPages
      }
    }), { 
      status: 200, 
      headers 
    });
    
  } catch (error) {
    console.error('Error en la API de IPC:', error);
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

/**
 * Genera una respuesta en formato CSV con codificación UTF-8
 */
function respondWithCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: 'No hay datos para exportar' },
      { status: 404 }
    );
  }
  
  // Obtener las cabeceras del CSV
  const headers = Object.keys(data[0]);
  
  // Generar contenido CSV
  let csvContent = headers.join(',') + '\n';
  
  // Agregar filas de datos
  csvContent += data.map(row => {
    return headers
      .map(header => {
        // Formatear el valor según el tipo
        const value = row[header];
        // Si es string y contiene comas o comillas, rodearlo con comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== null && value !== undefined ? value : '';
      })
      .join(',');
  }).join('\n');
  
  // Agregar BOM (Byte Order Mark) para indicar que es UTF-8
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  
  // Configurar la respuesta HTTP con codificación UTF-8 explícita
  return new NextResponse(csvWithBOM, {
    headers: {
      'Content-Type': 'text/csv; charset=UTF-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}

// Revalidación programada cada hora
export const revalidate = 3600; // 1 hora