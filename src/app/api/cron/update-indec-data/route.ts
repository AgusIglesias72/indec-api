// src/app/api/cron/update-indec-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchINDECData } from '@/services/emae-fetcher';
import { CronTaskResult } from '@/types';
import { Database } from '@/types/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutos como máximo para completar la tarea

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Endpoint para actualización programada de datos INDEC
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
      console.error('Intento de acceso no autorizado al cron job');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    console.info('Iniciando cron job de actualización de datos INDEC');
    const results: CronTaskResult[] = [];
    const startTime = new Date().toISOString();
    
    // 1. Actualizar EMAE general
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
    
    // 2. Actualizar EMAE por actividad
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
    
    // 3. Actualizar IPC general
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
    
    // Registrar la ejecución del cron job en Supabase
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
      // No fallamos el cron por errores de registro
    }
    
    console.info('Cron job completado:', JSON.stringify(results, null, 2));
    
    return NextResponse.json({
      success: true,
      execution_time: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Error en cron job:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Actualiza los datos del EMAE general
 * Utilizando la implementación probada en el endpoint de test
 */
async function updateEmaeData() {
  console.info('Iniciando actualización de datos EMAE...');
  
  // 1. Obtener datos nuevos del INDEC
  const newData = (await fetchINDECData('emae')).map(item => {
    const { id, ...rest } = item;
    return rest;
  });
   
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.info(`Obtenidos ${newData.length} registros nuevos de EMAE`);
  
  // 2. Guardar en Supabase
  const { data, error } = await supabase
    .from('emae')
    .upsert(newData, { 
      onConflict: 'date',
      ignoreDuplicates: false // Actualizar registros existentes
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

/**
 * Actualiza los datos del EMAE por actividad
 * Utilizando la implementación probada en el endpoint de test
 */
async function updateEmaeByActivityData() {
  console.info('Iniciando actualización de datos EMAE por actividad...');
  
  // 1. Obtener datos nuevos
  let newData = await fetchINDECData('emae_by_activity');
  
  // Eliminar los IDs para que Supabase los genere automáticamente
  newData = newData.map(item => {
    // const { id, ...rest } = item;
    const {...rest } = item;
    return rest;
  });
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.info(`Obtenidos ${newData.length} registros nuevos de EMAE por actividad`);
  
  // 2. Guardar en Supabase
  const { data, error } = await supabase
    .from('emae_by_activity')
    .upsert(newData, { 
      onConflict: 'date, economy_sector_code',
      ignoreDuplicates: false // Actualizar registros existentes
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



/**
 * Actualiza los datos del IPC
 */
/**
 * Actualiza los datos del IPC
 */
async function updateIPCData() {
  console.info('Iniciando actualización de datos IPC...');
  
  // 1. Obtener datos nuevos del INDEC
  const newData = await fetchINDECData('ipc');
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.info(`Obtenidos ${newData.length} registros nuevos de IPC`);
  
  // 2. Guardar en Supabase
  const { data, error } = await supabase
    .from('ipc')
    .upsert(newData, { 
      onConflict: 'date,component_code,region',
      ignoreDuplicates: false // Actualizar registros existentes
    })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar IPC: ${error.message}`);
  }
  
  console.info(`Datos IPC actualizados: ${data?.length || 0} registros`);
  
  // Ya no es necesario calcular variaciones, ya que se harán dinámicamente en la API
  
  return { 
    count: data?.length || 0, 
    message: 'Datos IPC actualizados correctamente',
    firstRecord: data && data.length > 0 ? data[0] : null,
    lastRecord: data && data.length > 0 ? data[data.length - 1] : null
  };
}