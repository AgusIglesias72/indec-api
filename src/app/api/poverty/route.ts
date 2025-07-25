// src/app/api/poverty/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { 
  PovertyApiResponse, 
  PovertyQueryFilters,
  PovertyData,
  PovertyDataType,
  PovertyIndicator
} from '@/types/poverty';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Configurar cliente de Supabase
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

/**
 * API pública para obtener datos de pobreza e indigencia
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parsear parámetros de query
    const filters: PovertyQueryFilters = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      data_type: (searchParams.get('data_type') as PovertyDataType) || undefined,
      region: searchParams.get('region') || undefined,
      indicator: (searchParams.get('indicator') as PovertyIndicator) || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      format: (searchParams.get('format') as 'json' | 'csv') || 'json'
    };

    // Validar límite
    if (filters.limit && (filters.limit < 1 || filters.limit > 1000)) {
      return NextResponse.json(
        { error: 'El parámetro limit debe estar entre 1 y 1000' },
        { status: 400 }
      );
    }

    // Construir query
    let query = supabase
      .from('poverty_data')
      .select('*')
      .order('date', { ascending: false });

    // Aplicar filtros
    if (filters.start_date) {
      query = query.gte('date', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('date', filters.end_date);
    }

    if (filters.data_type) {
      query = query.eq('data_type', filters.data_type);
    }

    if (filters.region) {
      query = query.ilike('region', `%${filters.region}%`);
    }

    // Aplicar límite
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching poverty data:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }

    // Filtrar por indicador si se especifica
    let filteredData = data as PovertyData[] | null;
    if (filters.indicator && filteredData) {
      filteredData = filteredData.filter(record => {
        const value = (record as any)[filters.indicator!];
        return value !== null && value !== undefined;
      });
    }

    if (!filteredData || filteredData.length === 0) {
      const response: PovertyApiResponse = {
        data: [],
        metadata: {
          count: 0,
          filtered_by: filters,
          period_range: undefined
        }
      };
      return NextResponse.json(response);
    }

    // Calcular rango de períodos
    const periods = filteredData.map(d => d.period).sort();
    const periodRange = {
      first: periods[0],
      last: periods[periods.length - 1]
    };

    // Formatear respuesta
    if (filters.format === 'csv') {
      const csvContent = convertToCSV(filteredData);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="poverty_data.csv"'
        }
      });
    }

    const response: PovertyApiResponse = {
      data: filteredData,
      metadata: {
        count: filteredData.length,
        filtered_by: filters,
        period_range: periodRange
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in poverty API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Convierte datos a formato CSV
 */
function convertToCSV(data: PovertyData[]): string {
  if (data.length === 0) return '';

  const headers = [
    'date',
    'period',
    'semester',
    'year',
    'data_type',
    'region',
    'poverty_rate_persons',
    'poverty_rate_households',
    'indigence_rate_persons',
    'indigence_rate_households',
    'poor_persons',
    'poor_households',
    'indigent_persons',
    'indigent_households',
    'total_persons',
    'total_households'
  ];

  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = (row as any)[header];
        return value !== null && value !== undefined ? value.toString() : '';
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}