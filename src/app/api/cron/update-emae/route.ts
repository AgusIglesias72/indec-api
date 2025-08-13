import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchINDECData } from '@/services/emae-fetcher';
import { CronTaskResult } from '@/types';
import { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    console.info('Iniciando cron job de actualización de datos EMAE');
    const results: CronTaskResult[] = [];
    const startTime = new Date().toISOString();
    
    try {
      console.info('Iniciando actualización de EMAE general');
      const emaeResult = await updateEmaeData();
      results.push({
        taskId: 'update-emae',
        dataSource: 'INDEC - EMAE',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: emaeResult.count,
        status: 'success',
        details: `Se actualizaron ${emaeResult.count} registros de EMAE`
      });
      console.info(`Actualización de EMAE completada: ${emaeResult.count} registros`);
    } catch (error) {
      console.error('Error en actualización de EMAE:', error);
      results.push({
        taskId: 'update-emae',
        dataSource: 'INDEC - EMAE',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: 0,
        status: 'error',
        details: `Error: ${(error as Error).message}`
      });
    }
    
    try {
      console.info('Iniciando actualización de EMAE por actividad');
      const emaeByActivityResult = await updateEmaeByActivityData();
      results.push({
        taskId: 'update-emae-by-activity',
        dataSource: 'INDEC - EMAE por actividad',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: emaeByActivityResult.count,
        status: 'success',
        details: `Se actualizaron ${emaeByActivityResult.count} registros de EMAE por actividad`
      });
      console.info(`Actualización de EMAE por actividad completada: ${emaeByActivityResult.count} registros`);
    } catch (error) {
      console.error('Error en actualización de EMAE por actividad:', error);
      results.push({
        taskId: 'update-emae-by-activity',
        dataSource: 'INDEC - EMAE por actividad',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: 0,
        status: 'error',
        details: `Error: ${(error as Error).message}`
      });
    }
    
    try {
      const { error } = await supabase
        .from('cron_executions')
        .insert({
          execution_time: new Date().toISOString(),
          results: JSON.parse(JSON.stringify(results)),
          status: results.every(r => r.status === 'success') ? 'success' : 'partial'
        });
      
      if (error) {
        console.warn('Error al registrar ejecución del cron:', error.message);
      }
    } catch (err) {
      console.warn('Error al registrar ejecución del cron:', err);
    }
    
    console.info('Cron job de EMAE completado:', JSON.stringify(results, null, 2));
    
    return NextResponse.json({
      success: true,
      execution_time: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Error en cron job de EMAE:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function updateEmaeData() {
  console.info('Iniciando actualización de datos EMAE...');
  
  const newData = (await fetchINDECData('emae')).map(item => {
    const { id, ...rest } = item;
    return rest;
  });
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.info(`Obtenidos ${newData.length} registros nuevos de EMAE`);
  
  const { data, error } = await supabase
    .from('emae')
    .upsert(newData, { 
      onConflict: 'date',
      ignoreDuplicates: false
    })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar EMAE: ${error.message}`);
  }
  
  console.info(`Datos EMAE actualizados: ${data?.length || 0} registros`);
  
  return { 
    count: data?.length || 0, 
    message: 'Datos actualizados correctamente',
    firstRecord: data && data.length > 0 ? data[0] : null,
    lastRecord: data && data.length > 0 ? data[data.length - 1] : null
  };
}

async function updateEmaeByActivityData() {
  console.info('Iniciando actualización de datos EMAE por actividad...');
  
  let newData = await fetchINDECData('emae_by_activity');
  
  newData = newData.map(item => {
    const {...rest } = item;
    return rest;
  });
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.info(`Obtenidos ${newData.length} registros nuevos de EMAE por actividad`);
  
  const { data, error } = await supabase
    .from('emae_by_activity')
    .upsert(newData, { 
      onConflict: 'date, economy_sector_code',
      ignoreDuplicates: false
    })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar EMAE por actividad: ${error.message}`);
  }
  
  console.info(`Datos EMAE por actividad actualizados: ${data?.length || 0} registros`);
  
  return { 
    count: data?.length || 0, 
    message: 'Datos actualizados correctamente',
    sectorCount: new Set(data?.map(item => item.economy_sector) || []).size,
    firstRecord: data && data.length > 0 ? data[0] : null,
    lastRecord: data && data.length > 0 ? data[data.length - 1] : null
  };
}