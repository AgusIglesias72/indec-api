// src/app/api/emae/latest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { EmaeResponse } from '@/types';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Obtener parámetros de consulta
    const sectorParam = searchParams.get('sector_code')?.toUpperCase() || 'GENERAL';
    const byActivity = searchParams.get('by_activity') === 'true';
    
    // Determinar qué vista usar según si queremos datos por actividad o generales
    const viewName = byActivity ? 'emae_by_activity_with_variations' : 'emae_with_variations';
    
    // Construir consulta para obtener el último dato disponible
    let query = supabase
      .from(viewName)
      .select('*')
      .order('date', { ascending: false })
      .limit(1);
    
    // Filtrar por código de sector si se especifica y no es 'GENERAL' o estamos en modo por actividad
    if (sectorParam && (sectorParam !== 'GENERAL' || byActivity)) {
      query = query.eq('sector_code', sectorParam);
    }
    
    // Ejecutar consulta
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error al consultar datos EMAE: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron datos para el sector especificado' },
        { status: 404 }
      );
    }
    
    // Transformar el resultado
    const item = data[0];
    const result: EmaeResponse = {
      date: item.date || '',
      sector: item.sector || '',
      sector_code: item.sector_code || '',
      original_value: item.original_value || 0,
      yearly_pct_change: item.yearly_pct_change || undefined,
      monthly_pct_change: item.monthly_pct_change || undefined,
    };
    
    // Si es el EMAE general, incluir series desestacionalizada y tendencia-ciclo
    if (viewName === 'emae_with_variations') {
      // Usar verificación de existencia de propiedades
      if ('seasonally_adjusted_value' in item) {
        result.seasonally_adjusted_value = item.seasonally_adjusted_value || 0;
      }
      
      if ('cycle_trend_value' in item) {
        result.trend_cycle_value = item.cycle_trend_value || 0;
      }
    }
    
    // Configurar caché más corto para datos frescos
    const CACHE_MAX_AGE = 300; // 5 minutos en segundos
    const CACHE_STALE_WHILE_REVALIDATE = 3600; // 1 hora
    
    // Configurar encabezados de caché
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`);
    
    // Responder con JSON
    return new NextResponse(JSON.stringify(result), { 
      status: 200, 
      headers 
    });
    
  } catch (error) {
    console.error('Error en la API de EMAE/latest:', error);
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

// Revalidación programada cada 5 minutos para datos más frescos
export const revalidate = 300; // 5 minutos
export const dynamic = 'force-dynamic';