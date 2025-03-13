// src/services/fetchSectorComparisonData.ts
import { EmaeHistoricalData } from "@/types/apiTypes";

/**
 * Obtiene datos históricos por sector para un conjunto de sectores
 * @param sectorCodes Array de códigos de sector (A, B, C, etc.)
 * @param startDate Fecha de inicio (YYYY-MM-DD)
 * @param endDate Fecha de fin (YYYY-MM-DD)
 * @param limit Límite de registros a obtener (por defecto 100)
 */
export async function fetchSectorComparisonData(
  sectorCodes: string[],
  startDate?: string,
  endDate?: string,
  limit: number = 100
): Promise<any[]> {
  try {
    if (!sectorCodes || sectorCodes.length === 0) {
      return [];
    }

    // Construir parámetros de consulta
    const params = new URLSearchParams();
    
    // Añadir sectores como lista separada por comas
    params.append('sector_code', sectorCodes.join(','));
    
    // Añadir fechas si están disponibles
    if (startDate) {
      params.append('start_date', startDate);
    }
    
    if (endDate) {
      params.append('end_date', endDate);
    }
    
    // Incluir variaciones y especificar límite
    params.append('include_variations', 'true');
    params.append('limit', limit.toString());
    
    // Realizar la petición a nuestra API
    const response = await fetch(`/api/emae/sectors?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.data || !Array.isArray(result.data)) {
      return [];
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching sector comparison data:', error);
    throw error;
  }
}