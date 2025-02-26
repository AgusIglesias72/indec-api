// src/app/api/test/update-functions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchINDECData } from '@/app/services/indec/fetcher';
import { Database } from '../../../../types/supabase';

export const dynamic = 'force-dynamic';

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
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
        { error: 'Debe especificar el parámetro "func" (emae o emae_activity)' },
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
    } else {
      return NextResponse.json(
        { error: 'Valor de func no válido. Use "emae" o "emae_activity"' },
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