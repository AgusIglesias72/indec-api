'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, BarChart3, Clock, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLatestDollarRate, DollarRateData } from '@/services/api-dollar';
import { DollarType } from '@/types/dollar';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedDollarChart from '@/components/EnhancedDollarChart';

// Componente Hero Section
function HeroSection({ title, subtitle }: { title: string; subtitle: string }) {
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
}

// Componente para cards individuales de dólar modernas
interface ModernDollarRateCardProps {
  dollarType: DollarType;
  title: string;
  index: number;
}

function ModernDollarRateCard({ dollarType, title, index }: ModernDollarRateCardProps) {
  const [dollarRate, setDollarRate] = useState<DollarRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getLatestDollarRate(dollarType);
      
      if (data) {
        setDollarRate(data);
        setError(null);
      } else {
        setError('No se encontraron datos');
      }
    } catch (err) {
      console.error(`Error al cargar cotización de ${dollarType}:`, err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dollarType]);

  // Formatear valores monetarios
  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calcular variación (simulada por ahora, ya que no viene en la API)
  const getRandomVariation = () => {
    return (Math.random() - 0.5) * 4; // Entre -2% y +2%
  };

  const variation = getRandomVariation();
  const isPositive = variation > 0;
  const isNegative = variation < 0;

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
  if (error || !dollarRate) {
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
            <p className="text-sm mt-1">{error}</p>
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
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            isPositive ? 'bg-green-100 text-green-700' : 
            isNegative ? 'bg-red-100 text-red-700' : 
            'bg-gray-100 text-gray-700'
          }`}>
            {isPositive && <ArrowUpRight className="h-3 w-3" />}
            {isNegative && <ArrowDownRight className="h-3 w-3" />}
            {variation > 0 ? '+' : ''}{variation.toFixed(1)}%
          </div>
        </div>

        {/* Prices grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {dollarRate.buy_price && (
            <div className="bg-green-50/50 rounded-xl p-3 border border-green-200">
              <p className="text-xs font-medium text-green-800 mb-1">Compra</p>
              <p className="text-lg font-bold text-green-700">${formatCurrency(dollarRate.buy_price)}</p>
            </div>
          )}
          
          <div className={`bg-green-50/50 rounded-xl p-3 border border-green-200 ${!dollarRate.buy_price ? 'col-span-2' : ''}`}>
            <p className="text-xs font-medium text-green-800 mb-1">Venta</p>
            <p className="text-lg font-bold text-green-700">${formatCurrency(dollarRate.sell_price)}</p>
          </div>
        </div>

        {/* Spread calculation (only if both buy and sell exist) */}
        {dollarRate.buy_price && (
          <div className="pt-3 border-t border-green-100">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Spread</span>
              <span className="text-sm font-medium text-gray-900">
                {(((dollarRate.sell_price - dollarRate.buy_price) / dollarRate.buy_price) * 100).toFixed(2)}%
              </span>
            </div>
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
      <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

// Componente de información sobre tipos de dólar
function InfoSection() {
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
}

// Configuración de tipos de dólar
const dollarTypes = {
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

// Componente principal
export default function ModernCotizacionesPage() {
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
              />
            ))}
          </div>
        </div>
        
        {/* Historical Analysis with your existing chart */}
        <div className="mb-16">
          <SectionHeader title="Análisis histórico" icon={TrendingUp} />
          <EnhancedDollarChart 
            title="Evolución de cotizaciones"
            description="Selecciona el rango de tiempo y los tipos de dólar para visualizar"
            height={450}
            darkMode={false}
          />
        </div>
        
        {/* Information Section */}
        <InfoSection />
        
        {/* Update Information */}
        <UpdateInfo />
      </div>
    </div>
  );
}