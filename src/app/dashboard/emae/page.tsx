'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Download, Filter } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DashboardHeader from "../components/DashboardHeader";
import EmaeTimeSeriesChart from "../components/EmaeTimeSeriesChart";
import EmaeMonthlyBarChart from "@/components/charts/EmaeMonthlyBarChart";
import SectorActivityChart from "@/components/charts/SectorActivityChart";
import SectorActivityList from "@/components/charts/SectorActivityList";
import MonthRangeFilter from "../components/MonthRangeFilter";
import { useAppData } from '@/lib/DataProvider';
import { useHistoricalEmaeData } from '@/hooks/useApiData';
import DataMetric from '@/components/DataMetric';

export default function EmaeDashboardPage() {
  // Estado para el filtro de rango de meses
  const [dateRange, setDateRange] = React.useState({
    startMonth: 1, // Enero
    startYear: new Date().getFullYear() - 1,
    endMonth: 12, // Diciembre
    endYear: new Date().getFullYear()
  });

  // Estado para las series a mostrar
  const [showSeries, setShowSeries] = React.useState({
    original: true,
    seasonallyAdjusted: true,
    trendCycle: false
  });

  // Obtener datos del contexto global
  const { 
    emaeData, 
    sectorData, 
    loadingEmae, 
    loadingSectors 
  } = useAppData();

  // Obtener datos históricos del EMAE
  const { 
    data: historicalData, 
    loading: loadingHistorical, 
    error: errorHistorical 
  } = useHistoricalEmaeData();

  // Fechas en formato ISO para filtrar los datos
  const startDate = `${dateRange.startYear}-${String(dateRange.startMonth).padStart(2, '0')}`;
  const endDate = `${dateRange.endYear}-${String(dateRange.endMonth).padStart(2, '0')}`;

  // Filtrar datos históricos por el rango de fechas seleccionado
  const filteredData = React.useMemo(() => {
    if (!historicalData) return [];
    
    return historicalData.filter(item => {
      const itemDate = new Date(item.date + 'T00:00:00');
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;
      
      // Verificar si la fecha está dentro del rango seleccionado
      if (dateRange.startYear > itemYear || (dateRange.startYear === itemYear && dateRange.startMonth > itemMonth)) {
        return false;
      }
      
      if (dateRange.endYear < itemYear || (dateRange.endYear === itemYear && dateRange.endMonth < itemMonth)) {
        return false;
      }
      
      return true;
    });
  }, [historicalData, dateRange]);

  // Función para formatear fechas
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const monthNames = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Función para manejar cambios en el filtro de rango de fechas
  const handleDateRangeChange = (newRange: {
    startMonth: number;
    startYear: number;
    endMonth: number;
    endYear: number;
  }) => {
    setDateRange(newRange);
  };

  // Función para alternar la visibilidad de las series
  const toggleSeries = (series: 'original' | 'seasonallyAdjusted' | 'trendCycle') => {
    setShowSeries(prev => ({
      ...prev,
      [series]: !prev[series]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <DashboardHeader 
        title="Dashboard EMAE"
        description="Estimador Mensual de Actividad Económica"
        lastUpdateDate={emaeData?.date + 'T00:00:00'}
      />

      {/* Filtros y controles */}
      <div className="mb-8 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Filtros y Controles</h3>
            <MonthRangeFilter 
              dateRange={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="space-x-2">
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={showSeries.original} 
                  onChange={() => toggleSeries('original')}
                  className="rounded border-gray-300 text-indec-blue focus:ring-indec-blue"
                />
                <span className="ml-2 text-sm">Serie Original</span>
              </label>
              
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={showSeries.seasonallyAdjusted} 
                  onChange={() => toggleSeries('seasonallyAdjusted')}
                  className="rounded border-gray-300 text-indec-blue focus:ring-indec-blue"
                />
                <span className="ml-2 text-sm">Serie Desestacionalizada</span>
              </label>
              
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={showSeries.trendCycle} 
                  onChange={() => toggleSeries('trendCycle')}
                  className="rounded border-gray-300 text-indec-blue focus:ring-indec-blue"
                />
                <span className="ml-2 text-sm">Tendencia-Ciclo</span>
              </label>
            </div>
            
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Exportar datos</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Primera fila: Indicadores principales y gráfico principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Métricas clave */}
        <div className="lg:col-span-1 grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                Último valor (original)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-indec-gray-dark/70" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Valor del EMAE de la serie original en el último período disponible.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEmae ? (
                <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <div className="text-2xl font-mono font-medium text-indec-blue-dark">
                  {emaeData?.original_value.toFixed(1)}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Base 2004 = 100
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                Var. mensual (desest.)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-indec-gray-dark/70" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Variación respecto al mes anterior (serie desestacionalizada).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEmae ? (
                <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <DataMetric 
                  label="" 
                  value={`${emaeData?.monthly_pct_change.toFixed(1)}%`} 
                  trend={emaeData && emaeData.monthly_pct_change >= 0 ? "up" : "down"} 
                  className="text-2xl font-mono font-medium" 
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                Var. interanual
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-indec-gray-dark/70" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Variación respecto al mismo mes del año anterior (serie original).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEmae ? (
                <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <DataMetric 
                  label="" 
                  value={`${emaeData?.yearly_pct_change.toFixed(1)}%`} 
                  trend={emaeData && emaeData.yearly_pct_change >= 0 ? "up" : "down"} 
                  className="text-2xl font-mono font-medium" 
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                Último período
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEmae ? (
                <div className="h-9 w-40 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <div className="text-lg font-medium text-indec-blue-dark">
                  {formatDate(emaeData?.date + 'T00:00:00')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Gráfico principal de series temporales */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Evolución del EMAE</CardTitle>
              <CardDescription>
                Series original, desestacionalizada{showSeries.trendCycle && ' y tendencia-ciclo'} | {formatDate(startDate + 'T00:00:00')} - {formatDate(endDate + 'T00:00:00')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <EmaeTimeSeriesChart 
                  data={filteredData}
                  loading={loadingHistorical}
                  error={errorHistorical}
                  showSeries={showSeries}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Segunda fila: Gráficos y tablas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de variación mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Variación mensual del EMAE</CardTitle>
            <CardDescription>
              Variación intermensual - Serie desestacionalizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <EmaeMonthlyBarChart 
                data={filteredData.slice(-12)} // Últimos 12 meses
                loading={loadingHistorical}
                error={errorHistorical}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Gráfico de sectores */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad por sectores</CardTitle>
            <CardDescription>
              Variación interanual por sector económico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <SectorActivityChart
                data={sectorData || []}
                loading={loadingSectors}
                error={null}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tercera fila: Tabla de sectores */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por sectores económicos</CardTitle>
          <CardDescription>
            Variación interanual por sector - Último período disponible: {formatDate(emaeData?.date + 'T00:00:00')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SectorActivityList
            data={sectorData || []}
            loading={loadingSectors}
            error={null}
          />
        </CardContent>
      </Card>
    </div>
  );
}