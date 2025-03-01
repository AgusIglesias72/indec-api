import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceArea
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

// Tipo de datos que espera el componente
interface EmaeTimeSeriesChartProps {
  data: Array<{
    date: string;
    original_value: number;
    seasonally_adjusted_value: number;
    cycle_trend_value?: number; // Opcional ya que no todos los datos podrían tenerlo
  }>;
  loading: boolean;
  error: Error | null;
  dateRange: string; // '1Y', '2Y', '5Y', '10Y', 'ALL'
}

// Función para formatear fecha (YYYY-MM-DD a MMM YYYY)
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  // Usar toLocaleString para obtener el nombre del mes en español 
  // (con opciones para obtener solo el mes abreviado)
  const month = date.toLocaleString('es', { month: 'short' });
  const year = date.getFullYear();
  
  // Solo mostrar año si es enero o si dateRange es más de 5 años
  if (date.getMonth() === 0) {
    return `${month} ${year}`;
  }
  return month;
};

// Componente para renderizar el CustomTooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-indec-gray-medium rounded shadow-sm">
        <p className="font-medium">{formatDate(data.date)}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
            <span>{item.name}:</span>
            <span className="font-mono font-medium">{item.value?.toFixed(1) || 'N/D'}</span>
          </p>
        ))}
      </div>
    );
  }
  
  return null;
};

const EmaeTimeSeriesChart = ({ data, loading, error, dateRange }: EmaeTimeSeriesChartProps) => {
  // Filtrar datos según el rango seleccionado
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (dateRange) {
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case '2Y':
        cutoffDate.setFullYear(now.getFullYear() - 2);
        break;
      case '5Y':
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
      case '10Y':
        cutoffDate.setFullYear(now.getFullYear() - 10);
        break;
      case 'ALL':
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.date) >= cutoffDate);
  }, [data, dateRange]);

  // Encontrar los valores mínimo y máximo para el eje Y
  const yDomain = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [0, 100];
    
    const allValues = filteredData.flatMap(item => [
      item.original_value, 
      item.seasonally_adjusted_value,
      item.cycle_trend_value || 0
    ]);
    
    const min = Math.floor(Math.min(...allValues) * 0.95); // 5% margen hacia abajo
    const max = Math.ceil(Math.max(...allValues) * 1.05); // 5% margen hacia arriba
    
    return [min, max];
  }, [filteredData]);

  // Identificar períodos de recesión (esto sería reemplazado por datos reales)
  // Supongamos que tenemos estas fechas de recesión para mostrar en el gráfico
  const recessions = [
    { start: '2018-04-01', end: '2019-12-01' },
    { start: '2020-03-01', end: '2020-11-01' }
  ];

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }
  
  if (error || !data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-indec-gray-dark text-center">
          No se pudieron cargar los datos del EMAE
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={filteredData}
        margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
          tickCount={12}
        />
        <YAxis 
          domain={yDomain}
          tickFormatter={(value) => `${value.toFixed(0)}`}
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
        
        {/* Áreas de recesión (solo mostrar si está en el rango) */}
        {recessions.map((recession, index) => {
          const startDate = new Date(recession.start);
          const endDate = new Date(recession.end);
          const cutoffDate = dateRange === 'ALL' ? new Date(0) : (() => {
            const date = new Date();
            switch (dateRange) {
              case '1Y': date.setFullYear(date.getFullYear() - 1); break;
              case '2Y': date.setFullYear(date.getFullYear() - 2); break;
              case '5Y': date.setFullYear(date.getFullYear() - 5); break;
              case '10Y': date.setFullYear(date.getFullYear() - 10); break;
              default: return new Date(0);
            }
            return date;
          })();
          
          // Solo mostrar si la recesión está dentro del rango de fechas visible
          if (endDate >= cutoffDate) {
            return (
              <ReferenceArea 
                key={index}
                x1={recession.start} 
                x2={recession.end}
                fill="#f5f5f5" 
                fillOpacity={0.5}
              />
            );
          }
          return null;
        })}
        
        <Line 
          name="Serie Original" 
          type="monotone" 
          dataKey="original_value" 
          stroke="#005288" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line 
          name="Serie Desestacionalizada" 
          type="monotone" 
          dataKey="seasonally_adjusted_value" 
          stroke="#FF9F1C" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line 
          name="Tendencia-Ciclo" 
          type="monotone" 
          dataKey="cycle_trend_value" 
          stroke="#10893E" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EmaeTimeSeriesChart;