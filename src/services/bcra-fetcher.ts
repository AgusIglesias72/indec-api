// src/services/bcra-fetcher.ts
import axios from 'axios';
import https from 'https';

const BCRA_API_BASE = 'https://api.bcra.gob.ar/estadisticas/v3.0';

// Configurar axios para ignorar certificados SSL en desarrollo
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export interface BCRADataPoint {
  idVariable: number;
  fecha: string;
  valor: number;
}

export interface BCRAResponse {
  status: number;
  metadata?: {
    resultset: {
      count: number;
      offset: number;
      limit: number;
    };
  };
  results: BCRADataPoint[];
}

export interface ProcessedBCRAData {
  date: string;
  value: number;
}

/**
 * Obtiene datos del BCRA con paginación
 */
export async function fetchBCRAData(
  variableId: number,
  limit: number = 1000,
  offset: number = 0
): Promise<BCRAResponse> {
  try {
    const url = `${BCRA_API_BASE}/Monetarias/${variableId}`;
    const params = { limit, offset };
    
    console.log(`Fetching BCRA data: ${url}`, params);
    
    const response = await axios.get<BCRAResponse>(url, { 
      params,
      httpsAgent,
      timeout: 30000
    });
    
    if (response.data.status !== 200) {
      throw new Error(`BCRA API returned status ${response.data.status}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching BCRA data:', error);
    throw error;
  }
}

/**
 * Obtiene TODOS los datos históricos de una variable del BCRA
 */
export async function fetchAllBCRAData(
  variableId: number,
  batchSize: number = 1000
): Promise<ProcessedBCRAData[]> {
  const allData: ProcessedBCRAData[] = [];
  let offset = 0;
  let hasMore = true;
  
  console.log(`Starting to fetch all data for variable ${variableId}`);
  
  while (hasMore) {
    try {
      const response = await fetchBCRAData(variableId, batchSize, offset);
      
      // Procesar y agregar los datos
      const processedBatch = response.results.map(item => ({
        date: item.fecha,
        value: item.valor
      }));
      
      allData.push(...processedBatch);
      
      // Verificar si hay más datos
      const totalCount = response.metadata?.resultset.count || 0;
      offset += batchSize;
      hasMore = offset < totalCount;
      
      console.log(`Fetched ${allData.length} of ${totalCount} records`);
      
      // Pequeña pausa para no sobrecargar la API
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error at offset ${offset}:`, error);
      // Si hay un error, intentamos continuar con el siguiente batch
      offset += batchSize;
      hasMore = false; // Por seguridad, detenemos si hay error
    }
  }
  
  // Ordenar por fecha (más reciente primero)
  allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  console.log(`Total records fetched: ${allData.length}`);
  return allData;
}

/**
 * Obtiene los últimos N registros de una variable del BCRA
 */
export async function fetchLatestBCRAData(
  variableId: number,
  count: number = 30
): Promise<ProcessedBCRAData[]> {
  const response = await fetchBCRAData(variableId, count, 0);
  
  return response.results.map(item => ({
    date: item.fecha,
    value: item.valor
  }));
}

// IDs de las variables del BCRA
export const BCRA_VARIABLES = {
  CER: 30,
  UVA: 31,
  UVI: 32,
  ICL: 40
} as const;

/**
 * Valida que una fecha sea válida
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Obtiene datos del CER
 */
export async function fetchCERData(all: boolean = false): Promise<ProcessedBCRAData[]> {
  console.log('Fetching CER data...');
  const data = all 
    ? await fetchAllBCRAData(BCRA_VARIABLES.CER)
    : await fetchLatestBCRAData(BCRA_VARIABLES.CER);
  
  // Validar datos
  return data.filter(item => 
    isValidDate(item.date) && 
    typeof item.value === 'number' && 
    item.value > 0
  );
}

/**
 * Obtiene datos del UVA
 */
export async function fetchUVAData(all: boolean = false): Promise<ProcessedBCRAData[]> {
  console.log('Fetching UVA data...');
  const data = all 
    ? await fetchAllBCRAData(BCRA_VARIABLES.UVA)
    : await fetchLatestBCRAData(BCRA_VARIABLES.UVA);
  
  // Validar datos
  return data.filter(item => 
    isValidDate(item.date) && 
    typeof item.value === 'number' && 
    item.value > 0
  );
}