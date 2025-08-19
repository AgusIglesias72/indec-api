// scripts/force-dollar-update.js
// Script para forzar actualización inmediata del dólar

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: '.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Falta configuración de Supabase');
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

async function forceUpdateDollar() {
  try {
    console.log('🚀 Forzando actualización del dólar...');
    
    // Obtener datos actuales de la API
    console.log('📊 Obteniendo datos de dolarapi.com...');
    const response = await fetch('https://dolarapi.com/v1/dolares', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Argentina-Datos-API-Force-Update/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error obteniendo datos de la API: ${response.status}`);
    }
    
    const dollarData = await response.json();
    console.log(`✅ Obtenidos ${dollarData.length} tipos de dólar`);
    
    const now = new Date().toISOString();
    let updatedCount = 0;
    
    // Actualizar cada tipo de dólar
    for (const dollar of dollarData) {
      const dollarType = DOLLAR_TYPE_MAP[dollar.casa];
      
      if (!dollarType) {
        console.warn(`⚠️ Tipo de dólar no reconocido: ${dollar.casa}`);
        continue;
      }
      
      // Para OFICIAL y MAYORISTA, siempre actualizar
      const alwaysUpdate = ['OFICIAL', 'MAYORISTA'].includes(dollarType);
      
      try {
        // Obtener último registro
        const { data: lastRecord } = await supabase
          .from('dollar_rates')
          .select('*')
          .eq('dollar_type', dollarType)
          .order('date', { ascending: false })
          .limit(1)
          .single();
        
        // Si no hay cambios y no es un tipo que siempre se actualiza, saltar
        if (lastRecord && !alwaysUpdate) {
          if (lastRecord.buy_price === dollar.compra && 
              lastRecord.sell_price === dollar.venta) {
            console.log(`⏭️ Sin cambios para ${dollarType}: $${dollar.compra}/$${dollar.venta}`);
            continue;
          }
        }
        
        // Insertar nuevo registro con timestamp actual
        const { error } = await supabase
          .from('dollar_rates')
          .insert({
            dollar_type: dollarType,
            date: now,
            buy_price: dollar.compra,
            sell_price: dollar.venta,
            updated_at: now,
            created_at: now
          });
        
        if (error) {
          throw error;
        }
        
        console.log(`✅ Actualizado ${dollarType}: $${dollar.compra}/$${dollar.venta}`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Error actualizando ${dollarType}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Actualización completada:`);
    console.log(`   📈 Tipos actualizados: ${updatedCount}`);
    console.log(`   🕐 Timestamp: ${now}`);
    
    return {
      success: true,
      updatedCount,
      timestamp: now
    };
    
  } catch (error) {
    console.error('❌ Error en actualización forzada:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar el script
const main = async () => {
  console.log('💻 Script de Actualización Forzada del Dólar');
  console.log('============================================');
  console.log('');
  
  const result = await forceUpdateDollar();
  
  if (result.success) {
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  } else {
    console.log('\n❌ Script falló');
    process.exit(1);
  }
};

// Ejecutar
main();