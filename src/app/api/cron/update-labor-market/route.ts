// src/app/api/cron/update-labor-market/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchLaborMarketData } from '@/services/labor-market-fetcher';
import { Database } from '@/types/supabase';
import { LaborMarketData } from '@/types/labor-market';

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
    /*
    // Permitir llamadas desde Vercel cron o entorno de Vercel sin token
    if ((!isVercelCron && !isVercelDeployment) && 
        (!authHeader || authHeader.split(' ')[1] !== process.env.CRON_SECRET_KEY)) {
      console.error('Intento de acceso no autorizado al cron job de mercado laboral');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
      */
    
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
          execution_duration: `${Date.now() - new Date(startTime).getTime()}ms`,
          breakdown: result.breakdown
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
        lastRecord: null,
        breakdown: {
          national: 0,
          regional: 0,
          demographic: 0
        }
      };
    }
  
    console.info(`📥 Obtenidos ${newData.length} registros del mercado laboral`);
  
    // 1.b Deduplicar datos antes de guardar
    const deduplicatedData = deduplicateRecords(newData);
  
    if (deduplicatedData.length === 0) {
      console.warn('⚠️ Todos los registros fueron duplicados, no hay nada para guardar');
      return {
        count: 0,
        message: 'Todos los registros eran duplicados',
        regionsCount: 0,
        periodsCount: 0,
        firstRecord: null,
        lastRecord: null,
        breakdown: {
          national: 0,
          regional: 0,
          demographic: 0
        }
      };
    }
  
    // Analizar los datos antes de guardar
    const regions = new Set(deduplicatedData.map(item => item.region)).size;
    const periods = new Set(deduplicatedData.map(item => item.period)).size;
    const breakdown = {
      national: deduplicatedData.filter(item => item.data_type === 'national').length,
      regional: deduplicatedData.filter(item => item.data_type === 'regional').length,
      demographic: deduplicatedData.filter(item => item.data_type === 'demographic').length
    };
  
    console.info(`📈 Datos incluyen ${regions} regiones y ${periods} períodos`);
    console.info(`📊 Breakdown: Nacional=${breakdown.national}, Regional=${breakdown.regional}, Demográfico=${breakdown.demographic}`);
  
    // 2. Guardar en Supabase con upsert (constraint corregido)
    console.info('💾 Guardando datos en la base de datos...');
    const { data, error } = await supabase
      .from('labor_market')
      .upsert(deduplicatedData, {
        onConflict: 'date,region,gender,age_group,demographic_segment',
        ignoreDuplicates: false
      })
      .select();
  
    if (error) {
      console.error('❌ Error al guardar datos en Supabase:', error);
      throw new Error(`Error al guardar datos en Supabase: ${error.message}`);
    }
  
    const totalSaved = data?.length || 0;
    console.info(`✅ Todos los batches guardados exitosamente: ${totalSaved} registros en total`);
  
    return {
      count: totalSaved,
      message: `Datos del mercado laboral actualizados correctamente`,
      regionsCount: regions,
      periodsCount: periods,
      firstRecord: deduplicatedData[0] ? {
        date: deduplicatedData[0].date,
        period: deduplicatedData[0].period,
        region: deduplicatedData[0].region,
        data_type: deduplicatedData[0].data_type
      } : null,
      lastRecord: deduplicatedData[deduplicatedData.length - 1] ? {
        date: deduplicatedData[deduplicatedData.length - 1].date,
        period: deduplicatedData[deduplicatedData.length - 1].period,
        region: deduplicatedData[deduplicatedData.length - 1].region,
        data_type: deduplicatedData[deduplicatedData.length - 1].data_type
      } : null,
      breakdown: breakdown
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
          ? `Se actualizaron ${result.count} registros. Nacional: ${result.breakdown?.national || 0}, Regional: ${result.breakdown?.regional || 0}, Demográfico: ${result.breakdown?.demographic || 0}`
          : `Error: ${result.error || 'Unknown error'}`
      }],
      status
    };

    const { error } = await supabase
      .from('cron_executions')
      .insert(executionLog);

    if (error) {
      console.warn('⚠️ Error al registrar ejecución del cron:', error.message);
    } else {
      console.info('📝 Ejecución del cron registrada exitosamente');
    }
  } catch (err) {
    console.warn('⚠️ Error al registrar ejecución del cron:', err);
  }
}

/**
 * Deduplica registros basado en la clave única
 */
function deduplicateRecords(records: Omit<LaborMarketData, "id">[]): Omit<LaborMarketData, "id">[] {
  const uniqueRecords = new Map<string, Omit<LaborMarketData, "id">>();
  let duplicatesFound = 0;
  
  records.forEach((record, index) => {
    // Crear clave única basada en el constraint de la tabla
    const key = `${record.date}-${record.region}-${record.gender || 'NULL'}-${record.age_group || 'NULL'}-${record.demographic_segment || 'NULL'}`;
    
    if (!uniqueRecords.has(key)) {
      uniqueRecords.set(key, { ...record });
    } else {
      duplicatesFound++;
      console.info(`🔍 Duplicado encontrado en índice ${index}: ${key}`);
      
      // Si ya existe, combinar los datos (mantener valores no null)
      const existing = uniqueRecords.get(key)!;
      const merged = { ...existing };
      
      // Combinar indicadores (mantener valores no null, priorizar los más recientes)
      if (record.activity_rate !== null && record.activity_rate !== undefined) {
        merged.activity_rate = record.activity_rate;
      }
      if (record.employment_rate !== null && record.employment_rate !== undefined) {
        merged.employment_rate = record.employment_rate;
      }
      if (record.unemployment_rate !== null && record.unemployment_rate !== undefined) {
        merged.unemployment_rate = record.unemployment_rate;
      }
      
      // Combinar poblaciones si existen
      if (record.total_population !== null && record.total_population !== undefined) {
        merged.total_population = record.total_population;
      }
      if (record.economically_active_population !== null && record.economically_active_population !== undefined) {
        merged.economically_active_population = record.economically_active_population;
      }
      if (record.employed_population !== null && record.employed_population !== undefined) {
        merged.employed_population = record.employed_population;
      }
      if (record.unemployed_population !== null && record.unemployed_population !== undefined) {
        merged.unemployed_population = record.unemployed_population;
      }
      if (record.inactive_population !== null && record.inactive_population !== undefined) {
        merged.inactive_population = record.inactive_population;
      }
      
      // Mantener el source_file más específico (priorizar el más reciente)
      if (record.source_file && record.source_file !== 'unknown') {
        merged.source_file = record.source_file;
      }
      
      // Actualizar data_type si es más específico
      if (record.data_type && record.data_type !== 'national') {
        merged.data_type = record.data_type;
      }
      
      uniqueRecords.set(key, merged);
    }
  });
  
  console.info(`🔍 Deduplicación completada: ${duplicatesFound} duplicados encontrados y combinados`);
  
  return Array.from(uniqueRecords.values());
}