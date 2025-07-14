// src/app/api/riesgo-pais/with-variations/route.ts
// Endpoint específico para obtener riesgo país con variaciones calculadas

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * GET /api/riesgo-pais/with-variations
 * Obtiene el valor actual del riesgo país con variaciones mensual e interanual
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener el valor más reciente
    const latestResponse = await supabase
      .from('v_embi_daily_closing')
      .select('*')
      .order('closing_date', { ascending: false })
      .limit(1);

    if (latestResponse.error || !latestResponse.data || latestResponse.data.length === 0) {
      throw new Error('No se pudo obtener el valor más reciente');
    }

    const latestData = latestResponse.data[0];

    // Calcular fechas para variaciones
    if (!latestData.closing_date) {
      throw new Error('La fecha de cierre más reciente es nula');
    }
    const currentDate = new Date(latestData.closing_date as string);
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const oneYearAgo = new Date(currentDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Obtener datos para variación mensual (buscar en un rango de ±7 días)
    const monthlyStartDate = new Date(oneMonthAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthlyEndDate = new Date(oneMonthAgo.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const monthlyResponse = await supabase
      .from('v_embi_daily_closing')
      .select('*')
      .gte('closing_date', monthlyStartDate.toISOString().split('T')[0])
      .lte('closing_date', monthlyEndDate.toISOString().split('T')[0])
      .order('closing_date', { ascending: false })
      .limit(1);

    // Obtener datos para variación interanual (buscar en un rango de ±7 días)
    const yearlyStartDate = new Date(oneYearAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const yearlyEndDate = new Date(oneYearAgo.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const yearlyResponse = await supabase
      .from('v_embi_daily_closing')
      .select('*')
      .gte('closing_date', yearlyStartDate.toISOString().split('T')[0])
      .lte('closing_date', yearlyEndDate.toISOString().split('T')[0])
      .order('closing_date', { ascending: false })
      .limit(1);

    // Calcular variaciones
    let monthlyVariation = null;
    let yearlyVariation = null;

    if (
      monthlyResponse.data &&
      monthlyResponse.data.length > 0 &&
      monthlyResponse.data[0].closing_value !== null &&
      latestData.closing_value !== null
    ) {
      const monthlyValue = monthlyResponse.data[0].closing_value;
      monthlyVariation = ((latestData.closing_value - monthlyValue) / monthlyValue * 100);
    }

    if (
      yearlyResponse.data &&
      yearlyResponse.data.length > 0 &&
      yearlyResponse.data[0].closing_value !== null &&
      latestData.closing_value !== null
    ) {
      const yearlyValue = yearlyResponse.data[0].closing_value;
      yearlyVariation = ((latestData.closing_value - yearlyValue) / yearlyValue * 100);
    }

    // Preparar respuesta
    const responseData = {
      ...latestData,
      monthly_variation: monthlyVariation,
      yearly_variation: yearlyVariation,
      monthly_reference_date: monthlyResponse.data?.[0]?.closing_date || null,
      yearly_reference_date: yearlyResponse.data?.[0]?.closing_date || null
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        query_timestamp: new Date().toISOString(),
        calculations: {
          monthly_period: monthlyResponse.data?.[0] ? {
            from: monthlyResponse.data[0].closing_date,
            to: latestData.closing_date,
            days_difference: monthlyResponse.data[0].closing_date
              ? Math.floor(
                  (currentDate.getTime() -
                    new Date(
                      monthlyResponse.data[0].closing_date as string
                    ).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null
          } : null,
          yearly_period: yearlyResponse.data?.[0] ? {
            from: yearlyResponse.data[0].closing_date,
            to: latestData.closing_date,
            days_difference: yearlyResponse.data[0].closing_date
              ? Math.floor(
                  (currentDate.getTime() -
                    new Date(
                      yearlyResponse.data[0].closing_date as string
                    ).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null
          } : null
        }
      }
    });

  } catch (error) {
    console.error('Error in riesgo-pais with-variations API:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: (error as Error).message
    }, { status: 500 });
  }
}