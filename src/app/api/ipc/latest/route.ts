// src/app/api/ipc/latest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { IpcResponse } from '@/types';
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

// Función en caché para obtener los datos más recientes del IPC
const getLatestIpcData = cache(async (
  componentCode: string,
  region: string
) => {
  console.log(`Fetching latest IPC data for ${componentCode} in ${region}`);
  
  // Consultar la vista que incluye variaciones
  const { data, error } = await supabase
    .from('ipc_with_variations')
    .select('*')
    .eq('component_code', componentCode)
    .eq('region', region)
    .order('date', { ascending: false })
    .limit(1);
  
  if (error) {
    throw new Error(`Error al consultar datos IPC: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    return null;
  }
  
  // Transformar el resultado
  const item = data[0];
  const result: IpcResponse = {
    date: item.date || '',
    category: item.component || '',
    category_code: item.component_code || '',
    category_type: item.component_type || '',
    index_value: item.index_value || 0,
    region: item.region || '',
    monthly_pct_change: item.monthly_pct_change || undefined,
    yearly_pct_change: item.yearly_pct_change || undefined,
    accumulated_pct_change: item.accumulated_pct_change || undefined
  };
  
  return result;
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Obtener parámetros de consulta y normalizar strings a minúsculas
    const categoryParam = searchParams.get('category')?.toUpperCase() || 'GENERAL';
    const regionParam = searchParams.get('region')?.toLowerCase() || 'nacional';
    
    // Normalizar región (primera letra mayúscula, resto minúsculas)
    const normalizedRegion = regionParam.charAt(0).toUpperCase() + regionParam.slice(1).toLowerCase();
    
    // Obtener datos en caché
    const latestData = await getLatestIpcData(categoryParam, normalizedRegion);
    
    if (!latestData) {
      return NextResponse.json(
        { error: 'No se encontraron datos para la categoría y región especificadas' },
        { status: 404 }
      );
    }
    
    // Configurar caché para 1 hora
    const CACHE_MAX_AGE = 3600; // 1 hora en segundos
    const CACHE_STALE_WHILE_REVALIDATE = 86400; // 24 horas
    
    // Configurar encabezados de caché
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`);
    
    // Responder con JSON
    return new NextResponse(JSON.stringify(latestData), { 
      status: 200, 
      headers 
    });
    
  } catch (error) {
    console.error('Error en la API de IPC/latest:', error);
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

// Revalidación programada cada hora
export const revalidate = 3600; // 1 hora