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
  statsData: ApiStats | null;
  loadingEmae: boolean;
  loadingIPC: boolean;
  loadingSectors: boolean;
  loadingStats: boolean;
  errorEmae: Error | null;
  errorIPC: Error | null;
  errorSectors: Error | null;
  errorStats: Error | null;
  latestSectorDate: string | null;
  refetchEmae: () => Promise<void>;
  refetchIPC: () => Promise<void>;
  refetchSectors: () => Promise<void>;
}

// Crear el contexto
const DataContext = createContext<DataContextType | undefined>(undefined);

// Proveedor de datos
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados para todos los tipos de datos
  const [emaeData, setEmaeData] = useState<EmaeLatestData | null>(null);
  const [ipcData, setIpcData] = useState<IPCLatestData | null>(null);
  const [sectorData, setSectorData] = useState<SectorData[] | null>(null);
  const [statsData, setStatsData] = useState<ApiStats | null>(null);
  const [latestSectorDate, setLatestSectorDate] = useState<string | null>(null);

  // Estados de carga
  const [loadingEmae, setLoadingEmae] = useState(true);
  const [loadingIPC, setLoadingIPC] = useState(true);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Estados de error
  const [errorEmae, setErrorEmae] = useState<Error | null>(null);
  const [errorIPC, setErrorIPC] = useState<Error | null>(null);
  const [errorSectors, setErrorSectors] = useState<Error | null>(null);
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
      ]);
    };

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Agregamos el comentario para deshabilitar la advertencia

  // Valor del contexto
  const contextValue: DataContextType = {
    emaeData,
    ipcData,
    sectorData,
    statsData,
    loadingEmae,
    loadingIPC,
    loadingSectors,
    loadingStats,
    errorEmae,
    errorIPC,
    errorSectors,
    errorStats,
    latestSectorDate,
    refetchEmae: fetchEmae,
    refetchIPC: fetchIPC,
    refetchSectors: fetchSectors,
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