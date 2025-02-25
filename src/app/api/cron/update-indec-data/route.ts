import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchINDECData } from '@/app/services/indec/fetcher';
import { desestacionalizar, calculateTrendCycle } from '@/app/services/analysis/seasonal';
import { CronTaskResult } from '@/types';
import { Database } from '@/types/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const results: CronTaskResult[] = [];
    const startTime = new Date().toISOString();
    
    // 1. Actualizar EMAE general
    try {
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
    } catch (error) {
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
    } catch (error) {
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
    
    // Registrar la ejecución del cron job (en un proyecto real, se guardaría en la base de datos)
    console.log('Resultados del cron job:', JSON.stringify(results, null, 2));
    
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
 */
async function updateEmaeData() {
  // 1. Obtener datos nuevos del INDEC
  const newData = await fetchINDECData('emae');
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  // 2. Desestacionalizar datos (si es necesario)
  // En este caso, los datos ya vienen con valores desestacionalizados,
  // pero en un caso real podríamos aplicar nuestros propios métodos
  
  // 3. Calcular tendencia-ciclo (si no está incluida)
  for (const item of newData) {
    if (item.cycle_trend_value === undefined || item.cycle_trend_value === null) {
      // Obtener serie histórica para contexto
      const { data: historicalData } = await supabase
        .from('emae')
        .select('date, original_value')
        .order('date', { ascending: true });
      
      if (historicalData && historicalData.length > 0) {
        // Combinar datos históricos y nuevos
        const combinedSeries = [
          ...historicalData.map(d => ({ date: d.date, value: d.original_value })),
          ...newData.map(d => ({ date: d.date, value: d.original_value }))
        ];
        
        // Ordenar por fecha
        combinedSeries.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        // Eliminar duplicados
        const uniqueSeries = combinedSeries.filter((item, index, self) =>
          index === self.findIndex(t => t.date === item.date)
        );
        
        // Calcular tendencia-ciclo
        const values = uniqueSeries.map(item => item.value);
        const trendCycleValues = calculateTrendCycle(values);
        
        // Asignar valores a los nuevos datos
        for (let i = 0; i < newData.length; i++) {
          const dataIndex = uniqueSeries.findIndex(item => item.date === newData[i].date);
          if (dataIndex >= 0) {
            newData[i].cycle_trend_value = trendCycleValues[dataIndex];
          }
        }
      }
    }
  }
  
  // 4. Guardar en Supabase
  const { data, error } = await supabase
    .from('emae')
    .upsert(newData, { onConflict: 'date' })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar EMAE: ${error.message}`);
  }
  
  return { count: data?.length || 0, message: 'Datos actualizados correctamente' };
}

/**
 * Actualiza los datos del EMAE por actividad
 */
async function updateEmaeByActivityData() {
  // 1. Obtener datos nuevos
  const newData = await fetchINDECData('emae_by_activity');
  
  if (!newData || newData.length === 0) {
    return { count: 0, message: 'No hay datos nuevos para procesar' };
  }
  
  // 2. Guardar en Supabase
  const { data, error } = await supabase
    .from('emae_by_activty')
    .upsert(newData, { onConflict: 'id' })
    .select();
  
  if (error) {
    throw new Error(`Error al actualizar EMAE por actividad: ${error.message}`);
  }
  
  return { count: data?.length || 0, message: 'Datos actualizados correctamente' };
}