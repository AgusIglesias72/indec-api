// src/app/api/test/update-functions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchINDECData } from '@/app/services/indec/fetcher';
import { Database } from '../../../../types/supabase';
import { calculateIPCVariations } from '@/app/services/indec/ipc-fetcher';

export const dynamic = 'force-dynamic';

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Endpoint para probar funciones de actualización
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || 
        authHeader.split(' ')[1] !== process.env.API_SECRET_KEY) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetro de consulta para determinar qué función ejecutar
    const funcType = request.nextUrl.searchParams.get('func');
    
    if (!funcType) {
      return NextResponse.json(
        { error: 'Debe especificar el parámetro "func" (emae, emae_activity, ipc, ipc_component)' },
        { status: 400 }
      );
    }

    // Determinar qué función ejecutar
    if (funcType === 'emae') {
      const result = await updateEmaeData();
      return NextResponse.json({
        success: true,
        function: 'updateEmaeData',
        result
      });
    } else if (funcType === 'emae_activity') {
      const result = await updateEmaeByActivityData();
      return NextResponse.json({
        success: true,
        function: 'updateEmaeByActivityData',
        result
      });
    } else if (funcType === 'ipc') {
      const result = await updateIPCData();
      return NextResponse.json({
        success: true,
        function: 'updateIPCData',
        result
      });
    } else if (funcType === 'ipc_component') {
      const result = await updateIPCByComponentData();
      return NextResponse.json({
        success: true,
        function: 'updateIPCByComponentData',
        result
      });
    } else {
      return NextResponse.json(
        { error: 'Valor de func no válido. Use "emae", "emae_activity", "ipc" o "ipc_component"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error al ejecutar función de prueba:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
}

/**
 * Actualiza los datos del EMAE general
 */
async function updateEmaeData() {
  console.log('Iniciando actualización de datos EMAE...');
  
  // 1. Obtener datos nuevos del INDEC
  let newData = await fetchINDECData('emae');
  
  // Generar UUIDs válidos para cada registro
  newData = newData.map(item => {
    // Eliminar el id generado y dejar que Supabase genere uno automáticamente
    const {...rest } = item;
    return rest;
  });
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.log(`Obtenidos ${newData.length} registros nuevos de EMAE`);
  
  // 2. Guardar en Supabase
  const { data, error } = await supabase
    .from('emae')
    .upsert(newData, { onConflict: 'date' })
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
 */
async function updateEmaeByActivityData() {
  console.log('Iniciando actualización de datos EMAE por actividad...');
  
  // 1. Obtener datos nuevos
  let newData = await fetchINDECData('emae_by_activity');
  
  // Eliminar los IDs para que Supabase los genere automáticamente
  newData = newData.map(item => {
    const {...rest } = item;
    return rest;
  });
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.log(`Obtenidos ${newData.length} registros nuevos de EMAE por actividad`);
  
  // 2. Guardar en Supabase
  const { data, error } = await supabase
    .from('emae_by_activity')
    .upsert(newData, { onConflict: 'id' })
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



/**
 * Actualiza los datos del IPC
 */
async function updateIPCData() {
  console.log('Iniciando actualización de datos IPC...');
  
  // 1. Obtener datos nuevos del INDEC
  let newData = await fetchINDECData('ipc');
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.log(`Obtenidos ${newData.length} registros nuevos de IPC`);
  
  // 2. Guardar en Supabase
  const { data, error } = await supabase
    .from('ipc')
    .upsert(newData, { 
      onConflict: 'date,component_code',
      ignoreDuplicates: false // Actualizar registros existentes
    })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar IPC: ${error.message}`);
  }
  
  console.log(`Datos IPC actualizados: ${data?.length || 0} registros`);
  
  // 3. Calcular variaciones para el nivel general
  if (data && data.length > 0) {
    try {
      // Obtener todos los registros del nivel general
      const { data: generalData, error: generalError } = await supabase
        .from('ipc')
        .select('*')
        .eq('is_general_index', true)
        .order('date', { ascending: true });
      
      if (generalError) throw generalError;
      
      if (generalData && generalData.length > 0) {
        // Calcular variaciones
        const dataWithVariations = calculateIPCVariations(generalData);
        
        // Actualizar registros con variaciones
        for (const item of dataWithVariations) {
          if (item.monthly_pct_change !== undefined || 
              item.yearly_pct_change !== undefined || 
              item.accumulated_pct_change !== undefined) {
            
            const updateData: any = {};
            if (item.monthly_pct_change !== undefined) updateData.monthly_pct_change = item.monthly_pct_change;
            if (item.yearly_pct_change !== undefined) updateData.yearly_pct_change = item.yearly_pct_change;
            if (item.accumulated_pct_change !== undefined) updateData.accumulated_pct_change = item.accumulated_pct_change;
            
            await supabase
              .from('ipc')
              .update(updateData)
              .eq('id', item.id);
          }
        }
        
        console.log('Variaciones de IPC calculadas y actualizadas');
      }
    } catch (varError) {
      console.error('Error al calcular variaciones del IPC:', varError);
    }
  }
  
  return { 
    count: data?.length || 0, 
    message: 'Datos IPC actualizados correctamente',
    firstRecord: data && data.length > 0 ? data[0] : null,
    lastRecord: data && data.length > 0 ? data[data.length - 1] : null
  };
}

/**
 * Actualiza los datos del IPC por componente
 */
async function updateIPCByComponentData() {
  console.log('Iniciando actualización de datos IPC por componente...');
  
  // 1. Obtener datos nuevos
  let newData = await fetchINDECData('ipc_by_component');
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  console.log(`Obtenidos ${newData.length} registros nuevos de IPC por componente`);
  
  // 2. Guardar en Supabase
  const { data, error } = await supabase
    .from('ipc_by_component')
    .upsert(newData, { 
      onConflict: 'date,component_code',
      ignoreDuplicates: false // Actualizar registros existentes
    })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar IPC por componente: ${error.message}`);
  }
  
  console.log(`Datos IPC por componente actualizados: ${data?.length || 0} registros`);
  
  return { 
    count: data?.length || 0, 
    message: 'Datos IPC por componente actualizados correctamente',
    componentCount: new Set(data?.map(item => item.component) || []).size,
    firstRecord: data && data.length > 0 ? data[0] : null,
    lastRecord: data && data.length > 0 ? data[data.length - 1] : null
  };
}