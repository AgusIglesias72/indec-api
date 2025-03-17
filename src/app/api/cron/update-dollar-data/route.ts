// src/app/api/cron/update-dollar-data/route.ts
// Endpoint independiente para actualizar cotizaciones de dólar
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchDollarRates } from '@/services/dollar-fetcher';
import { Database } from '@/types/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minuto como máximo para completar la tarea

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Endpoint para actualización programada de cotizaciones de dólar
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación para el cron job
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === 'true';
    const isVercelDeployment = process.env.VERCEL_ENV !== undefined;
    
    // En producción, permitir solo llamadas desde Vercel cron o con token válido
    if (process.env.NODE_ENV === 'production' &&
        (!isVercelCron && !isVercelDeployment) && 
        (!authHeader || authHeader.split(' ')[1] !== process.env.CRON_SECRET_KEY)) {
      console.error('Intento de acceso no autorizado al cron job de cotizaciones');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    console.info('Iniciando cron job de actualización de cotizaciones de dólar');
    const startTime = new Date().toISOString();
    
    // Obtener y guardar datos
    const { data: dollarRates, savedCount } = await fetchDollarRates(supabase);
    
    // Registrar la ejecución del cron job en Supabase
    try {
      const { error } = await supabase
        .from('cron_executions')
        .insert({
          execution_time: new Date().toISOString(),
          results: {
            taskId: 'update-dollar-rates',
            dataSource: 'API Argentina Datos - Cotizaciones',
            startTime,
            endTime: new Date().toISOString(),
            recordsProcessed: savedCount || 0,
            status: 'success',
            details: `Se actualizaron ${savedCount} cotizaciones de dólar`
          },
          status: 'success'
        });
      
      if (error) {
        console.warn('Error al registrar ejecución del cron:', error.message);
      }
    } catch (err) {
      console.warn('Error al registrar ejecución del cron:', err);
      // No fallamos el cron por errores de registro
    }
    
    console.info('Cron job de cotizaciones de dólar completado:', {
      recordsProcessed: savedCount,
      types: [...new Set(dollarRates.map(r => r.dollar_type))].join(', '),
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      execution_time: new Date().toISOString(),
      results: {
        records_processed: savedCount,
        dollar_types: [...new Set(dollarRates.map(r => r.dollar_type))],
        first_date: dollarRates.length > 0 ? dollarRates[0].date : null,
        record_count: dollarRates.length
      }
    });
  } catch (error) {
    console.error('Error en cron job de cotizaciones:', error);
    
    // Registrar el error en la tabla de ejecuciones
    try {
      await supabase
        .from('cron_executions')
        .insert({
          execution_time: new Date().toISOString(),
          results: {
            taskId: 'update-dollar-rates',
            dataSource: 'API Argentina Datos - Cotizaciones',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            recordsProcessed: 0,
            status: 'error',
            details: `Error: ${(error as Error).message}`
          },
          status: 'error'
        });
    } catch (err) {
      console.warn('Error al registrar error de cron:', err);
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}