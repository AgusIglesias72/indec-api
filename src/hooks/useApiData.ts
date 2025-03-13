"use client";

import { useState, useEffect } from 'react';
import { 
  getHistoricalIPCData,
  IPCHistoricalData,
  fetchHistoricalEmaeData,
} from '@/services/api';

/**
 * Hook para obtener los datos históricos del EMAE
 */
export function useHistoricalEmaeData(limit = 24) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // Función para obtener datos con parámetros opcionales
  const refetch = async (startDate?: string, endDate?: string, customLimit?: number) => {
    try {
      setLoading(true);
      const emaeData = await fetchHistoricalEmaeData(customLimit || limit, startDate, endDate);
      setData(emaeData);
      setError(null);
      return emaeData;
    } catch (err) {
      console.error("Error en useHistoricalEmaeData:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [limit]);

  return { data, loading, error, refetch };
}

/**
 * Hook para obtener los datos históricos del IPC
 */
export function useHistoricalIPCData() {
  const [data, setData] = useState<IPCHistoricalData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const ipcData = await getHistoricalIPCData();
        setData(ipcData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        console.error('Error al obtener datos históricos del IPC:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}