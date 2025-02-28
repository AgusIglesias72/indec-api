// src/components/charts/IPCChart.tsx
import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

// Tipo de datos que espera el componente
interface IPCChartProps {
  data: Array<{
    date: string;
    monthly_change: number;
    year_over_year_change: number;
  }> | null;
  loading: boolean;
  error: Error | null;
}

// Función para formatear fecha (YYYY-MM-DD a MMM)
const formatMonth = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  // Usar toLocaleString para obtener el nombre del mes en español 
  // (con opciones para obtener solo el mes abreviado)
  return date.toLocaleString('es', { month: 'short' });
};

// Componente para renderizar el CustomTooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-indec-gray-medium rounded shadow-sm">
        <p className="font-medium">{formatMonth(data.date)} {new Date(data.date).getFullYear()}</p>
        <p className="text-sm flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#005288]"></span>
          <span>Mensual:</span>
          <span className="font-mono font-medium">
            {data.monthly_change !== null && typeof data.monthly_change !== 'undefined'
              ? data.monthly_change.toFixed(1) + '%'
              : 'N/D'}
          </span>
        </p>
        <p className="text-sm flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#076252]"></span>
          <span>Interanual:</span>
          <span className="font-mono font-medium">
            {data.year_over_year_change !== null && typeof data.year_over_year_change !== 'undefined'
              ? data.year_over_year_change.toFixed(1) + '%'
              : 'N/D'}
          </span>
        </p>
      </div>
    );
  }
  
  return null;
};

const IPCChart = ({ data, loading, error }: IPCChartProps) => {
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-indec-gray-dark text-center">
          No se pudieron cargar los datos del IPC
        </p>
      </div>
    );
  }
  
  // Filtrar datos para asegurarnos de que no hay valores nulos en monthly_change
  // pero mantenemos los nulls en year_over_year_change para mostrar discontinuidades en la línea
  const filteredData = data.map(item => ({
    ...item,
    // Asegurarse de que monthly_change nunca sea null
    monthly_change: item.monthly_change !== null && typeof item.monthly_change !== 'undefined' 
      ? item.monthly_change 
      : 0
    // No modificamos year_over_year_change para que la línea no se dibuje donde no hay datos
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={filteredData}
        margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatMonth}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
        />
        <YAxis 
          yAxisId="left"
          orientation="left"
          tickFormatter={(value) => `${value.toFixed(0)}%`}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
          domain={[0, 'dataMax + 5']}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `${value.toFixed(0)}%`}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
          domain={[0, 'dataMax + 20']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{
            paddingTop: 15,
            fontSize: 12
          }}
        />
        <Bar 
          name="Var. mensual" 
          dataKey="monthly_change" 
          fill="#005288" 
          yAxisId="left"
          barSize={20}
          radius={[3, 3, 0, 0]}
        />
        <Line 
          name="Var. interanual" 
          type="monotone" 
          dataKey="year_over_year_change" 
          stroke="#076252" 
          strokeWidth={2}
          yAxisId="right"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          connectNulls={false} // No conectar puntos cuando hay valores nulos
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default IPCChart;