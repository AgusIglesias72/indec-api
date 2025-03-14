import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface IPCData {
  date: string;
  year_over_year_change?: number;
}

interface IPCInterannualChartProps {
  data: IPCData[];
}

/**
 * Gráfico para la variación interanual del IPC - Versión estable
 */
export default function IPCInterannualChart({ data }: IPCInterannualChartProps) {
  // Procesamos los datos una sola vez con useMemo
  const chartData = useMemo(() => {
    // Si no hay datos, devolver array vacío
    if (!data || data.length === 0) return [];
    
    // Filtrar datos válidos y ordenarlos
    return data
      .filter(item => 
        item && item.date && item.year_over_year_change !== undefined && item.year_over_year_change !== null
      )
      .map(item => ({
        date: item.date,
        year_over_year_change: typeof item.year_over_year_change === 'number' ? 
          item.year_over_year_change : parseFloat(String(item.year_over_year_change))
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]); // Solo se recalcula si data cambia

  // Función para formatear fechas en el eje X
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Usar toLocaleString para obtener el nombre del mes en español 
    const month = date.toLocaleString('es', { month: 'short' });
    const year = date.getFullYear().toString().slice(2); // Solo últimos 2 dígitos
    
    // Solo mostrar año si es enero o primer dato
    //const showYear = date.getMonth() === 0;
    return `${month} ${year}`;
  };

  // Personalizar tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border border-indec-gray-medium rounded shadow-sm">
          <p className="font-medium">{formatDate(data.date + 'T00:00:00')}</p>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-sm">
              <span className="text-indec-gray-dark">Var. interanual: </span>
              <span className="font-mono font-medium text-indec-red">
                {data.year_over_year_change.toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Si no hay datos procesados, mostrar mensaje
  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-indec-gray-dark">
        No hay datos disponibles para mostrar
      </div>
    );
  }

  // Obtener valores mínimos y máximos para escalar el eje Y correctamente
  const yValues = chartData.map(item => item.year_over_year_change);
  const minValue = Math.min(...yValues) * 0.9; // 10% de margen
  const maxValue = Math.max(...yValues) * 1.1; // 10% de margen

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
          interval={'preserveStartEnd'}
          minTickGap={20}
        />
        <YAxis
          domain={[minValue, maxValue]}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
          tickFormatter={(value) => `${value}%`}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        
        <Line
          type="monotone"
          dataKey="year_over_year_change"
          stroke="#A13000"  // Tono más oscuro para la variación interanual
          strokeWidth={2}
          dot={{ r: 2, fill: '#A13000' }}
          activeDot={{ r: 5 }}
          isAnimationActive={false} // Desactivar animaciones para mayor estabilidad
        />
      </LineChart>
    </ResponsiveContainer>
  );
}