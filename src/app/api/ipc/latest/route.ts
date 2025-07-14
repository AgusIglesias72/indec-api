// src/app/api/ipc/latest/route.ts
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
    
    // Obtener parámetros de consulta
    const region = searchParams.get('region')?.toLowerCase() || 'nacional';
    const componentCode = (searchParams.get('category') || 'GENERAL').toUpperCase();

    // Normalizar región (primera letra mayúscula, resto minúsculas) 
    // Excepto GBA, eso va todo en mayúsculas
    let normalizedRegion;
    if (region === 'gba') {
      normalizedRegion = 'GBA';
    } else {
      normalizedRegion = region.charAt(0).toUpperCase() + region.slice(1).toLowerCase();
    }
    
    
    // Obtener el último dato del IPC
    const { data: latestData, error: latestError } = await supabase
      .from('ipc_with_variations')
      .select('*')
      .eq('component_code', componentCode)
      .eq('region', normalizedRegion)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (latestError) {
      throw new Error(`Error al obtener el último dato del IPC: ${latestError.message}`);
    }
    
    if (!latestData) {
      return NextResponse.json(
        { error: 'No se encontraron datos para los parámetros especificados' },
        { status: 404 }
      );
    }
    
    // Calcular la fecha del mes anterior para obtener la variación del cambio mensual
    const currentDate = new Date(latestData.date || '');
    currentDate.setMonth(currentDate.getMonth() - 1);
    
    // Formatear la fecha anterior al formato YYYY-MM-DD
    const prevYear = currentDate.getFullYear();
    const prevMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const prevDateStr = `${prevYear}-${prevMonth}-01`;
    
    // Obtener el dato del mes anterior directamente desde la base de datos
    const { data: prevMonthData } = await supabase
      .from('ipc_with_variations')
      .select('monthly_pct_change')
      .eq('component_code', componentCode)
      .eq('region', normalizedRegion)
      .eq('date', prevDateStr)
      .limit(1)
      .single();
    
    // Transformar el dato para la respuesta
    const result: IpcResponse = {
      date: latestData.date || '',
      category: latestData.component || '',
      category_code: latestData.component_code || '',
      category_type: latestData.component_type || '',
      index_value: latestData.index_value || 0,
      region: latestData.region || '',
      monthly_pct_change: latestData.monthly_pct_change || undefined,
      yearly_pct_change: latestData.yearly_pct_change || undefined,
      accumulated_pct_change: latestData.accumulated_pct_change || undefined,
      monthly_change_variation: 0
    };
    
    // Calcular la variación del cambio mensual si tenemos el dato del mes anterior
    if (
      prevMonthData?.monthly_pct_change !== null && 
      prevMonthData?.monthly_pct_change !== undefined
    ) {
      // Calcular la variación del cambio mensual actual respecto al anterior
      const currentMonthlyChange = latestData.monthly_pct_change || 0;
      const prevMonthlyChange = prevMonthData.monthly_pct_change || 0;
      
      // La variación es la diferencia entre los cambios mensuales
      result.monthly_change_variation = currentMonthlyChange - prevMonthlyChange;
    }
    
    // Configurar caché para 1 hora
    const CACHE_MAX_AGE = 30; // era 3600
    const CACHE_STALE_WHILE_REVALIDATE = 30; // 24 horas
    
    // Configurar encabezados de caché
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`);
    
    // Responder con JSON
    return new NextResponse(JSON.stringify({
      data: result,
      metadata: {
        region: normalizedRegion,
        component_code: componentCode,
        last_updated: new Date().toISOString()
      }
    }), { 
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
export const revalidate = 10; // 1 hora
