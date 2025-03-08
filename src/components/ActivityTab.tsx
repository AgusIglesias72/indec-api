"use client"

import React, { useState, useEffect } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import DataMetric from '@/components/DataMetric';
import { useAppData } from '@/lib/DataProvider';

// Tipo para los datos de sectores
interface SectorData {
  sector_name: string;
  sector_code: string;
  year_over_year_change: number;
  original_value: number;
  date: string;
}

export default function ActivitySectorTabContent() {
  // Estados para manejo de datos y filtros
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showAllSectors, setShowAllSectors] = useState(false);
  
  const { emaeData, loadingEmae } = useAppData();

  // Estados para información del último mes disponible
  const [latestDate, setLatestDate] = useState<string | null>(null);
  const [latestMonth, setLatestMonth] = useState<number | null>(null);
  const [latestYear, setLatestYear] = useState<number | null>(null);

  // Cargar datos de sectores del último mes disponible
  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        setLoading(true);
        
        // Primero obtenemos metadatos para saber cuál es el último mes disponible
        const metadataResponse = await fetch('/api/emae/metadata');
        if (!metadataResponse.ok) {
          throw new Error(`Error ${metadataResponse.status}: ${metadataResponse.statusText}`);
        }
        
        const metadataResult = await metadataResponse.json();
        const lastDate = metadataResult.date_range?.last_date + "T00:00:00";
        
        if (lastDate) {
          setLatestDate(lastDate);
          
          // Extraer mes y año del último dato disponible
          const dateObj = new Date(lastDate);
          const month = dateObj.getMonth() + 1; // getMonth() devuelve 0-11
          const year = dateObj.getFullYear();

          setLatestMonth(month);
          setLatestYear(year);
          
          // Ahora obtenemos los datos de sectores específicamente para ese mes/año
          const response = await fetch(`/api/emae/sectors?month=${month}&year=${year}&limit=20`);
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (!result.data || !Array.isArray(result.data)) {
            throw new Error('Formato de respuesta inesperado');
          }
          
          // Transformar datos
          const formattedData: SectorData[] = result.data.map((item: any) => ({
            sector_name: item.economy_sector,
            sector_code: item.economy_sector_code,
            year_over_year_change: item.year_over_year_change || 0,
            original_value: item.original_value || 0,
            date: item.date
          }));
          
          setSectorData(formattedData);
          setError(null);
        } else {
          throw new Error('No se pudo determinar el último mes disponible');
        }
      } catch (err) {
        console.error('Error fetching sector data:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        
        // Datos simulados en caso de error
        const mockData: SectorData[] = [
          { sector_name: 'Agricultura, ganadería, caza y silvicultura', sector_code: 'A', year_over_year_change: 4.5, original_value: 120.5, date: '2024-02-01' },
          { sector_name: 'Pesca', sector_code: 'B', year_over_year_change: -2.3, original_value: 95.8, date: '2024-02-01' },
          { sector_name: 'Explotación de minas y canteras', sector_code: 'C', year_over_year_change: 6.2, original_value: 130.2, date: '2024-02-01' },
          { sector_name: 'Industria manufacturera', sector_code: 'D', year_over_year_change: -1.5, original_value: 115.3, date: '2024-02-01' },
          { sector_name: 'Electricidad, gas y agua', sector_code: 'E', year_over_year_change: 3.8, original_value: 125.9, date: '2024-02-01' },
          { sector_name: 'Construcción', sector_code: 'F', year_over_year_change: -4.7, original_value: 90.4, date: '2024-02-01' },
          { sector_name: 'Comercio', sector_code: 'G', year_over_year_change: 2.5, original_value: 118.7, date: '2024-02-01' },
        ];
        
        setSectorData(mockData);
        
        // En caso de error, establecer una fecha por defecto
        if (!latestDate) {
          setLatestDate('2024-02-01');
          setLatestMonth(2);
          setLatestYear(2024);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSectorData();
  }, []);

  // Preparar datos para mostrar
  const displayData = React.useMemo(() => {
    if (!sectorData || sectorData.length === 0) return [];
    
    // Ordenar sectores por variación interanual (de mayor a menor)
    const sortedData = [...sectorData].sort((a, b) => b.year_over_year_change - a.year_over_year_change);
    
    // Mostrar todos los sectores o solo los primeros 6
    return showAllSectors ? sortedData : sortedData.slice(0, 6);
  }, [sectorData, showAllSectors]);

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
            EMAE por Sectores
            <br />
            <span className="text-indec-gray-dark text-base font-normal">
              Actividad Económica por Sectores
            </span>
          </h3>
          
          <p className="text-indec-gray-dark mb-6 text-center lg:text-left">
            <span className="font-medium">Último dato disponible:</span> {latestDate ? formatDate(latestDate) : ((!loadingEmae && emaeData) ? formatDate(emaeData.date) : 'Cargando...')}
          </p>
          
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
                <div className="text-xl font-bold text-indec-green font-mono">
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
                <div className="text-xl font-bold text-indec-red font-mono">
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
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Variación interanual por sector</CardTitle>
                <CardDescription>
                  Comparativa del desempeño sectorial de {latestMonth && latestYear ? (
                    <>
                      <span className="font-medium">{formatDate(latestDate || '')}</span> respecto al mismo mes del año anterior
                    </>
                  ) : (
                    'los últimos datos disponibles'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Eliminados los controles de filtrado */}

            {loading ? (
              <Skeleton className="h-96 w-full" />
            ) : error ? (
              <div className="flex justify-center items-center h-96 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-gray-500">No se pudieron cargar los datos. Por favor, intenta nuevamente.</p>
              </div>
            ) : (
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
            )}
            
            {/* Botón "Ver más" */}
            {sectorData.length > 6 && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllSectors(!showAllSectors)}
                  className="flex items-center gap-2"
                >
                  {showAllSectors ? 'Ver menos' : 'Ver más'} 
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAllSectors ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-500 text-right">
              Fuente: Instituto Nacional de Estadística y Censos (INDEC)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}