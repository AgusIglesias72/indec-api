"use client"

import { useState, useEffect } from "react"
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { IPCHistoricalData } from "@/services/api"
import {  CardHeader } from "../ui/card"
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card"
import { ChartTooltip } from "../ui/chart"

interface IPCDualAxisChartProps {
  data: IPCHistoricalData[] | null
  loading: boolean
  error: Error | null
  height?: number
}

// Componente personalizado para el tooltip
// Adaptarlo para que muestre la variación interanual y mensual
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// Componente personalizado para el tooltip que muestra variación interanual y mensual

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const mensual = payload[0].value;
    const interanual = payload[1].value;
    
    const formatValue = (value: number) => 
      value !== undefined && value !== null 
        ? `${value > 0 ? '' : ''}${value.toFixed(1)}%` 
        : '0.0%';

    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium">
          <span className="text-gray-700">i/m: </span>
          <span className="text-indec-blue">
            {formatValue(mensual)}
          </span>
        </p>
        <p className="font-medium">
          <span className="text-gray-700">i/a: </span>
          <span className="text-[#A13000]">
            {formatValue(interanual)}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

export default function IPCDualAxisChart({ 
  data, 
  loading, 
  error, 
  height = 280 
}: IPCDualAxisChartProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (data && data.length > 0) {
      // Ordenar datos por fecha
      const sortedData = [...data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      
      // Tomar los últimos 24 meses para mejor visualización
      const recentData = sortedData.slice(-24)
      
      // Formatear datos para el gráfico
      const formattedData = recentData.map(item => {
        // Formatear fecha para mostrar mes y año
        const date = new Date(item.date)
        const monthNames = [
          "Ene", "Feb", "Mar", "Abr", "May", "Jun",
          "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
        ]
        const formattedDate = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`
        
        return {
          date: formattedDate,
          mensual: item.monthly_change,
          interanual: item.year_over_year_change,
        }
      })
      
      setChartData(formattedData)
    }
  }, [data])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Skeleton className="h-[350px] w-full" />
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-indec-gray-dark">
        No se pudieron cargar los datos del IPC
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-none bg-transparent h-full">
    <CardHeader className="px-0 pt-0">
      <CardTitle className="text-xl font-medium text-center">Variación del IPC</CardTitle>
      <CardDescription className="text-base text-center">Últimos 12 meses disponibles</CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      <div style={{ height: height }}>      
      <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={true}
            fontSize={12}
          />
          <YAxis 
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 'auto']}
            tickLine={false}
            axisLine={true}
            width={30}
           
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 'auto']}
            tickLine={false}
            axisLine={true}
            width={50}
          />
          {/* Usar el tooltip personalizado */}
          <ChartTooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                content={<CustomTooltip />}
              />

          <Bar 
            yAxisId="left"
            dataKey="mensual" 
            name="Variación Mensual" 
            fill="#0066a4" 
            radius={[4, 4, 0, 0]}
            barSize={30}
            
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="interanual" 
            name="Variación Interanual" 
            stroke="#A13000" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    </CardContent>
   
    </Card>
    
  )
} 