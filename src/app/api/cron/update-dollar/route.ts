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
      
      console.info(`✅ Actualización del dólar completada: ${result.newRecords} nuevos registros, ${result.updatedRecords} actualizados`);
      
      // Registrar la ejecución exitosa
      await logCronExecution(startTime, 'success', result);
      
      return NextResponse.json({
        success: true,
        execution_time: new Date().toISOString(),
        data_source: 'dolarapi.com',
        new_records: result.newRecords,
        updated_records: result.updatedRecords,
        duplicates_skipped: result.duplicatesSkipped,
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
        updatedRecords: 0
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
        updatedRecords: 0,
        duplicatesSkipped: 0,
        message: 'No hay datos disponibles en la API',
        processedTypes: [],
        errors: []
      };
    }
    
    console.info(`📥 Obtenidos ${dollarData.length} tipos de dólar desde la API`);
    
    // 2. Procesar cada tipo de dólar
    let newRecords = 0;
    let updatedRecords = 0;
    let duplicatesSkipped = 0;
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
        const updatedAt = new Date(dollar.fechaActualizacion).toISOString();
        const date = new Date(dollar.fechaActualizacion).toISOString().split('T')[0];
        
        // Verificar si ya existe un registro con la misma fecha de actualización
        const { data: existingRecord } = await supabase
          .from('dollar_rates')
          .select('id, updated_at')
          .eq('dollar_type', dollarType)
          .eq('updated_at', updatedAt)
          .single();
        
        if (existingRecord) {
          console.info(`⏭️ Registro duplicado omitido: ${dollarType} - ${updatedAt}`);
          duplicatesSkipped++;
          continue;
        }
        
        // Buscar si existe un registro para actualizar (mismo tipo y fecha)
        const { data: recordToUpdate } = await supabase
          .from('dollar_rates')
          .select('id')
          .eq('dollar_type', dollarType)
          .eq('date', date)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        // Preparar datos para insertar/actualizar
        const dollarRecord = {
          dollar_type: dollarType,
          date: date,
          buy_price: dollar.compra,
          sell_price: dollar.venta,
          updated_at: updatedAt,
          created_at: recordToUpdate ? undefined : new Date().toISOString()
        };
        
        if (recordToUpdate) {
          // Actualizar registro existente
          const { error } = await supabase
            .from('dollar_rates')
            .update({
              buy_price: dollarRecord.buy_price,
              sell_price: dollarRecord.sell_price,
              updated_at: dollarRecord.updated_at
            })
            .eq('id', recordToUpdate.id);
          
          if (error) {
            throw error;
          }
          
          updatedRecords++;
          console.info(`📝 Actualizado: ${dollarType} - ${date}`);
        } else {
          // Insertar nuevo registro
          const { error } = await supabase
            .from('dollar_rates')
            .insert(dollarRecord);
          
          if (error) {
            throw error;
          }
          
          newRecords++;
          console.info(`✨ Nuevo registro: ${dollarType} - ${date}`);
        }
        
        processedTypes.push(dollarType);
        
      } catch (error) {
        console.error(`❌ Error procesando ${dollar.casa}:`, error);
        errors.push(`Error en ${dollar.casa}: ${(error as Error).message}`);
      }
    }
    
    console.info(`✅ Procesamiento completado: ${newRecords} nuevos, ${updatedRecords} actualizados, ${duplicatesSkipped} omitidos`);
    
    return {
      newRecords,
      updatedRecords,
      duplicatesSkipped,
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
        recordsProcessed: (result.newRecords || 0) + (result.updatedRecords || 0),
        status,
        details: status === 'success' 
          ? `Procesados: ${result.newRecords} nuevos, ${result.updatedRecords} actualizados, ${result.duplicatesSkipped} omitidos. Tipos: ${result.processedTypes?.join(', ') || 'N/A'}`
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