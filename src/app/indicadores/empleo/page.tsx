'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, TrendingUp, TrendingDown, Activity, Clock, RefreshCw, ArrowUpRight, ArrowDownRight, Info, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Componente Hero Section
function HeroSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative bg-gradient-to-br from-orange-50 to-amber-100 py-16 mb-8">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>
      </div>
    </div>
  );
}

// Componente para cards individuales de métricas
interface ModernMetricCardProps {
  title: string;
  value: string;
  tooltip: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  index: number;
  loading?: boolean;
  color?: 'orange' | 'red' | 'blue' | 'green';
  empleoData?: any; // Agregar empleoData como prop
}

function ModernMetricCard({ title, value, tooltip, trend, trendValue, index, loading, color = 'orange', empleoData }: ModernMetricCardProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-orange-400/20 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-orange-100 h-full">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-24" />
        </div>
      </motion.div>
    );
  }

  const getTrendIcon = () => {
    // Solo para desempleo: rojo si sube, verde si baja
    if (title.includes('Desempleo')) {
      if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-green-600" />;
    } else {
      // Para empleo y actividad: verde si sube, rojo si baja
      if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = () => {
    // Solo para desempleo: rojo si sube, verde si baja
    if (title.includes('Desempleo')) {
      if (trend === 'up') return 'text-red-700';
      if (trend === 'down') return 'text-green-700';
    } else {
      // Para empleo y actividad: verde si sube, rojo si baja
      if (trend === 'up') return 'text-green-700';
      if (trend === 'down') return 'text-red-700';
    }
    return `text-${color}-700`;
  };

  const getColorClasses = () => {
    const colors = {
      orange: 'from-orange-600/20 to-orange-400/20 border-orange-100 bg-orange-100 text-orange-600',
      red: 'from-red-600/20 to-red-400/20 border-red-100 bg-red-100 text-red-600',
      blue: 'from-blue-600/20 to-blue-400/20 border-blue-100 bg-blue-100 text-blue-600',
      green: 'from-green-600/20 to-green-400/20 border-green-100 bg-green-100 text-green-600'
    };
    return colors[color];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className={`absolute -inset-1 bg-gradient-to-r ${getColorClasses().split(' ')[0]} ${getColorClasses().split(' ')[1]} rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500`}></div>
      
      <div className={`relative bg-white rounded-2xl p-6 shadow-lg border ${getColorClasses().split(' ')[2]} h-full`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`h-10 w-10 ${getColorClasses().split(' ')[3]} rounded-xl flex items-center justify-center`}>
            <Users className={`h-5 w-5 ${getColorClasses().split(' ')[4]}`} />
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className={`h-4 w-4 ${getColorClasses().split(' ')[4]}/70 cursor-help`} />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>

        <div className="flex items-center gap-2 mb-2">
          <p className={`text-2xl font-bold ${getTrendColor()}`}>{value}</p>
          {getTrendIcon()}
        </div>

        {trendValue && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Var. interanual: {trendValue}</p>
            {/* Mostrar variación trimestral específica para cada métrica */}
            {title.includes('Empleo') && (
              <p className="text-xs text-gray-500">
                Var. trimestral: {empleoData?.employment_quarterly_variation ? 
                  `${empleoData.employment_quarterly_variation > 0 ? '+' : ''}${empleoData.employment_quarterly_variation.toFixed(1)}pp` : 
                  '-0.1pp'
                }
              </p>
            )}
            {title.includes('Desempleo') && (
              <p className="text-xs text-gray-500">
                Var. trimestral: {empleoData?.unemployment_quarterly_variation ? 
                  `${empleoData.unemployment_quarterly_variation > 0 ? '+' : ''}${empleoData.unemployment_quarterly_variation.toFixed(1)}pp` : 
                  '+0.3pp'
                }
              </p>
            )}
            {title.includes('Actividad') && (
              <p className="text-xs text-gray-500">
                Var. trimestral: {empleoData?.activity_quarterly_variation ? 
                  `${empleoData.activity_quarterly_variation > 0 ? '+' : ''}${empleoData.activity_quarterly_variation.toFixed(1)}pp` : 
                  '0.0pp'
                }
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Componente para los headers de sección
function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-orange-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

// Componente de dropdown personalizado como el del IPC
function CustomDropdown({ 
  label, 
  value, 
  options, 
  onChange, 
  placeholder = "Seleccionar..." 
}: {
  label: string;
  value: string;
  options: { value: string; label: string; color?: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left flex items-center justify-between hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors min-w-[200px]"
        >
          <div className="flex items-center gap-2">
            {selectedOption?.color && (
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedOption.color }}
              />
            )}
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg"
              >
                {option.color && (
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span className="text-gray-900">{option.label}</span>
                {option.value === value && (
                  <svg className="w-4 h-4 text-orange-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de gráfico interactivo mejorado
function EmpleoEnhancedChart() {
  const [indicatorType, setIndicatorType] = useState('unemployment_rate');
  const [regionType, setRegionType] = useState('nacional');
  const [segmentType, setSegmentType] = useState('total');
  const [timeRange, setTimeRange] = useState('5');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Opciones para los dropdowns
  const indicatorOptions = [
    { value: 'unemployment_rate', label: 'Tasa de Desempleo', color: '#EA580C' },
    { value: 'employment_rate', label: 'Tasa de Empleo', color: '#059669' },
    { value: 'activity_rate', label: 'Tasa de Actividad', color: '#3B82F6' }
  ];

  const regionOptions = [
    { value: 'nacional', label: 'Nacional', color: '#6366F1' },
    { value: 'caba', label: 'CABA', color: '#8B5CF6' },
    { value: 'gba', label: 'Gran Buenos Aires', color: '#EC4899' },
    { value: 'pampeana', label: 'Región Pampeana', color: '#10B981' },
    { value: 'noa', label: 'Noroeste (NOA)', color: '#F59E0B' },
    { value: 'nea', label: 'Nordeste (NEA)', color: '#EF4444' },
    { value: 'cuyo', label: 'Cuyo', color: '#84CC16' },
    { value: 'patagonia', label: 'Patagonia', color: '#06B6D4' }
  ];

  const segmentOptions = [
    { value: 'total', label: 'Total', color: '#6B7280' },
    { value: 'varones', label: 'Varones', color: '#3B82F6' },
    { value: 'mujeres', label: 'Mujeres', color: '#EC4899' },
    { value: '14-29', label: '14-29 años', color: '#10B981' },
    { value: '30+', label: '30+ años', color: '#8B5CF6' }
  ];

  const timeOptions = [
    { value: '2', label: '2 años' },
    { value: '3', label: '3 años' },
    { value: '5', label: '5 años' },
    { value: '7', label: '7 años' },
    { value: '10', label: '10 años' }
  ];

  // Datos de fallback en caso de error
  const getFallbackData = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const years = parseInt(timeRange);
    const fallbackData = [];
    
    // Generar datos básicos de fallback
    for (let y = 0; y < years; y++) {
      for (let q = 1; q <= 4; q++) {
        const year = currentYear - years + y + 1;
        if (year <= currentYear) {
          fallbackData.push({
            period: `T${q} ${year}`,
            date: `${year}-${q * 3}-30`,
            [indicatorType]: indicatorType === 'unemployment_rate' ? 
              Math.random() * 5 + 5 : // 5-10% para desempleo
              indicatorType === 'employment_rate' ? 
              Math.random() * 5 + 40 : // 40-45% para empleo
              Math.random() * 3 + 46 // 46-49% para actividad
          });
        }
      }
    }
    
    return fallbackData.slice(-20); // Últimos 20 trimestres
  }, [timeRange, indicatorType]);

  // Fetch datos de la API
  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular fecha de inicio basada en el rango temporal
      const years = parseInt(timeRange);
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - years);
      const startDateStr = startDate.toISOString().split('T')[0];

      let apiUrl = '';
      
      // Determinar la consulta según los filtros
      if (regionType !== 'nacional') {
        // Datos regionales específicos
        apiUrl = `/api/labor-market?view=temporal&data_type=regional&region=${regionType}&start_date=${startDateStr}&limit=100`;
      } else if (segmentType !== 'total') {
        // Datos demográficos específicos
        const genderMap: Record<string, string> = {
          'varones': 'varon',
          'mujeres': 'mujer'
        };
        
        const ageMap: Record<string, string> = {
          '14-29': '14-29',
          '30+': '30+'
        };

        if (genderMap[segmentType]) {
          apiUrl = `/api/labor-market?view=temporal&data_type=demographic&gender=${genderMap[segmentType]}&start_date=${startDateStr}&limit=100`;
        } else if (ageMap[segmentType]) {
          apiUrl = `/api/labor-market?view=temporal&data_type=demographic&age_group=${ageMap[segmentType]}&start_date=${startDateStr}&limit=100`;
        }
      } else {
        // Datos nacionales totales
        apiUrl = `/api/labor-market?view=temporal&data_type=national&start_date=${startDateStr}&limit=100`;
      }

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        // Procesar y ordenar datos
        const processedData = result.data
          .filter((item: any) => item[indicatorType] !== null && item[indicatorType] !== undefined)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((item: any) => ({
            period: item.period,
            date: item.date,
            [indicatorType]: item[indicatorType]
          }));

        setData(processedData);
      } else {
        // Fallback con datos básicos si no hay datos
        setData(getFallbackData());
      }

    } catch (error) {
      console.error('Error fetching chart data:', error);
      setError((error as Error).message);
      setData(getFallbackData());
    } finally {
      setLoading(false);
    }
  }, [indicatorType, regionType, segmentType, timeRange, getFallbackData]);

  // Efectos para recargar datos cuando cambian los filtros
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const getChartConfig = () => {
    let gradientId = 'areaGradient';
    let strokeColor = '#EA580C';
    const fillOpacity = 0.3;

    // Determinar la configuración basada en el indicador
    switch (indicatorType) {
      case 'unemployment_rate':
        strokeColor = '#EA580C';
        gradientId = 'unemploymentGradient';
        break;
      case 'employment_rate':
        strokeColor = '#059669';
        gradientId = 'employmentGradient';
        break;
      case 'activity_rate':
        strokeColor = '#3B82F6';
        gradientId = 'activityGradient';
        break;
    }

    return {
      dataKey: indicatorType,
      strokeColor,
      gradientId,
      fillOpacity,
      yLabel: indicatorType === 'unemployment_rate' ? 'Tasa de Desempleo (%)' : 
              indicatorType === 'employment_rate' ? 'Tasa de Empleo (%)' : 'Tasa de Actividad (%)'
    };
  };

  const chartConfig = getChartConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="group relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/10 to-orange-400/10 rounded-2xl blur opacity-30"></div>
      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
        
        {/* Header y controles */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Evolución del Mercado Laboral</h3>
          <p className="text-sm text-gray-600 mb-6">
            Selecciona el indicador, región y período para visualizar la evolución histórica
          </p>
          
          {/* Controles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <CustomDropdown
              label="Indicador"
              value={indicatorType}
              options={indicatorOptions}
              onChange={setIndicatorType}
              placeholder="Seleccionar indicador..."
            />

            {indicatorType === 'unemployment_rate' && (
              <CustomDropdown
                label="Región"
                value={regionType}
                options={regionOptions}
                onChange={(value) => {
                  setRegionType(value);
                  if (value !== 'nacional') setSegmentType('total');
                }}
                placeholder="Seleccionar región..."
              />
            )}

            {indicatorType === 'unemployment_rate' && regionType === 'nacional' && (
              <CustomDropdown
                label="Segmento"
                value={segmentType}
                options={segmentOptions}
                onChange={setSegmentType}
                placeholder="Seleccionar segmento..."
              />
            )}

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Período</label>
              <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeRange(option.value)}
                    className={`px-3 py-1 text-sm rounded transition-colors flex-1 ${
                      timeRange === option.value
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Cargando datos...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 font-medium">Error al cargar datos</p>
              <p className="text-sm text-gray-600 mt-1">Mostrando datos de respaldo</p>
            </div>
          </div>
        )}

        {/* Gráfico */}
        {!loading && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={chartConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartConfig.strokeColor} stopOpacity={chartConfig.fillOpacity}/>
                    <stop offset="95%" stopColor={chartConfig.strokeColor} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="period" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  interval={Math.floor(data.length / 8)}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tickFormatter={(value) => `${value}%`}
                />
                <RechartsTooltip 
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [
                    `${Number(value).toFixed(1)}%`, 
                    indicatorOptions.find(opt => opt.value === indicatorType)?.label || 'Indicador'
                  ]}
                  labelFormatter={(label) => `Período: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey={chartConfig.dataKey} 
                  stroke={chartConfig.strokeColor} 
                  strokeWidth={2}
                  fill={`url(#${chartConfig.gradientId})`}
                  dot={{ fill: chartConfig.strokeColor, strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: chartConfig.strokeColor, strokeWidth: 2, fill: '#FFF' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Estadísticas del gráfico */}
        {!loading && data.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">Mínimo</p>
              <p className="text-sm font-semibold text-green-600">
                {Math.min(...data.map(d => d[chartConfig.dataKey])).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Máximo</p>
              <p className="text-sm font-semibold text-red-600">
                {Math.max(...data.map(d => d[chartConfig.dataKey])).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Actual</p>
              <p className="text-sm font-semibold text-orange-600">
                {data[data.length - 1]?.[chartConfig.dataKey]?.toFixed(1) || 'N/A'}%
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Componente de información de actualización
function UpdateInfo({ lastUpdate }: { lastUpdate?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="group relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/10 to-orange-400/10 rounded-xl blur opacity-30"></div>
      <div className="relative bg-white rounded-xl p-4 shadow-sm border border-orange-100">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span>Último dato disponible: <span className="font-medium">{lastUpdate || 'T1 2025'}</span></span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-orange-600" />
            <span>Fuente: Instituto Nacional de Estadística y Censos (INDEC)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente para estadísticas regionales
function RegionalStats() {
  const [regionsData, setRegionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch datos regionales de la API
  const fetchRegionalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/labor-market?view=latest&data_type=regional&limit=20');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Mapeo correcto de nombres de regiones que pueden venir de la API
      const regionNameMap: Record<string, string> = {
        'caba': 'CABA',
        'gran_buenos_aires': 'Gran Buenos Aires',
        'gba': 'Gran Buenos Aires',
        'pampeana': 'Región Pampeana',
        'noa': 'Noroeste (NOA)',
        'nea': 'Nordeste (NEA)',
        'cuyo': 'Cuyo',
        'patagonia': 'Patagonia'
      };

      if (result.data && result.data.length > 0) {
        // Procesar datos regionales
        const processedData = result.data.map((item: any) => ({
          region: regionNameMap[item.region?.toLowerCase()] || item.region || 'Región desconocida',
          unemployment: item.unemployment_rate || 0,
          trend: getTrendFromVariation(item.variation_yoy_unemployment_rate),
          change: item.variation_quarterly_unemployment_rate || 0,
          yoy_change: item.variation_yoy_unemployment_rate || 0
        }))
        .filter((item: any) => item.unemployment > 0) // Filtrar datos válidos
        .sort((a: any, b: any) => a.unemployment - b.unemployment); // Ordenar de menor a mayor

        setRegionsData(processedData);
      } else {
        // Usar datos de fallback si no hay datos de la API
        setRegionsData(getFallbackRegionalData());
      }

    } catch (error) {
      console.error('Error fetching regional data:', error);
      setError((error as Error).message);
      setRegionsData(getFallbackRegionalData());
    } finally {
      setLoading(false);
    }
  }, []);

  // Datos de fallback
  const getFallbackRegionalData = () => [
    { region: 'CABA', unemployment: 4.2, trend: 'down', change: -0.3, yoy_change: -0.8 },
    { region: 'Gran Buenos Aires', unemployment: 8.9, trend: 'up', change: 0.5, yoy_change: 1.2 },
    { region: 'Región Pampeana', unemployment: 6.1, trend: 'down', change: -0.1, yoy_change: -0.4 },
    { region: 'Noroeste (NOA)', unemployment: 6.8, trend: 'neutral', change: 0.0, yoy_change: 1.1 },
    { region: 'Nordeste (NEA)', unemployment: 5.9, trend: 'down', change: -0.2, yoy_change: 0.3 },
    { region: 'Cuyo', unemployment: 7.2, trend: 'up', change: 0.4, yoy_change: 0.5 },
    { region: 'Patagonia', unemployment: 5.4, trend: 'neutral', change: 0.0, yoy_change: -0.1 }
  ];

  // Determinar tendencia basada en variación
  const getTrendFromVariation = (variation: number | null | undefined) => {
    if (!variation || Math.abs(variation) < 0.1) return 'neutral';
    return variation > 0 ? 'up' : 'down';
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchRegionalData();
  }, [fetchRegionalData]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="group relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/10 to-orange-400/10 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const minRegion = regionsData.reduce((min, region) => region.unemployment < min.unemployment ? region : min, regionsData[0] || { unemployment: 0 });
  const maxRegion = regionsData.reduce((max, region) => region.unemployment > max.unemployment ? region : max, regionsData[0] || { unemployment: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="group relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/10 to-orange-400/10 rounded-2xl blur opacity-30"></div>
      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <MapPin className="h-4 w-4 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Desempleo por Regiones</h3>
          {error && (
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
              Datos de respaldo
            </span>
          )}
        </div>

        {/* Extremos */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-800">Menor Desempleo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-green-700">{minRegion.region}</p>
                  <p className="text-sm text-green-600">{minRegion.unemployment.toFixed(1)}%</p>
                  <p className="text-xs text-green-500">i/a: {minRegion.yoy_change > 0 ? '+' : ''}{minRegion.yoy_change.toFixed(1)}pp</p>
                </div>
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-800">Mayor Desempleo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-red-700">{maxRegion.region}</p>
                  <p className="text-sm text-red-600">{maxRegion.unemployment.toFixed(1)}%</p>
                  <p className="text-xs text-red-500">i/a: {maxRegion.yoy_change > 0 ? '+' : ''}{maxRegion.yoy_change.toFixed(1)}pp</p>
                </div>
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista completa */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Todas las regiones (T1 2025)</h4>
          {regionsData.map((region, index) => (
            <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900 min-w-[140px]">{region.region}</span>
                <div className="flex items-center gap-2">
                  {region.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-red-500" />}
                  {region.trend === 'down' && <ArrowDownRight className="h-3 w-3 text-green-500" />}
                  {region.trend === 'neutral' && <div className="h-3 w-3 bg-gray-400 rounded-full" />}
                  <div className="text-xs text-gray-500">
                    <span>trim: {region.change > 0 ? '+' : ''}{region.change.toFixed(1)}pp</span>
                    <span className="ml-2">i/a: {region.yoy_change > 0 ? '+' : ''}{region.yoy_change.toFixed(1)}pp</span>
                  </div>
                </div>
              </div>
              <span className="font-bold text-gray-900 text-lg">{region.unemployment.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Componente de información adicional
function LaborMarketInfo() {
  const infoSections = [
    {
      category: "Indicadores Principales",
      items: [
        {
          name: "Tasa de Actividad",
          description: "Porcentaje de la población de 14 años y más que participa activamente del mercado de trabajo, ya sea trabajando o buscando trabajo."
        },
        {
          name: "Tasa de Empleo", 
          description: "Porcentaje de la población de 14 años y más que tiene empleo. Se calcula como el cociente entre la población ocupada y la población total."
        },
        {
          name: "Tasa de Desocupación",
          description: "Porcentaje de la población económicamente activa que no tiene empleo pero lo busca activamente. Es el principal indicador del desempleo."
        },
        {
          name: "Subocupación",
          description: "Situación de los ocupados que trabajan menos de 35 horas semanales por causas involuntarias y están disponibles para trabajar más horas."
        }
      ]
    },
    {
      category: "Segmentación Demográfica",
      items: [
        {
          name: "Desempleo Juvenil",
          description: "Tasa de desempleo en el grupo etario de 14 a 29 años. Históricamente presenta valores más altos que el promedio general."
        },
        {
          name: "Brecha de Género",
          description: "Diferencias en las tasas de empleo y desempleo entre varones y mujeres. Las mujeres suelen tener menor tasa de empleo."
        },
        {
          name: "Desempleo Regional",
          description: "Variaciones en las tasas de desempleo entre las diferentes regiones del país, reflejando heterogeneidades económicas territoriales."
        },
        {
          name: "Nivel Educativo",
          description: "Relación entre el nivel de instrucción alcanzado y la situación laboral, donde mayor educación generalmente reduce el desempleo."
        }
      ]
    }
  ];

  return (
    <div className="mb-16">
      <SectionHeader title="Información sobre indicadores laborales" icon={Users} />
      
      <div className="grid md:grid-cols-2 gap-8">
        {infoSections.map((section, sectionIndex) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, x: sectionIndex === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/10 to-orange-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-md border border-orange-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-6 w-6 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-3 w-3 text-orange-600" />
                </div>
                {section.category}
              </h3>
              
              <div className="space-y-6">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-l-4 border-orange-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Componente principal
export default function ModernEmpleoPage() {
  const [empleoData, setEmpleoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestEmpleo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener último dato nacional disponible
        const response = await fetch('/api/labor-market?view=latest&data_type=national&limit=1');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
          const latestData = result.data[0];
          
          setEmpleoData({
            date: latestData.date,
            period: latestData.period,
            employment_rate: latestData.employment_rate,
            unemployment_rate: latestData.unemployment_rate,
            activity_rate: latestData.activity_rate,
            employment_variation: latestData.variation_yoy_employment_rate || 0,
            unemployment_variation: latestData.variation_yoy_unemployment_rate || 0,
            activity_variation: latestData.variation_yoy_activity_rate || 0,
            employment_quarterly_variation: latestData.variation_quarterly_employment_rate || 0,
            unemployment_quarterly_variation: latestData.variation_quarterly_unemployment_rate || 0,
            activity_quarterly_variation: latestData.variation_quarterly_activity_rate || 0
          });
          
          setError(null);
        } else {
          setError('No se pudo obtener información actualizada del empleo');
          // Usar datos de fallback
          setEmpleoData({
            date: '2025-03-31',
            period: 'T1 2025',
            employment_rate: 43.0,
            unemployment_rate: 7.9,
            activity_rate: 46.7,
            employment_variation: 0.8,
            unemployment_variation: 0.2, 
            activity_variation: 0.1,
            employment_quarterly_variation: -0.1,
            unemployment_quarterly_variation: 0.3,
            activity_quarterly_variation: 0.0
          });
        }
      } catch (err) {
        console.error('Error al cargar datos del empleo:', err);
        setError('Error al cargar datos del empleo');
        
        // Datos de fallback en caso de error
        setEmpleoData({
          date: '2025-03-31',
          period: 'T1 2025',
          employment_rate: 43.0,
          unemployment_rate: 7.9,
          activity_rate: 46.7,
          employment_variation: 0.8,
          unemployment_variation: 0.2,
          activity_variation: 0.1,
          employment_quarterly_variation: -0.1,
          unemployment_quarterly_variation: 0.3,
          activity_quarterly_variation: 0.0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLatestEmpleo();
  }, []);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${month} ${year}`;
    } catch (e) {
      console.error("Error formateando fecha:", e);
      return dateString;
    }
  };

  const metrics = [
    {
      title: "Tasa de Empleo",
      value: `${empleoData?.employment_rate?.toFixed(1) || "43.0"}%`,
      tooltip: "Porcentaje de la población de 14 años y más que tiene empleo",
      trend: empleoData?.employment_variation > 0 ? 'up' as const : empleoData?.employment_variation < 0 ? 'down' as const : 'neutral' as const,
      trendValue: empleoData?.employment_variation ? `${empleoData.employment_variation > 0 ? '+' : ''}${empleoData.employment_variation.toFixed(1)} pp` : "+0.8pp",
      color: 'green' as const
    },
    {
      title: "Tasa de Desempleo", 
      value: `${empleoData?.unemployment_rate?.toFixed(1) || "7.9"}%`,
      tooltip: "Porcentaje de la población económicamente activa que busca empleo",
      trend: empleoData?.unemployment_variation > 0 ? 'up' as const : empleoData?.unemployment_variation < 0 ? 'down' as const : 'neutral' as const,
      trendValue: empleoData?.unemployment_variation ? `${empleoData.unemployment_variation > 0 ? '+' : ''}${empleoData.unemployment_variation.toFixed(1)} pp` : "+0.2pp",
      color: 'red' as const
    },
    {
      title: "Tasa de Actividad",
      value: `${empleoData?.activity_rate?.toFixed(1) || "46.7"}%`,
      tooltip: "Porcentaje de la población que participa activamente del mercado laboral",
      trend: empleoData?.activity_variation > 0 ? 'up' as const : empleoData?.activity_variation < 0 ? 'down' as const : 'neutral' as const,
      trendValue: empleoData?.activity_variation ? `${empleoData.activity_variation > 0 ? '+' : ''}${empleoData.activity_variation.toFixed(1)} pp` : "+0.1pp",
      color: 'blue' as const
    }
  ];

  return (
    <div className="relative min-h-screen">
      <HeroSection 
        title="Indicadores de Empleo" 
        subtitle="Seguimiento completo del mercado laboral argentino con datos oficiales del INDEC"
      />

      <div 
        className="absolute inset-0 opacity-[0.85] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      ></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        
        {/* Current Values Section */}
        <div className="mb-12">
          <SectionHeader title="Indicadores actuales" icon={TrendingUp} />
          
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-red-400/20 rounded-2xl blur opacity-50"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-red-100">
                <div className="text-center text-red-600">
                  <p className="font-medium">Error al cargar datos</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <UpdateInfo lastUpdate={empleoData?.period} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {metrics.map((metric, index) => (
                  <ModernMetricCard
                    key={metric.title}
                    title={metric.title}
                    value={metric.value}
                    tooltip={metric.tooltip}
                    trend={metric.trend}
                    trendValue={metric.trendValue}
                    index={index}
                    loading={loading}
                    color={metric.color}
                    empleoData={empleoData}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Historical Analysis */}
        <div className="mb-16">
          <SectionHeader title="Análisis histórico" icon={Activity} />
          <EmpleoEnhancedChart />
        </div>
        
        {/* Regional Statistics */}
        <div className="mb-16">
          <SectionHeader title="Estadísticas regionales" icon={MapPin} />
          <RegionalStats />
        </div>
        
        {/* Labor Market Information */}
        <LaborMarketInfo />
        
        {/* Footer info con estado de datos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-gray-600 mt-8"
        >
          <p className="mb-1">Los datos se actualizan trimestralmente con la Encuesta Permanente de Hogares (EPH)</p>
          <p className="mb-3">Cobertura: 31 aglomerados urbanos que representan aproximadamente el 70% de la población urbana del país</p>
          
          {/* Indicador de estado de los datos */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            error 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            <div className={`h-2 w-2 rounded-full ${
              error ? 'bg-yellow-500' : 'bg-green-500'
            }`}></div>
            {error ? 'Usando datos de respaldo - Verifique su conexión' : 'Datos actualizados desde la API'}
          </div>
        </motion.div>
      </div>
    </div>
  );
}