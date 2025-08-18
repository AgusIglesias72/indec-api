'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, PieChart, Activity, Clock, RefreshCw, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import IPCEnhancedChart from '@/components/IPCEnhancedChart';
import IPCCategoriesTable from '@/components/IPCCategoriesTable';

// Componente Hero Section
function HeroSection({ title, subtitle }: { title: string; subtitle: string }) {
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
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-red-600" />; // Inflación = negativo
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-green-600" />; // Deflación = positivo
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-red-700'; // Inflación alta
    if (trend === 'down') return 'text-green-700'; // Inflación baja
    return 'text-purple-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      {/* Gradient background effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-purple-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
      
      {/* Main card */}
      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-purple-100 h-full">
        {/* Header */}
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

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>

        {/* Value with trend */}
        <div className="flex items-center gap-2 mb-2">
          <p className={`text-2xl font-bold ${getTrendColor()}`}>{value}</p>
          {getTrendIcon()}
        </div>

        {/* Trend value if provided */}
        {trendValue && (
          <p className="text-xs text-gray-500">{trendValue}</p>
        )}
      </div>
    </motion.div>
  );
}

// Componente para los headers de sección
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

// Componente de información sobre rubros del IPC
function IPCRubrosInfo() {
  const rubrosInfo = [
    {
      category: "Rubros Principales del IPC",
      items: [
        {
          name: "Alimentos y bebidas no alcohólicas",
          description: "Productos alimentarios básicos, carnes, lácteos, frutas, verduras, cereales, aceites y bebidas sin alcohol. Es uno de los rubros de mayor peso en la canasta familiar."
        },
        {
          name: "Vivienda, agua, electricidad y otros combustibles", 
          description: "Gastos de alquiler, expensas, servicios de electricidad, gas, agua, y combustibles para calefacción. Incluye mantenimiento y reparaciones menores del hogar."
        },
        {
          name: "Transporte",
          description: "Costos de transporte público, combustibles, mantenimiento vehicular, seguros automotores y servicios de transporte. Incluye tanto transporte privado como público."
        },
        {
          name: "Prendas de vestir y calzado",
          description: "Ropa para todas las edades y géneros, calzado, accesorios de vestir y servicios de reparación de prendas y calzado."
        },
        {
          name: "Recreación y cultura",
          description: "Servicios recreativos, equipos audiovisuales, equipos deportivos, flores, mascotas, servicios culturales y de entretenimiento."
        },
        {
          name: "Equipamiento y mantenimiento del hogar",
          description: "Muebles, electrodomésticos, artículos de decoración, utensilios domésticos y servicios de reparación y mantenimiento del equipamiento del hogar."
        }
      ]
    },
    {
      category: "Categorías de Análisis",
      items: [
        {
          name: "IPC Núcleo",
          description: "Excluye los precios de los alimentos no elaborados y los combustibles, proporcionando una medida de la inflación subyacente menos volátil."
        },
        {
          name: "Estacional",
          description: "Incluye productos cuyos precios presentan variaciones estacionales significativas, como alimentos frescos y servicios turísticos."
        },
        {
          name: "Regulados",
          description: "Bienes y servicios cuyos precios son fijados o influenciados por el sector público, como servicios públicos, combustibles y medicamentos."
        },
        {
          name: "Bienes vs Servicios",
          description: "División entre productos tangibles (bienes) y servicios, permitiendo analizar diferentes dinámicas inflacionarias entre ambos segmentos."
        }
      ]
    }
  ];

  return (
    <div className="mb-16">
      <SectionHeader title="Información sobre rubros y categorías del IPC" icon={PieChart} />
      
      <div className="grid md:grid-cols-2 gap-8">
        {rubrosInfo.map((section, sectionIndex) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, x: sectionIndex === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 to-purple-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-md border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-6 w-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-purple-600" />
                </div>
                {section.category}
              </h3>
              
              <div className="space-y-6">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-l-4 border-purple-200 pl-4">
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
function UpdateInfo({ lastUpdate }: { lastUpdate?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="group relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 to-purple-400/10 rounded-xl blur opacity-30"></div>
      <div className="relative bg-white rounded-xl p-4 shadow-sm border border-purple-100">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span>Último dato disponible: <span className="font-medium">{lastUpdate || 'Cargando...'}</span></span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-purple-600" />
            <span>Fuente: Instituto Nacional de Estadística y Censos (INDEC)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ModernIPCPageProps {
  initialData?: {
    latest: any;
    historical: any[];
    categories: any[];
    lastUpdate: string;
  };
}

// Componente principal
export default function ModernIPCPage({ initialData }: ModernIPCPageProps) {
  const [ipcData, setIpcData] = useState<any>(initialData?.latest || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Obtener datos actuales del IPC solo si no hay datos iniciales
  useEffect(() => {
    const fetchLatestIPC = async () => {
      // Skip if we have initial data
      if (initialData) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/ipc?type=latest', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
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
  }, [initialData]);

  // Formatear fecha
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

  // Configuración de métricas
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
        title="Índice de Precios al Consumidor" 
        subtitle="Seguimiento de la evolución de precios por regiones y rubros"
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
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Historical Analysis with existing chart */}
        <div className="mb-16">
          <SectionHeader title="Análisis histórico" icon={Activity} />
          <IPCEnhancedChart 
            title="Evolución del IPC"
            description="Selecciona el rango de tiempo, región y rubro para visualizar"
            initialData={initialData?.historical}
            height={450}
          />
        </div>
        
        {/* Categories Table Section */}
        <div className="mb-16">
          <SectionHeader title="Rubros y categorías" icon={PieChart} />
          <IPCCategoriesTable lastUpdate={formatDate(ipcData?.date)} initialData={initialData?.categories} />
        </div>
        
        {/* IPC Rubros Information Section */}
        <IPCRubrosInfo />
        
        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-gray-600 mt-8"
        >
          <p className="mb-1">Los datos se actualizan mensualmente con la publicación oficial</p>
        </motion.div>
      </div>
    </div>
  );
}