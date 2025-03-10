"use client"

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import DataMetric from '@/components/DataMetric';
import { useAppData } from '@/lib/DataProvider';

export default function ActivitySectorTabContent() {
  // Estado para controlar si mostrar todos los sectores o solo los primeros
  const [showAllSectors, setShowAllSectors] = useState(false);
  
  // Obtener datos del contexto global
  const { 
    sectorData, 
    loadingSectors, 
    errorSectors, 
    latestSectorDate,
    emaeData
  } = useAppData();

  // Número inicial de sectores a mostrar
  const initialSectorsCount = 6;

  // Función para obtener los sectores a mostrar
  const getDisplayData = () => {
    if (!sectorData || sectorData.length === 0) return [];
    
    // Ordenar los sectores por variación interanual (descendente)
    const sortedData = [...sectorData].sort((a, b) => 
      b.year_over_year_change - a.year_over_year_change
    );
    
    // Mostrar todos o solo los primeros según el estado
    return showAllSectors ? sortedData : sortedData.slice(0, initialSectorsCount);
  };

  const displayData = getDisplayData();
  const totalSectors = sectorData?.length || 0;

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
  const formatDate = (dateString: string | null) => { 
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const monthNames = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Extraer mes y año de la fecha para formatear fechas comparativas
  const getMonthYearFromDate = (dateString: string | null) => {
    if (!dateString) return { month: null, year: null };
    
    const date = new Date(dateString);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  };

  const { month: latestMonth, year: latestYear } = getMonthYearFromDate(latestSectorDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-indec-blue-dark mb-4 text-center lg:text-left">
            EMAE por Sectores
            <br />
            <span className="text-indec-gray-dark text-base font-normal">
              Actividad Económica por Sectores
            </span>
          </h3>
          
          <p className="text-indec-gray-dark mb-6 text-center lg:text-left">
            <span className="font-medium">Último dato disponible:</span> {formatDate(latestSectorDate) || (emaeData ? formatDate(emaeData.date) : 'Cargando...')}
          </p>
          
          <p className="text-indec-gray-dark mb-6 text-center lg:text-left">
            Análisis detallado del desempeño de los distintos sectores económicos, permitiendo identificar 
            fortalezas y debilidades en la economía argentina. Las variaciones interanuales muestran el 
            crecimiento o contracción respecto al mismo mes del año anterior.
          </p>
        </div>
        
        {/* Métricas agregadas */}
        {loadingSectors ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : aggregateMetrics ? (
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
                  {aggregateMetrics.growingSectors} de {sectorData?.length || 0}
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
                  {aggregateMetrics.shrinkingSectors} de {sectorData?.length || 0}
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
        ) : null}
      </div>
      
      <div className="lg:col-span-3 table-container">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <CardTitle>Variación interanual por sector</CardTitle>
                <CardDescription>
                  Comparativa del desempeño sectorial de {latestMonth && latestYear ? (
                    <>
                      <span className="font-medium">{formatDate(latestSectorDate)}</span> respecto a {formatDate(`${latestYear - 1}-${String(latestMonth).padStart(2, '0')}-01T00:00:00`)}
                    </>
                  ) : (
                    'los últimos datos disponibles'
                  )}
                </CardDescription>
              </div>
              
              {/* Etiqueta del período si está disponible */}
              {latestMonth && latestYear && (
                <div className="text-sm text-indec-gray-dark bg-indec-blue/10 px-3 py-1 rounded-full">
                  {formatDate(latestSectorDate)}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingSectors ? (
              <Skeleton className="h-96 w-full" />
            ) : errorSectors ? (
              <div className="flex justify-center items-center h-60 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-gray-500">No se pudieron cargar los datos. Por favor, intenta nuevamente.</p>
              </div>
            ) : (
              <>
                {/* Tabla de sectores */}
                <div className="divide-y divide-gray-200">
                  <div className="grid grid-cols-12 py-2 font-medium text-sm text-indec-gray-dark">
                    <div className="col-span-6">Sector</div>
                    <div className="col-span-3 text-right">Índice</div>
                    <div className="col-span-3 text-right">Var. i/a</div>
                  </div>
                  
                  {displayData.map((sector, index) => (
                    <div key={index} className="grid grid-cols-12 py-3 text-sm">
                      <div className="col-span-6">{sector.sector_name}</div>
                      <div className="col-span-3 text-right font-mono">
                        {sector.original_value.toFixed(1)}
                      </div>
                      <div className={`col-span-3 text-right font-mono font-medium ${
                        sector.year_over_year_change >= 0 ? 'text-indec-green' : 'text-indec-red'
                      }`}>
                        {`${sector.year_over_year_change >= 0 ? '+' : ''}${sector.year_over_year_change.toFixed(1)}%`}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Botón Ver más/menos */}
                {totalSectors > initialSectorsCount && (
                  <div className="mt-4 flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAllSectors(!showAllSectors)
                        if (showAllSectors) {
                          // Scroll to the top of the table
                          const table = document.querySelector('#indicators');
                          if (table) {
                            table.scrollIntoView({ behavior: 'smooth' });
                          }
                        }
                      }}

                      className="flex items-center gap-1 text-indec-blue"
                    >
                      {showAllSectors ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Ver todos los sectores ({totalSectors - initialSectorsCount} más)
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-gray-500 text-right">
                  Fuente: Instituto Nacional de Estadística y Censos (INDEC)
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}