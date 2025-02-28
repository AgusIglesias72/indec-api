// src/app/api/ipc/latest/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

// Inicializar cliente Supabase
if (!supabaseUrl || !supabaseKey) {
  throw new Error(`Unable to initialize Supabase client. Missing environment variables.`);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Obtener los registros de IPC más recientes (vamos a buscar más de un registro)
    const { data: ipcData, error: ipcError } = await supabase
      .from('ipc')
      .select('*')
      .eq('component_type', 'GENERAL')  // Solo nivel general
      .eq('region', 'Nacional')         // Solo región nacional
      .order('date', { ascending: false })
      .limit(2);  // Obtener los dos registros más recientes

    if (ipcError) {
      console.error('Error al consultar los datos de IPC:', ipcError);
      return NextResponse.json(
        { error: 'Error al consultar la base de datos', details: ipcError.message },
        { status: 500 }
      );
    }

    if (!ipcData || ipcData.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron datos de IPC' },
        { status: 404 }
      );
    }

    const latestIPC = ipcData[0];
    const previousMonthIPC = ipcData.length > 1 ? ipcData[1] : null;

    // Obtener el dato del mismo mes del año anterior para variación interanual
    const previousYearDate = new Date(latestIPC.date);
    previousYearDate.setFullYear(previousYearDate.getFullYear() - 1);
    const previousYearDateStr = previousYearDate.toISOString().split('T')[0];

    const { data: previousYearData, error: previousYearError } = await supabase
      .from('ipc')
      .select('*')
      .eq('component_type', 'GENERAL')
      .eq('region', 'Nacional')
      .eq('date', previousYearDateStr)
      .maybeSingle();

    // Obtener el dato de diciembre del año anterior para variación acumulada
    const currentYear = new Date(latestIPC.date).getFullYear();
    const lastDecemberStr = `${currentYear}-12-01`;

    const { data: lastDecemberData, error: lastDecemberError } = await supabase
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

    // Calcular variación mensual
    if (previousMonthIPC && previousMonthIPC.index_value > 0) {
      monthly_change = ((latestIPC.index_value - previousMonthIPC.index_value) / 
                       previousMonthIPC.index_value) * 100;
    }

    // Calcular variación interanual
    if (previousYearData && previousYearData.index_value > 0) {
      year_over_year_change = ((latestIPC.index_value - previousYearData.index_value) / 
                              previousYearData.index_value) * 100;
    }

    // Calcular variación acumulada
    if (lastDecemberData && lastDecemberData.index_value > 0) {
        console.log(lastDecemberData)
        console.log(latestIPC)
      accumulated_change = ((latestIPC.index_value - lastDecemberData.index_value) / 
                           lastDecemberData.index_value) * 100;
    }

    // Formatear la respuesta
    const responseData = {
      date: latestIPC.date,
      index_value: latestIPC.index_value,
      monthly_change: parseFloat(monthly_change.toFixed(1)),
      year_over_year_change: parseFloat(year_over_year_change.toFixed(1)),
      accumulated_change: parseFloat(accumulated_change.toFixed(1))
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error en API de IPC latest:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}