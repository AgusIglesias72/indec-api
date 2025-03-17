"use client"

import { useState, useMemo } from "react"
import { 
  ResponsiveContainer, 
  LineChart,
  BarChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ReferenceLine,
  Cell
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ChartTooltip } from "../ui/chart"

interface EmaeEnhancedChartProps {
  data: any[] | null;
  loading: boolean;
  error: any;
  height?: number;
}

// Componente personalizado para el tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  viewType?: 'series' | 'variations';
}

const CustomTooltip = ({ active, payload, label, viewType = 'variations' }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // Formato diferente según el tipo de vista
    if (viewType === 'variations') {
      const value = payload[0].value;
      const formattedValue = value !== undefined && value !== null 
        ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` 
        : '0.0%';
      
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="font-medium">
            <span className="text-gray-700">Var. m/m: </span>
            <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
              {formattedValue}
            </span>
          </p>
        </div>
      );
    } else {
      // Para la serie desestacionalizada
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="text-sm text-gray-600">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-medium">
              <span className="text-gray-700">{entry.name}: </span>
              <span style={{ color: entry.color }}>
                {entry.value.toFixed(1)}
              </span>
            </p>
          ))}
        </div>
      );
    }
  }

  return null;
};

export default function EmaeEnhancedChart({ 
  data, 
  loading, 
  error,
  height = 280 
}: EmaeEnhancedChartProps) {
  // Estado para controlar el tipo de visualización
  const [viewType, setViewType] = useState<'series' | 'variations'>('variations');

  // Procesamos los datos para ambos tipos de visualización
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Ordenar datos por fecha
    const sortedData = [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-12); // Últimos 12 meses
      
    return sortedData.map(item => {
      // Extraer el mes y año de la fecha
      const date = new Date(item.date);
      const monthNames = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear().toString().slice(2); // Solo los últimos 2 dígitos del año
      
      return {
        month: `${month} ${year}`,
        value: item.monthly_pct_change || 0, // Variación mensual
        originalValue: item.original_value || 0, // Valor original
        seriesValue: item.seasonally_adjusted_value || 0, // Serie desestacionalizada
        date: item.date
      };
    });
  }, [data]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-indec-gray-dark">
        No se pudieron cargar los datos del EMAE
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent h-full">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-medium">EMAE (desestacionalizado)</CardTitle>
            <CardDescription className="text-base">Últimos 12 meses disponibles</CardDescription>
          </div>
          <Tabs 
            defaultValue="variations" 
            className="w-auto"
            onValueChange={(value) => setViewType(value as 'series' | 'variations')}
          >
            <TabsList className="bg-indec-gray-light">
              <TabsTrigger value="variations" className="text-xs px-3">Variaciones</TabsTrigger>
              <TabsTrigger value="series" className="text-xs px-3">Serie</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height: height }}>
          {viewType === 'variations' ? (
            // Gráfico de barras para las variaciones mensuales
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={true}
                  fontSize={12}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={true}
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                  width={40}
                />
                {/* Línea de referencia en el valor 0 */}
                <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
                {/* Usar el tooltip personalizado */}
                <Tooltip content={<CustomTooltip viewType="variations" />} />
                <Bar 
                  dataKey="value" 
                  name="Variación Mensual"
                  fill="#22c55e" // Color base para las barras
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                >
                  {/* Usar Cell para colorear cada barra individualmente */}
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value >= 0 ? "#22c55e" : "#ef4444"} 
                    />
                  ))}
                 
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            // Gráfico de líneas para la serie desestacionalizada
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={true}

                  fontSize={12}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={true}
                  fontSize={12}
                  tickFormatter={(value) => `${value}`}
                  width={40}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip viewType="series" />} />
                <Line
                  type="monotone"
                  dataKey="seriesValue"
                  name="Serie Desestacionalizada"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}