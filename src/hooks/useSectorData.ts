// src/hooks/useSectorsData.ts
import { useState, useEffect } from 'react';

export interface SectorData {
  date: string;
  economy_sector: string;
  economy_sector_code: string;
  original_value: number;
  year_over_year_change: number;
}

interface UseSectorsDataReturn {
  data: SectorData[];
  loading: boolean;
  error: Error | null;
  fetchSectors: (sectorCodes: string[], startDate?: string, endDate?: string) => Promise<void>;
}

export function useSectorsData(): UseSectorsDataReturn {
  const [data, setData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Función para obtener datos de sectores específicos
  const fetchSectors = async (sectorCodes: string[], startDate?: string, endDate?: string) => {
    if (!sectorCodes || sectorCodes.length === 0) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      
      // Códigos de sector - unir con comas para el nuevo formato
      params.append('sector_code', sectorCodes.join(','));
      
      // Añadir filtros de fecha si se proporcionan
      if (startDate) {
        params.append('start_date', startDate);
      }
      
      if (endDate) {
        params.append('end_date', endDate);
      }
      
      // Incluir variaciones y usar límite alto para obtener todos los datos
      params.append('include_variations', 'true');
      params.append('limit', '1000');
      
      // Construir URL
      const url = `/api/emae/sectors?${params.toString()}`;
      
      // Realizar la petición
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Verificar que hay datos
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Formato de respuesta inesperado');
      }
      
      // Actualizar el estado con los datos recibidos
      setData(result.data);
      
    } catch (err) {
      console.error('Error al obtener datos de sectores:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al obtener datos de sectores'));
      
      // En caso de error, mantener los datos actuales o establecer un array vacío
      // Esto evita que la UI se rompa
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchSectors };
}