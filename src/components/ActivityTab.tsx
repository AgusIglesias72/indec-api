"use client"


import React from 'react';
import { Grid, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SectorActivityList from '@/components/charts/SectorActivityList';
import SectorActivityChart from '@/components/charts/SectorActivityChart';
import { useSectorData } from '@/hooks/useSectorData';
import DataMetric from '@/components/DataMetric';
import { useAppData } from '@/lib/DataProvider';

export default function ActivitySectorTabContent() {
  const { data: sectorData, loading, error } = useSectorData();
  const { emaeData, loadingEmae } = useAppData();

  // Calcular métricas agregadas
  const aggregateMetrics = React.useMemo(() => {
    if (!sectorData || sectorData.length === 0) return null;

    // Contar sectores en crecimiento y contracción
    const growingSectors = sectorData.filter(sector => sector.year_over_year_change > 0).length;
    const shrinkingSectors = sectorData.filter(sector => sector.year_over_year_change < 0).length;

    // Encontrar el sector con mayor crecimiento y mayor contracción
    const maxGrowthSector = [...sectorData].sort((a, b) => 
      b.year_over_year_change - a.year_over_year_change
    )[0];
    
    const maxShrinkSector = [...sectorData].sort((a, b) => 
      a.year_over_year_change - b.year_over_year_change
    )[0];

    return {
      growingSectors,
      shrinkingSectors,
      maxGrowthSector,
      maxShrinkSector
    };
  }, [sectorData]);

  // Formatear fecha
  const formatDate = (dateString: string) => { 
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const monthNames = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-indec-blue-dark mb-4 text-center lg:text-left">
            Actividad Económica por Sectores
          </h3>
          
          {!loadingEmae && emaeData && (
            <p className="text-indec-gray-dark mb-6 text-center lg:text-left">
              <span className="font-medium">Último dato disponible:</span> {formatDate(emaeData.date)}
            </p>
          )}
          
          <p className="text-indec-gray-dark mb-6 text-center lg:text-left">
            Análisis detallado del desempeño de los distintos sectores económicos, permitiendo identificar 
            fortalezas y debilidades en la economía argentina. Las variaciones interanuales muestran el 
            crecimiento o contracción respecto al mismo mes del año anterior.
          </p>
        </div>
        
        {/* Métricas agregadas */}
        {aggregateMetrics && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-indec-gray-medium/30 shadow-sm">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                  Sectores en crecimiento
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-indec-gray-dark/70" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>Número de sectores con variación interanual positiva.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl font-bold text-indec-green">
                  {aggregateMetrics.growingSectors} de {sectorData.length}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-indec-gray-medium/30 shadow-sm">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                  Sectores en contracción
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-indec-gray-dark/70" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>Número de sectores con variación interanual negativa.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl font-bold text-indec-red">
                  {aggregateMetrics.shrinkingSectors} de {sectorData.length}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-indec-gray-medium/30 shadow-sm">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                  Mayor crecimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-sm font-medium text-indec-blue-dark mb-1 truncate" title={aggregateMetrics.maxGrowthSector.sector_name}>
                  {aggregateMetrics.maxGrowthSector.sector_name}
                </div>
                <DataMetric 
                  label="" 
                  value={`+${aggregateMetrics.maxGrowthSector.year_over_year_change.toFixed(1)}%`} 
                  trend="up" 
                  className="text-indec-green text-lg" 
                />
              </CardContent>
            </Card>
            
            <Card className="border border-indec-gray-medium/30 shadow-sm">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                  Mayor contracción
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-sm font-medium text-indec-blue-dark mb-1 truncate" title={aggregateMetrics.maxShrinkSector.sector_name}>
                  {aggregateMetrics.maxShrinkSector.sector_name}
                </div>
                <DataMetric 
                  label="" 
                  value={`${aggregateMetrics.maxShrinkSector.year_over_year_change.toFixed(1)}%`} 
                  trend="down" 
                  className="text-indec-red text-lg" 
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      <div className="lg:col-span-3">
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-4">
            <TabsTrigger value="chart" className="flex items-center gap-1">
              <Grid className="h-4 w-4" />
              <span>Gráfico</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <Grid className="h-4 w-4" />
              <span>Lista</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="mt-0">
            <SectorActivityChart data={sectorData} loading={loading} error={error} />
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Variación interanual por sector</CardTitle>
                <CardDescription>Comparativa del desempeño sectorial</CardDescription>
              </CardHeader>
              <CardContent>
                <SectorActivityList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}