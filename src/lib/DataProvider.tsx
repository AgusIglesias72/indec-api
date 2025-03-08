"use client"

// src/lib/DataProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getApiStats, 
  getLatestEmaeData, 
  getLatestIPCData, 
  ApiStats,
  EmaeLatestData,
  IPCLatestData,
  SectorPerformance
} from '@/services/api';

// Definir la estructura del contexto
interface DataContextType {
  emaeData: EmaeLatestData | null;
  ipcData: IPCLatestData | null;
  sectorData: SectorPerformance[] | null;
  statsData: ApiStats | null;
  loadingEmae: boolean;
  loadingIPC: boolean;
  loadingSectors: boolean;
  loadingStats: boolean;
  errorEmae: Error | null;
  errorIPC: Error | null;
  errorSectors: Error | null;
  errorStats: Error | null;
  refetchEmae: () => Promise<void>;
  refetchIPC: () => Promise<void>;
  refetchStats: () => Promise<void>;
}

// Crear el contexto
const DataContext = createContext<DataContextType | undefined>(undefined);

// Proveedor de datos
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados para todos los tipos de datos
  const [emaeData, setEmaeData] = useState<EmaeLatestData | null>(null);
  const [ipcData, setIpcData] = useState<IPCLatestData | null>(null);
  const [sectorData, setSectorData] = useState<SectorPerformance[] | null>(null);
  const [statsData, setStatsData] = useState<ApiStats | null>(null);

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

 

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await getApiStats();
      setStatsData(data);
      setErrorStats(null);
    } catch (err) {
      setErrorStats(err instanceof Error ? err : new Error('Error desconocido'));
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoadingStats(false);
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
        fetchStats()
      ]);
    };

    loadAllData();
  }, []);

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
    refetchEmae: fetchEmae,
    refetchIPC: fetchIPC,
    refetchStats: fetchStats
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