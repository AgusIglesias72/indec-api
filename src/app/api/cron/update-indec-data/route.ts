// src/app/api/cron/update-indec-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchINDECData } from '@/app/services/indec/fetcher';
import { CronTaskResult } from '@/types';
import { Database } from '@/types/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutos como máximo para completar la tarea

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Endpoint para actualización programada de datos INDEC
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación para el cron job
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === 'true';
    
    // Permitir llamadas desde Vercel cron sin token
    if (!isVercelCron && (!authHeader || authHeader.split(' ')[1] !== process.env.CRON_SECRET_KEY)) {
      console.error('Intento de acceso no autorizado al cron job');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    console.log('Iniciando cron job de actualización de datos INDEC');
    const results: CronTaskResult[] = [];
    const startTime = new Date().toISOString();
    
    // 1. Actualizar EMAE general
    try {
      console.log('Iniciando actualización de EMAE general');
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
      console.log(`Actualización de EMAE completada: ${emaeResult.count} registros`);
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
      console.log('Iniciando actualización de EMAE por actividad');
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
      console.log(`Actualización de EMAE por actividad completada: ${emaeByActivityResult.count} registros`);
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
    
    // Registrar la ejecución del cron job en Supabase (opcional)
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
    
    console.log('Cron job completado:', JSON.stringify(results, null, 2));
    
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
  console.log('Iniciando actualización de datos EMAE...');
  
  // 1. Obtener datos nuevos del INDEC
  let newData = await fetchINDECData('emae');
  
  // Generar UUIDs válidos para cada registro
  newData = newData.map(item => {
    // Eliminar el id generado y dejar que Supabase genere uno automáticamente
    const { id, ...rest } = item;
    return rest;
  });
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.log(`Obtenidos ${newData.length} registros nuevos de EMAE`);
  
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
  
  console.log(`Datos EMAE actualizados: ${data?.length || 0} registros`);
  
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
  console.log('Iniciando actualización de datos EMAE por actividad...');
  
  // 1. Obtener datos nuevos
  let newData = await fetchINDECData('emae_by_activity');
  
  // Eliminar los IDs para que Supabase los genere automáticamente
  newData = newData.map(item => {
    const { id, ...rest } = item;
    return rest;
  });
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.log(`Obtenidos ${newData.length} registros nuevos de EMAE por actividad`);
  
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
  
  console.log(`Datos EMAE por actividad actualizados: ${data?.length || 0} registros`);
  
  return { 
    count: data?.length || 0, 
    message: 'Datos actualizados correctamente',
    sectorCount: new Set(data?.map(item => item.economy_sector) || []).size,
    firstRecord: data && data.length > 0 ? data[0] : null,
    lastRecord: data && data.length > 0 ? data[data.length - 1] : null
  };
}