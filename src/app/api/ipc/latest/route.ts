// src/app/api/ipc/latest/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { cache } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

// Inicializar cliente Supabase
if (!supabaseUrl || !supabaseKey) {
  throw new Error(`Unable to initialize Supabase client. Missing environment variables.`);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Función en caché para obtener el último dato de IPC
const getCachedLatestIPCData = cache(async () => {
  console.log('Fetching latest IPC data from database');
  
  // Obtener los registros de IPC más recientes
  const { data: ipcData, error: ipcError } = await supabase
    .from('ipc')
    .select('*')
    .eq('component_type', 'GENERAL')
    .eq('region', 'Nacional')
    .order('date', { ascending: false })
    .limit(3);

  if (ipcError) {
    throw new Error(`Error al consultar los datos de IPC: ${ipcError.message}`);
  }

  if (!ipcData || ipcData.length === 0) {
    throw new Error('No se encontraron datos de IPC');
  }

  const latestIPC = ipcData[0];
  const previousMonthIPC = ipcData.length > 1 ? ipcData[1] : null;
  const twoMonthsAgoIPC = ipcData.length > 2 ? ipcData[2] : null;

  // Obtener el dato del mismo mes del año anterior para variación interanual
  const previousYearDate = new Date(latestIPC.date);
  previousYearDate.setFullYear(previousYearDate.getFullYear() - 1);
  const previousYearDateStr = previousYearDate.toISOString().split('T')[0];

  const { data: previousYearData } = await supabase
    .from('ipc')
    .select('*')
    .eq('component_type', 'GENERAL')
    .eq('region', 'Nacional')
    .eq('date', previousYearDateStr)
    .maybeSingle();

  // Obtener el dato de diciembre del año anterior para variación acumulada
  const currentYear = new Date(latestIPC.date + 1).getFullYear();
  const lastDecemberStr = `${currentYear - 1}-12-01`;

  const { data: lastDecemberData } = await supabase
    .from('ipc')
    .select('*')
    .eq('component_type', 'GENERAL')
    .eq('region', 'Nacional')
    .eq('date', lastDecemberStr)
    .maybeSingle();

  // Calcular variaciones
  let monthly_change = 0;
  let year_over_year_change = 0;
  let accumulated_change = 0;
  let previous_monthly_change = 0;

  // Calcular variación mensual
  if (previousMonthIPC && previousMonthIPC.index_value > 0) {
    monthly_change = ((latestIPC.index_value - previousMonthIPC.index_value) / 
                     previousMonthIPC.index_value) * 100;
  }
  
  // Calcular variación mensual del periodo anterior para comparar
  if (previousMonthIPC && twoMonthsAgoIPC && twoMonthsAgoIPC.index_value > 0) {
    previous_monthly_change = ((previousMonthIPC.index_value - twoMonthsAgoIPC.index_value) / 
                              twoMonthsAgoIPC.index_value) * 100;
  }

  // Calcular variación interanual
  if (previousYearData && previousYearData.index_value > 0) {
    year_over_year_change = ((latestIPC.index_value - previousYearData.index_value) / 
                            previousYearData.index_value) * 100;
  }

  // Calcular variación acumulada
  if (lastDecemberData && lastDecemberData.index_value > 0) {
    accumulated_change = ((latestIPC.index_value - lastDecemberData.index_value) / 
                         lastDecemberData.index_value) * 100;
  }

  // Calcular la diferencia entre la variación mensual actual y la anterior
  const monthly_change_diff = parseFloat((monthly_change - previous_monthly_change).toFixed(1));

  return {
    date: latestIPC.date,
    index_value: latestIPC.index_value,
    monthly_change: parseFloat(monthly_change.toFixed(1)),
    year_over_year_change: parseFloat(year_over_year_change.toFixed(1)),
    accumulated_change: parseFloat(accumulated_change.toFixed(1)),
    monthly_change_diff: monthly_change_diff
  };
});

export async function GET() {
  try {
    // Configurar caché para 1 hora
    const CACHE_MAX_AGE = 3600; // 1 hora en segundos
    const CACHE_STALE_WHILE_REVALIDATE = 86400; // 24 horas

    // Obtener datos en caché
    const ipcData = await getCachedLatestIPCData();

    // Configurar encabezados de caché
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`);

    return new NextResponse(JSON.stringify(ipcData), { 
      status: 200, 
      headers 
    });
  } catch (error) {
    console.error('Error en API de IPC latest:', error);
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