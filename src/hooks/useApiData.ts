"use client";

import { useState, useEffect } from 'react';
import { 
  getApiStats, 
  getLatestEmaeData, 
  getLatestIPCData, 
  getSectorPerformance,
  getHistoricalIPCData,
  ApiStats,
  EmaeLatestData,
  IPCLatestData,
  SectorPerformance,
  IPCHistoricalData,
  fetchHistoricalEmaeData,
} from '@/services/api';

/**
 * Hook para obtener las estadísticas generales
 */
export function useApiStats() {
  const [data, setData] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await getApiStats();
        setData(stats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        console.error('Error al obtener estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook para obtener los datos más recientes del EMAE
 */
export function useLatestEmaeData() {
  const [data, setData] = useState<EmaeLatestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const emaeData = await getLatestEmaeData();
        setData(emaeData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        console.error('Error al obtener datos EMAE:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook para obtener los datos más recientes del IPC
 */
export function useLatestIPCData() {
  const [data, setData] = useState<IPCLatestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const ipcData = await getLatestIPCData();
        setData(ipcData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        console.error('Error al obtener datos IPC:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook para obtener el desempeño por sector
 */
export function useSectorPerformance() {
  const [data, setData] = useState<SectorPerformance[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const sectorsData = await getSectorPerformance();
        setData(sectorsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        console.error('Error al obtener datos de sectores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook para obtener los datos históricos del EMAE
 */
export function useHistoricalEmaeData(limit = 24) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const emaeData = await fetchHistoricalEmaeData(limit);
        setData(emaeData);
        setError(null);
      } catch (err) {
        console.error("Error en useHistoricalEmaeData:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [limit]);

  return { data, loading, error };
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