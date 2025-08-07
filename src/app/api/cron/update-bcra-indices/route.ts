// src/app/api/cron/update-bcra-indices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchCERData, fetchUVAData } from '@/services/bcra-fetcher';
import { CronTaskResult } from '@/types';
import { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minuto máximo

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Endpoint para actualización programada de índices del BCRA (CER y UVA)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación para el cron job
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === 'true';
    const isVercelDeployment = process.env.VERCEL_ENV !== undefined;
    
    if ((!isVercelCron && !isVercelDeployment) && 
        (!authHeader || authHeader.split(' ')[1] !== process.env.CRON_SECRET_KEY)) {
      console.error('Intento de acceso no autorizado al cron job de BCRA');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    console.info('Iniciando cron job de actualización de índices BCRA');
    const results: CronTaskResult[] = [];
    const startTime = new Date().toISOString();
    
    // 1. Actualizar CER
    try {
      console.info('Iniciando actualización de CER');
      const cerResult = await updateCERData();
      results.push({
        taskId: 'update-cer',
        dataSource: 'BCRA - CER',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: cerResult.count,
        status: 'success',
        details: `Se actualizaron ${cerResult.count} registros de CER`
      });
      console.info(`Actualización de CER completada: ${cerResult.count} registros`);
    } catch (error) {
      console.error('Error en actualización de CER:', error);
      results.push({
        taskId: 'update-cer',
        dataSource: 'BCRA - CER',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: 0,
        status: 'error',
        details: `Error: ${(error as Error).message}`
      });
    }
    
    // 2. Actualizar UVA
    try {
      console.info('Iniciando actualización de UVA');
      const uvaResult = await updateUVAData();
      results.push({
        taskId: 'update-uva',
        dataSource: 'BCRA - UVA',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: uvaResult.count,
        status: 'success',
        details: `Se actualizaron ${uvaResult.count} registros de UVA`
      });
      console.info(`Actualización de UVA completada: ${uvaResult.count} registros`);
    } catch (error) {
      console.error('Error en actualización de UVA:', error);
      results.push({
        taskId: 'update-uva',
        dataSource: 'BCRA - UVA',
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
    }
    
    console.info('Cron job de BCRA completado:', JSON.stringify(results, null, 2));
    
    return NextResponse.json({
      success: true,
      execution_time: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Error en cron job de BCRA:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Actualiza los datos del CER
 */
async function updateCERData() {
  console.info('Obteniendo últimos datos del CER...');
  
  // Obtener últimos 30 días de datos (por si hay actualizaciones retroactivas)
  const newData = await fetchCERData(false);
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.info(`Obtenidos ${newData.length} registros de CER`);
  
  // Guardar en Supabase
  const { data, error } = await supabase
    .from('cer')
    .upsert(newData, { 
      onConflict: 'date',
      ignoreDuplicates: false // Actualizar registros existentes
    })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar CER: ${error.message}`);
  }
  
  console.info(`Datos CER actualizados: ${data?.length || 0} registros`);
  
  return { 
    count: data?.length || 0, 
    message: 'Datos actualizados correctamente',
    firstRecord: data && data.length > 0 ? data[0] : null,
    lastRecord: data && data.length > 0 ? data[data.length - 1] : null
  };
}

/**
 * Actualiza los datos del UVA
 */
async function updateUVAData() {
  console.info('Obteniendo últimos datos del UVA...');
  
  // Obtener últimos 30 días de datos (por si hay actualizaciones retroactivas)
  const newData = await fetchUVAData(false);
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.info(`Obtenidos ${newData.length} registros de UVA`);
  
  // Guardar en Supabase
  const { data, error } = await supabase
    .from('uva')
    .upsert(newData, { 
      onConflict: 'date',
      ignoreDuplicates: false // Actualizar registros existentes
    })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar UVA: ${error.message}`);
  }
  
  console.info(`Datos UVA actualizados: ${data?.length || 0} registros`);
  
  return { 
    count: data?.length || 0, 
    message: 'Datos actualizados correctamente',
    firstRecord: data && data.length > 0 ? data[0] : null,
    lastRecord: data && data.length > 0 ? data[data.length - 1] : null
  };
}