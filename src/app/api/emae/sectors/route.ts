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
    const sectorCode = searchParams.get('sector_code');
    const format = searchParams.get('format')?.toLowerCase() || 'json';
    
    // Parámetros de paginación - si es CSV, usar un límite mucho mayor
    const isCSV = format === 'csv';
    const defaultLimit = isCSV ? 10000 : 16;
    const limit = parseInt(searchParams.get('limit') || defaultLimit.toString());
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    
    // Obtener información base (fechas)
    const firstDate = "2004-01-01";
    
    // Obtener la fecha más reciente
    const { data: lastDateData, error: lastDateError } = await supabase
      .from('emae_by_activity')
      .select('date')
      .order('date', { ascending: false })
      .limit(1);
    
    if (lastDateError) {
      throw new Error(`Error fetching last date: ${lastDateError.message}`);
    }
    
    const lastDate = lastDateData && lastDateData.length > 0 ? lastDateData[0].date : null;
    
    // Calcular el número total de meses (aproximado)
    const totalMonths = lastDate ? calculateMonthDifference(new Date(firstDate), new Date(lastDate)) + 1 : 0;
    
    // Para filtrado por month/year, necesitamos traer todos los datos primero
    // Si se usan estos filtros, omitimos paginación en la consulta inicial
    const needsJsFiltering = monthParam !== null || yearParam !== null;
    
    // Construir consulta base para obtener los datos
    let query = supabase
      .from('emae_by_activity')
      .select('date, economy_sector, economy_sector_code, original_value')
      .order('date', { ascending: true });
    
    // Aplicar filtros de base de datos
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    if (sectorCode) {
      query = query.eq('economy_sector_code', sectorCode);
    }
    
    // Si no es CSV y no necesitamos filtrado JS, aplicar paginación aquí
    if (!isCSV && !needsJsFiltering) {
      query = query.range(offset, offset + limit - 1);
    }
    
    // Ejecutar consulta
    const { data: queryData, error: queryError } = await query;
    
    if (queryError) {
      throw new Error(`Error fetching EMAE sectors data: ${queryError.message}`);
    }
    
    // Ahora aplicamos el filtrado por mes o año
    let filteredData = queryData || [];
    
    // Filtrar por mes y/o año en JavaScript si se especifican
    if (monthParam !== null || yearParam !== null) {
      const month = monthParam ? parseInt(monthParam) : null;
      const year = yearParam ? parseInt(yearParam) : null;
      
      console.log('Filtrando por mes/año:', { month, year, totalRegistros: filteredData.length });
      
      filteredData = filteredData.filter(item => {
        if (!item.date) return false;
        
        // Convertir string de fecha a objeto Date
        // El formato esperado es 'YYYY-MM-DD'
        const dateParts = item.date.split('-');
        if (dateParts.length !== 3) return false;
        
        const itemYear = parseInt(dateParts[0]);
        const itemMonth = parseInt(dateParts[1]);
        
        if (month !== null && year !== null) {
          // Filtrar por mes y año
          return itemMonth === month && itemYear === year;
        } else if (month !== null) {
          // Filtrar solo por mes
          return itemMonth === month;
        } else if (year !== null) {
          // Filtrar solo por año
          return itemYear === year;
        }
        
        return true;
      });
      
      console.log('Resultado después de filtrar:', filteredData.length);
    }
    
    // Aplicar paginación si es necesario (cuando usamos filtrado JS)
    let paginatedData = filteredData;
    if (!isCSV && needsJsFiltering) {
      const start = offset;
      const end = offset + limit;
      paginatedData = filteredData.slice(start, end);
    }
    
    // Si se solicita formato CSV, responder con CSV (usar datos filtrados completos)
    if (isCSV) {
      return respondWithCSV(filteredData as Record<string, any>[], 'emae_sectors_data.csv');
    }
    
    // Construir respuesta JSON (usar datos paginados)
    const response = {
      data: paginatedData,
      metadata: {
        count: paginatedData.length,
        total_count: filteredData.length,
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
          ...(sectorCode && { sector_code: sectorCode })
        }
      },
      pagination: {
        page,
        limit,
        total_items: filteredData.length,
        total_pages: Math.ceil(filteredData.length / limit),
        has_more: (page * limit) < filteredData.length
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