// scripts/load-bcra-historical-data.ts
const { createClient } = require('@supabase/supabase-js');
const { fetchCERData, fetchUVAData } = require('../src/services/bcra-fetcher');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadCERHistoricalData() {
  console.log('Loading CER historical data...');
  
  try {
    // Obtener todos los datos históricos del CER
    const cerData = await fetchCERData(true);
    console.log(`Fetched ${cerData.length} CER records`);
    
    if (cerData.length === 0) {
      console.log('No CER data to load');
      return { count: 0 };
    }
    
    // Insertar en lotes para mejor performance
    const batchSize = 500;
    let totalInserted = 0;
    
    for (let i = 0; i < cerData.length; i += batchSize) {
      const batch = cerData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('cer')
        .upsert(batch, {
          onConflict: 'date',
          ignoreDuplicates: false
        })
        .select();
      
      if (error) {
        console.error(`Error inserting CER batch ${i / batchSize + 1}:`, error);
        continue;
      }
      
      totalInserted += data?.length || 0;
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(cerData.length / batchSize)} (${totalInserted} total)`);
    }
    
    console.log(`CER data loaded successfully: ${totalInserted} records`);
    return { count: totalInserted };
  } catch (error) {
    console.error('Error loading CER data:', error);
    throw error;
  }
}

async function loadUVAHistoricalData() {
  console.log('Loading UVA historical data...');
  
  try {
    // Obtener todos los datos históricos del UVA
    const uvaData = await fetchUVAData(true);
    console.log(`Fetched ${uvaData.length} UVA records`);
    
    if (uvaData.length === 0) {
      console.log('No UVA data to load');
      return { count: 0 };
    }
    
    // Insertar en lotes para mejor performance
    const batchSize = 500;
    let totalInserted = 0;
    
    for (let i = 0; i < uvaData.length; i += batchSize) {
      const batch = uvaData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('uva')
        .upsert(batch, {
          onConflict: 'date',
          ignoreDuplicates: false
        })
        .select();
      
      if (error) {
        console.error(`Error inserting UVA batch ${i / batchSize + 1}:`, error);
        continue;
      }
      
      totalInserted += data?.length || 0;
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(uvaData.length / batchSize)} (${totalInserted} total)`);
    }
    
    console.log(`UVA data loaded successfully: ${totalInserted} records`);
    return { count: totalInserted };
  } catch (error) {
    console.error('Error loading UVA data:', error);
    throw error;
  }
}

async function main() {
  console.log('Starting BCRA historical data load...');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Cargar CER
    const cerResult = await loadCERHistoricalData();
    console.log(`CER: ${cerResult.count} records loaded`);
    
    // Cargar UVA
    const uvaResult = await loadUVAHistoricalData();
    console.log(`UVA: ${uvaResult.count} records loaded`);
    
    console.log('Historical data load completed successfully!');
    
    // Verificar los datos
    const { data: cerCount } = await supabase
      .from('cer')
      .select('*', { count: 'exact', head: true });
    
    const { data: uvaCount } = await supabase
      .from('uva')
      .select('*', { count: 'exact', head: true });
    
    console.log('Database verification:');
    console.log(`- CER records in database: ${cerCount}`);
    console.log(`- UVA records in database: ${uvaCount}`);
    
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().then(() => {
    console.log('Process completed');
    process.exit(0);
  }).catch(error => {
    console.error('Process failed:', error);
    process.exit(1);
  });
}