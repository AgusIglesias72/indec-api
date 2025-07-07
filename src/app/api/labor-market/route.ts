// src/app/api/labor-market/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { LaborMarketRegion, LaborMarketAgeGroup, LaborMarketGender, LaborMarketIndicator } from '@/types/labor-market';

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
    const region = searchParams.get('region') as LaborMarketRegion | null;
    const ageGroup = searchParams.get('age_group') as LaborMarketAgeGroup | null;
    const gender = searchParams.get('gender') as LaborMarketGender | null;
    const indicator = searchParams.get('indicator') as LaborMarketIndicator | null;
    const limitParam = searchParams.get('limit');
    const format = searchParams.get('format') || 'json';

    // Validar formato
    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Formato no válido. Use "json" o "csv"' },
        { status: 400 }
      );
    }

    // Construir query base
    let query = supabase
      .from('labor_market')
      .select('*');

    // Aplicar filtros
    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    if (region) {
      query = query.eq('region', region);
    }

    if (ageGroup) {
      query = query.eq('age_group', ageGroup);
    }

    if (gender) {
      query = query.eq('gender', gender);
    }

    // Si se especifica un indicador específico, filtrar solo registros que tengan ese campo
    if (indicator) {
      query = query.not(indicator, 'is', null);
    }

    // Aplicar límite
    const limit = limitParam ? parseInt(limitParam) : 1000;
    if (limit > 0) {
      query = query.limit(limit);
    }

    // Ordenar por fecha descendente
    query = query.order('date', { ascending: false });

    // Ejecutar consulta
    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching labor market data: ${error.message}`);
    }

    // Si se solicita CSV, responder con CSV
    if (format === 'csv') {
      return respondWithCSV(data || [], 'labor_market_data.csv');
    }

    // Procesar datos para incluir solo el indicador solicitado si se especifica
    let processedData = data || [];
    
    if (indicator) {
      processedData = processedData.map(item => ({
        date: item.date,
        period: item.period,
        region: item.region,
        age_group: item.age_group,
        gender: item.gender,
        [indicator]: item[indicator],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    }

    // Obtener rango de períodos para metadata
    let periodRange = null;
    if (processedData.length > 0) {
      const periods = processedData.map(item => item.period).filter(Boolean);
      const sortedPeriods = periods.sort();
      periodRange = {
        first: sortedPeriods[0],
        last: sortedPeriods[sortedPeriods.length - 1]
      };
    }

    // Configurar caché
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200' // 1 hora
    });

    return NextResponse.json({
      data: processedData,
      metadata: {
        count: processedData.length,
        filtered_by: {
          start_date: startDate,
          end_date: endDate,
          region,
          age_group: ageGroup,
          gender,
          indicator
        },
        period_range: periodRange
      }
    }, { headers });

  } catch (error) {
    console.error('Error in labor market endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
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
        const value = row[header];
        // Si es string y contiene comas o comillas, rodearlo con comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== null && value !== undefined ? value : '';
      })
      .join(',');
  }).join('\n');

  // Crear respuesta con headers apropiados para descarga de CSV
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

// Configurar revalidación
export const revalidate = 3600; // 1 hora