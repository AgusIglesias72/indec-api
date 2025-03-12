'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Download, Filter, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardHeader from "../components/DashboardHeader";
import EmaeTimeSeriesChart from "../components/EmaeTimeSeriesChart";
import EmaeMonthlyBarChart from "@/components/charts/EmaeMonthlyBarChart";
import SectorActivityChart from "@/components/charts/SectorActivityChart";
import SectorActivityList from "@/components/charts/SectorActivityList";
import MonthRangeFilter from "../components/MonthRangeFilter";
import { useAppData } from '@/lib/DataProvider';
import { useHistoricalEmaeData } from '@/hooks/useApiData';
import DataMetric from '@/components/DataMetric';
import SectorComparisonChart from "../components/SectorComparisonChart";

export default function EmaeDashboardPage() {
  // Estado para el filtro de rango de meses (ampliado para mostrar más datos históricos)
  const [dateRange, setDateRange] = useState({
    startMonth: 1, // Enero
    startYear: new Date().getFullYear() - 2, // 2 años atrás para mostrar más datos
    endMonth: 12, // Diciembre
    endYear: new Date().getFullYear()
  });

  // Estado para las series a mostrar
  const [showSeries, setShowSeries] = useState({
    original: true,
    seasonallyAdjusted: true,
    trendCycle: false
  });

  // Estado para sectores seleccionados para comparación
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  
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
    error: errorHistorical,
    refetch: refetchHistorical
  } = useHistoricalEmaeData(100); // Aumentamos el límite para obtener más datos históricos

  // Fechas en formato ISO para filtrar los datos
  const startDate = `${dateRange.startYear}-${String(dateRange.startMonth).padStart(2, '0')}`;
  const endDate = `${dateRange.endYear}-${String(dateRange.endMonth).padStart(2, '0')}`;

  // Efecto para cargar datos históricos cuando cambia el rango de fechas
  useEffect(() => {
    const fetchDataWithRange = async () => {
      // Implementar una función de fetch con parámetros de fecha
      try {
        // Esta función debería implementarse para hacer un fetch con el rango de fechas
        await refetchHistorical(startDate, endDate, 100);
      } catch (error) {
        console.error("Error fetching historical data with date range:", error);
      }
    };
    
    fetchDataWithRange();
  }, [startDate, endDate]);

  // Filtrar datos históricos por el rango de fechas seleccionado
  const filteredData = React.useMemo(() => {
    if (!historicalData) return [];
    
    return historicalData.filter(item => {
      const itemDate = new Date(item.date);
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

  // Generar opciones de sectores para el selector
  const sectorOptions = React.useMemo(() => {
    if (!sectorData) return [];
    
    // Extraer sectores únicos
    const uniqueSectors = Array.from(
      new Set(sectorData.map(item => item.sector_code))
    ).map(code => {
      const sector = sectorData.find(item => item.sector_code === code);
      return {
        code,
        name: sector?.sector_name || code
      };
    });
    
    return uniqueSectors.sort((a, b) => a.name.localeCompare(b.name));
  }, [sectorData]);

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

  // Manejar selección de sectores para comparación
  const handleSectorSelection = (sectorCode: string) => {
    setSelectedSectors(prev => {
      // Si ya está seleccionado, quitarlo
      if (prev.includes(sectorCode)) {
        return prev.filter(code => code !== sectorCode);
      }
      
      // Si no está seleccionado y hay menos de 5, agregarlo
      if (prev.length < 5) {
        return [...prev, sectorCode];
      }
      
      // Si ya hay 5 seleccionados, reemplazar el primero
      return [...prev.slice(1), sectorCode];
    });
  };

  // Descargar datos CSV
  const handleDownloadData = () => {
    if (!filteredData || filteredData.length === 0) return;
    
    // Crear encabezados
    const headers = ["fecha", "valor_original", "valor_desestacionalizado", "tendencia_ciclo", "var_mensual", "var_interanual"];
    
    // Convertir datos a formato CSV
    const csvData = filteredData.map(item => [
      item.date,
      item.original_value.toFixed(2),
      item.seasonally_adjusted_value.toFixed(2),
      item.cycle_trend_value ? item.cycle_trend_value.toFixed(2) : "",
      item.monthly_pct_change ? item.monthly_pct_change.toFixed(2) : "",
      item.yearly_pct_change ? item.yearly_pct_change.toFixed(2) : ""
    ].join(","));
    
    // Unir encabezados y datos
    const csvContent = `${headers.join(",")}\n${csvData.join("\n")}`;
    
    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `emae_datos_${startDate}_a_${endDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <DashboardHeader 
        title="Dashboard EMAE"
        description="Estimador Mensual de Actividad Económica"
        lastUpdateDate={emaeData?.date ? emaeData.date + 'T00:00:00' : undefined}
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
                <Checkbox 
                  checked={showSeries.original} 
                  onCheckedChange={() => toggleSeries('original')}
                  className="text-indec-blue"
                />
                <span className="ml-2 text-sm">Serie Original</span>
              </label>
              
              <label className="inline-flex items-center">
                <Checkbox 
                  checked={showSeries.seasonallyAdjusted} 
                  onCheckedChange={() => toggleSeries('seasonallyAdjusted')}
                  className="text-indec-blue"
                />
                <span className="ml-2 text-sm">Serie Desestacionalizada</span>
              </label>
              
              <label className="inline-flex items-center">
                <Checkbox 
                  checked={showSeries.trendCycle} 
                  onCheckedChange={() => toggleSeries('trendCycle')}
                  className="text-indec-blue"
                />
                <span className="ml-2 text-sm">Tendencia-Ciclo</span>
              </label>
            </div>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleDownloadData}
            >
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
                  value={`${emaeData?.monthly_pct_change ? emaeData.monthly_pct_change.toFixed(1) : "N/A"}%`} 
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
                  value={`${emaeData?.yearly_pct_change ? emaeData.yearly_pct_change.toFixed(1) : "N/A"}%`} 
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
                  {formatDate(emaeData?.date ? emaeData.date + 'T00:00:00' : undefined)}
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

      {/* Segunda fila: Nuevo gráfico de comparación de sectores */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <CardTitle>Variación interanual por sectores seleccionados</CardTitle>
                <CardDescription>
                  Compare la evolución de hasta 5 sectores económicos a lo largo del tiempo
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-2 items-center">
                <Select onValueChange={(value) => handleSectorSelection(value)}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Seleccionar sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorOptions.map((sector) => (
                      <SelectItem 
                        key={sector.code} 
                        value={sector.code}
                        disabled={selectedSectors.includes(sector.code) && selectedSectors.length >= 5}
                      >
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <span className="text-sm text-gray-500">
                  {selectedSectors.length}/5 sectores seleccionados
                </span>
              </div>
            </div>
            
            {/* Etiquetas de sectores seleccionados */}
            {selectedSectors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSectors.map(code => {
                  const sector = sectorOptions.find(s => s.code === code);
                  return (
                    <div 
                      key={code}
                      className="flex items-center gap-1 bg-indec-blue/10 text-indec-blue rounded-full px-3 py-1 text-sm"
                    >
                      <span>{sector?.name || code}</span>
                      <button 
                        onClick={() => handleSectorSelection(code)}
                        className="hover:text-indec-blue-dark"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <SectorComparisonChart 
                dateRange={{
                  startDate,
                  endDate
                }}
                selectedSectors={selectedSectors}
                loading={loadingSectors || loadingHistorical}
                error={errorHistorical}
              />
            </div>
            {selectedSectors.length === 0 && (
              <div className="flex items-center justify-center h-32 border border-dashed border-gray-300 rounded-md mt-4">
                <div className="text-center text-gray-500">
                  <TrendingUp className="mx-auto h-6 w-6 mb-2 text-gray-400" />
                  <p>Seleccione al menos un sector para visualizar su evolución</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tercera fila: Gráfico de variación mensual */}
      <div className="mb-8">
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
      </div>

      {/* Cuarta fila: Gráficos de sectores y tabla en la misma fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de sectores */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Actividad por sectores</CardTitle>
            <CardDescription>
              Variación interanual por sector económico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <SectorActivityChart
                data={sectorData || []}
                loading={loadingSectors}
                error={null}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Tabla de sectores */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Detalle por sectores económicos</CardTitle>
            <CardDescription>
              Variación interanual por sector - Último período disponible: {formatDate(emaeData?.date ? emaeData.date + 'T00:00:00' : undefined)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] overflow-auto">
              <SectorActivityList
                data={sectorData || []}
                loading={loadingSectors}
                error={null}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}