// src/app/api/emae/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { EmaeResponse } from '@/types';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Obtener parámetros de consulta
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const format = searchParams.get('format') || 'json';
    const sectorCode = searchParams.get('sector')?.toUpperCase() || 'GENERAL';
    const includeVariations = searchParams.get('include_variations') !== 'false';
    const byActivity = searchParams.get('by_activity') === 'true';
    
    // Convertir parámetros a tipos adecuados
    const month = monthParam ? parseInt(monthParam) : null;
    const year = yearParam ? parseInt(yearParam) : null;
    
    // Determinar qué vista usar según si queremos datos por actividad o generales
    const viewName = byActivity ? 'emae_by_activity_with_variations' : 'emae_with_variations';
    
    // Construir consulta base usando la vista correspondiente
    let query = supabase
      .from(viewName)
      .select('*');
    
    // Aplicar filtros directamente en la base de datos
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Aplicar filtros de mes y año directamente en la consulta SQL
    if (month !== null) {
      // En Supabase, podemos usar el operador 'eq' en campos adicionales extraídos con RPC o funciones
      query = query.eq('month', month);
    }
    
    if (year !== null) {
      query = query.eq('year', year);
    }
    
    // Filtrar por código de sector si se especifica y no es 'GENERAL' o estamos en modo por actividad
    if (sectorCode && (sectorCode !== 'GENERAL' || byActivity)) {
      query = query.eq('sector_code', sectorCode);
    }
    
    // Ordenar resultados
    query = query.order('date', { ascending: false });
    
    // Ejecutar consulta sin paginación
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(`Error al consultar datos EMAE: ${error.message}`);
    }
    
    // Transformar datos para la respuesta
    const transformedData = (data || []).map(item => {
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
    
    // Responder en el formato solicitado 
    if (format.toLowerCase() === 'csv') {
      return respondWithCSV(transformedData, 'emae_data.csv');
    }
    
    // Configurar caché para 1 hora
    const CACHE_MAX_AGE = 3600; // 1 hora en segundos
    const CACHE_STALE_WHILE_REVALIDATE = 86400; // 24 horas
    
    // Configurar encabezados de caché
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`);
    
    // Responder con JSON por defecto
    return new NextResponse(JSON.stringify({
      data: transformedData,
      metadata: {
        count: transformedData.length,
        start_date: startDate,
        end_date: endDate,
        month,
        year,
        sector_code: sectorCode,
        include_variations: includeVariations,
        by_activity: byActivity
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
export const revalidate = 60; // 1 hora