// src/components/EnhancedRiskChart.tsx
'use client';

// Cache buster: Updated 2025-01-30-17:26

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [selectedPeriod, setSelectedPeriod] = useState<'1d' | '7d' | '30d' | '3m' | '1y' | '5y' | '10y'>('3m');
  const [isClient, setIsClient] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    min: number;
    max: number;
    avg: number;
  } | null>(null);
  
  // Calculate optimal Y-axis domain with smart padding
  const getYAxisDomain = useCallback((data: ChartDataPoint[]) => {
    if (!data || data.length === 0) return ['auto', 'auto'];
    
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Add padding based on the data range
    // For small ranges, use a minimum padding
    // For larger ranges, use percentage-based padding
    let padding;
    if (range < 50) {
      // Small range: add fixed padding
      padding = Math.max(10, range * 0.1);
    } else if (range < 200) {
      // Medium range: add 8% padding
      padding = range * 0.08;
    } else {
      // Large range: add 5% padding
      padding = range * 0.05;
    }
    
    const yMin = Math.max(0, min - padding); // Don't go below 0
    const yMax = max + padding;
    
    // Round to nice numbers for cleaner axis
    const roundedMin = Math.floor(yMin / 10) * 10;
    const roundedMax = Math.ceil(yMax / 10) * 10;
    
    console.info(`Y-axis domain: [${roundedMin}, ${roundedMax}] (data range: ${min.toFixed(0)}-${max.toFixed(0)}, padding: ${padding.toFixed(1)})`);
    
    return [roundedMin, roundedMax];
  }, []);

  const periodOptions = useMemo(() => {
    // Base options available by default
    const baseOptions = [
      { value: '30d' as const, label: '30D', apiType: 'last_30_days' as const },
      { value: '3m' as const, label: '3M', apiType: 'last_90_days' as const },
      { value: '1y' as const, label: '1A', apiType: 'custom' as const },
      { value: '5y' as const, label: '5A', apiType: 'custom' as const },
      { value: '10y' as const, label: '10A', apiType: 'custom' as const }
    ];

    if (enableExtendedPeriods && isClient) {
      return [
        { value: '1d' as const, label: '1D', apiType: 'custom' as const },
        { value: '7d' as const, label: '7D', apiType: 'last_7_days' as const },
        ...baseOptions
      ];
    }

    return baseOptions;
  }, [enableExtendedPeriods, isClient]);

  // Cargar datos del gráfico con autopaginación mejorada
  const fetchChartData = useCallback(async (period: '1d' | '7d' | '30d' | '3m' | '1y' | '5y' | '10y') => {
    try {
      setLoading(true);
      const selectedOption = periodOptions.find(opt => opt.value === period);
      if (!selectedOption) return;

      let params: any = { order: 'asc', auto_paginate: true };

      if (selectedOption.apiType === 'custom') {
        const daysAgo = new Date();
        
        // Handle specific custom periods
        if (period === '1d') {
          daysAgo.setDate(daysAgo.getDate() - 1);
          // For 1D, we want high resolution - all database rows, not daily aggregates
          params = {
            ...params,
            type: 'custom',
            date_from: daysAgo.toISOString().split('T')[0],
            date_to: new Date().toISOString().split('T')[0],
            limit: maxDataPoints, // Allow more data points for intraday data
            order: 'asc', // Show chronological order for intraday
            resolution: 'raw', // Request raw data, not daily aggregates
            interval: '30min', // Request 30-minute intervals if supported
            granularity: 'intraday', // Alternative parameter for granularity
            aggregate: false, // Disable aggregation
            raw_data: true // Explicit raw data request
          };
        } else if (period === '1y') {
          daysAgo.setDate(daysAgo.getDate() - 365);
          params = {
            ...params,
            type: 'custom',
            date_from: daysAgo.toISOString().split('T')[0],
            date_to: new Date().toISOString().split('T')[0],
            limit: maxDataPoints
          };
        } else if (period === '5y') {
          daysAgo.setFullYear(daysAgo.getFullYear() - 5);
          params = {
            ...params,
            type: 'custom',
            date_from: daysAgo.toISOString().split('T')[0],
            date_to: new Date().toISOString().split('T')[0],
            limit: maxDataPoints
          };
        } else if (period === '10y') {
          daysAgo.setFullYear(daysAgo.getFullYear() - 10);
          params = {
            ...params,
            type: 'custom',
            date_from: daysAgo.toISOString().split('T')[0],
            date_to: new Date().toISOString().split('T')[0],
            limit: maxDataPoints
          };
        }
      } else {
        params.type = selectedOption.apiType;
        // For 7D, we also want higher resolution data
        if (period === '7d') {
          params.limit = maxDataPoints; // Allow more data points for 7D
          params.order = 'asc'; // Show chronological order
          params.resolution = 'raw'; // Request raw data, not daily aggregates
          params.interval = '30min'; // Request 30-minute intervals if supported
          params.granularity = 'intraday'; // Alternative parameter for granularity
          params.aggregate = false; // Disable aggregation
          params.raw_data = true; // Explicit raw data request
        } else {
          params.limit = Math.min(maxDataPoints, 1000); // Para períodos cortos no necesitamos tanto
        }
      }

      console.info(`Loading ${period} data with params:`, params);

      const response = await getRiskCountryData(params);
      
      // Enhanced debugging to check if we're getting unique data points
      console.info(`Received ${response.data?.length || 0} data points for ${period}`);
      
      if (response.data && response.data.length > 0) {
        const sampleData = response.data.slice(0, 10).map(point => ({
          date: point.closing_date,
          value: point.closing_value,
          timestamp: (point as any).created_at || (point as any).updated_at || (point as any).timestamp
        }));
        console.info('Sample data points:', sampleData);
        
        // Check for duplicates
        const uniqueDates = new Set(response.data.map(p => p.closing_date));
        const uniqueValues = new Set(response.data.map(p => p.closing_value));
        console.info(`Unique dates: ${uniqueDates.size}, Unique values: ${uniqueValues.size}, Total points: ${response.data.length}`);
        
        if (uniqueDates.size === 1 && response.data.length > 1) {
          console.warn('⚠️ All data points have the same date - likely getting repeated daily data');
        }
      }
      
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

        console.info(`Loaded ${finalData.length} data points for ${period}`);
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
  }, [maxDataPoints, periodOptions]);

  useEffect(() => {
    // Set client flag after hydration to enable 1D and 7D options
    setIsClient(true);
    
    // Force component update by adding timestamp to help with cache issues
    if (typeof window !== 'undefined') {
      console.info('EnhancedRiskChart loaded with 1D/7D options [v2]:', new Date().toISOString());
      console.info('enableExtendedPeriods:', enableExtendedPeriods);
      
      // Force a small re-render to break browser cache
      setTimeout(() => {
        setIsClient(false);
        setTimeout(() => setIsClient(true), 10);
      }, 100);
    }
  }, [enableExtendedPeriods]);

  useEffect(() => {
    fetchChartData(selectedPeriod);
  }, [fetchChartData, selectedPeriod]);

  // Formatear fechas para el eje X con espaciado inteligente
  const formatDateForAxis = (dateString: string, period: string, index: number, totalLength: number) => {
    const date = new Date(dateString);
    
    // Determinar cuántas etiquetas mostrar según el período
    let showEvery = 1;
    if (period === '1d') showEvery = Math.floor(totalLength / 8); // ~8 etiquetas para intraday
    if (period === '7d') showEvery = Math.floor(totalLength / 10); // ~10 etiquetas para 7 días
    if (period === '30d') showEvery = Math.floor(totalLength / 6); // ~6 etiquetas
    if (period === '3m') showEvery = Math.floor(totalLength / 8); // ~8 etiquetas  
    if (period === '1y') showEvery = Math.floor(totalLength / 12); // ~12 etiquetas
    if (period === '5y') showEvery = Math.floor(totalLength / 10); // ~10 etiquetas
    if (period === '10y') showEvery = Math.floor(totalLength / 10); // ~10 etiquetas

    // Solo mostrar etiquetas espaciadas
    if (index % Math.max(1, showEvery) !== 0) return '';
    
    switch (period) {
      case '1d':
        // For intraday, show time (hour:minute)
        return date.toLocaleTimeString('es-AR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      case '7d':
        // For 7 days, show day and time for more granular view
        return date.toLocaleDateString('es-AR', { 
          month: 'short', 
          day: 'numeric' 
        }) + ' ' + date.toLocaleTimeString('es-AR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
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
      
      // Format date/time based on selected period
      let dateTimeString = '';
      if (selectedPeriod === '1d') {
        dateTimeString = fullDate.toLocaleDateString('es-AR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) + ' · ' + fullDate.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } else if (selectedPeriod === '7d') {
        dateTimeString = fullDate.toLocaleDateString('es-AR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) + ' · ' + fullDate.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } else {
        dateTimeString = fullDate.toLocaleDateString('es-AR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      }
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {dateTimeString}
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
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 text-sm hidden md:block">{description}</p>
        </div>
      </div>
      
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-orange-400/10 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-white rounded-2xl p-3 md:p-6 shadow-md border border-red-100">
          
          {/* Header del gráfico con selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-6 gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-700">
                Período seleccionado
              </span>
            </div>
            
            {/* Selector de período */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPeriod(option.value)}
                  className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
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
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-6 p-2 md:p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Promedio</p>
                <p className="text-xs md:text-sm font-semibold text-gray-900">
                  {formatRiskValue(stats.avg)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Mínimo</p>
                <p className="text-xs md:text-sm font-semibold text-green-700">
                  {formatRiskValue(stats.min)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Máximo</p>
                <p className="text-xs md:text-sm font-semibold text-red-700">
                  {formatRiskValue(stats.max)}
                </p>
              </div>
            </div>
          )}

          {/* Gráfico de área */}
          <div className="w-full h-64 md:h-96" style={{ minHeight: `${Math.min(height, 300)}px` }}>
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
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
                    domain={getYAxisDomain(chartData)}
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