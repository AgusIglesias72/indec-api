"use client"

import React, { useState, useEffect } from 'react';
import { Grid, BarChart, Filter, ArrowUpDown, Download, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ReferenceLine, Cell } from 'recharts';
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
  const [sortOrder, setSortOrder] = useState('value'); // 'value' o 'alphabetical'
  const [showCount, setShowCount] = useState('all'); // 'all', '10', '5'
  
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
          console.log(result);
          
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

  // Función para ordenar y filtrar datos basados en filtros seleccionados
  const getSortedData = () => {
    if (!sectorData || sectorData.length === 0) return [];
    
    let sortedData = [...sectorData];
    if (sortOrder === 'value') {
      sortedData.sort((a, b) => b.year_over_year_change - a.year_over_year_change);
    } else {
      sortedData.sort((a, b) => a.sector_name.localeCompare(b.sector_name));
    }

    // Limitar la cantidad de sectores mostrados
    if (showCount === '5') {
      return sortedData.slice(0, 5);
    } else if (showCount === '10') {
      return sortedData.slice(0, 10);
    }
    return sortedData;
  };

  const displayData = getSortedData();

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

  // Tooltip personalizado para el gráfico
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium">{data.sector_name}</p>
          <p className="text-sm flex items-center gap-1">
            <span>Var. interanual:</span>
            <span className={`font-mono font-medium ${data.year_over_year_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {`${data.year_over_year_change >= 0 ? '+' : ''}${data.year_over_year_change.toFixed(1)}%`}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

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
          <div className="flex flex-col items-center mb-4">
            {latestMonth && latestYear && (
              <div className="text-sm text-indec-gray-dark mb-2 bg-indec-blue/10 px-3 py-1 rounded-full">
                Mostrando datos de {formatDate(latestDate || '')}
              </div>
            )}
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="chart" className="flex items-center gap-1">
                <BarChart className="h-4 w-4" />
                <span>Gráfico</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <Grid className="h-4 w-4" />
                <span>Lista</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chart" className="mt-0">
            <Card className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <CardTitle>Variación interanual por sector</CardTitle>
                    <CardDescription>
                      Comparativa del desempeño sectorial de {latestMonth && latestYear ? (
                        <>
                          <span className="font-medium">{formatDate(latestDate || '')}</span> respecto a {formatDate(`${latestYear - 1}-${String(latestMonth).padStart(4, '0')}-01`)}
                        </>
                      ) : (
                        'los últimos datos disponibles'
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                  <div className="flex gap-4 flex-wrap">
                    <div>
                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-36">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="value">Ordenar por valor</SelectItem>
                          <SelectItem value="alphabetical">Ordenar por nombre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select value={showCount} onValueChange={setShowCount}>
                        <SelectTrigger className="w-36">
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Mostrar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los sectores</SelectItem>
                          <SelectItem value="10">Top 10 sectores</SelectItem>
                          <SelectItem value="5">Top 5 sectores</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar datos
                  </Button>
                </div>

                {loading ? (
                  <Skeleton className="h-96 w-full rounded-lg" />
                ) : error ? (
                  <div className="flex justify-center items-center h-96 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-gray-500">No se pudieron cargar los datos. Por favor, intenta nuevamente.</p>
                  </div>
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={displayData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis
                          type="number"
                          domain={['dataMin - 1', 'dataMax + 1']}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis 
                          dataKey="sector_name" 
                          type="category" 
                          tick={{ fontSize: 12 }}
                          width={170}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <ReferenceLine x={0} stroke="#000" />
                        <Bar dataKey="year_over_year_change" name="Variación interanual (%)">
                          {displayData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.year_over_year_change >= 0 ? '#10893E' : '#D10A10'} 
                            />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-gray-500 text-right">
                  Fuente: Instituto Nacional de Estadística y Censos (INDEC)
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Variación interanual por sector</CardTitle>
                <CardDescription>Detalle de indicadores por sector económico</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}