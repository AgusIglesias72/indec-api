import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Info, Download, RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataMetric from "@/components/DataMetric";
import DateRangeFilter, { DateRange } from "./DateRangeFilter";
import IPCMonthlyChart from "./IPCMonthlyChart";
import IPCInterannualChart from "./IPCInteranualChart";
import { IPCLatestData, IPCHistoricalData } from '@/services/api';

// Datos de prueba en caso de que los datos reales no funcionen
const testMonthlyData = [
  { date: '2023-01-01', monthly_change: 6.0 },
  { date: '2023-02-01', monthly_change: 6.3 },
  { date: '2023-03-01', monthly_change: 7.7 },
  { date: '2023-04-01', monthly_change: 8.4 },
  { date: '2023-05-01', monthly_change: 7.8 },
  { date: '2023-06-01', monthly_change: 6.0 },
  { date: '2023-07-01', monthly_change: 6.3 },
  { date: '2023-08-01', monthly_change: 12.4 },
  { date: '2023-09-01', monthly_change: 12.7 },
  { date: '2023-10-01', monthly_change: 8.3 },
  { date: '2023-11-01', monthly_change: 12.8 },
  { date: '2023-12-01', monthly_change: 25.5 },
  { date: '2024-01-01', monthly_change: 20.6 },
  { date: '2024-02-01', monthly_change: 13.2 },
  { date: '2024-03-01', monthly_change: 11.0 },
  { date: '2024-04-01', monthly_change: 8.8 },
  { date: '2024-05-01', monthly_change: 4.2 },
  { date: '2024-06-01', monthly_change: 4.6 }
];

const testInterannualData = [
  { date: '2023-01-01', year_over_year_change: 98.8 },
  { date: '2023-02-01', year_over_year_change: 102.5 },
  { date: '2023-03-01', year_over_year_change: 104.3 },
  { date: '2023-04-01', year_over_year_change: 108.8 },
  { date: '2023-05-01', year_over_year_change: 114.2 },
  { date: '2023-06-01', year_over_year_change: 115.6 },
  { date: '2023-07-01', year_over_year_change: 113.4 },
  { date: '2023-08-01', year_over_year_change: 124.4 },
  { date: '2023-09-01', year_over_year_change: 138.3 },
  { date: '2023-10-01', year_over_year_change: 142.7 },
  { date: '2023-11-01', year_over_year_change: 160.9 },
  { date: '2023-12-01', year_over_year_change: 211.4 },
  { date: '2024-01-01', year_over_year_change: 254.4 },
  { date: '2024-02-01', year_over_year_change: 276.2 },
  { date: '2024-03-01', year_over_year_change: 287.9 },
  { date: '2024-04-01', year_over_year_change: 289.4 },
  { date: '2024-05-01', year_over_year_change: 277.8 },
  { date: '2024-06-01', year_over_year_change: 271.4 }
];

// Regiones y componentes disponibles
const REGIONS = [
  { value: 'Nacional', label: 'Nacional' },
  { value: 'GBA', label: 'Gran Buenos Aires' },
  { value: 'Pampeana', label: 'Región Pampeana' },
  { value: 'Noreste', label: 'Región Noreste' },
  { value: 'Noroeste', label: 'Región Noroeste' },
  { value: 'Cuyo', label: 'Región Cuyo' },
  { value: 'Patagonia', label: 'Región Patagonia' }
];

const COMPONENTS = [
  { value: 'GENERAL', label: 'Nivel General' },
  { value: 'RUBRO_ALIMENTOS', label: 'Alimentos y bebidas no alcohólicas' },
  { value: 'RUBRO_BEBIDAS_ALCOHOLICAS', label: 'Bebidas alcohólicas y tabaco' },
  { value: 'RUBRO_PRENDAS', label: 'Prendas de vestir y calzado' },
  { value: 'RUBRO_VIVIENDA', label: 'Vivienda, agua, electr., gas y otros' },
  { value: 'RUBRO_EQUIPAMIENTO', label: 'Equipamiento y mantenimiento del hogar' },
  { value: 'RUBRO_SALUD', label: 'Salud' },
  { value: 'RUBRO_TRANSPORTE', label: 'Transporte' },
  { value: 'RUBRO_COMUNICACION', label: 'Comunicación' },
  { value: 'RUBRO_RECREACION', label: 'Recreación y cultura' },
  { value: 'RUBRO_EDUCACION', label: 'Educación' },
  { value: 'RUBRO_RESTAURANTES', label: 'Restaurantes y hoteles' },
  { value: 'RUBRO_BIENES_SERVICIOS', label: 'Bienes y servicios varios' },
  { value: 'CAT_ESTACIONAL', label: 'Estacionales' },
  { value: 'CAT_NUCLEO', label: 'Núcleo' },
  { value: 'CAT_REGULADOS', label: 'Regulados' }
];

// Interfaces
interface IPCTabProps {
  ipcData: IPCLatestData | null;
  ipcHistorical: IPCHistoricalData[] | null;
  loadingIpc: boolean;
  loadingHistorical: boolean;
  error: Error | null;
  refetchHistorical?: (startDate?: string, endDate?: string, region?: string, category?: string) => Promise<any>;
}

export default function FixedIPCTab({ 
  ipcData, 
  ipcHistorical,
  loadingIpc, 
  loadingHistorical,
  error,
  refetchHistorical
}: IPCTabProps) {
  // Configurar rango de fechas por defecto (2 años atrás)
  const today = new Date();
  const twoYearsAgo = new Date(today);
  twoYearsAgo.setFullYear(today.getFullYear() - 2);
  
  // Estado para filtros
  const [dateRange, setDateRange] = useState<DateRange>({
    startYear: twoYearsAgo.getFullYear().toString(),
    startMonth: (twoYearsAgo.getMonth() + 1).toString().padStart(2, '0'),
    endYear: today.getFullYear().toString(),
    endMonth: (today.getMonth() + 1).toString().padStart(2, '0')
  });
  
  const [selectedRegion, setSelectedRegion] = useState('Nacional');
  const [selectedComponent, setSelectedComponent] = useState('GENERAL');
  
  // Estado para controlar la recarga de datos
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estado para controlar si usamos datos de prueba
  const [useTestData, setUseTestData] = useState(false);
  
  // Registramos el último estado de filtros para evitar recargas innecesarias
  const prevFiltersRef = useRef({
    startYear: dateRange.startYear,
    startMonth: dateRange.startMonth,
    endYear: dateRange.endYear,
    endMonth: dateRange.endMonth,
    region: selectedRegion,
    component: selectedComponent
  });

  // Efecto para cargar datos cuando cambian los filtros, con control de referencia previa
  useEffect(() => {
    // Comprobar si realmente cambió algo
    const prevFilters = prevFiltersRef.current;
    const filtersChanged = 
      prevFilters.startYear !== dateRange.startYear ||
      prevFilters.startMonth !== dateRange.startMonth ||
      prevFilters.endYear !== dateRange.endYear ||
      prevFilters.endMonth !== dateRange.endMonth ||
      prevFilters.region !== selectedRegion ||
      prevFilters.component !== selectedComponent;
    
    // Solo cargar datos si realmente hay cambios en los filtros
    if (filtersChanged && refetchHistorical) {
      console.log("Filtros cambiados, recargando datos...");
      
      setIsRefreshing(true);
      const loadData = async () => {
        try {
          // Construir las fechas para el filtro
          const startDate = `${dateRange.startYear}-${dateRange.startMonth}-01`;
          const endDate = `${dateRange.endYear}-${dateRange.endMonth}-31`;
          
          // Actualizar la referencia de filtros previos
          prevFiltersRef.current = {
            startYear: dateRange.startYear,
            startMonth: dateRange.startMonth,
            endYear: dateRange.endYear,
            endMonth: dateRange.endMonth,
            region: selectedRegion,
            component: selectedComponent
          };
          
          // Usar el refetch del hook para actualizar datos con los filtros seleccionados
          await refetchHistorical(startDate, endDate, selectedRegion, selectedComponent);
          // Si hay datos, no usamos los de prueba
          if (ipcHistorical && ipcHistorical.length > 0) {
            setUseTestData(false);
          }
        } catch (error) {
          console.error("Error al cargar datos del IPC:", error);
          // Si hay un error, usamos datos de prueba
          setUseTestData(true);
        } finally {
          setIsRefreshing(false);
        }
      };
      
      loadData();
    }
  }, [dateRange, selectedRegion, selectedComponent, refetchHistorical]);
  
  // Datos para mostrar en los gráficos (datos reales o de prueba)
  const monthlyChartData = useMemo(() => {
    if (useTestData) return testMonthlyData;
    return ipcHistorical || [];
  }, [ipcHistorical, useTestData]);
  
  const interannualChartData = useMemo(() => {
    if (useTestData) return testInterannualData;
    return ipcHistorical || [];
  }, [ipcHistorical, useTestData]);
  
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
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-wrap gap-4 w-full">
          <DateRangeFilter 
            dateRange={dateRange}
            onChange={setDateRange}
            className="flex-grow"
          />
          
          <div className="flex gap-2">
            <Select 
              value={selectedRegion} 
              onValueChange={setSelectedRegion}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Región" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(region => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedComponent} 
              onValueChange={setSelectedComponent}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Componente" />
              </SelectTrigger>
              <SelectContent>
                {COMPONENTS.map(component => (
                  <SelectItem key={component.value} value={component.value}>
                    {component.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2 ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              if (!refetchHistorical) return;
              setIsRefreshing(true);
              try {
                const startDate = `${dateRange.startYear}-${dateRange.startMonth}-01`;
                const endDate = `${dateRange.endYear}-${dateRange.endMonth}-31`;
                await refetchHistorical(startDate, endDate, selectedRegion, selectedComponent);
              } catch (error) {
                console.error("Error al actualizar datos del IPC:", error);
              } finally {
                setIsRefreshing(false);
              }
            }}
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
            {loadingIpc ? (
              <div className="h-7 w-40 bg-indec-gray-light/50 animate-pulse rounded"></div>
            ) : (
              <div className="text-xl font-bold text-indec-blue-dark">
                {ipcData?.date ? formatDate(ipcData.date) : ''}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Variación mensual */}
        <Card className="border border-indec-gray-medium/30 shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
              Var. mensual
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
          <CardContent className="p-3 pt-0">
            {loadingIpc ? (
              <div className="h-7 w-24 bg-indec-gray-light/50 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-center">
                <DataMetric 
                  label="" 
                  value={`${ipcData?.monthly_change?.toFixed(1) || "N/A"}%`}
                  className="text-xl font-bold text-indec-red"
                />
                
                {ipcData && ipcData.monthly_change_variation !== undefined && (
                  <div className="ml-2 flex items-center text-xs">
                    {ipcData.monthly_change_variation < 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-indec-green" />
                        <span className="text-indec-green ml-1">
                          {Math.abs(ipcData.monthly_change_variation).toFixed(1)} pp
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 text-indec-red" />
                        <span className="text-indec-red ml-1">
                          +{ipcData.monthly_change_variation.toFixed(1)} pp
                        </span>
                      </>
                    )}
                  </div>
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
            {loadingIpc ? (
              <div className="h-7 w-28 bg-indec-gray-light/50 animate-pulse rounded"></div>
            ) : (
              <div className="text-xl font-bold text-indec-red">
                {ipcData?.year_over_year_change?.toFixed(1) || "N/A"}%
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Variación acumulada anual */}
        <Card className="border border-indec-gray-medium/30 shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
              {`Acum. ${ipcData?.date ? new Date(ipcData.date).getFullYear() : ''}`}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-indec-gray-dark/70" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Variación acumulada en lo que va del año.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loadingIpc ? (
              <div className="h-7 w-28 bg-indec-gray-light/50 animate-pulse rounded"></div>
            ) : (
              <div className="text-xl font-bold text-indec-red">
                {ipcData?.accumulated_change?.toFixed(1) || "N/A"}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Variación Mensual */}
        <Card className="border border-indec-gray-medium/30 shadow-sm">
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="text-lg font-semibold text-indec-blue-dark">
              IPC - Variación Mensual
            </CardTitle>
            <CardDescription>
              {`${COMPONENTS.find(c => c.value === selectedComponent)?.label || 'Nivel General'} - ${selectedRegion}`}
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
                  No se pudieron cargar los datos del IPC
                </div>
              ) : (
                <IPCMonthlyChart data={monthlyChartData} />
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Gráfico Variación Interanual */}
        <Card className="border border-indec-gray-medium/30 shadow-sm">
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="text-lg font-semibold text-indec-blue-dark">
              IPC - Variación Interanual
            </CardTitle>
            <CardDescription>
              {`${COMPONENTS.find(c => c.value === selectedComponent)?.label || 'Nivel General'} - ${selectedRegion}`}
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
                  No se pudieron cargar los datos del IPC
                </div>
              ) : (
                <IPCInterannualChart data={interannualChartData} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Nota de fuente */}
      <div className="text-sm text-indec-gray-dark mt-6 text-center">
        Fuente: Instituto Nacional de Estadística y Censos (INDEC)
      </div>
    </div>
  );
}