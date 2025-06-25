'use client';

import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import IPCEnhancedChart from '@/components/IPCEnhancedChart';
import IPCCategoriesTable from '@/components/IPCCategoriesTable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DataMetric from "@/components/DataMetric";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Metadata } from 'next';
import { ipcMetadata } from '@/lib/metadata';

export const metadata: Metadata = ipcMetadata;

export default function IPCPage() {
  const [ipcData, setIpcData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener datos actuales del IPC
  useEffect(() => {
    const fetchLatestIPC = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ipc/latest');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.data) {
          setIpcData(result.data);
          setError(null);
        } else {
          setError('No se pudo obtener información actualizada del IPC');
        }
      } catch (err) {
        console.error('Error al cargar datos del IPC:', err);
        setError('Error al cargar datos del IPC');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestIPC();
  }, []);

  // Formatear fecha
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      
      // Nombres de meses en español
      const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${month} ${year}`;
    } catch (e) {
      console.error("Error formateando fecha:", e);
      return dateString;
    }
  };

  return (
    <div className="relative min-h-screen">
      <HeroSection 
        title="Índice de Precios al Consumidor" 
        subtitle="Seguimiento de la evolución de precios por regiones y rubros"
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        {/* Sección: Valores actuales */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Valores actuales</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <p className="text-indec-gray-dark mb-6">
                <span className="font-medium">Último dato disponible:</span> {formatDate(ipcData?.date)}
              </p>
            
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                      Variación mensual
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Variación porcentual respecto al mes anterior.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      <DataMetric 
                        label="" 
                        value={`${ipcData?.monthly_pct_change?.toFixed(1) || "N/A"}%`} 
                        trend={ipcData?.monthly_change_variation < 0 ? "down" : "up"} 
                        trendValue={ipcData?.monthly_change_variation ? `${ipcData.monthly_change_variation > 0 ? '+' : ''}${ipcData.monthly_change_variation.toFixed(1)} pp` : undefined}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                      Variación interanual
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Variación respecto al mismo mes del año anterior.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      <DataMetric 
                        label="" 
                        value={`${ipcData?.yearly_pct_change?.toFixed(1) || "N/A"}%`} 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                      Variación acumulada
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Variación acumulada en el año.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      <DataMetric 
                        label="" 
                        value={`${ipcData?.accumulated_pct_change?.toFixed(1) || "N/A"}%`} 
                      />
                    </div>
                  </CardContent>
                </Card>
                
              
              </div>
            </>
          )}
        </div>
        
        {/* Sección: Gráfico interactivo */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Análisis histórico</h2>
          <IPCEnhancedChart 
            title="Evolución del IPC"
            description="Selecciona el rango de tiempo, región y rubro para visualizar"
            height={450}
          />
        </div>
        
        {/* Sección: Tabla de rubros destacados con datos reales */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Rubros y categorías</h2>
          <IPCCategoriesTable lastUpdate={formatDate(ipcData?.date)} />
        </div>
        
            
        <div className="text-xs text-indec-gray-dark text-center mt-8">
          <p>Fuente: Instituto Nacional de Estadística y Censos (INDEC)</p>
          <p className="mt-1">Los datos se actualizan mensualmente con la publicación oficial</p>
        </div>
      </div>
    </div>
  );
}