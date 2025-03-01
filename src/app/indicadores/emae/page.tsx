'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown, Download, Filter, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataMetric from '@/components/DataMetric';
import EmaeTimeSeriesChart from '@/components/charts/EmaeTimeSeriesChart';
import EmaeActivityChart from '@/components/charts/EmaeActivityChart';
import { useHistoricalEmaeData } from '@/hooks/useApiData';
import { useAppData } from '@/lib/DataProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function EmaeDashboardPage() {
  // Estado para filtros
  const [dateRange, setDateRange] = useState('5Y');
  const [selectedActivity, setSelectedActivity] = useState('all');
  
  // Obtener datos
  const { 
    emaeData, 
    loadingEmae, 
    errorEmae 
  } = useAppData();
  
  const { 
    data: historicalData, 
    loading: loadingHistorical, 
    error: errorHistorical 
  } = useHistoricalEmaeData();

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
  }

  // Simulación de actividades económicas (en implementación real obtendríamos esto de la API)
  const activityOptions = [
    { code: 'all', name: 'Todos los sectores' },
    { code: 'A', name: 'Agricultura, ganadería, caza y silvicultura' },
    { code: 'B', name: 'Pesca' },
    { code: 'C', name: 'Explotación de minas y canteras' },
    { code: 'D', name: 'Industria manufacturera' },
    { code: 'E', name: 'Electricidad, gas y agua' },
    { code: 'F', name: 'Construcción' },
    { code: 'G', name: 'Comercio mayorista, minorista y reparaciones' },
    { code: 'H', name: 'Hoteles y restaurantes' },
    { code: 'I', name: 'Transporte, almacenamiento y comunicaciones' },
    { code: 'J', name: 'Intermediación financiera' },
    { code: 'K', name: 'Actividades inmobiliarias, empresariales y de alquiler' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-indec-blue-dark mb-2">Estimador Mensual de Actividad Económica</h1>
        <p className="text-indec-gray-dark">
          El EMAE refleja la evolución mensual de la actividad económica del conjunto de los sectores productivos a nivel nacional. Este indicador permite anticipar las tasas de variación del producto interno bruto (PIB) trimestral.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indec-gray-dark">Último período</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEmae ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-2xl font-bold text-indec-blue-dark">
                {formatDate(emaeData?.date)}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indec-gray-dark">Índice general</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEmae ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-2xl font-bold text-indec-blue-dark">
                {emaeData?.original_value.toFixed(1)}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
              Variación m/m (desest.)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-indec-gray-dark/70" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Variación porcentual respecto al mes anterior, calculada sobre la serie desestacionalizada.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEmae ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <DataMetric 
                label="" 
                value={`${emaeData?.monthly_change.toFixed(1)}%`} 
                trend={emaeData && emaeData.monthly_change >= 0 ? "up" : "down"} 
                className="text-2xl font-bold" 
              />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
              Variación i/a
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-indec-gray-dark/70" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Variación porcentual interanual, calculada respecto al mismo mes del año anterior.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEmae ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <DataMetric 
                label="" 
                value={`${emaeData?.year_over_year_change.toFixed(1)}%`} 
                trend={emaeData && emaeData.year_over_year_change >= 0 ? "up" : "down"} 
                className="text-2xl font-bold" 
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="general" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="by-activity">Por actividad</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1Y">Último año</SelectItem>
                <SelectItem value="2Y">Últimos 2 años</SelectItem>
                <SelectItem value="5Y">Últimos 5 años</SelectItem>
                <SelectItem value="10Y">Últimos 10 años</SelectItem>
                <SelectItem value="ALL">Serie completa</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        <TabsContent value="general" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Evolución histórica del EMAE</CardTitle>
              <CardDescription>
                Comparación de las series original, desestacionalizada y tendencia-ciclo
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <EmaeTimeSeriesChart 
                data={historicalData || []} 
                loading={loadingHistorical} 
                error={errorHistorical} 
                dateRange={dateRange}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-xs text-indec-gray-dark">
                Fuente: Instituto Nacional de Estadística y Censos (INDEC)
              </div>
              <div className="text-xs text-indec-gray-dark">
                Base 2004 = 100
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="by-activity" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>EMAE por actividad económica</CardTitle>
                  <CardDescription>
                    Evolución de los distintos sectores económicos
                  </CardDescription>
                </div>
                
                <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                  <SelectTrigger className="w-[250px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Seleccionar sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityOptions.map(option => (
                      <SelectItem key={option.code} value={option.code}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              <EmaeActivityChart 
                activity={selectedActivity} 
                dateRange={dateRange}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-xs text-indec-gray-dark">
                Fuente: Instituto Nacional de Estadística y Censos (INDEC)
              </div>
              <div className="text-xs text-indec-gray-dark">
                Base 2004 = 100
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metodología */}
      <Card>
        <CardHeader>
          <CardTitle>Metodología</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-indec-gray-dark">
            El Estimador Mensual de Actividad Económica (EMAE) refleja la evolución mensual de la actividad económica del conjunto de los sectores productivos a nivel nacional. Este indicador permite anticipar las tasas de variación del Producto Interno Bruto (PIB) trimestral.
          </p>
          <p className="text-indec-gray-dark mt-4">
            El EMAE se elabora mediante la agregación de las estimaciones sectoriales realizadas a partir de indicadores de evolución representativos de cada sector de actividad económica. La metodología de construcción del EMAE es similar a la utilizada para el cálculo trimestral del PIB por el lado de la oferta.
          </p>
          <p className="text-indec-gray-dark mt-4">
            Los datos del EMAE se presentan en forma de índice, con base 2004=100, y se encuentran disponibles tanto en serie original como desestacionalizada y tendencia-ciclo. La desestacionalización de los datos se realiza utilizando el método X-13 ARIMA-SEATS desarrollado por el Buró de Censos de los Estados Unidos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}