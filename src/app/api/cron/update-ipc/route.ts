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
    console.info('Iniciando cron job de actualización de datos IPC');
    const results: CronTaskResult[] = [];
    const startTime = new Date().toISOString();
    
    try {
      console.info('Iniciando actualización de IPC');
      const ipcResult = await updateIPCData();
      results.push({
        taskId: 'update-ipc',
        dataSource: 'INDEC - IPC',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: ipcResult.count,
        status: 'success',
        details: `Se actualizaron ${ipcResult.count} registros de IPC`
      });
      console.info(`Actualización de IPC completada: ${ipcResult.count} registros`);
    } catch (error) {
      console.error('Error en actualización de IPC:', error);
      results.push({
        taskId: 'update-ipc',
        dataSource: 'INDEC - IPC',
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
    
    console.info('Cron job de IPC completado:', JSON.stringify(results, null, 2));
    
    return NextResponse.json({
      success: true,
      execution_time: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Error en cron job de IPC:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function updateIPCData() {
  console.info('Iniciando actualización de datos IPC...');
  
  const newData = await fetchINDECData('ipc');
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.info(`Obtenidos ${newData.length} registros nuevos de IPC`);
  
  const { data, error } = await supabase
    .from('ipc')
    .upsert(newData, { 
      onConflict: 'date,component_code,region',
      ignoreDuplicates: false
    })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar IPC: ${error.message}`);
  }
  
  console.info(`Datos IPC actualizados: ${data?.length || 0} registros`);
  
  return { 
    count: data?.length || 0, 
    message: 'Datos IPC actualizados correctamente',
    firstRecord: data && data.length > 0 ? data[0] : null,
    lastRecord: data && data.length > 0 ? data[data.length - 1] : null
  };
}