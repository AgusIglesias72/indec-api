"use client"

// src/lib/DataProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getLatestEmaeData, 
  getLatestIPCData, 
  ApiStats,
  EmaeLatestData,
  IPCLatestData,
} from '@/services/api';
import { getLatestDollarRates } from '@/services/api-dollar';
import { DollarRateData } from '@/types/dollar';
import { getRiskCountryData } from '@/services/api-risk-country';
import { RiskCountryDataPoint } from '@/types/risk-country';

// Interfaz para los datos de sectores
interface SectorData {
  sector_name: string;
  sector_code: string;
  year_over_year_change: number;
  original_value: number;
  date: string;
}

// Definir la estructura del contexto
interface DataContextType {
  emaeData: EmaeLatestData | null;
  ipcData: IPCLatestData | null;
  sectorData: SectorData[] | null;
  dollarData: DollarRateData | null;
  riskCountryData: RiskCountryDataPoint | null;
  monthlyVariation: number | null;
  yearlyVariation: number | null;
  statsData: ApiStats | null;
  loadingEmae: boolean;
  loadingIPC: boolean;
  loadingSectors: boolean;
  loadingDollar: boolean;
  loadingRiskCountry: boolean;
  loadingStats: boolean;
  errorEmae: Error | null;
  errorIPC: Error | null;
  errorSectors: Error | null;
  errorDollar: Error | null;
  errorRiskCountry: Error | null;
  errorStats: Error | null;
  latestSectorDate: string | null;
  refetchEmae: () => Promise<void>;
  refetchIPC: () => Promise<void>;
  refetchSectors: () => Promise<void>;
  refetchDollar: () => Promise<void>;
  refetchRiskCountry: () => Promise<void>;
}

// Crear el contexto
const DataContext = createContext<DataContextType | undefined>(undefined);

// Proveedor de datos
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados para todos los tipos de datos
  const [emaeData, setEmaeData] = useState<EmaeLatestData | null>(null);
  const [ipcData, setIpcData] = useState<IPCLatestData | null>(null);
  const [sectorData, setSectorData] = useState<SectorData[] | null>(null);
  const [dollarData, setDollarData] = useState<DollarRateData | null>(null);
  const [riskCountryData, setRiskCountryData] = useState<RiskCountryDataPoint | null>(null);
  const [monthlyVariation, setMonthlyVariation] = useState<number | null>(null);
  const [yearlyVariation, setYearlyVariation] = useState<number | null>(null);
  const [statsData, setStatsData] = useState<ApiStats | null>(null);
  const [latestSectorDate, setLatestSectorDate] = useState<string | null>(null);

  // Estados de carga
  const [loadingEmae, setLoadingEmae] = useState(true);
  const [loadingIPC, setLoadingIPC] = useState(true);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [loadingDollar, setLoadingDollar] = useState(true);
  const [loadingRiskCountry, setLoadingRiskCountry] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Estados de error
  const [errorEmae, setErrorEmae] = useState<Error | null>(null);
  const [errorIPC, setErrorIPC] = useState<Error | null>(null);
  const [errorSectors, setErrorSectors] = useState<Error | null>(null);
  const [errorDollar, setErrorDollar] = useState<Error | null>(null);
  const [errorRiskCountry, setErrorRiskCountry] = useState<Error | null>(null);
  const [errorStats, setErrorStats] = useState<Error | null>(null);

  // Funciones para obtener datos
  const fetchEmae = async () => {
    try {
      setLoadingEmae(true);
      const data = await getLatestEmaeData();
      setEmaeData(data);
      setErrorEmae(null);
    } catch (err) {
      setErrorEmae(err instanceof Error ? err : new Error('Error desconocido'));
      console.error('Error al cargar datos EMAE:', err);
    } finally {
      setLoadingEmae(false);
    }
  };

  const fetchIPC = async () => {
    try {
      setLoadingIPC(true);
      const data = await getLatestIPCData();
      setIpcData(data);
      setErrorIPC(null);
    } catch (err) {
      setErrorIPC(err instanceof Error ? err : new Error('Error desconocido'));
      console.error('Error al cargar datos IPC:', err);
    } finally {
      setLoadingIPC(false);
    }
  };

  // Función para obtener datos del dólar oficial
  const fetchDollar = async () => {
    try {
      setLoadingDollar(true);
      const dollarRates = await getLatestDollarRates();
      const oficialRate = dollarRates.find(rate => rate.dollar_type === 'OFICIAL');
      
      if (oficialRate) {
        setDollarData(oficialRate);
        setErrorDollar(null);
      } else {
        throw new Error('No se encontraron datos del dólar oficial');
      }
    } catch (err) {
      setErrorDollar(err instanceof Error ? err : new Error('Error desconocido'));
      console.error('Error al cargar datos del dólar:', err);
      // Datos de fallback
      setDollarData({
        date: new Date().toISOString().split('T')[0],
        dollar_type: 'OFICIAL',
        dollar_name: 'Oficial',
        sell_price: 1185,
        buy_price: 1135,
        spread: 4.41,
        sell_variation: 0,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setLoadingDollar(false);
    }
  };

  // Función para obtener datos del riesgo país con variaciones
  const fetchRiskCountry = async () => {
    try {
      setLoadingRiskCountry(true);
      
      // Obtener valor actual
      const currentData = await getRiskCountryData({ type: 'latest' });
      if (!currentData.success || !currentData.data || currentData.data.length === 0) {
        throw new Error('No se encontraron datos actuales');
      }
      
      const latest = currentData.data[0];
      setRiskCountryData(latest);
      
      // Calcular variaciones
      const currentDate = new Date(latest.closing_date);
      const oneMonthAgo = new Date(currentDate);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const oneYearAgo = new Date(currentDate);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      // Obtener datos históricos para variaciones
      const [monthlyData, yearlyData] = await Promise.allSettled([
        getRiskCountryData({ 
          type: 'custom',
          date_from: new Date(oneMonthAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_to: new Date(oneMonthAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          limit: 1
        }),
        getRiskCountryData({ 
          type: 'custom',
          date_from: new Date(oneYearAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_to: new Date(oneYearAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          limit: 1
        })
      ]);
      
      // Calcular variación mensual
      if (monthlyData.status === 'fulfilled' && monthlyData.value.success && monthlyData.value.data.length > 0) {
        const monthlyValue = monthlyData.value.data[0].closing_value;
        const monthlyVar = ((latest.closing_value - monthlyValue) / monthlyValue * 100);
        setMonthlyVariation(monthlyVar);
      } else {
        setMonthlyVariation(null);
      }
      
      // Calcular variación anual
      if (yearlyData.status === 'fulfilled' && yearlyData.value.success && yearlyData.value.data.length > 0) {
        const yearlyValue = yearlyData.value.data[0].closing_value;
        const yearlyVar = ((latest.closing_value - yearlyValue) / yearlyValue * 100);
        setYearlyVariation(yearlyVar);
      } else {
        setYearlyVariation(null);
      }
      
      setErrorRiskCountry(null);
    } catch (err) {
      console.error('Error al cargar datos del riesgo país:', err);
      setErrorRiskCountry(err instanceof Error ? err : new Error('Error desconocido'));
      
      // Datos de fallback
      setRiskCountryData({
        closing_value: 705,
        change_percentage: -0.14,
        closing_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setMonthlyVariation(2.1);
      setYearlyVariation(-54.6);
    } finally {
      setLoadingRiskCountry(false);
    }
  };

  // Nueva función para obtener datos de sectores
  const fetchSectors = async () => {
    try {
      setLoadingSectors(true);
      
      // Primero obtenemos metadatos para saber cuál es el último mes disponible
      const metadataResponse = await fetch('/api/emae/metadata');
      if (!metadataResponse.ok) {
        throw new Error(`Error ${metadataResponse.status}: ${metadataResponse.statusText}`);
      }
      
      const metadataResult = await metadataResponse.json();
      const lastDate = metadataResult.date_range?.last_date + "T00:00:00";
      
      if (lastDate) {
        setLatestSectorDate(lastDate);
        
        // Extraer mes y año del último dato disponible
        const dateObj = new Date(lastDate);
        const month = dateObj.getMonth() + 1; // getMonth() devuelve 0-11
        const year = dateObj.getFullYear();

        // Ahora obtenemos los datos de sectores específicamente para ese mes/año
        const response = await fetch(`/api/emae/sectors?month=${month}&year=${year}&limit=20&include_variations=true`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('Formato de respuesta inesperado');
        }
        
        // Transformar datos
        const formattedData: SectorData[] = result.data.map((item: any) => ({
          sector_name: item.economy_sector,
          sector_code: item.economy_sector_code,
          year_over_year_change: item.year_over_year_change || 0,
          original_value: item.original_value || 0,
          date: item.date
        }));
        
        setSectorData(formattedData);
        setErrorSectors(null);
      } else {
        throw new Error('No se pudo determinar el último mes disponible');
      }
    } catch (err) {
      console.error('Error fetching sector data:', err);
      setErrorSectors(err instanceof Error ? err : new Error('Error desconocido'));
      
      // Datos simulados en caso de error para no romper la UI
      const mockData: SectorData[] = [
        { sector_name: 'Agricultura, ganadería, caza y silvicultura', sector_code: 'A', year_over_year_change: 4.5, original_value: 120.5, date: '2024-02-01' },
        { sector_name: 'Pesca', sector_code: 'B', year_over_year_change: -2.3, original_value: 95.8, date: '2024-02-01' },
        { sector_name: 'Explotación de minas y canteras', sector_code: 'C', year_over_year_change: 6.2, original_value: 130.2, date: '2024-02-01' },
        { sector_name: 'Industria manufacturera', sector_code: 'D', year_over_year_change: -1.5, original_value: 115.3, date: '2024-02-01' },
        { sector_name: 'Electricidad, gas y agua', sector_code: 'E', year_over_year_change: 3.8, original_value: 125.9, date: '2024-02-01' },
        { sector_name: 'Construcción', sector_code: 'F', year_over_year_change: -4.7, original_value: 90.4, date: '2024-02-01' },
        { sector_name: 'Comercio', sector_code: 'G', year_over_year_change: 2.5, original_value: 118.7, date: '2024-02-01' },
      ];
      
      setSectorData(mockData);
      
      // En caso de error, establecer una fecha por defecto
      if (!latestSectorDate) {
        setLatestSectorDate('2024-02-01');
      }
    } finally {
      setLoadingSectors(false);
    }
  };

  


  // Cargar todos los datos en la inicialización
  useEffect(() => {
    // Cargar todos los datos en paralelo
    const loadAllData = async () => {
      // Iniciar todas las peticiones en paralelo
      await Promise.all([
        fetchEmae(),
        fetchIPC(),
        fetchSectors(),
        fetchDollar(),
        fetchRiskCountry(),
      ]);
    };

    loadAllData();
    
    // Configurar intervalos de actualización
    const dollarInterval = setInterval(() => {
      fetchDollar();
    }, 5 * 60 * 1000); // Actualizar dólar cada 5 minutos
    
    const riskCountryInterval = setInterval(() => {
      fetchRiskCountry();
    }, 5 * 60 * 1000); // Actualizar riesgo país cada 5 minutos

    return () => {
      clearInterval(dollarInterval);
      clearInterval(riskCountryInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Agregamos el comentario para deshabilitar la advertencia

  // Valor del contexto
  const contextValue: DataContextType = {
    emaeData,
    ipcData,
    sectorData,
    dollarData,
    riskCountryData,
    monthlyVariation,
    yearlyVariation,
    statsData,
    loadingEmae,
    loadingIPC,
    loadingSectors,
    loadingDollar,
    loadingRiskCountry,
    loadingStats,
    errorEmae,
    errorIPC,
    errorSectors,
    errorDollar,
    errorRiskCountry,
    errorStats,
    latestSectorDate,
    refetchEmae: fetchEmae,
    refetchIPC: fetchIPC,
    refetchSectors: fetchSectors,
    refetchDollar: fetchDollar,
    refetchRiskCountry: fetchRiskCountry,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Hook para usar el contexto
export const useAppData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useAppData debe ser usado dentro de un DataProvider');
  }
  return context;
};