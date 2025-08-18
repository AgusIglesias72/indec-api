// src/app/api/admin/backfill-dollar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutos como máximo

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
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
 * Endpoint administrativo para rellenar datos históricos del dólar
 * Esto es útil para reconstruir datos después de períodos sin actualizaciones
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación administrativa
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader.split(' ')[1] !== process.env.CRON_SECRET_KEY) {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere token administrativo' },
        { status: 401 }
      );
    }
    
    // Leer parámetros del body
    const body = await request.json();
    const daysBack = body.days || 30; // Por defecto 30 días
    const dryRun = body.dryRun || false; // Por defecto ejecutar realmente
    
    console.info(`🚀 Iniciando backfill del dólar - ${daysBack} días, dryRun: ${dryRun}`);
    
    // Generar fechas para los últimos N días
    const dates = generateDateRange(daysBack);
    console.info(`📅 Procesando ${dates.length} fechas desde ${dates[0]} hasta ${dates[dates.length - 1]}`);
    
    let totalRecordsAdded = 0;
    let totalRecordsSkipped = 0;
    const processedResults: any[] = [];
    
    // Obtener datos actuales de la API para usar como valores base
    const currentResponse = await fetch('https://dolarapi.com/v1/dolares', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Argentina-Datos-API-Backfill/1.0'
      }
    });
    
    if (!currentResponse.ok) {
      throw new Error(`Error obteniendo datos actuales: ${currentResponse.status}`);
    }
    
    const currentDollarData: DollarApiResponse[] = await currentResponse.json();
    console.info(`📊 Usando ${currentDollarData.length} tipos de dólar como base`);
    
    // Procesar cada fecha hacia atrás
    for (let i = dates.length - 1; i >= 0; i--) {
      const targetDate = dates[i];
      console.info(`\n🔄 Procesando fecha: ${targetDate}`);
      
      let dayRecordsAdded = 0;
      let dayRecordsSkipped = 0;
      
      // Para cada tipo de dólar
      for (const dollar of currentDollarData) {
        const dollarType = DOLLAR_TYPE_MAP[dollar.casa];
        
        if (!dollarType) {
          console.warn(`⚠️ Tipo de dólar no reconocido: ${dollar.casa}`);
          continue;
        }
        
        try {
          // Verificar si ya existe un registro para esta fecha y tipo
          const { data: existingRecord } = await supabase
            .from('dollar_rates')
            .select('id')
            .eq('dollar_type', dollarType)
            .gte('date', `${targetDate}T00:00:00.000Z`)
            .lt('date', `${targetDate}T23:59:59.999Z`)
            .limit(1)
            .single();
          
          if (existingRecord) {
            console.info(`⏭️ Ya existe registro para ${dollarType} en ${targetDate}`);
            dayRecordsSkipped++;
            continue;
          }
          
          // Crear registro histórico
          const historicalTimestamp = new Date(`${targetDate}T12:00:00.000Z`).toISOString(); // Mediodía
          
          const recordToInsert = {
            dollar_type: dollarType,
            date: historicalTimestamp,
            buy_price: dollar.compra,
            sell_price: dollar.venta,
            updated_at: historicalTimestamp,
            created_at: new Date().toISOString() // Timestamp actual para saber cuándo se hizo el backfill
          };
          
          if (!dryRun) {
            const { error } = await supabase
              .from('dollar_rates')
              .insert(recordToInsert);
            
            if (error) {
              throw error;
            }
          }
          
          console.info(`✅ ${dryRun ? '[DRY RUN] ' : ''}Agregado ${dollarType}: ${targetDate} - ${dollar.compra}/${dollar.venta}`);
          dayRecordsAdded++;
          
        } catch (error) {
          console.error(`❌ Error procesando ${dollarType} para ${targetDate}:`, error);
        }
      }
      
      totalRecordsAdded += dayRecordsAdded;
      totalRecordsSkipped += dayRecordsSkipped;
      
      processedResults.push({
        date: targetDate,
        recordsAdded: dayRecordsAdded,
        recordsSkipped: dayRecordsSkipped
      });
      
      console.info(`📊 Fecha ${targetDate}: ${dayRecordsAdded} agregados, ${dayRecordsSkipped} omitidos`);
      
      // Pausa pequeña para no sobrecargar la base de datos
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.info(`\n✅ Backfill completado: ${totalRecordsAdded} registros agregados, ${totalRecordsSkipped} omitidos`);
    
    return NextResponse.json({
      success: true,
      dryRun,
      summary: {
        daysProcessed: dates.length,
        totalRecordsAdded,
        totalRecordsSkipped,
        dateRange: {
          from: dates[0],
          to: dates[dates.length - 1]
        }
      },
      details: processedResults,
      execution_time: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en backfill del dólar:', error);
    return NextResponse.json({
      success: false,
      error: 'Error ejecutando backfill',
      details: (error as Error).message
    }, { status: 500 });
  }
}

/**
 * Generar un rango de fechas hacia atrás
 */
function generateDateRange(daysBack: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = daysBack; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
  }
  
  return dates;
}

/**
 * GET para mostrar información sobre el backfill sin ejecutarlo
 */
export async function GET() {
  const dates = generateDateRange(30);
  
  return NextResponse.json({
    info: 'Endpoint de backfill para datos históricos del dólar',
    usage: {
      endpoint: 'POST /api/admin/backfill-dollar',
      authorization: 'Bearer [CRON_SECRET_KEY]',
      parameters: {
        days: 'Número de días hacia atrás (default: 30)',
        dryRun: 'true para simular sin insertar (default: false)'
      }
    },
    example_dates_30_days: dates.slice(0, 5).concat(['...', dates[dates.length - 1]]),
    total_dates_example: dates.length
  });
}