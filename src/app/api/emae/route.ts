// src/app/api/emae/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { EmaeRow } from '@/types';

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Unable to initialize Supabase client. Missing environment variables: ${
        !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : ''
      }${!supabaseKey ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`
    );
  }

  
const supabase = createClient<Database>(supabaseUrl, supabaseKey);


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Obtener parámetros de consulta
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const format = searchParams.get('format') || 'json';
    
    console.log('supabase', supabaseKey);

    // Construir consulta base
    let query = supabase
      .from('emae')
      .select('*');
    
    // Aplicar filtros si existen
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Ordenar resultados
    query = query.order('date', { ascending: true });
    
    // Aplicar paginación
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Ejecutar consulta
    const { data, error } = await query;
    
    if (error) {
      console.error('Error al consultar datos EMAE:', error);
      return NextResponse.json(
        { error: 'Error al consultar la base de datos', details: error.message },
        { status: 500 }
      );
    }
    
    // Transformar datos según parámetros
    let transformedData: any[] = data || [];
    
    if (data && data.length > 0) {
      transformedData = (data as EmaeRow[]).map(item => {
        const result = {
          date: item.date,
          original_value: item.original_value,
          seasonally_adjusted_value: item.seasonally_adjusted_value,
          cycle_trend_value: item.cycle_trend_value
        };
        
        return result;
      });
    }
    
    // Responder en el formato solicitado
    if (format === 'csv') {
      return respondWithCSV(transformedData as any[], 'emae_data.csv');
    }
    
    // Responder con JSON por defecto
    return NextResponse.json({
      data: transformedData,
      metadata: {
        count: transformedData.length,
        page,
        limit,
        start_date: startDate,
        end_date: endDate,
      }
    });
    
  } catch (error) {
    console.error('Error en la API de EMAE:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Genera una respuesta en formato CSV
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
        // Si es string y contiene comas, rodearlo con comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== null && value !== undefined ? value : '';
      })
      .join(',');
  }).join('\n');
  
  // Configurar la respuesta HTTP
  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}