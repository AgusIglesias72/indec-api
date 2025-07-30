"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  IPCHistoricalData,
} from '@/services/api';

/**
 * Hook para obtener los datos históricos del EMAE
 */
export function useHistoricalEmaeData(limit = 24) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // Función para obtener datos con parámetros opcionales
  const refetch = useCallback(async (startDate?: string, endDate?: string, customLimit?: number) => {
    try {
      setLoading(true);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      
      // Añadir límite
      params.append('limit', (customLimit || limit).toString());
      
      // Añadir filtros de fecha si se proporcionan
      if (startDate) {
        params.append('start_date', startDate);
      }
      
      if (endDate) {
        params.append('end_date', endDate);
      }
      
      // Incluir variaciones
      params.append('include_variations', 'true');
      
      // Realizar petición
      const response = await fetch(`/api/emae?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener datos históricos del EMAE: ${response.status}`);
      }
      
      const result = await response.json();
      const emaeData = result.data;
      
      // Procesar los datos para asegurar que son utilizables por los gráficos
      const processedData = emaeData.map((item: any) => {
        // Comprobar si es un objeto válido
        if (!item || typeof item !== 'object') {
          console.warn('Dato EMAE inválido:', item);
          return null;
        }
        
        return {
          date: item.date || '',
          original_value: typeof item.original_value === 'number' ? item.original_value : 
                         (item.original_value ? parseFloat(item.original_value) : undefined),
          seasonally_adjusted_value: typeof item.seasonally_adjusted_value === 'number' ? item.seasonally_adjusted_value : 
                                   (item.seasonally_adjusted_value ? parseFloat(item.seasonally_adjusted_value) : undefined),
          monthly_pct_change: typeof item.monthly_pct_change === 'number' ? item.monthly_pct_change : 
                             (item.monthly_pct_change ? parseFloat(item.monthly_pct_change) : undefined),
          yearly_pct_change: typeof item.yearly_pct_change === 'number' ? item.yearly_pct_change : 
                            (item.yearly_pct_change ? parseFloat(item.yearly_pct_change) : undefined)
        };
      }).filter(Boolean); // Eliminar cualquier elemento null
      
      setData(processedData);
      setError(null);
      return emaeData;
    } catch (err) {
      console.error("Error en useHistoricalEmaeData:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

/**
 * Hook para obtener los datos históricos del IPC
 */
export function useHistoricalIPCData() {
  const [data, setData] = useState<IPCHistoricalData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Función para obtener datos con parámetros de filtro
  const refetch = async (startDate?: string, endDate?: string, region: string = 'Nacional', category: string = 'GENERAL') => {
    try {
      setLoading(true);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      
      // Añadir filtros de fecha si se proporcionan
      if (startDate) {
        params.append('start_date', startDate);
      }
      
      if (endDate) {
        params.append('end_date', endDate);
      }
      
      // Añadir región y categoría
      params.append('region', region);
      params.append('category', category);
      
      // Incluir variaciones
      params.append('include_variations', 'true');
      
      // Realizar petición a la API
      const response = await fetch(`/api/ipc?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener datos históricos del IPC: ${response.status}`);
      }
      
      const result = await response.json();
      const ipcData = result.data.map((item: any) => ({
        date: item.date,
        index_value: item.index_value,
        monthly_change: item.monthly_pct_change,
        year_over_year_change: item.yearly_pct_change
      }));
      
      setData(ipcData);
      setError(null);
      return ipcData;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'));
      console.error('Error al obtener datos históricos del IPC:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial de datos
  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch };
}