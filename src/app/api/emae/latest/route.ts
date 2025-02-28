// src/app/api/emae/latest/route.ts
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
    // Obtener el registro más reciente de EMAE
    const { data: latestEmae, error: emaeError } = await supabase
      .from('emae')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (emaeError) {
      console.error('Error al consultar el último dato de EMAE:', emaeError);
      return NextResponse.json(
        { error: 'Error al consultar la base de datos', details: emaeError.message },
        { status: 500 }
      );
    }

    if (!latestEmae) {
      return NextResponse.json(
        { error: 'No se encontraron datos de EMAE' },
        { status: 404 }
      );
    }

    // Obtener el dato del mes anterior para calcular variación intermensual
    const previousMonthDate = new Date(latestEmae.date);
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    const previousMonthDateStr = previousMonthDate.toISOString().split('T')[0];

    console.log(`Buscando datos para el mes anterior: ${previousMonthDateStr}`);

    // Intentar encontrar exactamente el mes anterior, pero si no existe, buscar el más cercano
    let { data: previousMonthData, error: previousMonthError } = await supabase
      .from('emae')
      .select('*')
      .eq('date', previousMonthDateStr)
      .maybeSingle();
      
    if (!previousMonthData) {
      console.log('No se encontró dato exacto del mes anterior, buscando el más cercano');
      // Si no hay dato exacto, buscar el registro más reciente anterior a la fecha actual
      const { data: closestPreviousData, error: closestError } = await supabase
        .from('emae')
        .select('*')
        .lt('date', latestEmae.date)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (closestPreviousData && !closestError) {
        previousMonthData = closestPreviousData;
        console.log(`Se encontró un dato cercano para: ${previousMonthData.date}`);
      }
    }

    // Obtener el dato del mismo mes del año anterior para variación interanual
    const previousYearDate = new Date(latestEmae.date);
    previousYearDate.setFullYear(previousYearDate.getFullYear() - 1);
    const previousYearDateStr = previousYearDate.toISOString().split('T')[0];

    console.log(`Buscando datos para el año anterior: ${previousYearDateStr}`);

    // Intentar encontrar exactamente el mismo mes del año anterior, pero si no existe, buscar el más cercano
    let { data: previousYearData, error: previousYearError } = await supabase
      .from('emae')
      .select('*')
      .eq('date', previousYearDateStr)
      .maybeSingle();
      
    if (!previousYearData) {
      console.log('No se encontró dato exacto del año anterior, buscando el más cercano');
      // Buscar en un rango de ±1 mes
      const yearBefore = previousYearDate.getFullYear();
      const monthBefore = previousYearDate.getMonth() + 1; // +1 porque getMonth() devuelve 0-11
      
      // Construir fechas para un mes antes y después
      const monthBeforeStr = `${yearBefore}-${String(monthBefore - 1 || 12).padStart(2, '0')}-01`;
      const monthAfterStr = `${yearBefore}-${String(monthBefore + 1 > 12 ? 1 : monthBefore + 1).padStart(2, '0')}-01`;
      
      // Buscar en un rango de fechas
      const { data: rangeData, error: rangeError } = await supabase
        .from('emae')
        .select('*')
        .gte('date', monthBeforeStr)
        .lte('date', monthAfterStr)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (rangeData && !rangeError) {
        previousYearData = rangeData;
        console.log(`Se encontró un dato cercano para año anterior: ${previousYearData.date}`);
      }
    }

    // Calcular variaciones
    let monthly_change = 0;
    let year_over_year_change = 0;

    if (previousMonthData) {
      // Asegurarse de que hay un valor desestacionalizado válido para calcular
      if (previousMonthData.seasonally_adjusted_value > 0 && latestEmae.seasonally_adjusted_value > 0) {
        monthly_change = ((latestEmae.seasonally_adjusted_value - previousMonthData.seasonally_adjusted_value) / 
                          previousMonthData.seasonally_adjusted_value) * 100;
      } else {
        console.warn('Valores desestacionalizados no válidos para calcular variación mensual');
      }
    } else {
      console.warn('No se encontraron datos del mes anterior para calcular variación mensual');
    }

    if (previousYearData) {
      // Asegurarse de que hay un valor original válido para calcular
      if (previousYearData.original_value > 0 && latestEmae.original_value > 0) {
        year_over_year_change = ((latestEmae.original_value - previousYearData.original_value) / 
                                previousYearData.original_value) * 100;
      } else {
        console.warn('Valores originales no válidos para calcular variación interanual');
      }
    } else {
      console.warn('No se encontraron datos del año anterior para calcular variación interanual');
    }

    // Formatear la respuesta
    const responseData = {
      date: latestEmae.date,
      original_value: latestEmae.original_value,
      seasonally_adjusted_value: latestEmae.seasonally_adjusted_value,
      monthly_change: parseFloat(monthly_change.toFixed(1)),
      year_over_year_change: parseFloat(year_over_year_change.toFixed(1))
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error en API de EMAE latest:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}