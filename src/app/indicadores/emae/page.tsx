'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Clock, RefreshCw, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EMAEEnhancedChart from '@/components/EMAEEnhancedChart';
import EMAESectorsTable from '@/components/EMAESectorsTable';

// Componente Hero Section
function HeroSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 py-16 mb-8">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
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
  index: number;
  loading?: boolean;
}

function ModernMetricCard({ title, value, tooltip, trend, index, loading }: ModernMetricCardProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-blue-100 h-full">
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
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-700';
    if (trend === 'down') return 'text-red-700';
    return 'text-blue-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      {/* Gradient background effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
      
      {/* Main card */}
      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-blue-100 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-blue-600/70 cursor-help" />
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
        <div className="flex items-center gap-2">
          <p className={`text-2xl font-bold ${getTrendColor()}`}>{value}</p>
          {getTrendIcon()}
        </div>
      </div>
    </motion.div>
  );
}

// Componente para los headers de sección
function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-blue-600" />
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
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-blue-400/10 rounded-xl blur opacity-30"></div>
      <div className="relative bg-white rounded-xl p-4 shadow-sm border border-blue-100">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Último dato disponible: <span className="font-medium">{lastUpdate || 'Cargando...'}</span></span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600" />
            <span>Fuente: Instituto Nacional de Estadística y Censos (INDEC)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente principal
export default function ModernEMAEPage() {
  const [emaeData, setEmaeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener datos actuales del EMAE
  useEffect(() => {
    const fetchLatestEMAE = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/emae/latest');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setEmaeData(result);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos del EMAE:', err);
        setError('Error al cargar datos del EMAE');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestEMAE();
  }, []);

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
      title: "Valor del índice",
      value: emaeData?.original_value?.toLocaleString('es-AR', { maximumFractionDigits: 1 }) || "N/A",
      tooltip: "Valor del índice de actividad económica (2004=100).",
      trend: 'neutral' as const
    },
    {
      title: "Var. mensual",
      value: `${emaeData?.monthly_pct_change?.toFixed(1) || "N/A"}%`,
      tooltip: "Variación respecto al mes anterior (serie desestacionalizada).",
      trend: emaeData?.monthly_pct_change >= 0 ? 'up' as const : 'down' as const
    },
    {
      title: "Var. interanual", 
      value: `${emaeData?.yearly_pct_change?.toFixed(1) || "N/A"}%`,
      tooltip: "Variación respecto al mismo mes del año anterior.",
      trend: emaeData?.yearly_pct_change >= 0 ? 'up' as const : 'down' as const
    },
    {
      title: "Serie desestacionalizada",
      value: emaeData?.seasonally_adjusted_value?.toLocaleString('es-AR', { maximumFractionDigits: 1 }) || "N/A",
      tooltip: "Valor de la serie sin efectos estacionales.",
      trend: 'neutral' as const
    }
  ];

  return (
    <div className="relative min-h-screen">
      <HeroSection 
        title="Estimador Mensual de Actividad Económica" 
        subtitle="Seguimiento de la evolución de la actividad económica a nivel nacional"
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
          <SectionHeader title="Valores actuales" icon={Activity} />
          
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
              <UpdateInfo lastUpdate={formatDate(emaeData?.date)} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {metrics.map((metric, index) => (
                  <ModernMetricCard
                    key={metric.title}
                    title={metric.title}
                    value={metric.value}
                    tooltip={metric.tooltip}
                    trend={metric.trend}
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
          <SectionHeader title="Análisis histórico" icon={TrendingUp} />
          <EMAEEnhancedChart 
            title="Evolución del EMAE"
            description="Selecciona el sector, tipo de visualización y rango de tiempo"
            height={450}
          />
        </div>
        
        {/* Sectors Table Section */}
        <div className="mb-16">
          <SectionHeader title="Sectores económicos" icon={BarChart3} />
          <EMAESectorsTable lastUpdate={formatDate(emaeData?.date)} />
        </div>

        {/* Sector Information Section */}
        <div className="mb-16">
          <SectionHeader title="Información sobre los sectores económicos" icon={Activity} />
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Main Economic Sectors */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-blue-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-md border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-3 w-3 text-blue-600" />
                  </div>
                  Sectores Productivos Principales
                </h3>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Industria Manufacturera <span className="text-sm text-blue-600 font-normal">(18.9% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Sector que transforma físicamente y químicamente materiales, sustancias o componentes en productos nuevos. Incluye desde alimentos y textiles hasta automotores y productos químicos.</p>
                  </div>
                  
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Comercio mayorista y minorista <span className="text-sm text-blue-600 font-normal">(12.4% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Abarca el comercio de productos agropecuarios, industriales nacionales, importados y exportaciones, junto con mantenimiento y reparación de automotores.</p>
                  </div>
                  
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Actividades inmobiliarias y empresariales <span className="text-sm text-blue-600 font-normal">(11% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Incluye servicios inmobiliarios, alquiler de viviendas, actividades jurídicas y contables, alquiler de equipos, y servicios empresariales como informática y seguridad.</p>
                  </div>

                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Agricultura, ganadería y silvicultura <span className="text-sm text-blue-600 font-normal">(8.1% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Comprende cultivos agrícolas como soja, trigo, maíz, y actividades pecuarias incluyendo producción bovina, lechería, carne aviar y huevos.</p>
                  </div>

                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Transporte y comunicaciones <span className="text-sm text-blue-600 font-normal">(6.1% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Servicios de transporte de pasajeros y cargas por vía férrea, automotor, aéreo y fluvial, así como telefonía, servicios postales, Internet y transmisión audiovisual.</p>
                  </div>

                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Explotación de minas y canteras <span className="text-sm text-blue-600 font-normal">(5% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Extracción de petróleo, gas natural y minerales metalíferos no ferrosos, junto con sus servicios relacionados.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Service Sectors */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-blue-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-md border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-3 w-3 text-blue-600" />
                  </div>
                  Sectores de Servicios
                </h3>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Administración pública y defensa <span className="text-sm text-blue-600 font-normal">(4.4% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Servicios administrativos del gobierno nacional, provincial y municipal, incluyendo seguridad y defensa nacional.</p>
                  </div>
                  
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Enseñanza <span className="text-sm text-blue-600 font-normal">(3.5% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Servicios educativos públicos y privados en todos los niveles, desde educación inicial hasta universitaria y formación profesional.</p>
                  </div>
                  
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Intermediación financiera <span className="text-sm text-blue-600 font-normal">(3.1% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Servicios bancarios, seguros, casas de cambio y otros servicios financieros incluyendo obras sociales y medicina prepaga.</p>
                  </div>

                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Construcción <span className="text-sm text-blue-600 font-normal">(3.1% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Actividades de construcción residencial, comercial e infraestructura, medida a través de indicadores como el ISAC y empleo sectorial.</p>
                  </div>

                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Servicios sociales y de salud <span className="text-sm text-blue-600 font-normal">(2.7% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Servicios de salud públicos y privados, incluyendo hospitales, clínicas, centros de salud y servicios médicos especializados.</p>
                  </div>

                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Electricidad, gas y agua <span className="text-sm text-blue-600 font-normal">(1.8% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Generación, transmisión y distribución de energía eléctrica, servicios de gas natural y distribución de agua potable y saneamiento.</p>
                  </div>

                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Hoteles y restaurantes <span className="text-sm text-blue-600 font-normal">(1.4% del PIB)</span></h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Servicios de alojamiento temporal y gastronómicos, incluyendo hoteles, restaurantes, bares y servicios de catering.</p>
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
          <p className="mb-1">Los datos se actualizan mensualmente con la publicación oficial</p>
        </motion.div>
      </div>
    </div>
  );
}




