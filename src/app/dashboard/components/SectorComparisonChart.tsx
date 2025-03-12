// src/app/dashboard/components/SectorComparisonChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Download, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ReferenceLine } from 'recharts';

// Definimos la interfaz para los datos de los sectores
interface SectorData {
  sector_name: string;
  sector_code: string;
  year_over_year_change: number;
  date: string; // Fecha del dato
}

// La interfaz para los datos combinados del gráfico
interface TimeSeriesDataPoint {
  date: string;
  [key: string]: string | number | null; // Para permitir agregar dinámicamente los sectores
}

// Propiedades del componente
interface SectorComparisonChartProps {
  allSectors: {
    code: string;
    name: string;
  }[];
  loading: boolean;
  startDate?: string;
  endDate?: string;
  onFetch?: (sectorCodes: string[]) => Promise<any>;
}

// Colores para los sectores en el gráfico
const SECTOR_COLORS = [
  '#005288', // Azul INDEC
  '#FF9F1C', // Naranja
  '#10893E', // Verde
  '#9B4DCA', // Púrpura
  '#D10A10', // Rojo
];

export default function SectorComparisonChart({ 
  allSectors, 
  loading, 
  startDate,
  endDate,
  onFetch
}: SectorComparisonChartProps) {
  const [selectedSectors, setSelectedSectors] = useState<{code: string, name: string}[]>([]);
  const [availableSectors, setAvailableSectors] = useState<{code: string, name: string}[]>([]);
  const [chartData, setChartData] = useState<TimeSeriesDataPoint[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [currentSelection, setCurrentSelection] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Inicializar sectores disponibles
  useEffect(() => {
    if (allSectors && allSectors.length > 0) {
      setAvailableSectors(allSectors);
    }
  }, [allSectors]);

  // Actualizar sectores disponibles cuando cambian las selecciones
  useEffect(() => {
    if (allSectors) {
      const selected = new Set(selectedSectors.map(s => s.code));
      setAvailableSectors(allSectors.filter(sector => !selected.has(sector.code)));
    }
  }, [selectedSectors, allSectors]);

  // Función para agregar un sector seleccionado
  const addSector = () => {
    if (!currentSelection || selectedSectors.length >= 5) return;
    
    const sector = allSectors.find(s => s.code === currentSelection);
    if (sector) {
      setSelectedSectors(prev => [...prev, sector]);
      setCurrentSelection('');
    }
  };

  // Función para eliminar un sector seleccionado
  const removeSector = (code: string) => {
    setSelectedSectors(prev => prev.filter(s => s.code !== code));
  };

  // Función para cargar datos históricos de sectores
  const fetchSectorData = async () => {
    if (selectedSectors.length === 0) {
      setChartData([]);
      return;
    }

    setLoadingData(true);
    setError(null);

    try {
      if (onFetch) {
        // Usar la función proporcionada por el padre si está disponible
        const sectorCodes = selectedSectors.map(s => s.code);
        const data = await onFetch(sectorCodes);
        processChartData(data);
      } else {
        // Implementación por defecto para obtener datos de sectores
        // Esta es una simulación, en un entorno real deberías hacer una petición a la API
        const mockData = generateMockData();
        processChartData(mockData);
      }
    } catch (err) {
      console.error('Error fetching sector comparison data:', err);
      setError('No se pudieron cargar los datos de comparación de sectores.');
    } finally {
      setLoadingData(false);
    }
  };

  // Función para procesar los datos para el gráfico
  const processChartData = (data: any[]) => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }

    // Organizar datos por fecha
    const dataByDate: {[key: string]: {[key: string]: number}} = {};
    
    // Para cada sector, almacenar sus datos por fecha
    data.forEach(item => {
      if (!dataByDate[item.date]) {
        dataByDate[item.date] = {};
      }
      dataByDate[item.date][item.sector_code] = item.year_over_year_change;
    });

    // Convertir a formato adecuado para el gráfico
    const formattedData = Object.keys(dataByDate)
      .sort() // Ordenar por fecha
      .map(date => {
        const point: TimeSeriesDataPoint = { date };
        selectedSectors.forEach(sector => {
          point[sector.code] = dataByDate[date][sector.code] || null; 
        });
        return point;
      });

    setChartData(formattedData);
  };

  // Generar datos de ejemplo (solo para desarrollo)
  const generateMockData = () => {
    // Generar fechas para los últimos 24 meses
    const dates: string[] = []; 
    const today = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      dates.unshift(date.toISOString().slice(0, 10)); // Formato YYYY-MM-DD
    }

    // Generar datos para cada sector seleccionado
    const mockData: any[] = [];
    
    selectedSectors.forEach(sector => {
      let baseValue = Math.random() * 10 - 5; // Valor base entre -5 y 5
      
      dates.forEach((date: string) => {       
        // Añadir un poco de variación aleatoria
        const variation = Math.random() * 2 - 1; // Entre -1 y 1
        baseValue += variation;
        // Limitar dentro de un rango razonable
        const value = Math.max(-15, Math.min(15, baseValue));
        
        mockData.push({
          date,
          sector_code: sector.code,
          sector_name: sector.name,
          year_over_year_change: parseFloat(value.toFixed(1))
        });
      });
    });
    
    return mockData;
  };

  // Cargar datos cuando cambian los sectores seleccionados
  useEffect(() => {
    fetchSectorData();
  }, [selectedSectors]);

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium mb-2">{formatDate(label)}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
              <span>{getSectorName(item.dataKey)}:</span>
              <span className={`font-mono font-medium ${
                item.value >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {`${item.value >= 0 ? '+' : ''}${item.value?.toFixed(1) || 'N/D'}%`}
              </span>
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };

  // Función para formatear la fecha en un formato más legible
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const monthNames = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear().toString().slice(2); // Solo los últimos 2 dígitos del año
    
    return `${month} ${year}`;
  };

  // Obtener el nombre de un sector a partir de su código
  const getSectorName = (code: string) => {
    const sector = allSectors.find(s => s.code === code);
    return sector ? sector.name : code;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <CardTitle>Comparativa de Sectores</CardTitle>
            <CardDescription>
              Evolución de la variación interanual por sectores económicos
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  disabled={chartData.length === 0}
                  className="text-indec-blue"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportar datos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            {selectedSectors.map((sector, index) => (
              <Badge 
                key={sector.code}
                className="flex items-center gap-1 px-3 py-1.5"
                style={{backgroundColor: SECTOR_COLORS[index % SECTOR_COLORS.length], color: 'white'}}
              >
                {sector.name}
                <button 
                  onClick={() => removeSector(sector.code)} 
                  className="ml-1 hover:opacity-80 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {selectedSectors.length === 0 && (
              <div className="text-sm text-gray-500 italic">
                Selecciona sectores para visualizar su comparación
              </div>
            )}
          </div>
          
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <div className="text-sm font-medium mb-1.5 flex items-center gap-1">
                Añadir sector 
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Puedes seleccionar hasta 5 sectores para comparar su evolución interanual.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={currentSelection}
                onValueChange={setCurrentSelection}
                disabled={selectedSectors.length >= 5 || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sector..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSectors.map(sector => (
                    <SelectItem key={sector.code} value={sector.code}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={addSector} 
              disabled={!currentSelection || selectedSectors.length >= 5}
              className="bg-indec-blue hover:bg-indec-blue-dark"
            >
              Añadir
            </Button>
          </div>
        </div>
        
        <div className="h-64">
          {loadingData || loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ) : error ? (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-gray-500 text-center">{error}</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-gray-500 text-center">
                {selectedSectors.length === 0 
                  ? "Selecciona al menos un sector para visualizar sus datos" 
                  : "No hay datos disponibles para los sectores seleccionados"}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                  interval="preserveStart"
                />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  domain={[-15, 15]}
                  tick={{ fontSize: 12 }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
                
                {selectedSectors.map((sector, index) => (
                  <Line
                    key={sector.code}
                    type="monotone"
                    dataKey={sector.code}
                    name={sector.name}
                    stroke={SECTOR_COLORS[index % SECTOR_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-right">
          {chartData.length > 0 && "Variación porcentual interanual por sector"}
        </div>
      </CardContent>
    </Card>
  );
}