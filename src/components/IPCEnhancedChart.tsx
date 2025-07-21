// src/components/IPCEnhancedChart.tsx
"use client"

import React, { useState, useEffect, useCallback } from 'react';
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
import { RefreshCw, ChevronDown } from "lucide-react";

// Interfaces
interface IPCEnhancedChartProps {
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

interface ComponentOption {
  type: string;
  code: string;
  name: string;
  color: string;
  gradient: {
    id: string;
    colors: { offset: string; color: string; opacity: string }[];
  };
}

interface RegionOption {
  code: string;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  variationType: 'monthly' | 'yearly';
}

// Componente principal
export default function IPCEnhancedChart({
  title = "Evolución del IPC",
  description = "Selecciona el rango de tiempo y tipo de variación para visualizar",
  height = 400,
  className = ""
}: IPCEnhancedChartProps) {
  // Estados
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<string>("1");
  const [variationType, setVariationType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedComponent, setSelectedComponent] = useState<string>("GENERAL");
  const [selectedRegion, setSelectedRegion] = useState<string>("Nacional");

  // Rangos de tiempo disponibles (actualizados a 1, 3, 5 y 10 años)
  const timeRanges: TimeRange[] = [
    { id: "1", label: "1 año", years: 1 },
    { id: "3", label: "3 años", years: 3 },
    { id: "5", label: "5 años", years: 5 },
    { id: "7", label: "7 años", years: 7 }
  ];

  // Componentes del IPC con colores y gradientes
  const componentOptions: ComponentOption[] = [
    // Nivel General
    {
      type: "GENERAL",
      code: "GENERAL",
      name: "Nivel general",
      color: "#3b82f6",
      gradient: {
        id: "generalGradient",
        colors: [
          { offset: "0%", color: "#3b82f6", opacity: "0.7" },
          { offset: "95%", color: "#3b82f6", opacity: "0.05" }
        ]
      }
    },
    // Bienes y Servicios
    {
      type: "BYS",
      code: "BYS_BIENES",
      name: "Bienes",
      color: "#22c55e",
      gradient: {
        id: "bienesGradient",
        colors: [
          { offset: "0%", color: "#22c55e", opacity: "0.7" },
          { offset: "95%", color: "#22c55e", opacity: "0.05" }
        ]
      }
    },
    {
      type: "BYS",
      code: "BYS_SERVICIOS",
      name: "Servicios",
      color: "#f59e0b",
      gradient: {
        id: "serviciosGradient",
        colors: [
          { offset: "0%", color: "#f59e0b", opacity: "0.7" },
          { offset: "95%", color: "#f59e0b", opacity: "0.05" }
        ]
      }
    },
    // Categorías
    {
      type: "CATEGORIA",
      code: "CAT_ESTACIONAL",
      name: "Estacional",
      color: "#a855f7",
      gradient: {
        id: "estacionalGradient",
        colors: [
          { offset: "0%", color: "#a855f7", opacity: "0.7" },
          { offset: "95%", color: "#a855f7", opacity: "0.05" }
        ]
      }
    },
    {
      type: "CATEGORIA",
      code: "CAT_NUCLEO",
      name: "Núcleo",
      color: "#ec4899",
      gradient: {
        id: "nucleoGradient",
        colors: [
          { offset: "0%", color: "#ec4899", opacity: "0.7" },
          { offset: "95%", color: "#ec4899", opacity: "0.05" }
        ]
      }
    },
    {
      type: "CATEGORIA",
      code: "CAT_REGULADOS",
      name: "Regulados",
      color: "#6366f1",
      gradient: {
        id: "reguladosGradient",
        colors: [
          { offset: "0%", color: "#6366f1", opacity: "0.7" },
          { offset: "95%", color: "#6366f1", opacity: "0.05" }
        ]
      }
    },
    // Rubros
    {
      type: "RUBRO",
      code: "RUBRO_ALIMENTOS",
      name: "Alimentos y bebidas no alcohólicas",
      color: "#10b981",
      gradient: {
        id: "alimentosGradient",
        colors: [
          { offset: "0%", color: "#10b981", opacity: "0.7" },
          { offset: "95%", color: "#10b981", opacity: "0.05" }
        ]
      }
    },
    {
      type: "RUBRO",
      code: "RUBRO_BEB_ALC_Y_TAB",
      name: "Bebidas alcohólicas y tabaco",
      color: "#f43f5e",
      gradient: {
        id: "alcoholGradient",
        colors: [
          { offset: "0%", color: "#f43f5e", opacity: "0.7" },
          { offset: "95%", color: "#f43f5e", opacity: "0.05" }
        ]
      }
    },
    {
      type: "RUBRO",
      code: "RUBRO_PRE_DE_VES_Y_CAL",
      name: "Prendas de vestir y calzado",
      color: "#f97316",
      gradient: {
        id: "indumentariaGradient",
        colors: [
          { offset: "0%", color: "#f97316", opacity: "0.7" },
          { offset: "95%", color: "#f97316", opacity: "0.05" }
        ]
      }
    },
    {
      type: "RUBRO",
      code: "RUBRO_VIVIENDA",
      name: "Vivienda, agua, electricidad, gas y otros combustibles",
      color: "#8b5cf6",
      gradient: {
        id: "viviendaGradient",
        colors: [
          { offset: "0%", color: "#8b5cf6", opacity: "0.7" },
          { offset: "95%", color: "#8b5cf6", opacity: "0.05" }
        ]
      }
    },
    {
      type: "RUBRO",
      code: "RUBRO_EQUIPAMIENTO",
      name: "Equipamiento y mantenimiento del hogar",
      color: "#ec4899",
      gradient: {
        id: "equipamientoGradient",
        colors: [
          { offset: "0%", color: "#ec4899", opacity: "0.7" },
          { offset: "95%", color: "#ec4899", opacity: "0.05" }
        ]
      }
    },
    {
      type: "RUBRO",
      code: "RUBRO_SALUD",
      name: "Salud",
      color: "#ef4444",
      gradient: {
        id: "saludGradient",
        colors: [
          { offset: "0%", color: "#ef4444", opacity: "0.7" },
          { offset: "95%", color: "#ef4444", opacity: "0.05" }
        ]
      }
    },
    {
      type: "RUBRO",
      code: "RUBRO_TRANSPORTE",
      name: "Transporte",
      color: "#64748b",
      gradient: {
        id: "transporteGradient",
        colors: [
          { offset: "0%", color: "#64748b", opacity: "0.7" },
          { offset: "95%", color: "#64748b", opacity: "0.05" }
        ]
      }
    },
    {
      type: "RUBRO",
      code: "RUBRO_COMUNICACION",
      name: "Comunicación",
      color: "#06b6d4",
      gradient: {
        id: "comunicacionGradient",
        colors: [
          { offset: "0%", color: "#06b6d4", opacity: "0.7" },
          { offset: "95%", color: "#06b6d4", opacity: "0.05" }
        ]
      }
    },
    {
      type: "RUBRO",
      code: "RUBRO_RECREACION_Y_CULTURA",
      name: "Recreación y cultura",
      color: "#0ea5e9",
      gradient: {
        id: "recreacionGradient",
        colors: [
          { offset: "0%", color: "#0ea5e9", opacity: "0.7" },
          { offset: "95%", color: "#0ea5e9", opacity: "0.05" }
        ]
      }
    },
    {
      type: "RUBRO",
      code: "RUBRO_EDUCACION",
      name: "Educación",
      color: "#0ea5e9",
      gradient: {
        id: "educacionGradient",
        colors: [
          { offset: "0%", color: "#0ea5e9", opacity: "0.7" },
          { offset: "95%", color: "#0ea5e9", opacity: "0.05" }
        ]
      }
    },
    {
      type: "RUBRO",
      code: "RUBRO_RESTAURANTES",
      name: "Restaurantes y hoteles",
      color: "#14b8a6",
      gradient: {
        id: "restaurantesGradient",
        colors: [
          { offset: "0%", color: "#14b8a6", opacity: "0.7" },
          { offset: "95%", color: "#14b8a6", opacity: "0.05" }
        ]
      }
    },
    {
      type: "RUBRO",
      code: "RUBRO_BIE_Y_SER_VAR",
      name: "Bienes y servicios varios",
      color: "#84cc16",
      gradient: {
        id: "bienesServiciosGradient",
        colors: [
          { offset: "0%", color: "#84cc16", opacity: "0.7" },
          { offset: "95%", color: "#84cc16", opacity: "0.05" }
        ]
      }
    }
  ];

  // Opciones de regiones
  const regionOptions: RegionOption[] = [
    { code: "Nacional", name: "Nacional" },
    { code: "GBA", name: "GBA" },
    { code: "Pampeana", name: "Pampeana" },
    { code: "Noreste", name: "Noreste" },
    { code: "Noroeste", name: "Noroeste" },
    { code: "Cuyo", name: "Cuyo" },
    { code: "Patagonia", name: "Patagonia" }
  ];

  // Obtener componentes agrupados por tipo
  const getGroupedComponents = () => {
    const grouped: Record<string, ComponentOption[]> = {};
    
    componentOptions.forEach(comp => {
      if (!grouped[comp.type]) {
        grouped[comp.type] = [];
      }
      grouped[comp.type].push(comp);
    });
    
    return grouped;
  };

  const groupedComponents = getGroupedComponents();

  // Cargar datos según filtros seleccionados
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setLoading(true);
      
      // Calcular fecha de inicio según el rango seleccionado en años
      const years = parseInt(timeRange);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - years);
      const startDateStr = startDate.toISOString().split('T')[0];
      
      // Obtener datos del IPC desde la API
      const url = `/api/ipc?start_date=${startDateStr}&end_date=${endDate}&category=${selectedComponent}&region=${selectedRegion}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        // Procesar datos para el gráfico
        const chartData = result.data.map((item: any) => {
          // Extraer valores relevantes según el tipo de variación
          const monthlyChange = item.monthly_pct_change || 0;
          const yearlyChange = item.yearly_pct_change || 0;
          
          // Extraer el mes y año de la fecha
          const date = new Date(item.date);
          const monthNames = [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
          ];
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear().toString().substring(2); // Solo los últimos 2 dígitos
          
          // Formato de fecha simplificado "Mar 24"
          const formattedDate = `${month} ${year}`;
          
          return {
            date: item.date,
            formattedDate: formattedDate,
            monthlyChange: monthlyChange,
            yearlyChange: yearlyChange,
            component: selectedComponent,
            region: selectedRegion
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
      console.error('Error al cargar datos del IPC:', err);
      setError('Error al cargar datos del IPC');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [timeRange, selectedComponent, selectedRegion]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload, label, variationType }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      
      // Determinar qué valor mostrar según el tipo de variación
      const value = variationType === 'monthly' ? item.monthlyChange : item.yearlyChange;
      const valueLabel = variationType === 'monthly' ? 'Variación mensual' : 'Variación interanual';
      
      // Formatear el valor
      const formattedValue = `${value.toFixed(1)}%`;
      
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium mb-2">{item.formattedDate}</p>
          <div className="flex items-center gap-2 my-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: componentOptions.find(c => c.code === selectedComponent)?.color || '#3b82f6'
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

  // Formatear fechas para el eje X (Nuevo formato: "Mar 24")
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    
    // Nombres de meses abreviados en español
    const monthNames = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear().toString().substring(2); // Últimos 2 dígitos
    
    // Formato simplificado: "Mar 24"
    return `${month} ${year}`;
  };

  // Obtener el color del componente seleccionado
  const getSelectedComponentColor = () => {
    return componentOptions.find(c => c.code === selectedComponent)?.color || '#3b82f6';
  };

  // Obtener el ID del gradiente para el componente seleccionado
  const getSelectedComponentGradientId = () => {
    return componentOptions.find(c => c.code === selectedComponent)?.gradient.id || 'generalGradient';
  };

  // Obtener el nombre del componente seleccionado para mostrar en la leyenda
  const getSelectedComponentName = () => {
    return componentOptions.find(c => c.code === selectedComponent)?.name || 'Nivel general';
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
              <Select value={selectedComponent} onValueChange={setSelectedComponent}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Seleccionar componente" />
                </SelectTrigger>
                <SelectContent className="max-h-96">
                  {/* Agrupar componentes por tipo */}
                  {Object.keys(groupedComponents).map(type => (
                    <div key={type}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                        {type === "GENERAL" ? "General" : 
                         type === "BYS" ? "Bienes y Servicios" : 
                         type === "CATEGORIA" ? "Categorías" : "Rubros"}
                      </div>
                      {groupedComponents[type].map(component => (
                        <SelectItem key={component.code} value={component.code}>
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-2" 
                              style={{ backgroundColor: component.color }}
                            />
                            {component.name}
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Seleccionar región" />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map(region => (
                    <SelectItem key={region.code} value={region.code}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Tabs 
                value={variationType} 
                onValueChange={(value) => setVariationType(value as 'monthly' | 'yearly')}
              >
                <TabsList>
                  <TabsTrigger value="monthly">Mensual</TabsTrigger>
                  <TabsTrigger value="yearly">Interanual</TabsTrigger>
                </TabsList>
              </Tabs>
              
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
                  {componentOptions.map(component => (
                    <linearGradient 
                      key={component.gradient.id} 
                      id={component.gradient.id} 
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      {component.gradient.colors.map((color, index) => (
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
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  domain={variationType === 'monthly' ? [0, 'auto'] : [0, 'auto']}
                  stroke="rgba(0,0,0,0.2)"
                />
                <Tooltip content={<CustomTooltip variationType={variationType} />} />
                <Legend />
                
                {/* Área para el tipo de variación seleccionada */}
                <Area 
                  type="monotone" 
                  dataKey={variationType === 'monthly' ? 'monthlyChange' : 'yearlyChange'}
                  name={`${getSelectedComponentName()} - ${variationType === 'monthly' ? 'Var. Mensual' : 'Var. Interanual'}`}
                  stroke={getSelectedComponentColor()}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${getSelectedComponentGradientId()})`}
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