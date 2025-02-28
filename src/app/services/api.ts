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
        accumulated_change: data.accumulated_change
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