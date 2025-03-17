// src/app/api/dollar/route.ts
// Endpoint para obtener cotizaciones de dólar
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { DollarType } from '@/types/dollar';

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
    const { searchParams } = request.nextUrl;
    
    // Obtener parámetros de consulta
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const dollarTypeParam = searchParams.get('type')?.toUpperCase();
    const format = searchParams.get('format')?.toLowerCase() || 'json';
    
    // Construir consulta base
    let query = supabase
      .from('dollar_rates')
      .select('*');
    
    // Aplicar filtros directamente en la base de datos
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Filtrar por tipo de dólar si se especifica
    if (dollarTypeParam) {
      // Si es una lista separada por comas, filtrar por múltiples tipos
      if (dollarTypeParam.includes(',')) {
        const types = dollarTypeParam.split(',').map(t => t.trim().toUpperCase());
        query = query.in('dollar_type', types);
      } else {
        query = query.eq('dollar_type', dollarTypeParam as DollarType);
      }
    }
    
    // Ordenar resultados por fecha descendente y tipo de dólar
    query = query.order('date', { ascending: false }).order('dollar_type');
    
    // Ejecutar consulta
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching dollar rates: ${error.message}`);
    }
    
    // Transformar datos para la respuesta
    const transformedData = data?.map(item => ({
      date: item.date,
      dollar_type: item.dollar_type,
      buy_price: Number(item.buy_price),
      sell_price: Number(item.sell_price),
      variation_buy: null, // Estos campos se calcularán más adelante si es necesario
      variation_sell: null,
      last_updated: item.created_at
    })) || [];
    
    // Si se solicita formato CSV, responder con CSV
    if (format === 'csv') {
      return respondWithCSV(transformedData, 'dollar_rates.csv');
    }
    
    // Configurar caché para 15 minutos (los datos de dólar son más volátiles)
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800' // 15 minutos
    });
    
    // Responder con JSON
    return NextResponse.json({
      data: transformedData,
      metadata: {
        count: transformedData.length,
        filtered_by: {
          start_date: startDate,
          end_date: endDate,
          dollar_type: dollarTypeParam,
        }
      }
    }, { headers });
    
  } catch (error) {
    console.error('Error in dollar rates endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
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
      'Content-Disposition': `attachment; filename="${filename}"`,
    }
  });
}

// Revalidación programada cada 15 minutos
export const revalidate = 900; // 15 minutos