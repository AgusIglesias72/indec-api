// src/app/api/ipc/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { IpcResponse } from '@/types';

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
    
    // Obtener parámetros de consulta y normalizar strings a minúsculas
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const format = searchParams.get('format')?.toLowerCase() || 'json';
    const componentType = searchParams.get('component_type')?.toLowerCase() || null;
    const componentCode = (searchParams.get('category') || 'GENERAL').toUpperCase();
    const region = searchParams.get('region')?.toLowerCase() || 'nacional';
    const includeVariations = searchParams.get('include_variations')?.toLowerCase() !== 'false';
    
    // Normalizar región (primera letra mayúscula, resto minúsculas) 
    // Excepto GBA, eso va todo en mayúsculas
    let normalizedRegion;
    if (region === 'gba') {
      normalizedRegion = 'GBA';
    } else {
      normalizedRegion = region.charAt(0).toUpperCase() + region.slice(1).toLowerCase();
    }
    

    
    // Construir consulta base - usando la vista que incluye variaciones
    let query = supabase
      .from('ipc_with_variations')
      .select('*');
    
    // Aplicar filtros directamente en la base de datos
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Filtrar por tipo de componente si se especifica
    if (componentType) {
      query = query.eq('component_type', componentType.toUpperCase());
    }
    
    // Filtrar por código de componente
    query = query.eq('component_code', componentCode);
    
    // Filtrar por región
    query = query.eq('region', normalizedRegion);
    
    // Filtrar por mes y año si se especifican
    if (monthParam) {
      const month = parseInt(monthParam);
      query = query.eq('month', month);
    }
    
    if (yearParam) {
      const year = parseInt(yearParam);
      query = query.eq('year', year);
    }
    
    // Ordenar resultados
    query = query.order('date', { ascending: false });
    
    // Ejecutar consulta
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(`Error al consultar datos IPC: ${error.message}`);
    }
    
    // Transformar datos para la respuesta
    const transformedData = (data || []).map(item => {
      // Crear objeto base con propiedades obligatorias
      const result: IpcResponse = {
        date: item.date || '', 
        category: item.component || '',
        category_code: item.component_code || '',
        category_type: item.component_type || '',
        index_value: item.index_value || 0,
        region: item.region || '',
        monthly_change_variation: 0
      };
      
      // Añadir variaciones solo si se solicitan
      if (includeVariations) {
        result.monthly_pct_change = item.monthly_pct_change || undefined;
        result.yearly_pct_change = item.yearly_pct_change || undefined;
        result.accumulated_pct_change = item.accumulated_pct_change || undefined;
      }
      
      return result;
    });
    
    // Si se solicita formato CSV, responder con CSV
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
    
    // Responder con JSON por defecto
    return new NextResponse(JSON.stringify({
      data: transformedData,
      metadata: {
        count: transformedData.length,
        filtered_by: {
          start_date: startDate,
          end_date: endDate,
          month: monthParam ? parseInt(monthParam) : null,
          year: yearParam ? parseInt(yearParam) : null,
          component_type: componentType,
          component_code: componentCode,
          region: normalizedRegion,
          include_variations: includeVariations
        }
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