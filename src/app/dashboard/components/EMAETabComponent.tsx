import React, { useState, useEffect, useMemo } from 'react';
import { Info, Download, RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import DataMetric from "@/components/DataMetric";
import DateRangeFilter, { DateRange } from "./DateRangeFilter";
import EmaeDeseasonalizedChart from "./EMAEDeseasonalizaedChart";
import EmaeOriginalChart from "./EMAEOriginalChart";
import { EmaeLatestData } from '@/services/api';

// Interfaces
interface EmaeTabProps {
  emaeData: EmaeLatestData | null;
  emaeHistorical: any[] | null;
  loadingEmae: boolean;
  loadingHistorical: boolean;
  error: Error | null;
  refetchData: (startDate?: string, endDate?: string) => Promise<any[]>;
}

export default function EmaeTab({ 
  emaeData, 
  emaeHistorical,
  loadingEmae, 
  loadingHistorical,
  error,
  refetchData
}: EmaeTabProps) {
  // Configurar rango de fechas por defecto (2 años atrás)
  const today = new Date();
  const twoYearsAgo = new Date(today);
  twoYearsAgo.setFullYear(today.getFullYear() - 2);
  
  // Estado para el rango de fechas
  const [dateRange, setDateRange] = useState<DateRange>({
    startYear: twoYearsAgo.getFullYear().toString(),
    startMonth: (twoYearsAgo.getMonth() + 1).toString().padStart(2, '0'),
    endYear: today.getFullYear().toString(),
    endMonth: (today.getMonth() + 1).toString().padStart(2, '0')
  });
  
  // Estado para controlar la recarga de datos
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Datos filtrados para los gráficos
  const filteredData = useMemo(() => {
    if (!emaeHistorical) return [];
    
    const startDate = `${dateRange.startYear}-${dateRange.startMonth}-01`;
    const endDate = `${dateRange.endYear}-${dateRange.endMonth}-31`;
    
    return emaeHistorical.filter(item => {
      const itemDate = new Date(item.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return itemDate >= start && itemDate <= end;
    });
  }, [emaeHistorical, dateRange]);
  
  // Efecto para cargar datos cuando cambian las fechas
  useEffect(() => {
    const startDate = `${dateRange.startYear}-${dateRange.startMonth}-01`;
    const endDate = `${dateRange.endYear}-${dateRange.endMonth}-31`;
    
    const loadData = async () => {
      setIsRefreshing(true);
      try {
        await refetchData(startDate, endDate);
      } catch (err) {
        console.error("Error al actualizar datos del EMAE:", err);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    loadData();
  }, [dateRange, refetchData]);
  
  // Función para formatear fecha
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
    <div className="space-y-6">
      {/* Filtros y controles */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <DateRangeFilter 
          dateRange={dateRange}
          onChange={setDateRange}
        />
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchData()}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => console.log("Implementar exportación")}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Fecha de último dato */}
        <Card className="border border-indec-gray-medium/30 shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
              Último período disponible
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-indec-gray-dark/70" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Fecha del último dato disponible en la serie.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loadingEmae ? (
              <div className="h-7 w-40 bg-indec-gray-light/50 animate-pulse rounded"></div>
            ) : (
              <div className="text-xl font-bold text-indec-blue-dark">
                {emaeData?.date ? formatDate(emaeData.date) : ''}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Valor del índice original */}
        <Card className="border border-indec-gray-medium/30 shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
              Índice EMAE (Original)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-indec-gray-dark/70" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Valor del índice en la serie original. Base 2004=100.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loadingEmae ? (
              <div className="h-7 w-24 bg-indec-gray-light/50 animate-pulse rounded"></div>
            ) : (
              <div className="text-xl font-bold text-indec-blue-dark">
                {emaeData?.original_value?.toFixed(1) || "N/A"}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Variación mensual */}
        <Card className="border border-indec-gray-medium/30 shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
              Var. mensual (desest.)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-indec-gray-dark/70" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Variación porcentual respecto al mes anterior (serie desestacionalizada).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loadingEmae ? (
              <div className="h-7 w-28 bg-indec-gray-light/50 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-center">
                <DataMetric 
                  label="" 
                  value={`${emaeData?.monthly_pct_change?.toFixed(1) || "N/A"}%`} 
                  trend={emaeData && emaeData.monthly_pct_change >= 0 ? "up" : "down"} 
                  className="text-xl font-bold" 
                />
                
                {emaeData && emaeData.monthly_pct_change !== undefined && (
                  <span className="ml-2">
                    {emaeData.monthly_pct_change >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-indec-green" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-indec-red" />
                    )}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Variación interanual */}
        <Card className="border border-indec-gray-medium/30 shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
              Var. interanual
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-indec-gray-dark/70" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Variación porcentual respecto al mismo mes del año anterior.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loadingEmae ? (
              <div className="h-7 w-28 bg-indec-gray-light/50 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-center">
                <DataMetric 
                  label="" 
                  value={`${emaeData?.yearly_pct_change?.toFixed(1) || "N/A"}%`} 
                  trend={emaeData && emaeData.yearly_pct_change >= 0 ? "up" : "down"} 
                  className="text-xl font-bold" 
                />
                
                {emaeData && emaeData.yearly_pct_change !== undefined && (
                  <span className="ml-2">
                    {emaeData.yearly_pct_change >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-indec-green" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-indec-red" />
                    )}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Serie Desestacionalizada */}
        <Card className="border border-indec-gray-medium/30 shadow-sm">
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="text-lg font-semibold text-indec-blue-dark">
              EMAE - Serie Desestacionalizada
            </CardTitle>
            <CardDescription>
              Variación mensual desestacionalizada
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="h-72">
              {loadingHistorical ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : error ? (
                <div className="w-full h-full flex items-center justify-center text-indec-gray-dark">
                  No se pudieron cargar los datos del EMAE
                </div>
              ) : (
                <EmaeDeseasonalizedChart data={filteredData} />
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Gráfico Serie Original */}
        <Card className="border border-indec-gray-medium/30 shadow-sm">
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="text-lg font-semibold text-indec-blue-dark">
              EMAE - Serie Original
            </CardTitle>
            <CardDescription>
              Variación interanual serie original
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="h-72">
              {loadingHistorical ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : error ? (
                <div className="w-full h-full flex items-center justify-center text-indec-gray-dark">
                  No se pudieron cargar los datos del EMAE
                </div>
              ) : (
                <EmaeOriginalChart data={filteredData} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Nota de fuente */}
      <div className="text-sm text-indec-gray-dark mt-6 text-center">
        Fuente: Instituto Nacional de Estadística y Censos (INDEC) - Base 2004 = 100
      </div>
    </div>
  );
}