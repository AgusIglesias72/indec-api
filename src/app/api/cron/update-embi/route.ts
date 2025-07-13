// src/app/api/cron/update-embi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getEmbiData, EmbiRow } from '@/services/google-sheets';
import { Database } from '@/types/supabase';

// export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutos como máximo para completar la tarea

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
const embiSpreadsheetId = process.env.EMBI_SPREADSHEET_ID as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Unable to initialize Supabase client. Missing environment variables: ${
      !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : ''
    }${!supabaseKey ? 'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY' : ''}`
  );
}

if (!embiSpreadsheetId) {
  throw new Error('Missing EMBI_SPREADSHEET_ID environment variable');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Cron job para actualización de datos del riesgo país (EMBI)
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
      console.error('Intento de acceso no autorizado al cron job de EMBI');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    console.info('🚀 Iniciando cron job de actualización del riesgo país (EMBI)');
    const startTime = new Date().toISOString();
    let result;
    
    try {
      // Actualizar datos del riesgo país
      result = await updateEmbiData();
      
      console.info(`✅ Actualización del EMBI completada: ${result.newRecords} nuevos registros de ${result.totalProcessed} procesados`);
      
      // Registrar la ejecución exitosa en Supabase
      await logCronExecution(startTime, 'success', result);
      
      return NextResponse.json({
        success: true,
        execution_time: new Date().toISOString(),
        data_source: 'Google Sheets - EMBI Argentina',
        records_processed: result.totalProcessed,
        new_records: result.newRecords,
        duplicates_skipped: result.duplicatesSkipped,
        summary: result.message,
        details: {
          first_record: result.firstRecord,
          last_record: result.lastRecord,
          date_range: result.dateRange,
          execution_duration: `${Date.now() - new Date(startTime).getTime()}ms`
        }
      });
      
    } catch (error) {
      console.error('❌ Error en actualización del EMBI:', error);
      
      // Registrar la ejecución fallida
      await logCronExecution(startTime, 'error', { 
        error: (error as Error).message,
        newRecords: 0,
        totalProcessed: 0 
      });
      
      return NextResponse.json({
        success: false,
        execution_time: new Date().toISOString(),
        error: 'Error al actualizar datos del riesgo país',
        details: (error as Error).message
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error general en cron job del EMBI:', error);
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
 * Actualiza los datos del riesgo país (EMBI) desde Google Sheets
 */
async function updateEmbiData() {
  console.info('📊 Iniciando descarga de datos EMBI desde Google Sheets...');
  
  // 1. Obtener datos nuevos de Google Sheets
  const newData = await getEmbiData(embiSpreadsheetId);
  
  if (!newData || newData.length === 0) {
    console.warn('⚠️ No se obtuvieron datos nuevos del EMBI');
    return { 
      newRecords: 0,
      totalProcessed: 0,
      duplicatesSkipped: 0,
      message: 'No hay datos nuevos para procesar',
      firstRecord: null,
      lastRecord: null,
      dateRange: null
    };
  }
  
  console.info(`📥 Obtenidos ${newData.length} registros del EMBI desde Google Sheets`);
  
  // 2. Transformar datos al formato de Supabase
  const transformedData = newData.map(row => ({
    external_id: row.id,
    date: parseEmbiDate(row.fecha),
    value: row.indice
  }));
  
  // Filtrar registros con fechas válidas
  const validData = transformedData.filter(row => row.date !== null) as Array<{
    external_id: string;
    date: string;
    value: number;
  }>;
  
  if (validData.length === 0) {
    console.warn('⚠️ No se encontraron registros con fechas válidas');
    return {
      newRecords: 0,
      totalProcessed: newData.length,
      duplicatesSkipped: 0,
      message: 'No hay registros con fechas válidas para procesar',
      firstRecord: null,
      lastRecord: null,
      dateRange: null
    };
  }
  
  console.info(`📈 ${validData.length} registros con fechas válidas de ${newData.length} totales`);
  
  // 4. Filtrar solo los IDs que no existen en la base de datos
  console.info('🔍 Verificando registros existentes en la base de datos...');
  const existingIds = validData.length > 0 ? await getExistingIds(validData.map(r => r.external_id)) : [];
  
  const newRecords = validData.filter(record => !existingIds.includes(record.external_id));
  const skippedCount = validData.length - newRecords.length;
  
  console.info(`📊 Filtrado completado: ${newRecords.length} nuevos, ${skippedCount} ya existentes`);
  
  if (newRecords.length === 0) {
    console.info('✅ No hay registros nuevos para procesar');
    return {
      newRecords: 0,
      totalProcessed: newData.length,
      duplicatesSkipped: skippedCount,
      message: 'No hay registros nuevos para procesar',
      firstRecord: null,
      lastRecord: null,
      dateRange: null
    };
  }
  
  // 5. Guardar solo los registros nuevos en Supabase
  // 5. Guardar solo los registros nuevos en Supabase (usando upsert como seguridad)
  console.info('💾 Insertando registros nuevos en la base de datos...');
  const { data, error } = await supabase
    .from('embi_risk')
    .upsert(newRecords, { 
      onConflict: 'external_id',
      ignoreDuplicates: true // Ignorar duplicados si los hay
    })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar datos del EMBI en Supabase: ${error.message}`);
  }
  
  const savedCount = data?.length || 0;
  console.info(`✅ Datos guardados exitosamente: ${savedCount} registros`);
  
  // Calcular estadísticas
  const dates = newRecords.map(r => r.date).filter(d => d).sort();
  const dateRange = dates.length > 0 ? `${dates[0]} a ${dates[dates.length - 1]}` : null;
  
  return { 
    newRecords: savedCount,
    totalProcessed: newData.length,
    duplicatesSkipped: skippedCount,
    message: `Datos del riesgo país (EMBI) actualizados correctamente`,
    firstRecord: data && data.length > 0 ? {
      date: data[0].date,
      value: data[0].value,
      external_id: data[0].external_id
    } : null,
    lastRecord: data && data.length > 0 ? {
      date: data[data.length - 1].date,
      value: data[data.length - 1].value,
      external_id: data[data.length - 1].external_id
    } : null,
    dateRange
  };
}

/**
 * Obtiene los IDs externos que ya existen en la base de datos (en lotes)
 */
async function getExistingIds(externalIds: string[]): Promise<string[]> {
  try {
    const batchSize = 100; // Procesar en lotes de 100
    const existingIds: string[] = [];
    
    console.info(`🔍 Verificando ${externalIds.length} IDs en lotes de ${batchSize}...`);
    
    for (let i = 0; i < externalIds.length; i += batchSize) {
      const batch = externalIds.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('embi_risk')
        .select('external_id')
        .in('external_id', batch);
      
      if (error) {
        console.warn(`⚠️ Error en lote ${Math.floor(i/batchSize) + 1}:`, error.message);
        continue;
      }
      
      if (data) {
        existingIds.push(...data.map(record => record.external_id));
      }
      
      // Pequeña pausa para no saturar la API
      if (i + batchSize < externalIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.info(`✅ Verificación completada: ${existingIds.length} IDs ya existen`);
    return existingIds;
  } catch (error) {
    console.warn('⚠️ Error verificando IDs existentes, usando fallback...', error);
    
    // Fallback: usar un query más simple para obtener todos los IDs existentes
    try {
      const { data, error: fallbackError } = await supabase
        .from('embi_risk')
        .select('external_id');
        
      if (fallbackError) {
        console.warn('⚠️ Fallback también falló, asumiendo que no hay duplicados');
        return [];
      }
      
      const allExistingIds = data?.map(record => record.external_id) || [];
      return externalIds.filter(id => allExistingIds.includes(id));
    } catch (fallbackError) {
      console.warn('⚠️ Fallback falló, asumiendo que no hay duplicados');
      return [];
    }
  }
}

/**
 * Convierte una fecha del formato de Google Sheets a ISO string
 * - Fechas CON hora: se interpretan como GMT 0 (UTC)
 * - Fechas SIN hora: se asume cierre de día en Argentina (18:00 GMT-3)
 * Maneja formatos como: "29/3/1999", "13/7/2025", "12/7/2025 18:10:47"
 */
function parseEmbiDate(dateString: string): string | null {
  try {
    // Limpiar el string de fecha
    const cleanDate = dateString.trim();
    
    // Formato: DD/M/YYYY o DD/MM/YYYY (con o sin hora)
    const regex = /(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?/;
    const match = cleanDate.match(regex);
    
    if (match) {
      const [, day, month, year, hour, minute, second] = match;
      
      if (hour && minute && second) {
        // Tiene hora: interpretar como GMT 0 (UTC)
        const date = new Date(Date.UTC(
          parseInt(year),
          parseInt(month) - 1, // Los meses en JS van de 0-11
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        ));
        
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } else {
        // No tiene hora: asumir cierre del día en Argentina (18:00 GMT-3)
        const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T18:00:00-03:00`;
        const date = new Date(dateStr);
        
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
    }
    
    console.warn(`No se pudo parsear la fecha: ${dateString}`);
    return null;
    
  } catch (error) {
    console.warn(`Error al parsear fecha ${dateString}:`, error);
    return null;
  }
}

/**
 * Registra la ejecución del cron job en la base de datos
 */
async function logCronExecution(startTime: string, status: 'success' | 'error', result: any) {
  try {
    const executionLog = {
      execution_time: new Date().toISOString(),
      results: [{
        taskId: 'update-embi',
        dataSource: 'Google Sheets - EMBI Argentina',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: result.totalProcessed || 0,
        status,
        details: status === 'success' 
          ? `Se procesaron ${result.totalProcessed} registros, ${result.newRecords} nuevos guardados, ${result.duplicatesSkipped} duplicados omitidos. Rango: ${result.dateRange || 'N/A'}`
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