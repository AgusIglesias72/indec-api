'use client';

import React, { useState, useEffect, memo, useMemo, lazy, Suspense } from 'react';
import { TrendingUp, BarChart3, Clock, RefreshCw, ArrowUpRight, ArrowDownRight, PieChart, Activity, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Lazy load heavy components
const IPCEnhancedChart = lazy(() => import('@/components/IPCEnhancedChart'));
const IPCCategoriesTable = lazy(() => import('@/components/IPCCategoriesTable'));

// Hero Section Component
const HeroSection = memo(function HeroSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 py-16 mb-8">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>
      </div>
    </div>
  );
});

// Metric Card Component
interface ModernMetricCardProps {
  title: string;
  value: string;
  tooltip: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  index: number;
  loading?: boolean;
}

function ModernMetricCard({ title, value, tooltip, trend, trendValue, index, loading }: ModernMetricCardProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-purple-400/20 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-purple-100 h-full">
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
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-red-600" />; // Higher inflation = red
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-green-600" />; // Lower inflation = green
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-red-700';
    if (trend === 'down') return 'text-green-700';
    return 'text-purple-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-purple-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
      
      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-purple-100 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-purple-600/70 cursor-help" />
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
          <p className="text-xs text-gray-500">{trendValue}</p>
        )}
      </div>
    </motion.div>
  );
}

// Section Header Component
function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-purple-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

// Update Info Component
function UpdateInfo({ lastUpdate }: { lastUpdate?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="group relative mb-6"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 to-purple-400/10 rounded-xl blur opacity-30"></div>
      <div className="relative bg-white rounded-xl p-4 shadow-sm border border-purple-100">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span>Último dato: <span className="font-medium">{lastUpdate || 'Cargando...'}</span></span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-purple-600" />
            <span>Fuente: INDEC</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// IPC Information Component
function IPCInfoSection() {
  const infoCards = [
    {
      title: "¿Qué es el IPC?",
      description: "El Índice de Precios al Consumidor (IPC) mide la evolución de los precios de los bienes y servicios que consumen los hogares de un país. Es el indicador más utilizado para medir la inflación.",
      icon: TrendingUp,
      color: "purple"
    },
    {
      title: "Metodología",
      description: "Se calcula a partir de una canasta representativa de bienes y servicios, dividida en diferentes rubros como alimentos, vivienda, transporte y recreación. Los datos se recolectan mensualmente.",
      icon: BarChart3,
      color: "blue"
    },
    {
      title: "Importancia",
      description: "El IPC es fundamental para la toma de decisiones económicas, ajustes salariales, políticas monetarias y para entender el poder adquisitivo de la moneda.",
      icon: Activity,
      color: "green"
    }
  ];

  return (
    <div className="mb-16">
      <SectionHeader title="Acerca del IPC" icon={Info} />
      
      <div className="grid md:grid-cols-3 gap-6">
        {infoCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 to-purple-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-md border border-purple-100 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <card.icon className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{card.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Main Component
export default function ModernIPCLandingPage() {
  const [ipcData, setIpcData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestIPC = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ipc?type=latest');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.data) {
          setIpcData(result.data);
          setError(null);
        } else {
          setError('No se pudo obtener información actualizada del IPC');
        }
      } catch (err) {
        console.error('Error al cargar datos del IPC:', err);
        setError('Error al cargar datos del IPC');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestIPC();
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
      title: "Variación mensual",
      value: `${ipcData?.monthly_pct_change?.toFixed(1) || "N/A"}%`,
      tooltip: "Variación porcentual respecto al mes anterior.",
      trend: ipcData?.monthly_change_variation < 0 ? 'down' as const : 'up' as const,
      trendValue: ipcData?.monthly_change_variation ? `${ipcData.monthly_change_variation > 0 ? '+' : ''}${ipcData.monthly_change_variation.toFixed(1)} pp` : undefined
    },
    {
      title: "Variación interanual",
      value: `${ipcData?.yearly_pct_change?.toFixed(1) || "N/A"}%`,
      tooltip: "Variación respecto al mismo mes del año anterior.",
      trend: 'neutral' as const
    },
    {
      title: "Variación acumulada",
      value: `${ipcData?.accumulated_pct_change?.toFixed(1) || "N/A"}%`,
      tooltip: "Variación acumulada en el año.",
      trend: 'neutral' as const
    }
  ];

  return (
    <div className="relative min-h-screen">
      <HeroSection 
        title="Índice de Precios al Consumidor (IPC)" 
        subtitle="Seguimiento completo de la inflación argentina con datos oficiales del INDEC"
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
          <SectionHeader title="Valores actuales" icon={TrendingUp} />
          
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
              <UpdateInfo lastUpdate={formatDate(ipcData?.date)} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* IPC Information Section */}
        <IPCInfoSection />
        
        {/* Historical Analysis */}
        <div className="mb-16">
          <SectionHeader title="Análisis histórico" icon={Activity} />
          <Suspense fallback={
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
              <Skeleton className="h-96 w-full" />
            </div>
          }>
            <IPCEnhancedChart 
              title="Evolución del IPC"
              description="Selecciona el rango de tiempo, región y rubro para visualizar"
              height={450}
            />
          </Suspense>
        </div>
        
        {/* Categories Analysis */}
        <div className="mb-16">
          <SectionHeader title="Análisis por rubros" icon={PieChart} />
          <Suspense fallback={
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
              <Skeleton className="h-64 w-full" />
            </div>
          }>
            <IPCCategoriesTable lastUpdate={formatDate(ipcData?.date)} />
          </Suspense>
        </div>
        
        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-gray-600 mt-8 p-6 bg-white rounded-xl border border-purple-100"
        >
          <p className="mb-2 font-medium">Datos oficiales del Instituto Nacional de Estadística y Censos (INDEC)</p>
          <p>Los datos se actualizan mensualmente con la publicación oficial del organismo</p>
        </motion.div>
      </div>
    </div>
  );
}