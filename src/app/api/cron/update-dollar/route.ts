// src/app/api/cron/update-dollar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

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

// Mapeo de tipos de dólar
const DOLLAR_TYPE_MAP: Record<string, string> = {
  'oficial': 'OFICIAL',
  'blue': 'BLUE',
  'bolsa': 'MEP',
  'contadoconliqui': 'CCL',
  'mayorista': 'MAYORISTA',
  'cripto': 'CRYPTO',
  'tarjeta': 'TARJETA'
};

interface DollarApiResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

/**
 * Cron job para actualización de datos del dólar
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
      console.error('Intento de acceso no autorizado al cron job de Dollar');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    console.info('🚀 Iniciando cron job de actualización del dólar');
    const startTime = new Date().toISOString();
    let result;
    
    try {
      // Actualizar datos del dólar
      result = await updateDollarData();
      
      console.info(`✅ Actualización del dólar completada: ${result.newRecords} nuevos registros (${result.intradayUpdates} intradiarios), ${result.duplicatesSkipped} omitidos, ${result.replicatedRecords} replicados`);
      
      // Registrar la ejecución exitosa
      await logCronExecution(startTime, 'success', result);
      
      return NextResponse.json({
        success: true,
        execution_time: new Date().toISOString(),
        data_source: 'dolarapi.com',
        new_records: result.newRecords,
        intraday_updates: result.intradayUpdates,
        duplicates_skipped: result.duplicatesSkipped,
        replicated_records: result.replicatedRecords,
        summary: result.message,
        details: {
          processed_types: result.processedTypes,
          errors: result.errors,
          execution_duration: `${Date.now() - new Date(startTime).getTime()}ms`
        }
      });
      
    } catch (error) {
      console.error('❌ Error en actualización del dólar:', error);
      
      // Registrar la ejecución fallida
      await logCronExecution(startTime, 'error', { 
        error: (error as Error).message,
        newRecords: 0,
        duplicatesSkipped: 0,
        replicatedRecords: 0,
        intradayUpdates: 0
      });
      
      return NextResponse.json({
        success: false,
        execution_time: new Date().toISOString(),
        error: 'Error al actualizar datos del dólar',
        details: (error as Error).message
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error general en cron job del dólar:', error);
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
 * Actualiza los datos del dólar desde la API externa
 * 
 * Comportamiento:
 * - Guarda SIEMPRE que haya una nueva fechaActualizacion, aunque los precios sean iguales
 * - Solo omite si la fechaActualizacion es exactamente igual a la última guardada
 * - Para mercados cerrados (fecha anterior), replica los valores con timestamp actual
 * - Permite tracking completo de actualizaciones, incluso cuando los precios no cambian
 */
async function updateDollarData() {
  console.info('📊 Iniciando descarga de datos del dólar desde dolarapi.com...');
  
  try {
    // 1. Obtener datos de la API externa
    const response = await fetch('https://dolarapi.com/v1/dolares', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Argentina-Datos-API/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener datos de dolarapi.com: ${response.status} ${response.statusText}`);
    }
    
    const dollarData: DollarApiResponse[] = await response.json();
    
    if (!dollarData || dollarData.length === 0) {
      console.warn('⚠️ No se obtuvieron datos del dólar');
      return {
        newRecords: 0,
        duplicatesSkipped: 0,
        replicatedRecords: 0,
        intradayUpdates: 0,
        message: 'No hay datos disponibles en la API',
        processedTypes: [],
        errors: []
      };
    }
    
    console.info(`📥 Obtenidos ${dollarData.length} tipos de dólar desde la API`);
    
    // 2. Obtener la fecha actual en Argentina
    const nowArgentina = new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"});
    const todayArgentina = new Date(nowArgentina);
    todayArgentina.setHours(0, 0, 0, 0);
    const todayISO = todayArgentina.toISOString();
    
    // 3. Procesar cada tipo de dólar
    let newRecords = 0;
    let duplicatesSkipped = 0;
    let replicatedRecords = 0;
    let intradayUpdates = 0;
    const processedTypes: string[] = [];
    const errors: string[] = [];
    
    for (const dollar of dollarData) {
      try {
        const dollarType = DOLLAR_TYPE_MAP[dollar.casa];
        
        if (!dollarType) {
          console.warn(`⚠️ Tipo de dólar no reconocido: ${dollar.casa}`);
          errors.push(`Tipo no reconocido: ${dollar.casa}`);
          continue;
        }
        
        // Convertir la fecha de actualización a timestamp ISO
        const apiUpdatedAt = new Date(dollar.fechaActualizacion);
        const apiDateOnly = new Date(apiUpdatedAt);
        apiDateOnly.setHours(0, 0, 0, 0);
        
        // Verificar el último registro de este tipo de dólar
        const { data: lastRecord } = await supabase
          .from('dollar_rates')
          .select('id, buy_price, sell_price, date, updated_at')
          .eq('dollar_type', dollarType)
          .order('date', { ascending: false })
          .limit(1)
          .single();
        
        // Para Dolar Oficial y Mayorista, siempre guardar con timestamp actual
        const alwaysUpdate = ['OFICIAL', 'MAYORISTA'].includes(dollarType);
        
        // Si existe un registro previo, verificar si la fecha de actualización cambió
        if (lastRecord && !alwaysUpdate) {
          // Comparar la fecha de actualización de la API con la última guardada
          const lastUpdateTime = new Date(lastRecord.updated_at).getTime();
          const apiUpdateTime = apiUpdatedAt.getTime();
          
          // Solo omitir si la fecha de actualización es exactamente la misma
          if (lastUpdateTime === apiUpdateTime) {
            console.info(`⏭️ Sin nueva actualización para: ${dollarType} (última: ${lastRecord.updated_at})`);
            duplicatesSkipped++;
            continue;
          }
        }
        
        // Si la fecha de la API es de hoy, usar los datos actuales
        if (apiDateOnly.getTime() === todayArgentina.getTime()) {
          // Para OFICIAL y MAYORISTA, usar timestamp actual en lugar del de la API
          const currentTimestamp = new Date().toISOString();
          const useCurrentTime = alwaysUpdate;
          
          const dollarRecord = {
            dollar_type: dollarType,
            date: useCurrentTime ? currentTimestamp : apiUpdatedAt.toISOString(),
            buy_price: dollar.compra,
            sell_price: dollar.venta,
            updated_at: useCurrentTime ? currentTimestamp : apiUpdatedAt.toISOString(),
            created_at: currentTimestamp
          };
          
          const { error } = await supabase
            .from('dollar_rates')
            .insert(dollarRecord);
          
          if (error) {
            throw error;
          }
          
          newRecords++;
          
          // Determinar el tipo de actualización
          if (lastRecord) {
            const priceChanged = lastRecord.buy_price !== dollar.compra || lastRecord.sell_price !== dollar.venta;
            const isSameDay = new Date(lastRecord.date).toDateString() === apiDateOnly.toDateString();
            
            if (isSameDay) {
              intradayUpdates++;
              if (alwaysUpdate) {
                console.info(`🔄 Actualización forzada (${dollarType}): ${currentTimestamp} - ${dollar.compra}/${dollar.venta}`);
              } else if (priceChanged) {
                console.info(`📈 Actualización intradiaria con cambio: ${dollarType} - ${apiUpdatedAt.toISOString()} (${lastRecord.buy_price}/${lastRecord.sell_price} → ${dollar.compra}/${dollar.venta})`);
              } else {
                console.info(`📊 Actualización intradiaria sin cambio de precio: ${dollarType} - ${apiUpdatedAt.toISOString()} (mantiene ${dollar.compra}/${dollar.venta})`);
              }
            } else {
              console.info(`✨ Nuevo registro del día: ${dollarType} - ${useCurrentTime ? currentTimestamp : apiUpdatedAt.toISOString()}`);
            }
          } else {
            console.info(`✨ Primer registro: ${dollarType} - ${useCurrentTime ? currentTimestamp : apiUpdatedAt.toISOString()}`);
          }        } else {
          // Si la fecha de la API es anterior (mercados cerrados)
          console.info(`📋 ${dollarType}: Mercado cerrado (última actualización: ${apiUpdatedAt.toISOString()})`);
          
          // Verificar si ya creamos un registro de continuidad hoy
          const todayStart = new Date(todayArgentina);
          const { data: todayRecords } = await supabase
            .from('dollar_rates')
            .select('date')
            .eq('dollar_type', dollarType)
            .gte('date', todayStart.toISOString())
            .order('date', { ascending: false });
          
          if (todayRecords && todayRecords.length > 0) {
            console.info(`⏭️ Ya existe registro de hoy para: ${dollarType} (mercado cerrado)`);
            duplicatesSkipped++;
            continue;
          }
          
          // Crear UN registro de continuidad por día para mercados cerrados
          const nowISO = new Date().toISOString();
          
          const replicatedRecord = {
            dollar_type: dollarType,
            date: nowISO,
            buy_price: dollar.compra,
            sell_price: dollar.venta,
            updated_at: nowISO,
            created_at: nowISO
          };
          
          const { error } = await supabase
            .from('dollar_rates')
            .insert(replicatedRecord);
          
          if (error) {
            throw error;
          }
          
          replicatedRecords++;
          console.info(`📋 Registro de continuidad diario creado: ${dollarType} - valores del ${apiUpdatedAt.toLocaleDateString()} (${dollar.compra}/${dollar.venta})`);
        }
        
        processedTypes.push(dollarType);
        
      } catch (error) {
        console.error(`❌ Error procesando ${dollar.casa}:`, error);
        errors.push(`Error en ${dollar.casa}: ${(error as Error).message}`);
      }
    }
    
    console.info(`✅ Procesamiento completado: ${newRecords} nuevos (${intradayUpdates} actualizaciones intradiarias), ${duplicatesSkipped} omitidos, ${replicatedRecords} replicados`);
    
    return {
      newRecords,
      duplicatesSkipped,
      replicatedRecords,
      intradayUpdates,
      message: 'Datos del dólar actualizados correctamente',
      processedTypes: [...new Set(processedTypes)],
      errors
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo datos de dolarapi.com:', error);
    throw error;
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
        taskId: 'update-dollar',
        dataSource: 'dolarapi.com',
        startTime,
        endTime: new Date().toISOString(),
        recordsProcessed: result.newRecords || 0,
        status,
        details: status === 'success' 
          ? `Procesados: ${result.newRecords} nuevos (${result.intradayUpdates || 0} intradiarios), ${result.duplicatesSkipped} omitidos, ${result.replicatedRecords} replicados. Tipos: ${result.processedTypes?.join(', ') || 'N/A'}`
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