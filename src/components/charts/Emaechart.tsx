// src/components/charts/EmaeChart.tsx
import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine 
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

// Tipo de datos que espera el componente
interface EmaeChartProps {
  data: Array<{
    date: string;
    monthly_change: number;
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
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    
    return (
      <div className="bg-white p-3 border border-indec-gray-medium rounded shadow-sm">
        <p className="font-medium">{formatMonth(data.date)} {new Date(data.date).getFullYear()}</p>
        <p className="text-sm">
          <span className="font-mono font-medium">
            {value !== null && typeof value !== 'undefined'
              ? (value > 0 ? '+' : '') + value.toFixed(1) + '%'
              : 'N/D'}
          </span>
        </p>
      </div>
    );
  }
  
  return null;
};

const EmaeChart = ({ data, loading, error }: EmaeChartProps) => {
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
          No se pudieron cargar los datos del EMAE
        </p>
      </div>
    );
  }
  
  // Filtrar datos para que solo se muestren barras donde hay datos válidos
  const filteredData = data.filter(item => 
    item.monthly_change !== null && 
    typeof item.monthly_change !== 'undefined'
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={filteredData}
        margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
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
          tickFormatter={(value) => `${value.toFixed(1)}%`}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{
            paddingTop: 15,
            fontSize: 12
          }}
        />
        <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
        <Bar 
          name="Var. intermensual (desest.)" 
          dataKey="monthly_change" 
          fill="#005288" 
          radius={[3, 3, 0, 0]}
          barSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EmaeChart;