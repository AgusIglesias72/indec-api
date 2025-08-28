// Script para popular datos CER y UVA básicos
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de ejemplo CER (valores aproximados)
const cerData = [
  { date: '2023-01-01', value: 0.9847 },
  { date: '2023-02-01', value: 1.0123 },
  { date: '2023-03-01', value: 1.0456 },
  { date: '2023-04-01', value: 1.0789 },
  { date: '2023-05-01', value: 1.1124 },
  { date: '2023-06-01', value: 1.1478 },
  { date: '2023-07-01', value: 1.1834 },
  { date: '2023-08-01', value: 1.2198 },
  { date: '2023-09-01', value: 1.2567 },
  { date: '2023-10-01', value: 1.2943 },
  { date: '2023-11-01', value: 1.3326 },
  { date: '2023-12-01', value: 1.3715 },
  { date: '2024-01-01', value: 1.4112 },
  { date: '2024-02-01', value: 1.4516 },
  { date: '2024-03-01', value: 1.4928 },
  { date: '2024-04-01', value: 1.5347 },
  { date: '2024-05-01', value: 1.5774 },
  { date: '2024-06-01', value: 1.6209 },
  { date: '2024-07-01', value: 1.6653 },
  { date: '2024-08-01', value: 1.7105 },
  { date: '2024-09-01', value: 1.7566 },
  { date: '2024-10-01', value: 1.8036 },
  { date: '2024-11-01', value: 1.8515 },
  { date: '2024-12-01', value: 1.9003 },
  { date: '2025-01-01', value: 1.9503 },
  { date: '2025-02-01', value: 2.0015 },
  { date: '2025-03-01', value: 2.0540 },
  { date: '2025-04-01', value: 2.1078 },
  { date: '2025-05-01', value: 2.1630 },
  { date: '2025-06-01', value: 2.2196 },
  { date: '2025-07-01', value: 2.2777 },
  { date: '2025-08-01', value: 2.3373 },
  { date: '2025-08-28', value: 2.3445 },
];

// Datos de ejemplo UVA (valores aproximados)
const uvaData = [
  { date: '2023-01-01', value: 456.78 },
  { date: '2023-02-01', value: 469.23 },
  { date: '2023-03-01', value: 484.56 },
  { date: '2023-04-01', value: 498.89 },
  { date: '2023-05-01', value: 514.12 },
  { date: '2023-06-01', value: 530.45 },
  { date: '2023-07-01', value: 547.78 },
  { date: '2023-08-01', value: 565.91 },
  { date: '2023-09-01', value: 584.67 },
  { date: '2023-10-01', value: 604.43 },
  { date: '2023-11-01', value: 625.26 },
  { date: '2023-12-01', value: 647.15 },
  { date: '2024-01-01', value: 670.12 },
  { date: '2024-02-01', value: 694.16 },
  { date: '2024-03-01', value: 719.28 },
  { date: '2024-04-01', value: 745.47 },
  { date: '2024-05-01', value: 772.74 },
  { date: '2024-06-01', value: 801.09 },
  { date: '2024-07-01', value: 830.53 },
  { date: '2024-08-01', value: 861.05 },
  { date: '2024-09-01', value: 892.66 },
  { date: '2024-10-01', value: 925.36 },
  { date: '2024-11-01', value: 959.15 },
  { date: '2024-12-01', value: 994.03 },
];

async function populateData() {
  console.log('🚀 Iniciando población de datos CER y UVA...');
  
  try {
    // Insertar datos CER
    console.log('📊 Insertando datos CER...');
    const { data: cerInserted, error: cerError } = await supabase
      .from('cer')
      .upsert(
        cerData.map(item => ({
          date: item.date,
          value: item.value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        { 
          onConflict: 'date',
          ignoreDuplicates: false 
        }
      );
    
    if (cerError) {
      console.error('❌ Error insertando CER:', cerError);
    } else {
      console.log('✅ Datos CER insertados correctamente');
    }
    
    // Insertar datos UVA
    console.log('📊 Insertando datos UVA...');
    const { data: uvaInserted, error: uvaError } = await supabase
      .from('uva')
      .upsert(
        uvaData.map(item => ({
          date: item.date,
          value: item.value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        { 
          onConflict: 'date',
          ignoreDuplicates: false 
        }
      );
    
    if (uvaError) {
      console.error('❌ Error insertando UVA:', uvaError);
    } else {
      console.log('✅ Datos UVA insertados correctamente');
    }
    
    console.log('🎉 Población de datos completada!');
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar el script
populateData().then(() => {
  console.log('📋 Script finalizado');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error ejecutando script:', error);
  process.exit(1);
});