// src/services/fetchSectorHistoricalData.ts

/**
 * Función para obtener datos históricos de sectores específicos en un rango de fechas
 * 
 * @param sectorCodes - Array de códigos de sectores para obtener
 * @param startDate - Fecha de inicio (formato YYYY-MM-DD)
 * @param endDate - Fecha de fin (formato YYYY-MM-DD)
 * @returns Datos históricos de los sectores especificados
 */
export async function fetchSectorHistoricalData(
    sectorCodes: string[],
    startDate?: string,
    endDate?: string
  ) {
    try {
      // Construir URL con parámetros
      const url = new URL('/api/emae/sectors', window.location.origin);
      
      // Añadir parámetros de consulta
      if (startDate) {
        url.searchParams.append('start_date', startDate);
      }
      
      if (endDate) {
        url.searchParams.append('end_date', endDate);
      }
      
      // Aumentar límite para obtener más datos
      url.searchParams.append('limit', '500');
      
      // Incluir variaciones
      url.searchParams.append('include_variations', 'true');
      
      console.log('Fetching sector data from:', url.toString());
      
      // Realizar la petición
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filtrar por sectores deseados
      // También transformamos los datos para que tengan un formato más amigable
      const filteredData = data.data
        .filter((item: any) => sectorCodes.includes(item.economy_sector_code))
        .map((item: any) => ({
          date: item.date,
          sector_code: item.economy_sector_code,
          sector_name: item.economy_sector,
          original_value: item.original_value,
          year_over_year_change: item.year_over_year_change || 0
        }));
      
      // Ordenar cronológicamente
      filteredData.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      return filteredData;
    } catch (error) {
      console.error('Error fetching sector historical data:', error);
      throw error;
    }
  }
  
  /**
   * Función para obtener los metadatos de EMAE, incluyendo la lista de sectores
   * 
   * @returns Lista de sectores disponibles
   */
  export async function fetchEmaeSectors() {
    try {
      const response = await fetch('/api/emae/metadata');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Devolver la lista de sectores
      return data.sectors || [];
    } catch (error) {
      console.error('Error fetching EMAE sectors:', error);
      throw error;
    }
  }
  
  // Función para simular datos históricos por sectores
  // Útil para desarrollo cuando la API no está disponible
  export function simulateSectorHistoricalData(
    sectorCodes: string[],
    startDate?: string,
    endDate?: string,
    sectorNames: Record<string, string> = {} // Mapeo de códigos a nombres
  ) {
    // Determinar rango de fechas a generar
    const start = startDate ? new Date(startDate) : new Date(new Date().setFullYear(new Date().getFullYear() - 2));
    const end = endDate ? new Date(endDate) : new Date();
    
    // Asegurarse de que las fechas tienen el formato correcto
    start.setDate(1);
    end.setDate(1);
    
    // Generar array de fechas entre start y end (una por mes)
    const dates = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Datos simulados
    const simulatedData = [];
    
    // Para cada sector, generar datos para cada fecha
    for (const sectorCode of sectorCodes) {
      // Valor base para este sector (entre -5 y 15)
      let baseValue = Math.random() * 20 - 5;
      
      // Tendencia del sector (si tiende a crecer o decrecer)
      const trend = Math.random() * 0.4 - 0.2; // Entre -0.2 y 0.2
      
      for (const date of dates) {
        // Añadir un poco de variación aleatoria y la tendencia
        const randomVariation = Math.random() * 2 - 1; // Entre -1 y 1
        baseValue = baseValue + randomVariation + trend;
        
        // Mantener dentro de límites razonables
        baseValue = Math.max(-15, Math.min(15, baseValue));
        
        // Formato de fecha YYYY-MM-DD
        const formattedDate = date.toISOString().slice(0, 10);
        
        simulatedData.push({
          date: formattedDate,
          sector_code: sectorCode,
          sector_name: sectorNames[sectorCode] || `Sector ${sectorCode}`,
          original_value: 100 + Math.random() * 50, // Valor entre 100 y 150
          year_over_year_change: parseFloat(baseValue.toFixed(1))
        });
      }
    }
    
    return simulatedData;
  }