"use client"

import { useState, useMemo } from "react"
import { 
  ResponsiveContainer, 
  ComposedChart,
  BarChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ReferenceLine
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { IPCHistoricalData } from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ChartTooltip } from "../ui/chart"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"

interface IPCEnhancedChartProps {
  data: IPCHistoricalData[] | null
  loading: boolean
  error: Error | null
  height?: number
}

// Componente personalizado para el tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// Componente personalizado para el tooltip que muestra variación interanual y mensual
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    
    const formatValue = (value: number) => 
      value !== undefined && value !== null 
        ? `${value.toFixed(1)}%` 
        : '0.0%';

    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium">
          <span className="text-gray-700">{payload[0].name}: </span>
          <span className="text-indec-blue">
            {formatValue(value)}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

export default function IPCEnhancedChart({ 
  data, 
  loading, 
  error, 
  height = 280 
}: IPCEnhancedChartProps) {
  // Estado para controlar el tipo de variación a mostrar
  const [variationType, setVariationType] = useState<'monthly' | 'yearly'>('monthly');
  
  // Preparar los datos para el gráfico según el tipo de variación
  const prepareChartData = () => {
    if (!data || data.length === 0) return [];
    
    // Ordenar datos por fecha
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Tomar los últimos 24 meses para mejor visualización
    const recentData = sortedData.slice(-12);
    
    // Formatear datos para el gráfico
    return recentData.map(item => {
      // Formatear fecha para mostrar mes y año
      const date = new Date(item.date);
      const monthNames = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
      ];
      const formattedDate = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`;
      
      return {
        date: formattedDate,
        originalDate: item.date,
        mensual: item.monthly_change,
        interanual: item.year_over_year_change,
      };
    });
  };
  
  const chartData = prepareChartData();

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
        No se pudieron cargar los datos del IPC
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent h-full">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-medium">Variación del IPC</CardTitle>
            <CardDescription className="text-base">Últimos 12 meses disponibles</CardDescription>
          </div>
          <Tabs 
            defaultValue="monthly" 
            className="w-auto"
            onValueChange={(value) => setVariationType(value as 'monthly' | 'yearly')}
          >
            <TabsList className="bg-indec-gray-light">
              <TabsTrigger value="monthly" className="text-xs px-3">Mensual</TabsTrigger>
              <TabsTrigger value="yearly" className="text-xs px-3">Interanual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height: height }}>      
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis 
                dataKey="date"
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
                domain={variationType === 'monthly' ? [0, 'auto'] : [0, 'auto']}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Barra condicional según el tipo de variación */}
              <Bar 
                dataKey={variationType === 'monthly' ? 'mensual' : 'interanual'} 
                name={variationType === 'monthly' ? 'Variación Mensual' : 'Variación Interanual'} 
                fill={variationType === 'monthly' ? "#0066a4" : "#cc4700"} 
                radius={[4, 4, 0, 0]}
                barSize={30}
              >
                <LabelList 
                  dataKey={variationType === 'monthly' ? 'mensual' : 'interanual'} 
                  position="top" 
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  style={{ fontSize: 12, fill: '#666' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}