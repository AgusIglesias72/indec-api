import { SectorHistoricalData } from "@/types/apiTypes"

interface FetchParams {
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export async function fetchSectorHistoricalData(params?: FetchParams): Promise<SectorHistoricalData[]> {
  try {
    // Construir query params
    const queryParams = new URLSearchParams();
    
    // Asegurarse de que las fechas incluyan el día
    if (params?.start_date) {
      // Si la fecha no incluye el día, añadir "-01"
      const startDate = params.start_date.length === 7 
        ? `${params.start_date}-01` 
        : params.start_date;
      queryParams.append('start_date', startDate);
    }
    
    if (params?.end_date) {
      // Si la fecha no incluye el día, añadir "-01"
      const endDate = params.end_date.length === 7 
        ? `${params.end_date}-01` 
        : params.end_date;
      queryParams.append('end_date', endDate);
    }
    
    // Añadir límite por defecto de 100
    queryParams.append('limit', (params?.limit || 100).toString());
    
    const queryString = queryParams.toString();
    // URL corregida sin "historical"
    const url = `/api/emae/sectors?${queryString}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener datos históricos sectoriales:", error);
    throw error;
  }
}