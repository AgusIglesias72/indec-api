// src/components/EnhancedRiskChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, Calendar } from 'lucide-react';
import { getRiskCountryData, formatRiskValue } from '@/services/api-risk-country';
import { RiskCountryDataPoint } from '@/types/risk-country';

interface EnhancedRiskChartProps {
  title?: string;
  description?: string;
  height?: number;
  darkMode?: boolean;
  enableExtendedPeriods?: boolean;
  maxDataPoints?: number;
}

// Interfaz para los datos del gráfico
interface ChartDataPoint {
  date: string;
  value: number;
  change?: number;
  formattedDate: string;
}

export default function EnhancedRiskChart({ 
  title = "Evolución del Riesgo País", 
  description = "Selecciona el rango de tiempo para visualizar",
  height = 450,
  darkMode = false,
  enableExtendedPeriods = false,
  maxDataPoints = 5000
}: EnhancedRiskChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'30d' | '3m' | '1y' | '5y' | '10y'>('3m');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    min: number;
    max: number;
    avg: number;
  } | null>(null);

  const periodOptions = [
    { value: '30d' as const, label: '30D', apiType: 'last_30_days' as const },
    { value: '3m' as const, label: '3M', apiType: 'last_90_days' as const },
    { value: '1y' as const, label: '1A', apiType: 'custom' as const },
    { value: '5y' as const, label: '5A', apiType: 'custom' as const },
    { value: '10y' as const, label: '10A', apiType: 'custom' as const }
  ];

  // Cargar datos del gráfico con autopaginación mejorada
  const fetchChartData = async (period: '30d' | '3m' | '1y' | '5y' | '10y') => {
    try {
      setLoading(true);
      const selectedOption = periodOptions.find(opt => opt.value === period);
      if (!selectedOption) return;

      let params: any = { order: 'asc', auto_paginate: true };

      if (selectedOption.apiType === 'custom') {
        const daysAgo = new Date();
        if (period === '1y') daysAgo.setDate(daysAgo.getDate() - 365);
        if (period === '5y') daysAgo.setFullYear(daysAgo.getFullYear() - 5);
        if (period === '10y') daysAgo.setFullYear(daysAgo.getFullYear() - 10);
        
        params = {
          ...params,
          type: 'custom',
          date_from: daysAgo.toISOString().split('T')[0],
          date_to: new Date().toISOString().split('T')[0],
          limit: maxDataPoints
        };
      } else {
        params.type = selectedOption.apiType;
        params.limit = Math.min(maxDataPoints, 1000); // Para períodos cortos no necesitamos tanto
      }

      console.log(`Loading ${period} data with params:`, params);

      const response = await getRiskCountryData(params);
      
      if (response.success && response.data.length > 0) {
        const finalData = response.data.map((point: RiskCountryDataPoint, index) => ({
          date: point.closing_date,
          value: point.closing_value,
          change: point.change_percentage === null ? undefined : point.change_percentage,
          formattedDate: formatDateForAxis(point.closing_date, period, index, response.data.length)
        }));

        setChartData(finalData);

        if (finalData.length > 0) {
          const values = finalData.map(d => d.value);
          setStats({
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length
          });
        }

        console.log(`Loaded ${finalData.length} data points for ${period}`);
      } else {
        console.error('Error loading data:', response.error);
        setChartData([]);
        setStats(null);
      }

    } catch (error) {
      console.error('Error loading chart data:', error);
      setChartData([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData(selectedPeriod);
  }, [selectedPeriod, maxDataPoints]);

  // Formatear fechas para el eje X con espaciado inteligente
  const formatDateForAxis = (dateString: string, period: string, index: number, totalLength: number) => {
    const date = new Date(dateString);
    
    // Determinar cuántas etiquetas mostrar según el período
    let showEvery = 1;
    if (period === '30d') showEvery = Math.floor(totalLength / 6); // ~6 etiquetas
    if (period === '3m') showEvery = Math.floor(totalLength / 8); // ~8 etiquetas  
    if (period === '1y') showEvery = Math.floor(totalLength / 12); // ~12 etiquetas
    if (period === '5y') showEvery = Math.floor(totalLength / 10); // ~10 etiquetas
    if (period === '10y') showEvery = Math.floor(totalLength / 10); // ~10 etiquetas

    // Solo mostrar etiquetas espaciadas
    if (index % Math.max(1, showEvery) !== 0) return '';
    
    switch (period) {
      case '30d':
      case '3m':
        return date.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' });
      case '1y':
        return date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
      case '5y':
      case '10y':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString('es-AR');
    }
  };

  // Tooltip personalizado y simple
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const fullDate = new Date(data.date);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {fullDate.toLocaleDateString('es-AR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
          <p className="text-sm text-red-600 font-semibold mb-1">
            {formatRiskValue(data.value)} puntos básicos
          </p>
          {data.change !== null && data.change !== undefined && (
            <p className={`text-xs ${data.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {data.change >= 0 ? '+' : ''}{data.change?.toFixed(2)}% vs anterior
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
      
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-orange-400/10 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-md border border-red-100">
          
          {/* Header del gráfico con selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-700">
                {periodOptions.find(opt => opt.value === selectedPeriod)?.label}
                {chartData.length > 0 && (
                  <span className="text-gray-500 ml-2">
                    ({chartData.length.toLocaleString()} puntos)
                  </span>
                )}
              </span>
            </div>
            
            {/* Selector de período */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPeriod(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedPeriod === option.value
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Estadísticas simples */}
          {stats && !loading && (
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Promedio</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatRiskValue(stats.avg)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Mínimo</p>
                <p className="text-sm font-semibold text-green-700">
                  {formatRiskValue(stats.min)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Máximo</p>
                <p className="text-sm font-semibold text-red-700">
                  {formatRiskValue(stats.max)}
                </p>
              </div>
            </div>
          )}

          {/* Gráfico de área */}
          <div style={{ height: `${height}px` }}>
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Cargando datos...</p>
                  {selectedPeriod === '5y' || selectedPeriod === '10y' ? (
                    <p className="text-xs text-gray-400 mt-1">
                      Procesando {selectedPeriod === '5y' ? '~1,800' : '~3,600'} puntos de datos
                    </p>
                  ) : null}
                </div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay datos disponibles</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 40, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#f0f0f0" 
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    stroke="#d1d5db"
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    orientation="right"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    stroke="#d1d5db"
                    tickFormatter={(value) => formatRiskValue(value)}
                    axisLine={false}
                    tickLine={false}
                    tickCount={6}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#DC2626"
                    strokeWidth={2}
                    fill="url(#riskGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}