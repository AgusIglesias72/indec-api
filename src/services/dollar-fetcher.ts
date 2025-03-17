// src/services/dollar-fetcher.ts
import { Database } from '@/types/supabase';
import axios from 'axios';
import { DollarRateInsert, ExternalDollarRate, dollarTypeMapping } from '@/types/dollar';

/**
 * Obtiene datos de cotizaciones de dólar desde la API externa
 */
/**
 * Obtiene y guarda datos de cotizaciones de dólar desde la API externa
 * @param supabase Cliente de Supabase opcional para guardar los datos directamente
 * @returns Datos procesados y resultado de la operación
 */
export async function fetchDollarRates(supabase?: ReturnType<typeof import('@supabase/supabase-js').createClient<Database>>): Promise<{data: DollarRateInsert[], savedCount?: number}> {
  try {
    // URL de la API externa
    const url = 'https://api.argentinadatos.com/v1/cotizaciones/dolares';
    
    console.info(`Obteniendo cotizaciones de dólar desde: ${url}`);
    
    // Realizar petición a la API
    const response = await axios.get<ExternalDollarRate[]>(url);
    
    // Validar respuesta
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Formato de respuesta inesperado en la API de cotizaciones');
    }
    
    console.info(`Se obtuvieron ${response.data.length} cotizaciones`);
    
    // Transformar datos al formato interno
    const processedData: DollarRateInsert[] = response.data.map(item => {
      // Determinar el tipo de dólar basado en el mapeo
      const dollarType = dollarTypeMapping[item.casa.toLowerCase()] || item.casa.toUpperCase();
      
      return {
        date: item.fecha,
        dollar_type: dollarType,
        buy_price: item.compra || 0, // Manejar casos donde compra podría ser null
        sell_price: item.venta || 0, // Manejar casos donde venta podría ser null
        created_at: new Date().toISOString()
      };
    });
    
    console.info(`Datos procesados: ${processedData.length} cotizaciones`);
    
    // Si se proporciona un cliente de Supabase, guardar los datos
    let savedCount = 0;
    if (supabase) {
      try {
        console.info('Guardando cotizaciones en la base de datos...');
        
        // Usar upsert para actualizar registros existentes o insertar nuevos
        // La combinación de fecha + tipo de dólar debe ser única
        const { data, error } = await supabase
          .from('dollar_rates')
          .upsert(processedData, {
            onConflict: 'date,dollar_type',
            ignoreDuplicates: false // Actualizar registros existentes
          })
          .select();
          
        if (error) {
          console.error('Error al guardar cotizaciones:', error);
        } else {
          savedCount = data?.length || 0;
          console.info(`Guardadas ${savedCount} cotizaciones en la base de datos`);
        }
      } catch (dbError) {
        console.error('Error al interactuar con la base de datos:', dbError);
      }
    }
    
    return { data: processedData, savedCount };
  } catch (error) {
    console.error('Error al obtener cotizaciones de dólar:', error);
    throw new Error(`Error al obtener cotizaciones de dólar: ${(error as Error).message}`);
  }
}