// src/app/api/cron/update-poverty/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchPovertyData } from '@/services/poverty-fetcher';
import { Database } from '@/types/supabase';
import { PovertyData } from '@/types/poverty';

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
 * Cron job dedicado para actualización de datos de pobreza e indigencia
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
      console.error('Intento de acceso no autorizado al cron job de pobreza');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
      */
    
    console.info('🚀 Iniciando cron job de actualización de pobreza e indigencia');
    const startTime = new Date().toISOString();
    let result;
    
    try {
      // Actualizar datos de pobreza
      result = await updatePovertyData();
      
      console.info(`✅ Actualización de pobreza completada: ${result.count} registros`);
      
      // Registrar la ejecución exitosa en Supabase
      await logCronExecution(startTime, 'success', result);
      
      return NextResponse.json({
        success: true,
        execution_time: new Date().toISOString(),
        data_source: 'INDEC - Pobreza e Indigencia',
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
      console.error('❌ Error en actualización de pobreza:', error);
      
      // Registrar la ejecución fallida
      await logCronExecution(startTime, 'error', { 
        error: (error as Error).message,
        count: 0 
      });
      
      return NextResponse.json({
        success: false,
        execution_time: new Date().toISOString(),
        error: 'Error al actualizar datos de pobreza',
        details: (error as Error).message
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error general en cron job de pobreza:', error);
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
 * Actualiza los datos de pobreza desde la fuente del INDEC
 */
async function updatePovertyData() {
    console.info('📊 Iniciando descarga de datos de pobreza desde INDEC...');
  
    // 1. Obtener datos nuevos del INDEC
    const newData = await fetchPovertyData();
  
    if (!newData || newData.length === 0) {
      console.warn('⚠️ No se obtuvieron datos nuevos de pobreza');
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
          provincial: 0
        }
      };
    }
  
    console.info(`📥 Obtenidos ${newData.length} registros de pobreza`);
  
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
          provincial: 0
        }
      };
    }
  
    // Analizar los datos antes de guardar
    const regions = new Set(deduplicatedData.map(item => item.region)).size;
    const periods = new Set(deduplicatedData.map(item => item.period)).size;
    const breakdown = {
      national: deduplicatedData.filter(item => item.data_type === 'national').length,
      regional: deduplicatedData.filter(item => item.data_type === 'regional').length,
      // provincial: deduplicatedData.filter(item => item.data_type === 'provincial').length
    };
  
    console.info(`📈 Datos incluyen ${regions} regiones y ${periods} períodos`);
    console.info(`📊 Breakdown: Nacional=${breakdown.national}, Regional=${breakdown.regional}`);
  
    // 2. Guardar en Supabase con upsert
    console.info('💾 Guardando datos en la base de datos...');
    const { data, error } = await supabase
      .from('poverty_data')
      .upsert(deduplicatedData, {
        onConflict: 'date,region',
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
      message: `Datos de pobreza actualizados correctamente`,
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
        taskId: 'update-poverty',
        dataSource: 'INDEC - Pobreza e Indigencia',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: result.count || 0,
        status,
        details: status === 'success' 
          ? `Se actualizaron ${result.count} registros. Nacional: ${result.breakdown?.national || 0}, Regional: ${result.breakdown?.regional || 0}, Provincial: ${result.breakdown?.provincial || 0}`
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
function deduplicateRecords(records: Omit<PovertyData, "id">[]): Omit<PovertyData, "id">[] {
  const uniqueRecords = new Map<string, Omit<PovertyData, "id">>();
  let duplicatesFound = 0;
  
  records.forEach((record, index) => {
    // Crear clave única basada en fecha y región
    const key = `${record.date}-${record.region}`;
    
    if (!uniqueRecords.has(key)) {
      uniqueRecords.set(key, { ...record });
    } else {
      duplicatesFound++;
      console.info(`🔍 Duplicado encontrado en índice ${index}: ${key}`);
      
      // Si ya existe, combinar los datos (mantener valores no null)
      const existing = uniqueRecords.get(key)!;
      const merged = { ...existing };
      
      // Combinar indicadores (mantener valores no null, priorizar los más recientes)
      if (record.poverty_rate_persons !== null && record.poverty_rate_persons !== undefined) {
        merged.poverty_rate_persons = record.poverty_rate_persons;
      }
      if (record.poverty_rate_households !== null && record.poverty_rate_households !== undefined) {
        merged.poverty_rate_households = record.poverty_rate_households;
      }
      if (record.indigence_rate_persons !== null && record.indigence_rate_persons !== undefined) {
        merged.indigence_rate_persons = record.indigence_rate_persons;
      }
      if (record.indigence_rate_households !== null && record.indigence_rate_households !== undefined) {
        merged.indigence_rate_households = record.indigence_rate_households;
      }
      
      // Las propiedades de población no están en el tipo PovertyData actual
      // Se eliminan para mantener compatibilidad con el tipo definido
      
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