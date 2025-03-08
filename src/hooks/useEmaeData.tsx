/*  
// src/hooks/useEmaeData.ts
import { useState, useEffect } from 'react';

export interface EmaeDataPoint {
  date: string;
  original_value: number;
  seasonally_adjusted_value: number;
  cycle_trend_value?: number;
}

export interface EmaeQueryParams {
  start_date?: string;
  end_date?: string;
  sector_code?: string;
  limit?: number;
  page?: number;
  include_variations?: boolean;
  format?: 'json' | 'csv';
}

export function useEmaeData(params: EmaeQueryParams = {}) {
  const [data, setData] = useState<EmaeDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Construir URL con parámetros de consulta
        const url = new URL('/api/emae', window.location.origin);
        
        // Añadir parámetros a la URL
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        });
        
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Asumimos que la respuesta tiene un formato { data: [...], metadata: {...} }
        if (result.data) {
          setData(result.data);
        } else {
          setData([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching EMAE data:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  return { data, loading, error };
}

// Hook específico para obtener datos del EMAE por sectores económicos
export interface SectorData {
  sector_code: string;
  sector_name: string;
  latest_value: number;
  year_over_year_change: number;
}

export function useEmaeSectors() {
  const [data, setData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/emae/sectors');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching EMAE sector data:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchSectorData();
  }, []);

  return { data, loading, error };
}
*/