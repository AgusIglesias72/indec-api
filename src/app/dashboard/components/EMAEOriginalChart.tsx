import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

interface EmaeData {
  date: string;
  original_value?: number;
  yearly_pct_change?: number;
}

interface EmaeOriginalChartProps {
  data: EmaeData[];
}

/**
 * Gráfico para la serie original del EMAE
 */
export default function EmaeOriginalChart({ data }: EmaeOriginalChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  // Procesar los datos para el gráfico cuando cambian
  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }

    // Filtrar datos para asegurarnos de que tienen la propiedad original_value
    const validData = data.filter(item => 
      item && item.date && 
      item.original_value !== undefined && 
      item.original_value !== null
    );

    // Ordenar cronológicamente (de más antiguo a más reciente)
    const sortedData = [...validData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Añadir el dato procesado para el gráfico
    setChartData(sortedData.map(item => ({
      date: item.date,
      original_value: parseFloat(item.original_value!.toFixed(1)),
      yearly_pct_change: item.yearly_pct_change !== undefined ? 
        parseFloat(item.yearly_pct_change.toFixed(1)) : undefined
    })));
  }, [data]);

  // Función para formatear fechas en el eje X
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Usar toLocaleString para obtener el nombre del mes en español 
    const month = date.toLocaleString('es', { month: 'short' });
    const year = date.getFullYear().toString().slice(2); // Solo últimos 2 dígitos
    
    // Solo mostrar año si es enero o primer dato
    const showYear = date.getMonth() === 0;
    return showYear ? `${month} ${year}` : month;
  };

  // Personalizar tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border border-indec-gray-medium rounded shadow-sm">
          <p className="font-medium">{formatDate(data.date)}</p>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-sm">
              <span className="text-indec-gray-dark">Índice: </span>
              <span className="font-mono font-medium">{data.original_value.toFixed(1)}</span>
            </p>
            {data.yearly_pct_change !== undefined && (
              <p className="text-sm">
                <span className="text-indec-gray-dark">Var. interanual: </span>
                <span className={`font-mono font-medium ${data.yearly_pct_change >= 0 ? 'text-indec-green' : 'text-indec-red'}`}>
                  {data.yearly_pct_change > 0 ? '+' : ''}
                  {data.yearly_pct_change.toFixed(1)}%
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Si no hay datos, mostrar un mensaje
  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-indec-gray-dark">
        No hay datos disponibles para mostrar
      </div>
    );
  }

  // Encontrar los valores mínimo y máximo para el eje Y
  const values = chartData.map((item: any) => item.original_value).filter((val: any) => val !== undefined);
  const minValue = Math.min(...values) * 0.95; // 5% de margen
  const maxValue = Math.max(...values) * 1.05; // 5% de margen

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
          interval={'preserveStartEnd'}
        />
        <YAxis
          domain={[minValue, maxValue]}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
          tickFormatter={(value) => value.toFixed(0)}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        
        <Line
          type="monotone"
          dataKey="original_value"
          stroke="#10893E"
          strokeWidth={2}
          dot={{ r: 2, fill: '#10893E' }}
          activeDot={{ r: 5 }}
          isAnimationActive={true}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}