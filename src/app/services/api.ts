// src/services/api.ts
// Servicio para obtener datos de la API

/**
 * Tipos para los datos de la API
 */
export interface ApiStats {
    dataPoints: number;
    apiUptime: number;
    indicatorsCount: number;
    updateTime: number; // en minutos
  }
  
  export interface EmaeLatestData {
    date: string;
    original_value: number;
    seasonally_adjusted_value: number;
    monthly_change: number; // variación intermensual (desestacionalizada)
    year_over_year_change: number; // variación interanual (serie original)
  }
 
  export interface IPCLatestData {
    date: string;
    monthly_change: number; // variación mensual (respecto al mes anterior)
    year_over_year_change: number; // variación interanual
    accumulated_change: number; // variación acumulada en el año
    monthly_change_diff?: number; // diferencia con la variación mensual del periodo anterior
  }
  
  export interface SectorPerformance {
    sector_name: string;
    sector_code: string;
    value: number;
    year_over_year_change: number;
  }
  
  // Base URL para la API
  const API_BASE_URL = '/api';
  
  /**
   * Obtener estadísticas generales para la sección de Stats
   */
  export async function getApiStats(): Promise<ApiStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getApiStats:', error);
      // Fallback a valores por defecto en caso de error
      return {
        dataPoints: 10500000,
        apiUptime: 99.5,
        indicatorsCount: 11,
        updateTime: 5
      };
    }
  }
  
  /**
   * Obtener los datos más recientes del EMAE
   */
  export async function getLatestEmaeData(): Promise<EmaeLatestData> {
    try {
      const response = await fetch(`${API_BASE_URL}/emae/latest`);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos del EMAE');
      }
      
      const data = await response.json();
      
      // En una implementación real, podríamos necesitar transformar
      // los datos recibidos al formato que esperamos
      return {
        date: data.date,
        original_value: data.original_value,
        seasonally_adjusted_value: data.seasonally_adjusted_value,
        monthly_change: data.monthly_change,
        year_over_year_change: data.year_over_year_change
      };
    } catch (error) {
      console.error('Error en getLatestEmaeData:', error);
      // Fallback a valores por defecto en caso de error
      return {
        date: new Date().toISOString().split('T')[0],
        original_value: 162.7,
        seasonally_adjusted_value: 159.8,
        monthly_change: 0.8,
        year_over_year_change: 3.5
      };
    }
  }
  
  /**
   * Obtener los datos más recientes del IPC
   */
  export async function getLatestIPCData(): Promise<IPCLatestData> {
    try {
      const response = await fetch(`${API_BASE_URL}/ipc/latest`);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos del IPC');
      }
      
      const data = await response.json();
      
      return {
        date: data.date,
        monthly_change: data.monthly_change,
        year_over_year_change: data.year_over_year_change,
        accumulated_change: data.accumulated_change,
        monthly_change_diff: data.monthly_change_diff
      };
    } catch (error) {
      console.error('Error en getLatestIPCData:', error);
      // Fallback a valores por defecto en caso de error
      return {
        date: new Date().toISOString().split('T')[0],
        monthly_change: 4.2,
        year_over_year_change: 142.7,
        accumulated_change: 8.7
      };
    }
  }
  
  /**
   * Obtener datos de desempeño por sector económico
   */
  export async function getSectorPerformance(): Promise<SectorPerformance[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/emae/sectors`);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos de sectores');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getSectorPerformance:', error);
      // Fallback a valores por defecto en caso de error
      return [
        { sector_name: "Agricultura, ganadería, caza y silvicultura", sector_code: "A", value: 104.8, year_over_year_change: 4.8 },
        { sector_name: "Explotación de minas y canteras", sector_code: "C", value: 98.8, year_over_year_change: -1.2 },
        { sector_name: "Industria manufacturera", sector_code: "D", value: 97.5, year_over_year_change: -2.5 },
        { sector_name: "Construcción", sector_code: "F", value: 92.3, year_over_year_change: -7.7 },
        { sector_name: "Comercio mayorista y minorista", sector_code: "G", value: 95.6, year_over_year_change: -4.4 },
        { sector_name: "Intermediación financiera", sector_code: "J", value: 102.7, year_over_year_change: 2.7 },
        { sector_name: "Transporte y comunicaciones", sector_code: "I", value: 103.1, year_over_year_change: 3.1 }
      ];
    }
  }

// Actualización para src/app/services/api.ts
// Añadir estas interfaces y funciones al archivo existente

export interface EmaeHistoricalData {
  date: string;
  original_value: number;
  seasonally_adjusted_value: number;
  monthly_change: number;
}

export interface IPCHistoricalData {
  date: string;
  index_value: number;
  monthly_change: number;
  year_over_year_change: number;
}

/**
 * Obtiene los datos históricos del EMAE de los últimos 13 meses
 */
export async function getHistoricalEmaeData(): Promise<EmaeHistoricalData[]> {
  try {
    // Calcular la fecha de hace 13 meses
    const today = new Date();
    const thirteenMonthsAgo = new Date(today);
    thirteenMonthsAgo.setMonth(today.getMonth() - 13);
    const startDate = thirteenMonthsAgo.toISOString().split('T')[0];
    
    // Usar la API base con parámetros de consulta
    const response = await fetch(`${API_BASE_URL}/emae?start_date=${startDate}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener datos históricos del EMAE');
    }
    
    const data = await response.json();
    
    // Mapear los datos para calcular las variaciones mensuales
    const processedData = data.data.map((item: any, index: number, array: any[]) => {
      // Calcular variación mensual de la serie desestacionalizada
      let monthlyChange = null;
      if (index > 0 && array[index - 1].seasonally_adjusted_value > 0) {
        monthlyChange = ((item.seasonally_adjusted_value - array[index - 1].seasonally_adjusted_value) / 
                       array[index - 1].seasonally_adjusted_value) * 100;
        monthlyChange = parseFloat(monthlyChange.toFixed(1));
      }
      
      return {
        date: item.date  + 'T00:00:00-04:00',
        original_value: item.original_value,
        seasonally_adjusted_value: item.seasonally_adjusted_value,
        monthly_change: monthlyChange
      };
    });
    
    // Filtrar el primer elemento que no tendría variación mensual
    return processedData.slice(1);
  } catch (error) {
    console.error('Error en getHistoricalEmaeData:', error);
    // Fallback a valores por defecto en caso de error
    return [];
  }
}

/**
 * Obtiene los datos históricos del IPC de los últimos 13 meses
 */
export async function getHistoricalIPCData(): Promise<IPCHistoricalData[]> {
  try {
    // Calcular la fecha de hace 13 meses
    const today = new Date();
    const thirteenMonthsAgo = new Date(today);
    thirteenMonthsAgo.setMonth(today.getMonth() - 13);
    const startDate = thirteenMonthsAgo.toISOString().split('T')[0];
    
    // Usar la API base con parámetros de consulta
    const response = await fetch(`${API_BASE_URL}/ipc?start_date=${startDate}&component_type=GENERAL&region=Nacional&include_variations=true`);

    console.log(response);
    if (!response.ok) {
      throw new Error('Error al obtener datos históricos del IPC');
    }
    
    const data = await response.json();
    
    // Mapear los datos al formato que espera nuestro componente
    const mappedData = data.data.map((item: any) => ({
      date: item.date + 'T00:00:00-04:00',
      index_value: item.index_value,
      monthly_change: item.monthly_pct_change,
      year_over_year_change: item.yearly_pct_change
    }));
    
    return mappedData;
  } catch (error) {
    console.error('Error en getHistoricalIPCData:', error);
    // Fallback a valores por defecto en caso de error
    return [
      { date: '2024-01-01', index_value: 2250.1, monthly_change: 4.2, year_over_year_change: 142.7 },
      { date: '2024-02-01', index_value: 2342.3, monthly_change: 4.1, year_over_year_change: 141.5 },
      { date: '2024-03-01', index_value: 2436.2, monthly_change: 4.0, year_over_year_change: 139.8 },
      { date: '2024-04-01', index_value: 2521.5, monthly_change: 3.5, year_over_year_change: 136.5 },
      { date: '2024-05-01', index_value: 2597.1, monthly_change: 3.0, year_over_year_change: 133.2 },
      { date: '2024-06-01', index_value: 2662.0, monthly_change: 2.5, year_over_year_change: 130.5 },
      { date: '2024-07-01', index_value: 2728.6, monthly_change: 2.5, year_over_year_change: 128.7 },
      { date: '2024-08-01', index_value: 2796.8, monthly_change: 2.5, year_over_year_change: 124.8 },
      { date: '2024-09-01', index_value: 2866.7, monthly_change: 2.5, year_over_year_change: 120.5 },
      { date: '2024-10-01', index_value: 2938.4, monthly_change: 2.5, year_over_year_change: 115.8 },
      { date: '2024-11-01', index_value: 3011.8, monthly_change: 2.5, year_over_year_change: 110.2 },
      { date: '2024-12-01', index_value: 3087.1, monthly_change: 2.5, year_over_year_change: 105.5 }
    ];
  }
}

// Función para obtener datos históricos del EMAE
export async function fetchHistoricalEmaeData(limit = 24) {
  try {
    const response = await fetch(`/api/emae?limit=${limit}&include_variations=true`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener datos históricos del EMAE: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching historical EMAE data:", error);
    throw error;
  }
}

// Función para obtener el último dato del EMAE
export async function fetchLatestEmaeData(sectorCode = 'GENERAL') {
  try {
    const response = await fetch(`/api/emae/latest?sector_code=${sectorCode}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener el último dato del EMAE: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Ya no necesitamos calcular las variaciones, vienen de la API
    return {
      date: data.date,
      sector: data.sector,
      sector_code: data.sector_code,
      original_value: data.original_value,
      seasonally_adjusted_value: data.seasonally_adjusted_value,
      trend_cycle_value: data.trend_cycle_value,
      monthly_change: data.monthly_pct_change || 0,
      year_over_year_change: data.yearly_pct_change || 0
    };
  } catch (error) {
    console.error("Error fetching latest EMAE data:", error);
    throw error;
  }
}