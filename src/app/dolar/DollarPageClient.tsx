'use client';

import React, { useState, useEffect, memo, useMemo, lazy, Suspense } from 'react';
import { DollarSign, TrendingUp, BarChart3, Clock, RefreshCw, ArrowUpRight, ArrowDownRight, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { DollarRateData } from '@/types/dollar';
import { DollarType } from '@/types/dollar';
import { Skeleton } from '@/components/ui/skeleton';
import ConverterPromoSection from '@/components/landing/ConverterPromoSection';

// Lazy load heavy chart component
const EnhancedDollarChart = lazy(() => import('@/components/EnhancedDollarChart'));
const DollarConverter = lazy(() => import('@/components/DollarConverter'));

// Actualizar la interfaz DollarRateData para incluir las variaciones
interface ExtendedDollarRateData extends DollarRateData {
  buy_variation?: number;
  sell_variation?: number;
  minutes_ago?: number;
}

// Shared utility functions for variation styling (eliminates code duplication)
const getVariationStyles = (variation: number) => {
  const isPositive = variation > 0;
  const isNegative = variation < 0;
  
  return {
    isPositive,
    isNegative,
    bgClass: isPositive ? 'bg-green-100 text-green-700' : isNegative ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700',
    icon: isPositive ? <ArrowUpRight className="h-3 w-3" /> : isNegative ? <ArrowDownRight className="h-3 w-3" /> : null
  };
};

// Memoized Hero Section to prevent unnecessary re-renders
const HeroSection = memo(function HeroSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative bg-gradient-to-br from-green-50 to-green-100 py-16 mb-8">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>
      </div>
    </div>
  );
});

// Memoized utility function for time formatting
function formatTimeAgo(minutes: number): string {
  if (minutes < 1) return 'Hace menos de 1 minuto';
  if (minutes === 1) return 'Hace 1 minuto';
  if (minutes < 60) return `Hace ${minutes} minutos`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'Hace 1 hora';
  if (hours < 24) return `Hace ${hours} horas`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;

  return 'Hace más de una semana';
}

// Componente para cards individuales de dólar modernas
interface ModernDollarRateCardProps {
  dollarType: DollarType;
  title: string;
  index: number;
  data: ExtendedDollarRateData | null;
  loading: boolean;
  error: string | null;
}

const ModernDollarRateCard = memo(function ModernDollarRateCard({ dollarType, title, index, data, loading, error }: ModernDollarRateCardProps) {
  // Memoized currency formatter
  const formatCurrency = useMemo(() => (value: number | undefined | null) => {
    if (value === undefined || value === null) {
      return "N/A";
    }

    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  // Memoized variation calculation
  const variation = useMemo(() => {
    if (!data) return 0;

    const buyVar = data.buy_variation ?? 0;
    const sellVar = data.sell_variation ?? 0;

    // Si ambas están disponibles, calculamos el promedio
    if (data.buy_variation !== undefined && data.sell_variation !== undefined) {
      return (buyVar + sellVar) / 2;
    }

    // Si solo una está disponible, usamos esa
    if (data.buy_variation !== undefined) return buyVar;
    if (data.sell_variation !== undefined) return sellVar;

    // Si ninguna está disponible, retornamos 0
    return 0;
  }, [data]);

  // Use shared variation styles
  const variationStyles = useMemo(() => getVariationStyles(variation), [variation]);

  // Renderizar skeleton mientras carga
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-green-400/20 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-green-100 h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <Skeleton className="h-8 w-full" />
        </div>
      </motion.div>
    );
  }

  // Renderizar error
  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-red-400/20 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-red-100 h-full">
          <div className="text-center text-red-600">
            <p className="font-medium">{title}</p>
            <p className="text-sm mt-1">{error || 'No hay datos disponibles'}</p>
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
      className="group relative"
    >
      {/* Gradient background effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-green-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>

      {/* Main card */}
      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-green-100 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 font-medium">{dollarType}</p>
            </div>
          </div>

          {/* Change indicator */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${variationStyles.bgClass}`}>
            {variationStyles.icon}
            {variation > 0 ? '+' : ''}{variation.toFixed(2)}%
          </div>
        </div>

        {/* Prices grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {data.buy_price !== undefined && data.buy_price !== null && (
            <div className="bg-green-50/50 rounded-xl p-3 border border-green-200">
              <p className="text-xs font-medium text-green-800 mb-1">Compra</p>
              <p className="text-lg font-bold text-green-700">${formatCurrency(data.buy_price)}</p>
            </div>
          )}

          <div className={`bg-green-50/50 rounded-xl p-3 border border-green-200 ${(!data.buy_price || data.buy_price === null) ? 'col-span-2' : ''
            }`}>
            <p className="text-xs font-medium text-green-800 mb-1">Venta</p>
            <p className="text-lg font-bold text-green-700">${formatCurrency(data.sell_price)}</p>
          </div>
        </div>

        {/* Update time info */}
        <div className="pt-3 border-t border-green-100">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Actualizado</span>
            <span
              className="text-sm font-medium text-gray-700 flex items-center gap-1"
              suppressHydrationWarning
            >
              <Clock className="h-3 w-3" />
              {formatTimeAgo(data.minutes_ago || 0)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Memoized SectionHeader component
const SectionHeader = memo(function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
});

// Memoized InfoSection component
const InfoSection = memo(function InfoSection() {
  const dollarInfo = [
    {
      category: "Dólares Financieros",
      items: [
        {
          name: "Dólar MEP (Bolsa)",
          description: "Se obtiene mediante la compra-venta de bonos o acciones que cotizan tanto en pesos como en dólares, permitiendo adquirir dólares de forma legal a través del mercado bursátil."
        },
        {
          name: "Contado con Liquidación (CCL)",
          description: "Similar al MEP, pero permite transferir dólares al exterior. Se obtiene mediante la compra de activos en pesos que también cotizan en mercados internacionales."
        },
        {
          name: "Dólar Cripto",
          description: "Cotización implícita que surge de la compra-venta de criptomonedas estables (stablecoins) como USDT o DAI a través de exchanges o plataformas P2P."
        }
      ]
    },
    {
      category: "Dólares de Referencia",
      items: [
        {
          name: "Dólar Oficial",
          description: "Cotización regulada por el Banco Central de la República Argentina (BCRA) para operaciones en bancos y casas de cambio oficiales."
        },
        {
          name: "Dólar Blue",
          description: "Cotización que surge del mercado informal o paralelo, no regulado oficialmente pero ampliamente utilizado como referencia."
        },
        {
          name: "Dólar Mayorista",
          description: "Utilizado principalmente para operaciones de comercio exterior y entre entidades financieras. Es la referencia para importaciones y exportaciones."
        },
        {
          name: "Dólar Tarjeta",
          description: "Cotización aplicada a las compras realizadas en el exterior con tarjetas de crédito o débito, que incluye impuestos adicionales como el PAIS y percepciones a cuenta de Ganancias/Bienes Personales."
        }
      ]
    }
  ];

  return (
    <div className="mb-16">
      <SectionHeader title="Información sobre los tipos de dólar" icon={TrendingUp} />

      <div className="grid md:grid-cols-2 gap-8">
        {dollarInfo.map((section, sectionIndex) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, x: sectionIndex === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600/10 to-green-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-md border border-green-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-6 w-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-green-600" />
                </div>
                {section.category}
              </h3>

              <div className="space-y-6">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-l-4 border-green-200 pl-4">
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
});

// Memoized UpdateInfo component
const UpdateInfo = memo(function UpdateInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="group relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-green-600/10 to-green-400/10 rounded-xl blur opacity-30"></div>
      <div className="relative bg-white rounded-xl p-4 shadow-sm border border-green-100">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span>Las cotizaciones se actualizan automáticamente durante los días hábiles</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-green-600" />
            <span>Fuente: API Argentina Datos</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Static dollar types configuration
const dollarTypesConfig = {
  financial: [
    { type: 'MEP' as DollarType, name: 'MEP (Bolsa)' },
    { type: 'CCL' as DollarType, name: 'Contado con Liqui' },
    { type: 'CRYPTO' as DollarType, name: 'Dólar Cripto' }
  ],
  reference: [
    { type: 'BLUE' as DollarType, name: 'Dólar Blue' },
    { type: 'OFICIAL' as DollarType, name: 'Dólar Oficial' },
    { type: 'MAYORISTA' as DollarType, name: 'Dólar Mayorista' },
    { type: 'TARJETA' as DollarType, name: 'Dólar Tarjeta' }
  ]
};

// Main optimized component with performance improvements
export default function ModernCotizacionesPage() {
  const [dollarRates, setDollarRates] = useState<Record<DollarType, ExtendedDollarRateData | null>>({} as any);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Memoized dollar types to prevent object recreation
  const dollarTypes = useMemo(() => dollarTypesConfig, []);

  // Cargar todos los datos de una vez
  const fetchAllRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dollar?type=latest&include_variations=true');

      if (!response.ok) {
        throw new Error('Error al cargar cotizaciones');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Convertir array a objeto indexado por tipo
        const ratesMap: Record<DollarType, ExtendedDollarRateData> = {} as any;
        result.data.forEach((rate: ExtendedDollarRateData) => {
          if (rate.dollar_type) {
            ratesMap[rate.dollar_type as DollarType] = rate;
          }
        });

        setDollarRates(ratesMap);
        setError(null);
      } else {
        setError('No se encontraron datos');
      }
    } catch (err) {
      console.error('Error al cargar cotizaciones:', err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRates();

    // Actualizar cada 5 minutos
    const interval = setInterval(fetchAllRates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen">
      <HeroSection
        title="Cotizaciones de Dólar"
        subtitle="Seguimiento en tiempo real de los principales tipos de cambio en Argentina"
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
        {/* Financial Dollars Section */}
        <div className="mb-12">
          <SectionHeader title="Dólares Financieros" icon={BarChart3} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dollarTypes.financial.map((dollar, index) => (
              <ModernDollarRateCard
                key={dollar.type}
                dollarType={dollar.type}
                title={dollar.name}
                index={index}
                data={dollarRates[dollar.type] || null}
                loading={loading}
                error={error}
              />
            ))}
          </div>
        </div>

        {/* Reference Dollars Section */}
        <div className="mb-12">
          <SectionHeader title="Dólares de Referencia" icon={DollarSign} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dollarTypes.reference.map((dollar, index) => (
              <ModernDollarRateCard
                key={dollar.type}
                dollarType={dollar.type}
                title={dollar.name}
                index={index + 3}
                data={dollarRates[dollar.type] || null}
                loading={loading}
                error={error}
              />
            ))}
          </div>
        </div>

        {/* Dollar Converter Section */}
        <div className="mb-16">
          <SectionHeader title="Conversor de Divisas" icon={Calculator} />
          <Suspense fallback={
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100">
              <div className="animate-pulse space-y-6">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          }>
            <DollarConverter 
              dollarRates={dollarRates} 
              loading={loading}
            />
          </Suspense>
        </div>

        {/* Historical Analysis with lazy loaded chart */}
        <div className="mb-16">
          <SectionHeader title="Análisis histórico" icon={TrendingUp} />
          <Suspense fallback={
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          }>
            <EnhancedDollarChart
              title="Evolución de cotizaciones"
              description="Selecciona el rango de tiempo y los tipos de dólar para visualizar"
              height={450}
              darkMode={false}
            />
          </Suspense>
        </div>

        {/* Converter Promotion Section */}
        <div className="mb-16">
          <ConverterPromoSection />
        </div>

        {/* Information Section */}
        <InfoSection />

        {/* Update Information */}
        <UpdateInfo />
      </div>
    </div>
  );
}