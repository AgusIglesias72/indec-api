// src/app/api/emae/sectors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

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
    const { searchParams } = new URL(request.url);
    
    // Parámetros de filtrado
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const sectorCodeParam = searchParams.get('sector_code');
    const format = searchParams.get('format')?.toLowerCase() || 'json';
    const includeVariations = searchParams.get('include_variations') !== 'false';
    
    // Parámetros de paginación - si es CSV, usar un límite mucho mayor
    const isCSV = format === 'csv';
    const defaultLimit = isCSV ? 10000 : 100;
    const limit = parseInt(searchParams.get('limit') || defaultLimit.toString());
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    
    // Obtener información base de fechas (primera y última fecha disponible)
    const { data: firstDateData, error: firstDateError } = await supabase
      .from('emae_by_activity_with_variations')
      .select('date')
      .order('date', { ascending: true })
      .limit(1);
    
    if (firstDateError) {
      throw new Error(`Error fetching first date: ${firstDateError.message}`);
    }
    
    const { data: lastDateData, error: lastDateError } = await supabase
      .from('emae_by_activity_with_variations')
      .select('date')
      .order('date', { ascending: false })
      .limit(1);
    
    if (lastDateError) {
      throw new Error(`Error fetching last date: ${lastDateError.message}`);
    }
    
    const firstDate = firstDateData && firstDateData.length > 0 ? firstDateData[0].date : null;
    const lastDate = lastDateData && lastDateData.length > 0 ? lastDateData[0].date : null;
    
    // Calcular el número total de meses (aproximado)
    const totalMonths = (firstDate && lastDate) ? 
      calculateMonthDifference(new Date(firstDate), new Date(lastDate)) + 1 : 0;
    
    // Construir consulta base para obtener los datos, usando la vista que incluye variaciones
    let query = supabase
      .from('emae_by_activity_with_variations')
      .select('*');
    
    // Aplicar filtros de base de datos
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Manejar múltiples códigos de sector separados por comas
    if (sectorCodeParam) {
      const sectorCodes = sectorCodeParam.split(',').map(code => code.trim());
      
      if (sectorCodes.length === 1) {
        // Si solo hay un código, usar eq
        query = query.eq('sector_code', sectorCodes[0]);
      } else {
        // Si hay múltiples códigos, usar in
        query = query.in('sector_code', sectorCodes);
      }
    }
    
    // Filtrar directamente por mes y año usando las columnas específicas
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
    
    // Si no es CSV, aplicar paginación
    if (!isCSV) {
      query = query.range(offset, offset + limit - 1);
    }
    // Ejecutar consulta
    const { data: queryData, error: queryError, count } = await query;
    
    if (queryError) {
      throw new Error(`Error fetching EMAE sectors data: ${queryError.message}`);
    }
    
    // Transformar datos para la respuesta
    const formattedData = queryData?.map((item: any) => ({
      date: item.date,
      economy_sector: item.economy_sector || '',
      economy_sector_code: item.economy_sector_code || '',
      original_value: item.original_value || 0,
      year_over_year_change: includeVariations ? (item.yearly_pct_change || 0) : undefined
    })) || [];
    
    // Si se solicita formato CSV, responder con CSV
    if (isCSV) {
      return respondWithCSV(formattedData, 'emae_sectors_data.csv');
    }
    
    // Calcular total de páginas
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Construir respuesta JSON
    const response = {
      data: formattedData,
      metadata: {
        count: formattedData.length,
        total_count: totalCount,
        date_range: {
          first_date: firstDate,
          last_date: lastDate,
          total_months: totalMonths
        },
        filtered_by: {
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
          ...(monthParam && { month: parseInt(monthParam) }),
          ...(yearParam && { year: parseInt(yearParam) }),
          ...(sectorCodeParam && { sector_code: sectorCodeParam })
        }
      },
      pagination: {
        page,
        limit,
        total_items: totalCount,
        total_pages: totalPages,
        has_more: page < totalPages
      }
    };
    
    // Configurar caché para 1 hora
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    });
    
    return NextResponse.json(response, { headers });
    
  } catch (error) {
    console.error('Error in EMAE sectors endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Calcula la diferencia en meses entre dos fechas
 */
function calculateMonthDifference(startDate: Date, endDate: Date): number {
  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    endDate.getMonth() - startDate.getMonth()
  );
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
      'Content-Disposition': `attachment; filename="${filename}"`,
    }
  });
}