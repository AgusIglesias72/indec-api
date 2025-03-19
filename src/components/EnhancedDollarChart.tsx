// src/components/EnhancedDollarChart.tsx
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
import { getDollarRatesHistory, DollarRateData } from '@/services/api-dollar';
import { DollarType } from '@/types/dollar';
import { RefreshCw } from "lucide-react";

// Interfaces
interface EnhancedDollarChartProps {
  title?: string;
  description?: string;
  height?: number;
  className?: string;
  darkMode?: boolean;
}

interface TimeRange {
  id: string;
  label: string;
  days: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// Componente principal
export default function EnhancedDollarChart({
  title = "Evolución de Cotizaciones",
  description = "Selecciona el rango de tiempo y los tipos de dólar para visualizar",
  height = 400,
  className = "",
  darkMode = false
}: EnhancedDollarChartProps) {
  // Estados
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<string>("90");
  const [selectedTypes, setSelectedTypes] = useState<DollarType[]>(["BLUE", "OFICIAL"]);

  // Rangos de tiempo disponibles
  const timeRanges: TimeRange[] = [
    { id: "30", label: "1 mes", days: 30 },
    { id: "90", label: "3 meses", days: 90 },
    { id: "180", label: "6 meses", days: 180 },
    { id: "365", label: "1 año", days: 365 }
  ];

  // Tipos de dólar disponibles con colores y gradientes para el área
  const dollarTypes: { 
    type: DollarType, 
    label: string, 
    color: string,
    gradient: {
      id: string,
      colors: { offset: string, color: string, opacity: string }[]
    }
  }[] = [
    { 
      type: "BLUE", 
      label: "Blue", 
      color: "#3b82f6",
      gradient: {
        id: "blueGradient",
        colors: [
          { offset: "0%", color: "#3b82f6", opacity: "0.7" },
          { offset: "95%", color: "#3b82f6", opacity: "0.05" }
        ]
      }
    },
    { 
      type: "OFICIAL", 
      label: "Oficial", 
      color: "#10b981",
      gradient: {
        id: "greenGradient",
        colors: [
          { offset: "0%", color: "#10b981", opacity: "0.7" },
          { offset: "95%", color: "#10b981", opacity: "0.05" }
        ]
      }
    },
    { 
      type: "CCL", 
      label: "Contado con Liqui", 
      color: "#f97316",
      gradient: {
        id: "orangeGradient",
        colors: [
          { offset: "0%", color: "#f97316", opacity: "0.7" },
          { offset: "95%", color: "#f97316", opacity: "0.05" }
        ]
      }
    },
    { 
      type: "MEP", 
      label: "MEP (Bolsa)", 
      color: "#8b5cf6",
      gradient: {
        id: "purpleGradient",
        colors: [
          { offset: "0%", color: "#8b5cf6", opacity: "0.7" },
          { offset: "95%", color: "#8b5cf6", opacity: "0.05" }
        ]
      }
    },
    { 
      type: "MAYORISTA", 
      label: "Mayorista", 
      color: "#64748b",
      gradient: {
        id: "grayGradient",
        colors: [
          { offset: "0%", color: "#64748b", opacity: "0.7" },
          { offset: "95%", color: "#64748b", opacity: "0.05" }
        ]
      }
    },
    { 
      type: "TARJETA", 
      label: "Tarjeta", 
      color: "#f43f5e",
      gradient: {
        id: "redGradient",
        colors: [
          { offset: "0%", color: "#f43f5e", opacity: "0.7" },
          { offset: "95%", color: "#f43f5e", opacity: "0.05" }
        ]
      }
    }
  ];

  // Función para cambiar la selección de un tipo de dólar
  const toggleDollarType = (type: DollarType) => {
    if (selectedTypes.includes(type)) {
      // Evitar deseleccionar todos
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Cargar datos según filtros seleccionados
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      setLoading(true);
      
      // Calcular fecha de inicio según el rango seleccionado
      const days = parseInt(timeRange);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      
      // Obtener datos históricos para los tipos seleccionados
      const historicalData = await getDollarRatesHistory(selectedTypes, startDate, endDate);
      
      if (historicalData && historicalData.length > 0) {
        // Agrupar por fecha para el gráfico
        const groupedByDate = historicalData.reduce((acc, item) => {
          if (!acc[item.date]) {
            acc[item.date] = { date: item.date };
          }
          
          // Solo guardar el precio de venta por simplicidad
          acc[item.date][`${item.dollar_type}_sell`] = item.sell_price;
          
          return acc;
        }, {} as Record<string, any>);
        
        // Convertir a array y ordenar por fecha
        const chartData = Object.values(groupedByDate).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        setData(chartData);
        setError(null);
      } else {
        setError('No se encontraron datos para el período solicitado');
      }
    } catch (err) {
      console.error('Error al cargar datos históricos:', err);
      setError('Error al cargar datos históricos');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, [timeRange, selectedTypes]);

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      // Formatear fecha para el tooltip
      const date = new Date(label || '');
      
      // Nombres de meses para el tooltip
      const monthNames = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
      ];
      
      // Formato más completo para el tooltip
      const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      return (
        <div className={`p-3 border rounded-md shadow-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
          <p className="font-medium mb-2">{formattedDate}</p>
          {payload.map((entry: any, index: number) => {
            // Extraer tipo de dólar del nombre del dataKey
            const dollarType = entry.dataKey.split('_')[0];
            const dollarInfo = dollarTypes.find(d => d.type === dollarType);
            const displayName = dollarInfo?.label || dollarType;
            
            return (
              <div key={index} className="flex items-center gap-2 my-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: dollarInfo?.color || '#000000' }}
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{displayName}:</span>
                <span className="text-sm font-medium">${entry.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            );
          })}
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

  // Renderizar componente
  return (
    <Card className={`${className} ${darkMode ? 'bg-gray-900 text-white border-gray-800' : ''}`}>
      <CardHeader className={darkMode ? 'border-gray-800' : ''}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className={darkMode ? 'text-white' : ''}>{title}</CardTitle>
            <CardDescription className={darkMode ? 'text-gray-400' : ''}>{description}</CardDescription>
          </div>
          <Tabs 
            value={timeRange} 
            onValueChange={setTimeRange}
            className="w-full md:w-auto"
          >
            <TabsList className={darkMode ? 'bg-gray-800' : ''}>
              {timeRanges.map(range => (
                <TabsTrigger 
                  key={range.id} 
                  value={range.id}
                  className={`text-xs md:text-sm ${darkMode ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-white' : ''}`}
                >
                  {range.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {dollarTypes.map(dollarType => (
            <Button
              key={dollarType.type}
              variant={selectedTypes.includes(dollarType.type) ? "default" : "outline"}
              onClick={() => toggleDollarType(dollarType.type)}
              className="text-xs md:text-sm py-1 h-8"
              style={{
                backgroundColor: selectedTypes.includes(dollarType.type) ? dollarType.color : 'transparent',
                borderColor: dollarType.color,
                color: selectedTypes.includes(dollarType.type) ? 'white' : dollarType.color
              }}
            >
              {dollarType.label}
            </Button>
          ))}
        </div>
        
        <div style={{ width: '100%', height }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className={`w-full h-full ${darkMode ? 'bg-gray-800' : ''}`} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-indec-gray-dark">
              <p className="mb-4">{error}</p>
              <Button 
                onClick={fetchData} 
                variant="outline" 
                size="sm" 
                className={darkMode ? 'border-gray-700 hover:bg-gray-800' : ''}
              >
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
                  {dollarTypes.map(dollarType => (
                    <linearGradient 
                      key={dollarType.gradient.id} 
                      id={dollarType.gradient.id} 
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      {dollarType.gradient.colors.map((color, index) => (
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
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false}
                  stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
                />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis} 
                  tick={{ fontSize: 12, fill: darkMode ? '#cbd5e1' : '#64748b' }}
                  tickMargin={10}
                  stroke={darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                />
                <YAxis 
                  orientation="right"
                  tickFormatter={(value) => `$${value.toFixed(0)}`} 
                  tick={{ fontSize: 12, fill: darkMode ? '#cbd5e1' : '#64748b' }}
                  domain={['auto', 'auto']}
                  stroke={darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value, entry, index) => (
                    <span style={{ color: darkMode ? '#cbd5e1' : '#64748b' }}>{value}</span>
                  )}
                />
                
                {/* Renderizar áreas para cada tipo de dólar seleccionado */}
                {selectedTypes.map(type => {
                  const dollarInfo = dollarTypes.find(d => d.type === type);
                  return (
                    <Area 
                      key={type}
                      type="monotone" 
                      dataKey={`${type}_sell`}
                      name={dollarInfo?.label || type}
                      stroke={dollarInfo?.color}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#${dollarInfo?.gradient.id})`}
                      activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
      <CardFooter className={`flex justify-between ${darkMode ? 'text-gray-400' : ''}`}>
        <div className="text-xs">
          Fuente: Argentina Datos API
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 ${darkMode ? 'text-gray-300 hover:bg-gray-800' : ''}`}
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