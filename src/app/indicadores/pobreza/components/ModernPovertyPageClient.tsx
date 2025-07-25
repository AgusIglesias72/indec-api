'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Clock, RefreshCw, ArrowUpRight, ArrowDownRight, Info, Users, Home, Target, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PovertyEnhancedChart from '@/components/PovertyEnhancedChart';
import PovertyRegionalTable from '@/components/PovertyRegionalTable';

// Componente Hero Section
function HeroSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative bg-gradient-to-br from-red-50 to-orange-100 py-16 mb-8">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94] // cubic-bezier for smooth animation
          }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-red-500 rounded-xl flex items-center justify-center">
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
  change?: number | null;
  changeText?: string;
  index: number;
  loading?: boolean;
  icon?: any;
  color?: 'red' | 'orange' | 'blue';
}

function ModernMetricCard({ title, value, tooltip, trend, change, changeText, index, loading, icon: Icon = Users, color = 'red' }: ModernMetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-red-600" />;
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-green-600" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-red-700'; // Para pobreza, subir es malo
    if (trend === 'down') return 'text-green-700'; // Para pobreza, bajar es bueno
    return 'text-gray-700';
  };

  const colorMap = {
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-red-100',
      gradient: 'from-red-600/20 to-red-400/20'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-100',
      gradient: 'from-orange-600/20 to-orange-400/20'
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-100',
      gradient: 'from-blue-600/20 to-blue-400/20'
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative"
      >
        <div className={`absolute -inset-1 bg-gradient-to-r ${colorMap[color].gradient} rounded-2xl blur opacity-30 animate-pulse`}></div>
        <div className={`relative bg-white rounded-2xl p-3 md:p-6 shadow-lg border ${colorMap[color].border} h-full`}>
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className={`h-8 w-8 md:h-10 md:w-10 ${colorMap[color].bg} rounded-xl flex items-center justify-center animate-pulse`}>
              <div className="h-4 w-4 md:h-5 md:w-5 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <Skeleton className="h-3 w-3 md:h-4 md:w-4 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 md:h-4 w-20 md:w-28" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 md:h-8 w-12 md:w-20" />
              <div className="flex flex-col items-end space-y-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className="group relative cursor-pointer"
    >
      <div className={`absolute -inset-1 bg-gradient-to-r ${colorMap[color].gradient} rounded-2xl blur opacity-50 group-hover:opacity-100 transition-all duration-300`}></div>
      
      <div className={`relative bg-white rounded-2xl p-3 md:p-6 shadow-lg border ${colorMap[color].border} h-full group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-[1.02]`}>
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <div className={`h-8 w-8 md:h-10 md:w-10 ${colorMap[color].bg} rounded-xl flex items-center justify-center`}>
            <Icon className={`h-4 w-4 md:h-5 md:w-5 ${colorMap[color].text}`} />
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className={`h-3 w-3 md:h-4 md:w-4 ${colorMap[color].text}/70 cursor-help`} />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">{title}</h3>

        <div className="flex items-center justify-between">
          <p className="text-lg md:text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              {getTrendIcon()}
            </div>
            {change !== null && changeText && (
              <span className={`text-xs font-medium ${getTrendColor()}`}>
                {changeText}pp
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente para los headers de sección
function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-8 w-8 bg-red-100 rounded-xl flex items-center justify-center">
        <Icon className="h-4 w-4 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
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
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-red-400/10 rounded-xl blur opacity-30"></div>
      <div className="relative bg-white rounded-xl p-4 shadow-sm border border-red-100">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-600" />
            <span>Último dato disponible: <span className="font-medium">{lastUpdate || 'Cargando...'}</span></span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-red-600" />
            <span>Fuente: Instituto Nacional de Estadística y Censos (INDEC)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente principal
export default function ModernPovertyPageClient() {
  const [povertyData, setPovertyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener datos actuales de pobreza y del período anterior
  useEffect(() => {
    const fetchLatestPoverty = async () => {
      try {
        setLoading(true);
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/poverty/latest?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // También obtener datos históricos para comparar con período anterior
        const seriesResponse = await fetch(`/api/poverty/series?region=Total%2031%20aglomerados&start_date=2020-01-01&end_date=2024-12-31`, {
          cache: 'no-store'
        });
        
        let previousPeriodData = null;
        if (seriesResponse.ok) {
          const seriesResult = await seriesResponse.json();
          const sortedData = seriesResult.data?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          if (sortedData && sortedData.length >= 2) {
            previousPeriodData = sortedData[1]; // Second most recent (previous period)
          }
        }
        
        setPovertyData({ ...result, previousPeriodData });
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos de pobreza:', err);
        setError('Error al cargar datos de pobreza');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPoverty();
  }, []);

  // Formatear fecha para mostrar semestre
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      const month = date.getMonth() + 1; // getMonth() is 0-indexed
      const year = date.getFullYear();
      
      // Determinar semestre basado en el mes
      const semester = month <= 6 ? 1 : 2;
      
      return `${semester === 1 ? '1er' : '2do'} Semestre ${year}`;
    } catch (e) {
      console.error("Error formateando fecha:", e);
      return dateString;
    }
  };

  // Función para calcular cambio y tendencia
  const calculateTrendData = (currentValue?: number, previousValue?: number) => {
    if (!currentValue || !previousValue) {
      return { trend: 'neutral' as const, change: null, changeText: '' };
    }
    
    const change = currentValue - previousValue;
    const trend = change > 0.1 ? 'up' as const : change < -0.1 ? 'down' as const : 'neutral' as const;
    const changeText = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
    
    return { trend, change, changeText };
  };

  // Configuración de métricas con comparación de período anterior
  const currentData = povertyData?.data?.national;
  const previousData = povertyData?.previousPeriodData;
  
  const metrics = [
    {
      title: "Pobreza en personas",
      value: `${currentData?.poverty_rate_persons?.toFixed(1) || "N/A"}%`,
      tooltip: "Porcentaje de personas en situación de pobreza en los 31 aglomerados urbanos.",
      ...calculateTrendData(currentData?.poverty_rate_persons, previousData?.poverty_rate_persons),
      icon: Users,
      color: 'red' as const
    },
    {
      title: "Pobreza en hogares",
      value: `${currentData?.poverty_rate_households?.toFixed(1) || "N/A"}%`,
      tooltip: "Porcentaje de hogares en situación de pobreza en los 31 aglomerados urbanos.",
      ...calculateTrendData(currentData?.poverty_rate_households, previousData?.poverty_rate_households),
      icon: Home,
      color: 'red' as const
    },
    {
      title: "Indigencia en personas", 
      value: `${currentData?.indigence_rate_persons?.toFixed(1) || "N/A"}%`,
      tooltip: "Porcentaje de personas en situación de indigencia en los 31 aglomerados urbanos.",
      ...calculateTrendData(currentData?.indigence_rate_persons, previousData?.indigence_rate_persons),
      icon: AlertTriangle,
      color: 'orange' as const
    },
    {
      title: "Indigencia en hogares",
      value: `${currentData?.indigence_rate_households?.toFixed(1) || "N/A"}%`,
      tooltip: "Porcentaje de hogares en situación de indigencia en los 31 aglomerados urbanos.",
      ...calculateTrendData(currentData?.indigence_rate_households, previousData?.indigence_rate_households),
      icon: Target,
      color: 'orange' as const
    }
  ];

  return (
    <div className="relative min-h-screen">
      <HeroSection 
        title="Dashboard de Pobreza e Indigencia en Argentina" 
        subtitle="Análisis interactivo de la incidencia de la pobreza e indigencia en los principales aglomerados urbanos del país con datos oficiales del INDEC"
      />

      {/* Background pattern */}
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
          <SectionHeader title="Indicadores actuales" icon={Activity} />
          
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
              <UpdateInfo lastUpdate={formatDate(povertyData?.data?.national?.date)} />
              
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-6">
                {metrics.map((metric, index) => (
                  <ModernMetricCard
                    key={metric.title}
                    title={metric.title}
                    value={metric.value}
                    tooltip={metric.tooltip}
                    trend={metric.trend}
                    change={metric.change}
                    changeText={metric.changeText}
                    index={index}
                    loading={loading}
                    icon={metric.icon}
                    color={metric.color}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Historical Analysis with chart */}
        <div className="mb-16">
          <SectionHeader title="Análisis histórico interactivo" icon={TrendingUp} />
          <PovertyEnhancedChart 
            title="Evolución de la Pobreza e Indigencia"
            description="Selecciona el indicador, región y rango de tiempo para analizar la evolución. Gráfico interactivo con datos desde 2016."
            height={520}
          />
        </div>
        
        {/* Regional Comparison Section */}
        <div className="mb-16">
          <SectionHeader title="Comparación por regiones" icon={BarChart3} />
          <PovertyRegionalTable lastUpdate={formatDate(povertyData?.data?.national?.date)} />
        </div>

        {/* SEO Content Section */}
        <div className="mb-16">
          <SectionHeader title="Guía del Dashboard" icon={Info} />
          
          <div className="prose prose-lg max-w-none text-gray-700 mb-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Cómo usar el Dashboard de Pobreza e Indigencia
              </h3>
              
              <p className="mb-6">
                Este <strong>dashboard interactivo de pobreza e indigencia en Argentina</strong> te permite analizar 
                en profundidad la evolución de los indicadores sociales más importantes del país. Utiliza datos oficiales 
                del <strong>INDEC</strong> y ofrece múltiples herramientas de análisis y visualización.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Gráficos Interactivos</h4>
                    <p>Visualiza la evolución histórica de pobreza e indigencia desde 2016. Filtra por región, 
                    período y tipo de indicador (personas vs hogares) para análisis específicos.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Target className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Comparación Regional</h4>
                    <p>Compara los indicadores entre los 31 aglomerados urbanos más importantes de Argentina 
                    y identifica patrones y diferencias regionales.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Activity className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Indicadores en Tiempo Real</h4>
                    <p>Visualiza los últimos datos disponibles con información de tendencias y cambios 
                    respecto al período anterior, actualizado semestralmente.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RefreshCw className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Datos Oficiales INDEC</h4>
                    <p>Toda la información proviene directamente del Instituto Nacional de Estadística y Censos, 
                    garantizando confiabilidad y precisión en cada análisis.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="mb-16">
          <SectionHeader title="Información sobre la medición" icon={Info} />
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Poverty Definition */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-red-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-md border border-red-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="h-6 w-6 bg-red-100 rounded-xl flex items-center justify-center">
                    <Users className="h-3 w-3 text-red-600" />
                  </div>
                  ¿Qué es la Pobreza?
                </h3>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-red-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Definición</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Se considera pobre a una persona cuando el ingreso del hogar donde reside no alcanza para adquirir la Canasta Básica Total (CBT), que incluye alimentos y servicios básicos.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-red-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Canasta Básica Total (CBT)</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Incluye la Canasta Básica Alimentaria más bienes y servicios no alimentarios como vestimenta, transporte, educación, salud y vivienda.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-red-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Método utilizado</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      El INDEC utiliza el método del ingreso, comparando los ingresos familiares con el valor de la CBT según la composición del hogar.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Cobertura geográfica</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      La medición abarca los 31 aglomerados urbanos más importantes del país, representando aproximadamente el 62% de la población total.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Indigence Definition */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/10 to-orange-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-md border border-orange-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="h-6 w-6 bg-orange-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-orange-600" />
                  </div>
                  ¿Qué es la Indigencia?
                </h3>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-orange-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Definición</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Se considera indigente a una persona cuando el ingreso del hogar no alcanza para adquirir la Canasta Básica Alimentaria (CBA), que cubre las necesidades nutricionales mínimas.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-orange-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Canasta Básica Alimentaria (CBA)</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Conjunto de alimentos, expresado en cantidades suficientes para satisfacer las necesidades energéticas y proteicas de un adulto equivalente.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-orange-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Relación con la pobreza</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      La indigencia es un subconjunto de la pobreza. Todos los indigentes son pobres, pero no todos los pobres son indigentes.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Periodicidad</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Los datos se publican semestralmente (primer y segundo semestre) con información de la Encuesta Permanente de Hogares (EPH).
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Importancia</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Es un indicador crucial para el diseño de políticas públicas focalizadas en las necesidades más urgentes de la población.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-gray-600 mt-8"
        >
          <p className="mb-1">Los datos se actualizan semestralmente con la publicación oficial del INDEC</p>
          <p>Metodología basada en la Encuesta Permanente de Hogares (EPH)</p>
        </motion.div>
      </div>
    </div>
  );
}