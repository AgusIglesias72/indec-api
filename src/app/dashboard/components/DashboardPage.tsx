'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "./DashboardHeaderComponent";
import EmaeTab from "./EMAETabComponent";
import IpcTab from "./IPCTabComponent";
import { useAppData } from '@/lib/DataProvider';
import { useHistoricalEmaeData, useHistoricalIPCData } from '@/hooks/useApiData';

/**
 * Dashboard principal que integra visualizaciones de EMAE e IPC
 */
export default function DashboardPage() {
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState<string>('emae');
  
  // Obtener datos básicos del contexto
  const { 
    emaeData, 
    ipcData, 
    loadingEmae, 
    loadingIPC 
  } = useAppData();
  
  // Datos históricos para los gráficos
  const { 
    data: emaeHistorical, 
    loading: loadingEmaeHistorical, 
    error: emaeHistoricalError,
    refetch: refetchEmae
  } = useHistoricalEmaeData();
  
  const { 
    data: ipcHistorical, 
    loading: loadingIpcHistorical, 
    error: ipcHistoricalError,
    refetch: refetchIPC 
  } = useHistoricalIPCData();

  return (
    <div className="relative min-h-screen">
      {/* Fondo con patrón de puntos */}
      <div 
        className="absolute inset-0 opacity-[0.85] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      
      <div className="container relative z-10 mx-auto px-4 py-8">
        {/* Encabezado del Dashboard */}
        <DashboardHeader
          title="Panel de Indicadores Económicos"
          description="Monitorea y analiza los principales indicadores económicos de Argentina con visualizaciones interactivas"
        />
        
        {/* Tabs para EMAE e IPC */}
        <Tabs 
          defaultValue="emae" 
          className="mt-8" 
          onValueChange={(value) => setActiveTab(value)}
        >
          <div className="flex justify-center mb-8">
            <TabsList className="bg-indec-gray-light">
              <TabsTrigger 
                value="emae" 
                className="data-[state=active]:bg-white"
              >
                EMAE
              </TabsTrigger>
              <TabsTrigger 
                value="ipc" 
                className="data-[state=active]:bg-white"
              >
                IPC
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Contenido de las pestañas */}
          <TabsContent value="emae">
            <EmaeTab 
              emaeData={emaeData}
              emaeHistorical={emaeHistorical}
              loadingEmae={loadingEmae}
              loadingHistorical={loadingEmaeHistorical}
              error={emaeHistoricalError}
              refetchData={refetchEmae}
            />
          </TabsContent>
          
          <TabsContent value="ipc">
            <IpcTab 
              ipcData={ipcData}
              ipcHistorical={ipcHistorical}
              loadingIpc={loadingIPC}
              loadingHistorical={loadingIpcHistorical}
              error={ipcHistoricalError}
              refetchHistorical={refetchIPC}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}