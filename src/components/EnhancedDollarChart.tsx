// src/components/EnhancedDollarChart.tsx
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
import { getDollarRatesHistory } from '@/services/api-dollar';
import { DollarRateData } from '@/types/dollar';
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
  const fetchData = useCallback(async () => {
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
          // Usar solo la fecha sin hora para agrupar cierres diarios
          const dateOnly = item.date.split('T')[0];

          if (!acc[dateOnly]) {
            acc[dateOnly] = { date: dateOnly };
          }

          // Usar solo el precio de venta
          acc[dateOnly][item.dollar_type] = item.sell_price;

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
  }, [timeRange, selectedTypes]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
            // El dataKey ahora es directamente el tipo de dólar
            const dollarType = entry.dataKey;
            const dollarInfo = dollarTypes.find(d => d.type === dollarType);
            const displayName = dollarInfo?.label || dollarType;

            return (
              <div key={index} className="flex items-center gap-2 my-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: dollarInfo?.color || '#000000' }}
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {displayName}:
                </span>
                <span className="font-medium">
                  ${entry.value?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
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
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };
  const allValues = data.flatMap(item => [
    item.BLUE,
    item.OFICIAL,
    item.CCL,
    item.MEP,
    item.MAYORISTA,
    item.TARJETA
  ])
  .map(val => parseFloat(val))
  .filter(val => !isNaN(val));
  
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0;
  
  // Round down to nearest 100
  const yAxisMin = Math.floor(minValue * 0.6 / 100) * 100;
  // Round up to nearest 100
  const yAxisMax = Math.ceil(maxValue * 1.1 / 100) * 100;


  // Formatear valores del eje Y
  const formatYAxis = (value: number) => {
    return `$ ${value.toLocaleString('es-AR')}`;
  };

  return (
    <Card className={`${className} ${darkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={darkMode ? 'text-white' : ''}>{title}</CardTitle>
            <CardDescription className={darkMode ? 'text-gray-400' : ''}>{description}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isRefreshing}
            className={darkMode ? 'border-gray-700 hover:bg-gray-800' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Selector de rango de tiempo */}
        <div className="flex justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap gap-2 justify-around">
            {dollarTypes.map((dollarType) => (
              <Button
                key={dollarType.type}
                variant={selectedTypes.includes(dollarType.type) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDollarType(dollarType.type)}
                className={`transition-all ${selectedTypes.includes(dollarType.type)
                    ? ''
                    : darkMode ? 'border-gray-700 hover:bg-gray-800' : ''
                  }`}
                style={{
                  backgroundColor: selectedTypes.includes(dollarType.type) ? dollarType.color : 'transparent',
                  borderColor: selectedTypes.includes(dollarType.type) ? dollarType.color : undefined
                }}
              >
                {dollarType.label}
              </Button>
            ))}
          </div>
          <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto m-auto lg:m-0">
            <TabsList className={`grid grid-cols-4 ${darkMode ? 'bg-gray-800' : ''}`}>
              {timeRanges.map((range) => (
                <TabsTrigger
                  key={range.id}
                  value={range.id}
                  className={darkMode ? 'data-[state=active]:bg-gray-700' : ''}
                >
                  {range.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
         
        </div>

        {/* Selector de tipos de dólar */}

      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="w-full h-[400px] p-6">
            <Skeleton className="w-full h-full" />
          </div>
        ) : error ? (
          <div className="w-full h-[400px] flex items-center justify-center">
            <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-[400px] flex items-center justify-center">
            <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No hay datos disponibles para el período seleccionado
            </p>
          </div>
        ) : (
          <div className="w-full p-1 lg:p-6">
            <ResponsiveContainer width="100%" height={height}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                {/* Definir gradientes */}
                <defs>
                  {dollarTypes.map((dollarType) => (
                    <linearGradient
                      key={dollarType.gradient.id}
                      id={dollarType.gradient.id}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
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
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tickFormatter={formatYAxis}
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 12 }}
                  ticks={Array.from(
                    {length: Math.floor((yAxisMax - yAxisMin) / 100) + 1}, 
                    (_, i) => yAxisMin + i * 100
                  )}
                  domain={[yAxisMin, yAxisMax]}     
                               />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: darkMode ? '#6b7280' : '#d1d5db',
                    strokeWidth: 1
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="line"
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px'
                  }}
                />

                {/* Renderizar áreas para tipos seleccionados */}
                {dollarTypes
                  .filter(dollarType => selectedTypes.includes(dollarType.type))
                  .map((dollarType) => (
                    <Area
                      key={dollarType.type}
                      type="monotone"
                      dataKey={dollarType.type}
                      name={dollarType.label}
                      stroke={dollarType.color}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#${dollarType.gradient.id})`}
                    />
                  ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>

      <CardFooter className={`text-sm ${darkMode ? 'text-gray-500 border-gray-800' : 'text-gray-600'}`}>
        <p>Fuente: INDEC</p>
      </CardFooter>
    </Card>
  );
}