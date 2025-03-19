// src/components/EMAEEnhancedChart.tsx
"use client"

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

// Interfaces
interface EMAEEnhancedChartProps {
  title?: string;
  description?: string;
  height?: number;
  className?: string;
}

interface TimeRange {
  id: string;
  label: string;
  years: number;
}

interface ViewType {
  id: string;
  label: string;
}

interface SectorOption {
  code: string;
  name: string;
  color: string;
  gradient: {
    id: string;
    colors: { offset: string; color: string; opacity: string }[];
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  viewType: string;
}

// Componente principal
export default function EMAEEnhancedChart({
  title = "Evolución del EMAE",
  description = "Selecciona el rango de tiempo y tipo de visualización",
  height = 400,
  className = ""
}: EMAEEnhancedChartProps) {
  // Estados
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<string>("1");
  const [viewType, setViewType] = useState<string>("index");
  const [selectedSector, setSelectedSector] = useState<string>("GENERAL");

  // Rangos de tiempo disponibles
  const timeRanges: TimeRange[] = [
    { id: "1", label: "1 año", years: 1 },
    { id: "3", label: "3 años", years: 3 },
    { id: "6", label: "6 años", years: 6 }
  ];

  // Tipos de visualización disponibles
  const viewTypes: ViewType[] = [
    { id: "index", label: "Índice" },
    { id: "monthly", label: "Var. Mensual" },
    { id: "yearly", label: "Var. Interanual" }
  ];

  // Opciones de sectores con colores y gradientes
  const sectorOptions: SectorOption[] = [
    {
      code: "GENERAL",
      name: "Nivel General",
      color: "#3b82f6",
      gradient: {
        id: "generalGradient",
        colors: [
          { offset: "0%", color: "#3b82f6", opacity: "0.7" },
          { offset: "95%", color: "#3b82f6", opacity: "0.05" }
        ]
      }
    },
    {
      code: "A",
      name: "Agricultura y ganadería",
      color: "#10b981",
      gradient: {
        id: "agriculturaGradient",
        colors: [
          { offset: "0%", color: "#10b981", opacity: "0.7" },
          { offset: "95%", color: "#10b981", opacity: "0.05" }
        ]
      }
    },
    {
      code: "B",
      name: "Pesca",
      color: "#06b6d4",
      gradient: {
        id: "pescaGradient",
        colors: [
          { offset: "0%", color: "#06b6d4", opacity: "0.7" },
          { offset: "95%", color: "#06b6d4", opacity: "0.05" }
        ]
      }
    },
    {
      code: "C",
      name: "Minería",
      color: "#f97316",
      gradient: {
        id: "mineriaGradient",
        colors: [
          { offset: "0%", color: "#f97316", opacity: "0.7" },
          { offset: "95%", color: "#f97316", opacity: "0.05" }
        ]
      }
    },
    {
      code: "D",
      name: "Industria manufacturera",
      color: "#8b5cf6",
      gradient: {
        id: "industriaGradient",
        colors: [
          { offset: "0%", color: "#8b5cf6", opacity: "0.7" },
          { offset: "95%", color: "#8b5cf6", opacity: "0.05" }
        ]
      }
    },
    {
      code: "E",
      name: "Electricidad, gas y agua",
      color: "#ec4899",
      gradient: {
        id: "energiaGradient",
        colors: [
          { offset: "0%", color: "#ec4899", opacity: "0.7" },
          { offset: "95%", color: "#ec4899", opacity: "0.05" }
        ]
      }
    },
    {
      code: "F",
      name: "Construcción",
      color: "#ef4444",
      gradient: {
        id: "construccionGradient",
        colors: [
          { offset: "0%", color: "#ef4444", opacity: "0.7" },
          { offset: "95%", color: "#ef4444", opacity: "0.05" }
        ]
      }
    },
    {
      code: "G",
      name: "Comercio",
      color: "#64748b",
      gradient: {
        id: "comercioGradient",
        colors: [
          { offset: "0%", color: "#64748b", opacity: "0.7" },
          { offset: "95%", color: "#64748b", opacity: "0.05" }
        ]
      }
    }
  ];

  // Cargar datos según filtros seleccionados
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      setLoading(true);
      
      // Calcular fecha de inicio según el rango seleccionado en años
      const years = parseInt(timeRange);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - years);
      const startDateStr = startDate.toISOString().split('T')[0];
      
      // Determinar si necesitamos datos generales o por sector
      let url = '';
      
      if (selectedSector === 'GENERAL') {
        // Para el nivel general, usar la API principal
        url = `/api/emae?start_date=${startDateStr}&end_date=${endDate}&include_variations=true`;
      } else {
        // Para un sector específico, usar la API de sectores
        url = `/api/emae/sectors?start_date=${startDateStr}&end_date=${endDate}&include_variations=true&sector_code=${selectedSector}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        // Procesar datos para el gráfico
        const chartData = result.data.map((item: any) => {
          // Extraer valores relevantes
          const indexValue = selectedSector === 'GENERAL' ? 
            item.original_value : 
            item.original_value || item.economy_sector_value;
            
          const monthlyChange = item.monthly_pct_change || 0;
          const yearlyChange = item.yearly_pct_change || item.year_over_year_change || 0;
          
          // Extraer el mes y año de la fecha
          const date = new Date(item.date);
          const monthNames = [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
          ];
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear();
          
          return {
            date: item.date,
            formattedDate: `${date.getDate()} ${month} ${year.toString().substring(2)}`,
            indexValue: indexValue,
            monthlyChange: monthlyChange,
            yearlyChange: yearlyChange,
            sector: selectedSector
          };
        });
        
        // Ordenar por fecha ascendente
        chartData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setData(chartData);
        setError(null);
      } else {
        setError('No se encontraron datos para los criterios seleccionados');
      }
    } catch (err) {
      console.error('Error al cargar datos del EMAE:', err);
      setError('Error al cargar datos del EMAE');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, [timeRange, selectedSector, viewType]);

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload, label, viewType }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      
      // Determinar qué valor mostrar según el tipo de visualización
      let value, valueLabel;
      
      if (viewType === 'index') {
        value = item.indexValue;
        valueLabel = 'Valor del índice';
      } else if (viewType === 'monthly') {
        value = item.monthlyChange;
        valueLabel = 'Variación mensual';
      } else {
        value = item.yearlyChange;
        valueLabel = 'Variación interanual';
      }
      
      // Formatear el valor según su tipo
      const formattedValue = viewType === 'index' ? 
        value.toFixed(1) : 
        `${value.toFixed(1)}%`;
      
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium mb-2">{item.formattedDate}</p>
          <div className="flex items-center gap-2 my-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: sectorOptions.find(s => s.code === selectedSector)?.color || '#3b82f6'
              }}
            />
            <span className="text-sm text-gray-700">{valueLabel}:</span>
            <span className="text-sm font-medium">{formattedValue}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Formatear fechas para el eje X
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    
    // Nombres de meses abreviados en español
    const monthNames = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    
    // Formato: "19 Mar"
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  // Obtener el color del sector seleccionado
  const getSelectedSectorColor = () => {
    return sectorOptions.find(s => s.code === selectedSector)?.color || '#3b82f6';
  };

  // Obtener el ID del gradiente para el sector seleccionado
  const getSelectedSectorGradientId = () => {
    return sectorOptions.find(s => s.code === selectedSector)?.gradient.id || 'generalGradient';
  };

  // Obtener el dataKey según el tipo de visualización
  const getDataKey = () => {
    switch (viewType) {
      case 'monthly':
        return 'monthlyChange';
      case 'yearly':
        return 'yearlyChange';
      default:
        return 'indexValue';
    }
  };

  // Obtener el nombre para mostrar en la leyenda
  const getChartName = () => {
    const sectorName = sectorOptions.find(s => s.code === selectedSector)?.name || 'Nivel General';
    
    switch (viewType) {
      case 'monthly':
        return `${sectorName} - Var. Mensual`;
      case 'yearly':
        return `${sectorName} - Var. Interanual`;
      default:
        return `${sectorName} - Índice`;
    }
  };

  // Determinar el formato para el eje Y
  const getYAxisFormat = () => {
    return viewType === 'index' ? 
      (value: number) => `${value}` :
      (value: number) => `${value}%`;
  };

  // Renderizar componente
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Seleccionar sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectorOptions.map(sector => (
                    <SelectItem key={sector.code} value={sector.code}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Tabs value={viewType} onValueChange={setViewType}>
                <TabsList>
                  {viewTypes.map(type => (
                    <TabsTrigger key={type.id} value={type.id} className="text-xs md:text-sm">
                      {type.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList>
                {timeRanges.map(range => (
                  <TabsTrigger key={range.id} value={range.id}>
                    {range.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="w-full h-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="mb-4">{error}</p>
              <Button onClick={fetchData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                {/* Definir gradientes para las áreas */}
                <defs>
                  {sectorOptions.map(sector => (
                    <linearGradient 
                      key={sector.gradient.id} 
                      id={sector.gradient.id} 
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      {sector.gradient.colors.map((color, index) => (
                        <stop 
                          key={index}
                          offset={color.offset} 
                          stopColor={color.color} 
                          stopOpacity={color.opacity}
                        />
                      ))}
                    </linearGradient>
                  ))}
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickMargin={10}
                  stroke="rgba(0,0,0,0.2)"
                  minTickGap={30} // Espacio mínimo entre ticks para evitar saturación
                />
                <YAxis 
                  orientation="right"
                  tickFormatter={getYAxisFormat()}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  domain={viewType === 'index' ? ['auto', 'auto'] : [viewType === 'monthly' ? -5 : 'auto', 'auto']}
                  stroke="rgba(0,0,0,0.2)"
                />
                <Tooltip content={<CustomTooltip viewType={viewType} />} />
                <Legend />
                
                {/* Área para el tipo de visualización seleccionada */}
                <Area 
                  type="monotone" 
                  dataKey={getDataKey()}
                  name={getChartName()}
                  stroke={getSelectedSectorColor()}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${getSelectedSectorGradientId()})`}
                  activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-gray-500">
          Fuente: INDEC
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={fetchData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </CardFooter>
    </Card>
  );
}