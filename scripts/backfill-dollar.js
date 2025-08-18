// scripts/backfill-dollar.js
// Script para rellenar datos históricos del dólar

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: '.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Falta configuración de Supabase');
  console.log('Asegúrate de que estén configuradas las variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeo de tipos de dólar
const DOLLAR_TYPE_MAP = {
  'oficial': 'OFICIAL',
  'blue': 'BLUE',
  'bolsa': 'MEP',
  'contadoconliqui': 'CCL',
  'mayorista': 'MAYORISTA',
  'cripto': 'CRYPTO',
  'tarjeta': 'TARJETA'
};

/**
 * Generar fechas hacia atrás
 */
function generateDateRange(daysBack) {
  const dates = [];
  const today = new Date();
  
  for (let i = daysBack; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
  }
  
  return dates;
}

/**
 * Función principal de backfill
 */
async function backfillDollarData(daysBack = 30, dryRun = false) {
  try {
    console.log(`🚀 Iniciando backfill del dólar - ${daysBack} días, dryRun: ${dryRun}`);
    
    // Obtener datos actuales de la API
    console.log('📊 Obteniendo datos actuales de dolarapi.com...');
    const response = await fetch('https://dolarapi.com/v1/dolares', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Argentina-Datos-API-Backfill/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error obteniendo datos de la API: ${response.status}`);
    }
    
    const currentDollarData = await response.json();
    console.log(`✅ Obtenidos ${currentDollarData.length} tipos de dólar`);
    
    // Generar fechas
    const dates = generateDateRange(daysBack);
    console.log(`📅 Procesando ${dates.length} fechas desde ${dates[0]} hasta ${dates[dates.length - 1]}`);
    
    let totalRecordsAdded = 0;
    let totalRecordsSkipped = 0;
    
    // Procesar cada fecha hacia atrás (desde más antigua a más reciente)
    for (let i = dates.length - 1; i >= 0; i--) {
      const targetDate = dates[i];
      console.log(`\n🔄 Procesando fecha: ${targetDate}`);
      
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
            dayRecordsSkipped++;
            continue;
          }
          
          // Crear registro histórico (mediodía)
          const historicalTimestamp = new Date(`${targetDate}T12:00:00.000Z`).toISOString();
          
          const recordToInsert = {
            dollar_type: dollarType,
            date: historicalTimestamp,
            buy_price: dollar.compra,
            sell_price: dollar.venta,
            updated_at: historicalTimestamp,
            created_at: new Date().toISOString() // Para identificar que fue backfill
          };
          
          if (!dryRun) {
            const { error } = await supabase
              .from('dollar_rates')
              .insert(recordToInsert);
            
            if (error) {
              throw error;
            }
          }
          
          console.log(`✅ ${dryRun ? '[DRY RUN] ' : ''}Agregado ${dollarType}: ${targetDate} - $${dollar.compra}/$${dollar.venta}`);
          dayRecordsAdded++;
          
        } catch (error) {
          console.error(`❌ Error procesando ${dollarType} para ${targetDate}:`, error.message);
        }
      }
      
      totalRecordsAdded += dayRecordsAdded;
      totalRecordsSkipped += dayRecordsSkipped;
      
      console.log(`📊 ${targetDate}: ${dayRecordsAdded} agregados, ${dayRecordsSkipped} omitidos`);
      
      // Pausa para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n🎉 Backfill completado:`);
    console.log(`   📈 Registros agregados: ${totalRecordsAdded}`);
    console.log(`   ⏭️ Registros omitidos: ${totalRecordsSkipped}`);
    console.log(`   📅 Fechas procesadas: ${dates.length}`);
    console.log(`   🔧 Modo: ${dryRun ? 'DRY RUN (no se insertó nada)' : 'REAL (datos insertados)'}`);
    
    return {
      success: true,
      totalRecordsAdded,
      totalRecordsSkipped,
      datesProcessed: dates.length
    };
    
  } catch (error) {
    console.error('❌ Error en backfill:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar el script
const main = async () => {
  // Leer argumentos de línea de comandos
  const args = process.argv.slice(2);
  const daysBack = parseInt(args[0]) || 30;
  const dryRun = args.includes('--dry-run');
  
  console.log('💻 Script de Backfill del Dólar');
  console.log('================================');
  console.log(`📊 Días hacia atrás: ${daysBack}`);
  console.log(`🔧 Modo: ${dryRun ? 'DRY RUN' : 'REAL'}`);
  console.log('');
  
  if (dryRun) {
    console.log('🔍 Ejecutando en modo DRY RUN - no se insertarán datos');
    console.log('💡 Para ejecutar realmente, quita el --dry-run');
    console.log('');
  }
  
  const result = await backfillDollarData(daysBack, dryRun);
  
  if (result.success) {
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  } else {
    console.log('\n❌ Script falló');
    process.exit(1);
  }
};

// Ejecutar el script
main();