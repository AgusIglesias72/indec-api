// src/app/api/cron/update-labor-market/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchLaborMarketData } from '@/services/labor-market-fetcher';
import { Database } from '@/types/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutos como máximo

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
 * Cron job dedicado para actualización de datos del mercado laboral (EPH)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación para el cron job
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === 'true';
    const isVercelDeployment = process.env.VERCEL_ENV !== undefined;
    
    // Permitir llamadas desde Vercel cron o entorno de Vercel sin token
    if ((!isVercelCron && !isVercelDeployment) && 
        (!authHeader || authHeader.split(' ')[1] !== process.env.CRON_SECRET_KEY)) {
      console.error('Intento de acceso no autorizado al cron job de mercado laboral');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    console.info('🚀 Iniciando cron job de actualización del mercado laboral (EPH)');
    const startTime = new Date().toISOString();
    let result;
    
    try {
      // Actualizar datos del mercado laboral
      result = await updateLaborMarketData();
      
      console.info(`✅ Actualización del mercado laboral completada: ${result.count} registros`);
      
      // Registrar la ejecución exitosa en Supabase
      await logCronExecution(startTime, 'success', result);
      
      return NextResponse.json({
        success: true,
        execution_time: new Date().toISOString(),
        data_source: 'INDEC - EPH (Mercado Laboral)',
        records_processed: result.count,
        regions_updated: result.regionsCount,
        periods_updated: result.periodsCount,
        summary: result.message,
        details: {
          first_record: result.firstRecord,
          last_record: result.lastRecord,
          execution_duration: `${Date.now() - new Date(startTime).getTime()}ms`
        }
      });
      
    } catch (error) {
      console.error('❌ Error en actualización del mercado laboral:', error);
      
      // Registrar la ejecución fallida
      await logCronExecution(startTime, 'error', { 
        error: (error as Error).message,
        count: 0 
      });
      
      return NextResponse.json({
        success: false,
        execution_time: new Date().toISOString(),
        error: 'Error al actualizar datos del mercado laboral',
        details: (error as Error).message
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error general en cron job del mercado laboral:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * Actualiza los datos del mercado laboral desde la fuente del INDEC
 */
async function updateLaborMarketData() {
  console.info('📊 Iniciando descarga de datos EPH desde INDEC...');
  
  // 1. Obtener datos nuevos del INDEC
  const newData = await fetchLaborMarketData();
  
  if (!newData || newData.length === 0) {
    console.warn('⚠️ No se obtuvieron datos nuevos del mercado laboral');
    return { 
      count: 0, 
      message: 'No hay datos nuevos para procesar',
      regionsCount: 0,
      periodsCount: 0,
      firstRecord: null,
      lastRecord: null
    };
  }
  
  console.info(`📥 Obtenidos ${newData.length} registros del mercado laboral`);
  
  // Analizar los datos antes de guardar
  const regions = new Set(newData.map(item => item.region)).size;
  const periods = new Set(newData.map(item => item.period)).size;
  console.info(`📈 Datos incluyen ${regions} regiones y ${periods} períodos`);
  
  // 2. Guardar en Supabase con upsert
  console.info('💾 Guardando datos en la base de datos...');
  const { data, error } = await supabase
    .from('labor_market')
    .upsert(newData, { 
      onConflict: 'date,region,age_group,gender',
      ignoreDuplicates: false // Actualizar registros existentes
    })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar datos del mercado laboral en Supabase: ${error.message}`);
  }
  
  const savedCount = data?.length || 0;
  console.info(`✅ Datos guardados exitosamente: ${savedCount} registros`);
  
  // Calcular estadísticas de lo guardado
  const savedRegions = new Set(data?.map(item => item.region) || []).size;
  const savedPeriods = new Set(data?.map(item => item.period) || []).size;
  
  return { 
    count: savedCount,
    message: `Datos del mercado laboral actualizados correctamente`,
    regionsCount: savedRegions,
    periodsCount: savedPeriods,
    firstRecord: data && data.length > 0 ? {
      date: data[0].date,
      period: data[0].period,
      region: data[0].region
    } : null,
    lastRecord: data && data.length > 0 ? {
      date: data[data.length - 1].date,
      period: data[data.length - 1].period,
      region: data[data.length - 1].region
    } : null
  };
}

/**
 * Registra la ejecución del cron job en la base de datos
 */
async function logCronExecution(startTime: string, status: 'success' | 'error', result: any) {
  try {
    const executionLog = {
      execution_time: new Date().toISOString(),
      results: [{
        taskId: 'update-labor-market',
        dataSource: 'INDEC - EPH (Mercado Laboral)',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: result.count || 0,
        status,
        details: status === 'success' 
          ? `Se actualizaron ${result.count} registros. Regiones: ${result.regionsCount}, Períodos: ${result.periodsCount}`
          : `Error: ${result.error || 'Error desconocido'}`
      }],
      status
    };

    const { error } = await supabase
      .from('cron_executions')
      .insert(executionLog);
    
    if (error) {
      console.warn('⚠️ Error al registrar ejecución del cron en la BD:', error.message);
    } else {
      console.info('📝 Ejecución del cron registrada exitosamente');
    }
  } catch (err) {
    console.warn('⚠️ Error al registrar ejecución del cron:', err);
    // No fallar el cron por errores de logging
  }
}