'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Globe, TrendingUp, TrendingDown, BarChart3, Clock, RefreshCw, ArrowUpRight, ArrowDownRight, Info, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import EnhancedRiskChart from '@/components/EnhancedRiskChart';
import {
  getRiskCountryData,
  getLatestRiskCountryRate,
  formatRiskValue,
  formatPercentageChange
} from '@/services/api-risk-country';
import { RiskCountryDataPoint, RiskCountryStats } from '@/types/risk-country';

// Función para calcular tiempo relativo
function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'hace menos de 1 minuto';
  if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;

  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Componente Hero Section
function HeroSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative bg-gradient-to-br from-red-50 to-orange-100 py-16 mb-8">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>
      </div>
    </div>
  );
}

// Componente para la card principal del riesgo país (simplificada y responsive)
function CurrentRiskCard() {
  const [riskData, setRiskData] = useState<RiskCountryDataPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const latestResponse = await getRiskCountryData({
        type: 'latest',
        // Add timestamp to force cache refresh
        _t: Date.now().toString()
      } as any);

      if (latestResponse.success && latestResponse.data.length > 0) {
        setRiskData(latestResponse.data[0]);
        setLastUpdate(new Date().toISOString());
        setError(null);
      } else {
        setError(latestResponse.error || 'No se encontraron datos');
      }
    } catch (err) {
      console.error('Error al cargar riesgo país:', err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getVariationColor = (variation: number | null) => {
    if (!variation) return 'text-gray-700';
    if (variation > 0) return 'text-red-700';
    if (variation < 0) return 'text-green-700';
    return 'text-gray-700';
  };

  const getVariationIcon = (variation: number | null) => {
    if (!variation) return <Minus className="h-4 w-4" />;
    if (variation > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (variation < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getVariationBg = (variation: number | null) => {
    if (!variation) return 'bg-gray-100 text-gray-700';
    if (variation > 0) return 'bg-red-100 text-red-700';
    if (variation < 0) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative w-full"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-orange-400/20 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-red-100">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-16 w-32 mx-auto md:mx-0" />
              <Skeleton className="h-8 w-24 mx-auto md:mx-0" />
              <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !riskData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative w-full"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-red-400/20 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-red-100">
          <div className="text-center text-red-600">
            <Globe className="h-12 w-12 mx-auto mb-4" />
            <p className="font-medium mb-2">Error al cargar Riesgo País</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative w-full"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-orange-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>

      <div className="relative bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-red-100">
        <div className="text-center md:text-left">

          <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
            <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Riesgo País Argentina</h3>
              <p className="text-gray-600">Nivel actual</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <p className="text-4xl md:text-5xl font-bold text-gray-900">
                {formatRiskValue(riskData.closing_value)}
              </p>
              <p className="text-base md:text-lg text-gray-500">puntos básicos</p>
            </div>

            {riskData.change_percentage !== null && (
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <div className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg font-medium ${getVariationBg(riskData.change_percentage)}`}>
                  {getVariationIcon(riskData.change_percentage)}
                  {formatPercentageChange(riskData.change_percentage)}
                </div>
                <span className="text-gray-600">vs ayer</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>
                Actualizado: {new Date((riskData as any).latest_timestamp || (riskData as any).updated_at || riskData.closing_date).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })} · {getTimeAgo((riskData as any).latest_timestamp || (riskData as any).updated_at || riskData.closing_date)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente para las variaciones por período (responsive)
function PeriodVariations() {
  const [variations, setVariations] = useState<{
    thirtyDays: { value: number | null; date: string | null };
    sixMonths: { value: number | null; date: string | null };
    oneYear: { value: number | null; date: string | null };
  }>({
    thirtyDays: { value: null, date: null },
    sixMonths: { value: null, date: null },
    oneYear: { value: null, date: null }
  });
  const [loading, setLoading] = useState(true);
  const [currentValue, setCurrentValue] = useState<number | null>(null);

  useEffect(() => {
    const fetchVariations = async () => {
      try {
        // Obtener valor actual
        const currentResponse = await getRiskCountryData({ type: 'latest' });
        if (!currentResponse.success || currentResponse.data.length === 0) {
          throw new Error('No se pudo obtener el valor actual');
        }

        const current = currentResponse.data[0].closing_value;
        setCurrentValue(current);

        // Calcular fechas usando el día actual
        const today = new Date();
        const currentDay = today.getDate();

        const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth() - 1, currentDay);
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, currentDay);
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), currentDay);

        // Obtener datos históricos (con rango más amplio para encontrar datos)
        const thirtyDayRange = {
          from: new Date(thirtyDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date(thirtyDaysAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        const sixMonthRange = {
          from: new Date(sixMonthsAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date(sixMonthsAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        const oneYearRange = {
          from: new Date(oneYearAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date(oneYearAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };


        const [thirtyDaysData, sixMonthsData, oneYearData] = await Promise.all([
          getRiskCountryData({
            type: 'custom',
            date_from: thirtyDayRange.from,
            date_to: thirtyDayRange.to,
            order: 'desc',
            limit: 10
          }),
          getRiskCountryData({
            type: 'custom',
            date_from: sixMonthRange.from,
            date_to: sixMonthRange.to,
            order: 'desc',
            limit: 10
          }),
          getRiskCountryData({
            type: 'custom',
            date_from: oneYearRange.from,
            date_to: oneYearRange.to,
            order: 'desc',
            limit: 10
          })
        ]);


        // Procesar resultados - buscar fecha más cercana al día actual
        const processVariation = (data: any, label: string, targetDate: Date) => {
          if (data.success && data.data.length > 0) {
            // Encontrar la fecha más cercana al día actual
            const targetDay = currentDay;
            let closestRecord = data.data[0];
            let smallestDiff = Math.abs(new Date(data.data[0].closing_date).getDate() - targetDay);

            for (const record of data.data) {
              const recordDay = new Date(record.closing_date).getDate();
              const diff = Math.abs(recordDay - targetDay);
              if (diff < smallestDiff) {
                smallestDiff = diff;
                closestRecord = record;
              }
            }

            const historicalValue = closestRecord.closing_value;
            return {
              value: ((current - historicalValue) / historicalValue * 100),
              date: closestRecord.closing_date
            };
          }
          return { value: null, date: null };
        };

        const variations = {
          thirtyDays: processVariation(thirtyDaysData, '30 days', thirtyDaysAgo),
          sixMonths: processVariation(sixMonthsData, '6 months', sixMonthsAgo),
          oneYear: processVariation(oneYearData, '1 year', oneYearAgo)
        };

        setVariations(variations);
      } catch (error) {
        console.error('Error calculating variations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVariations();
  }, []);

  const getVariationColor = (variation: number | null) => {
    if (!variation) return 'text-gray-700';
    if (variation > 0) return 'text-red-700';
    if (variation < 0) return 'text-green-700';
    return 'text-gray-700';
  };

  const getVariationIcon = (variation: number | null) => {
    if (!variation) return <Minus className="h-4 w-4" />;
    if (variation > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (variation < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getVariationBg = (variation: number | null) => {
    if (!variation) return 'from-gray-600/10 to-gray-400/10 border-gray-100';
    if (variation > 0) return 'from-red-600/10 to-red-400/10 border-red-100';
    if (variation < 0) return 'from-green-600/10 to-green-400/10 border-green-100';
    return 'from-gray-600/10 to-gray-400/10 border-gray-100';
  };

  const periods = [
    { key: 'thirtyDays', label: '30 días', data: variations.thirtyDays },
    { key: 'sixMonths', label: '6 meses', data: variations.sixMonths },
    { key: 'oneYear', label: '1 año', data: variations.oneYear }
  ];

  if (loading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
          <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-red-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Variaciones por Período</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-600/10 to-gray-400/10 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-white rounded-2xl p-4 md:p-6 shadow-md border text-center md:text-left">
                <Skeleton className="h-4 w-16 mb-4 mx-auto md:mx-0" />
                <Skeleton className="h-10 w-24 mb-2 mx-auto md:mx-0" />
                <Skeleton className="h-3 w-20 mx-auto md:mx-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
        <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-red-600" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Variaciones por Período</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {periods.map((period, index) => (
          <motion.div
            key={period.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative"
          >
            <div className={`absolute -inset-1 bg-gradient-to-r ${getVariationBg(period.data.value)} rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300`}></div>
            <div className={`relative bg-white rounded-2xl p-4 md:p-6 shadow-md border ${getVariationBg(period.data.value).includes('border-') ? getVariationBg(period.data.value).split('border-')[1] : 'border-gray-100'} text-center md:text-left`}>
              <div className="flex items-center justify-center md:justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">{period.label}</p>
                <div className="ml-2 md:ml-0">
                  {getVariationIcon(period.data.value)}
                </div>
              </div>

              <p className={`text-2xl md:text-3xl font-bold mb-2 ${getVariationColor(period.data.value)}`}>
                {period.data.value !== null ? formatPercentageChange(period.data.value) : 'N/A'}
              </p>

              {period.data.date && (
                <p className="text-xs text-gray-500">
                  desde {new Date(period.data.date).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Componente para valores actuales de los últimos 3 meses (responsive)
function ValoresActuales() {
  const [stats, setStats] = useState<RiskCountryStats | null>(null);
  const [minData, setMinData] = useState<{ value: number; date: string } | null>(null);
  const [maxData, setMaxData] = useState<{ value: number; date: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValoresData = async () => {
      try {
        const response = await getRiskCountryData({ type: 'last_90_days' });
        if (response.success) {
          setStats(response.stats);

          if (response.data.length > 0) {
            const minPoint = response.data.reduce((min, current) =>
              current.closing_value < min.closing_value ? current : min
            );
            const maxPoint = response.data.reduce((max, current) =>
              current.closing_value > max.closing_value ? current : max
            );

            setMinData({
              value: minPoint.closing_value,
              date: minPoint.closing_date
            });
            setMaxData({
              value: maxPoint.closing_value,
              date: maxPoint.closing_date
            });
          }
        }
      } catch (error) {
        console.error('Error loading valores data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchValoresData();
  }, []);

  if (loading) {
    return (
      <div className="mb-12">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-red-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Últimos 3 meses</h2>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 md:gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-red-600 rounded-full"></div>
              <span>Último dato disponible: julio 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-red-600" />
              <span>Fuente: Mercados Financieros Internacionales</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-orange-400/10 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-white rounded-2xl p-4 md:p-6 shadow-md border border-red-100 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-20 mb-2 mx-auto md:mx-0" />
                <Skeleton className="h-3 w-16 mx-auto md:mx-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
          <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-red-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Últimos 3 meses</h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 md:gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 bg-red-600 rounded-full"></div>
            <span>Último dato disponible: julio 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-red-600" />
            <span>Fuente: Mercados Financieros Internacionales</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Valor mínimo */}
        {minData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600/10 to-green-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-4 md:p-6 shadow-md border border-green-100 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                </div>
                <div className="h-4 w-4 text-green-600 opacity-50">
                  <Info className="h-4 w-4" />
                </div>
              </div>

              <p className="text-sm font-medium text-gray-600 mb-2">Valor mínimo</p>
              <p className="text-2xl md:text-3xl font-bold text-green-700 mb-1">{formatRiskValue(minData.value)}</p>
              <p className="text-xs text-gray-500">
                {new Date(minData.date).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </motion.div>
        )}

        {/* Valor máximo */}
        {maxData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-red-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-4 md:p-6 shadow-md border border-red-100 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                </div>
                <div className="h-4 w-4 text-red-600 opacity-50">
                  <Info className="h-4 w-4" />
                </div>
              </div>

              <p className="text-sm font-medium text-gray-600 mb-2">Valor máximo</p>
              <p className="text-2xl md:text-3xl font-bold text-red-700 mb-1">{formatRiskValue(maxData.value)}</p>
              <p className="text-xs text-gray-500">
                {new Date(maxData.date).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </motion.div>
        )}

        {/* Promedio */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-blue-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-4 md:p-6 shadow-md border border-blue-100 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="h-4 w-4 text-blue-600 opacity-50">
                  <Info className="h-4 w-4" />
                </div>
              </div>

              <p className="text-sm font-medium text-gray-600 mb-2">Promedio del período</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-700 mb-1">{formatRiskValue(stats.avg_value)}</p>
              <p className="text-xs text-gray-500">últimos 3 meses</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Componente para los headers de sección
function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
      <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-red-600" />
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

// Componente de información sobre el riesgo país
function RiskCountryInfo() {
  const riskInfo = [
    {
      category: "¿Qué es el Riesgo País?",
      items: [
        {
          name: "Definición",
          description: "El riesgo país es un indicador que mide la probabilidad de que un país no pueda cumplir con sus obligaciones de deuda externa. Se expresa en puntos básicos sobre los bonos del Tesoro de Estados Unidos."
        },
        {
          name: "Cálculo",
          description: "Se calcula como el diferencial (spread) entre el rendimiento de los bonos soberanos argentinos y los bonos del Tesoro de EE.UU. de similar vencimiento. Un mayor spread indica mayor riesgo percibido."
        }
      ]
    },
    {
      category: "Interpretación de Niveles",
      items: [
        {
          name: "Riesgo Bajo (0-500 pb)",
          description: "Indica confianza del mercado en la capacidad de pago del país. Facilita el acceso a financiamiento internacional a tasas competitivas."
        },
        {
          name: "Riesgo Moderado (500-1000 pb)",
          description: "Señala cierta preocupación del mercado, pero aún se considera manejable. El acceso al financiamiento puede encarecerse ligeramente."
        },
        {
          name: "Riesgo Alto (1000-1500 pb)",
          description: "Refleja alta desconfianza del mercado. El acceso a financiamiento internacional se vuelve muy costoso y limitado."
        },
        {
          name: "Riesgo Muy Alto (+1500 pb)",
          description: "Indica una situación crítica donde el mercado considera muy probable un default. El acceso a financiamiento queda prácticamente cerrado."
        }
      ]
    }
  ];

  return (
    <div className="mb-16">
      <SectionHeader title="Información sobre el Riesgo País" icon={Info} />

      <div className="grid md:grid-cols-2 gap-8">
        {riskInfo.map((section, sectionIndex) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, x: sectionIndex === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-orange-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-md border border-red-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-6 w-6 bg-red-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-3 w-3 text-red-600" />
                </div>
                {section.category}
              </h3>

              <div className="space-y-6">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-l-4 border-red-200 pl-4">
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

// Componente de información de actualización
function UpdateInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="group relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-orange-400/10 rounded-xl blur opacity-30"></div>
      <div className="relative bg-white rounded-xl p-4 shadow-sm border border-red-100">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              <span>Actualizado en tiempo real durante las horas de mercado</span>
            </div>
            <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-red-600" />
              <span>Fuente: Mercados Financieros Internacionales</span>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <Info className="h-3 w-3 inline mr-1" />
              Este indicador es calculado por ArgenStats basado en datos de mercado.
              No es el índice EMBI+ oficial de JP Morgan.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente principal
export default function RiesgoPaisPage() {
  return (
    <div className="relative min-h-screen">
      <HeroSection
        title="Riesgo País Argentina"
        subtitle="Seguimiento en tiempo real del indicador de riesgo soberano argentino"
      />

      <div
        className="absolute inset-0 opacity-[0.85] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      ></div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <UpdateInfo />

        {/* Current Risk Level Section */}
        <div className="mb-8 md:mb-12 mt-6 md:mt-8">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Globe className="h-4 w-4 text-red-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Nivel Actual</h2>
          </div>
          <CurrentRiskCard />
        </div>

        {/* Period Variations Section */}
        <PeriodVariations />

        {/* Last 3 Months Values Section */}
        <ValoresActuales />

        {/* Historical Analysis with enhanced limits */}
        <EnhancedRiskChart
          title="Análisis histórico"
          description="Evolución del riesgo país con selector de períodos extendidos"
          height={450}
          darkMode={false}
          enableExtendedPeriods={true}
          maxDataPoints={5000}
        />

        {/* Information Sections */}
        <RiskCountryInfo />
      </div>
    </div>
  );
}