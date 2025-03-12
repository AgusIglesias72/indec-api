// src/app/dashboard/components/EmaeTimeSeriesChart.tsx
'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface EmaeChartData {
  date: string;
  original_value: number;
  seasonally_adjusted_value: number;
  cycle_trend_value?: number;
  monthly_pct_change?: number;
  yearly_pct_change?: number;
}

interface EmaeTimeSeriesChartProps {
  data: EmaeChartData[];
  loading: boolean;
  error: any;
  showSeries: {
    original: boolean;
    seasonallyAdjusted: boolean;
    trendCycle: boolean;
  };
}

// Componente personalizado para el tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Encontrar los items para cada serie
    const originalItem = payload.find((p: any) => p.dataKey === 'original_value');
    const seasonallyAdjustedItem = payload.find((p: any) => p.dataKey === 'seasonally_adjusted_value');
    const trendCycleItem = payload.find((p: any) => p.dataKey === 'cycle_trend_value');
    
    // Extraer las variaciones de los datos
    const originalData = originalItem?.payload;
    const seasonallyAdjustedData = seasonallyAdjustedItem?.payload;
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-md shadow-md">
        <p className="text-gray-700 font-medium mb-2">{label}</p>
        
        {originalItem && (
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: originalItem.color }}></div>
              <span className="font-medium">Serie Original:</span>
              <span className="font-mono">{originalItem.value?.toFixed(1)}</span>
            </div>
            {originalData?.yearly_pct_change !== undefined && (
              <div className="text-sm text-gray-600 ml-5">
                <span>Var. i/a: </span>
                <span className={`font-mono font-medium ${originalData.yearly_pct_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {`${originalData.yearly_pct_change >= 0 ? '+' : ''}${originalData.yearly_pct_change.toFixed(1)}%`}
                </span>
              </div>
            )}
          </div>
        )}
        
        {seasonallyAdjustedItem && (
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seasonallyAdjustedItem.color }}></div>
              <span className="font-medium">Serie Desestac.:</span>
              <span className="font-mono">{seasonallyAdjustedItem.value?.toFixed(1)}</span>
            </div>
            {seasonallyAdjustedData?.monthly_pct_change !== undefined && (
              <div className="text-sm text-gray-600 ml-5">
                <span>Var. i/m: </span>
                <span className={`font-mono font-medium ${seasonallyAdjustedData.monthly_pct_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {`${seasonallyAdjustedData.monthly_pct_change >= 0 ? '+' : ''}${seasonallyAdjustedData.monthly_pct_change.toFixed(1)}%`}
                </span>
              </div>
            )}
          </div>
        )}
        
        {trendCycleItem && (
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: trendCycleItem.color }}></div>
              <span className="font-medium">Tendencia-Ciclo:</span>
              <span className="font-mono">{trendCycleItem.value?.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return null;
};

export default function EmaeTimeSeriesChart({ data, loading, error, showSeries }: EmaeTimeSeriesChartProps) {
  // Función para formatear fechas en el eje X
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Obtener el mes abreviado
    const month = date.toLocaleString('es', { month: 'short' });
    const year = date.getFullYear();
    
    // Solo mostrar el año si es enero o si es el primer dato
    const showYear = date.getMonth() === 0;
    
    return showYear ? `${month} ${year}` : month;
  };

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
        <p className="text-gray-500">No se pudieron cargar los datos del EMAE</p>
      </div>
    );
  }

  // Ordenar datos por fecha
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const minValue = Math.min(...sortedData.map(d => d.original_value));
  const maxValue = Math.max(...sortedData.map(d => d.original_value));

  // Ajustar el dominio para que muestren un 5% arriba y abajo
  const domain = [minValue * 0.99, maxValue * 1];


  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={sortedData}
        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
        <XAxis 
          dataKey="date"
          tickFormatter={(value) => formatDate(value + 'T00:00:00')}
          tick={{ fontSize: 12 }}
          interval={'preserveStartEnd'}
        />
        <YAxis 
          tickFormatter={(value) => value.toFixed(0)}
          domain={domain}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {showSeries.original && (
          <Line 
            type="monotone" 
            dataKey="original_value" 
            name="Serie Original" 
            stroke="#005288" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        )}
        
        {showSeries.seasonallyAdjusted && (
          <Line 
            type="monotone" 
            dataKey="seasonally_adjusted_value" 
            name="Serie Desestacionalizada" 
            stroke="#FF9F1C" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        )}
        
        {showSeries.trendCycle && (
          <Line 
            type="monotone" 
            dataKey="cycle_trend_value" 
            name="Tendencia-Ciclo" 
            stroke="#10893E" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}