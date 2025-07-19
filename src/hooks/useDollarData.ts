// src/hooks/useDollarData.ts
import { useState, useEffect } from 'react';

interface DollarData {
  buy_price: number;
  sell_price: number;
  spread: number;
  dollar_type: string;
  date: string;
}

export const useDollarData = (dollarType: string = 'BLUE', refreshInterval: number = 5 * 60 * 1000) => {
  const [data, setData] = useState<DollarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/dollar?type=latest&dollar_type=${dollarType}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const dollarData = result.data?.find((d: any) => d.dollar_type === dollarType);
      
      if (dollarData) {
        setData(dollarData);
      } else {
        throw new Error(`No se encontraron datos para ${dollarType}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching dollar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Configurar actualización automática
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [dollarType, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

// Ejemplo de uso:
// const { data: blueData, loading, error } = useDollarData('BLUE');
// const { data: oficialData } = useDollarData('OFICIAL', 10 * 60 * 1000); // 10 minutos