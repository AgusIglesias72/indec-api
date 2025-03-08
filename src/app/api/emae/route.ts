// src/app/api/emae/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { EmaeResponse } from '@/types';
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

// Función en caché para obtener datos del EMAE
const getCachedEmaeData = cache(async (
  startDate: string | null,
  endDate: string | null,
  month: number | null,
  year: number | null,
  limit: number,
  page: number,
  format: string,
  sectorCode: string,
  includeVariations: boolean,
  byActivity: boolean
) => {
  
  // Si es formato CSV, usar un límite mucho mayor
  const isCSV = format.toLowerCase() === 'csv';
  const effectiveLimit = isCSV ? 10000 : limit;
  
  // Calcular offset para paginación
  const offset = (page - 1) * effectiveLimit;
  
  // Determinar qué vista usar según si queremos datos por actividad o generales
  const viewName = byActivity ? 'emae_by_activity_with_variations' : 'emae_with_variations';
  
  // Construir consulta base usando la vista correspondiente
  let query = supabase
    .from(viewName)
    .select('*');
  
  // Aplicar filtros si existen
  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  // Filtrar por código de sector si se especifica y no es 'GENERAL' o estamos en modo por actividad
  if (sectorCode && (sectorCode !== 'GENERAL' || byActivity)) {
    query = query.eq('sector_code', sectorCode);
  }
  
  // Ordenar resultados
  query = query.order('date', { ascending: false });
  
  // Ejecutar consulta sin paginación para obtener todos los datos y filtrarlos después
  const { data: allData, error } = await query;
  
  if (error) {
    throw new Error(`Error al consultar datos EMAE: ${error.message}`);
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
    const result: EmaeResponse = {
      date: item.date || '',
      sector: item.sector || '',
      sector_code: item.sector_code || '',
      original_value: item.original_value || 0
    };
    
    // Añadir propiedades opcionales solo si existen
    if ('seasonally_adjusted_value' in item) {
      result.seasonally_adjusted_value = item.seasonally_adjusted_value || 0;
    }
    
    if ('cycle_trend_value' in item) {
      result.trend_cycle_value = item.cycle_trend_value || 0;
    }
    
    // Añadir variaciones solo si se solicitan
    if (includeVariations) {
      if ('monthly_pct_change' in item) {
        result.monthly_pct_change = item.monthly_pct_change || undefined;
      }
      if ('yearly_pct_change' in item) {
        result.yearly_pct_change = item.yearly_pct_change || undefined;
      }
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
      sector_code: sectorCode,
      include_variations: includeVariations,
      by_activity: byActivity
    }
  };
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Obtener parámetros de consulta
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const limitParam = searchParams.get('limit') || '12';
    const pageParam = searchParams.get('page') || '1';
    const format = searchParams.get('format') || 'json';
    const sectorCode = searchParams.get('sector')?.toUpperCase() || 'GENERAL';
    const includeVariations = searchParams.get('include_variations') !== 'false';
    const byActivity = searchParams.get('by_activity') === 'true';
    
    // Convertir parámetros a tipos adecuados
    const limit = parseInt(limitParam);
    const page = parseInt(pageParam);
    const month = monthParam ? parseInt(monthParam) : null;
    const year = yearParam ? parseInt(yearParam) : null;
    
    // Obtener datos en caché
    const { data: transformedData, totalCount, metadata } = await getCachedEmaeData(
      startDate,
      endDate,
      month,
      year,
      limit,
      page,
      format,
      sectorCode,
      includeVariations,
      byActivity
    );
    
    // Responder en el formato solicitado 
    if (format === 'csv') {
      return respondWithCSV(transformedData, 'emae_data.csv');
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
    console.error('Error en la API de EMAE:', error);
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