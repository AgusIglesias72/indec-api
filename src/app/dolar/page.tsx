// src/app/dolar/page.tsx (Fully Optimized - Mostly Server Components)
import { getAllDollarRates, getDollarHistoricalData } from '@/lib/db-queries';
import { Suspense, lazy } from 'react';
import DollarHero from './components/DollarHero';
import DollarRatesGrid from './components/DollarRatesGrid';
import InteractiveFeatures from './components/InteractiveFeatures';

export const revalidate = 60; // Revalidate every 60 seconds

// Lazy load heavy components that require client-side features
const EnhancedDollarChart = lazy(() => import('@/components/EnhancedDollarChart'));
// const DollarConverter = lazy(() => import('@/components/DollarConverter'));
const ConverterPromoSection = lazy(() => import('@/components/landing/ConverterPromoSection'));

// Fetch all dollar data on the server
async function getDollarPageData() {
  try {
    // Get latest rates for all dollar types
    const latestRates = await getAllDollarRates();
    
    // Transform to the format expected by components
    const ratesMap: Record<string, any> = {};
    
    for (const rate of latestRates) {
      // Skip if no dollar_type
      if (!rate.dollar_type) continue;
      
      // Calculate variations if we have previous data
      const previousData = await getDollarHistoricalData(rate.dollar_type, 2);
      let buyVariation = 0;
      let sellVariation = 0;
      
      if (previousData.length >= 2) {
        const previous = previousData[previousData.length - 2];
        if (previous.buy_price && rate.buy_price) {
          buyVariation = ((rate.buy_price - previous.buy_price) / previous.buy_price) * 100;
        }
        if (previous.sell_price && rate.sell_price) {
          sellVariation = ((rate.sell_price - previous.sell_price) / previous.sell_price) * 100;
        }
      }
      
      // Calculate minutes ago
      const minutesAgo = rate.updated_at 
        ? Math.floor((Date.now() - new Date(rate.updated_at).getTime()) / (1000 * 60))
        : 0;
      
      ratesMap[rate.dollar_type!] = {
        ...rate,
        buy_variation: buyVariation,
        sell_variation: sellVariation,
        minutes_ago: minutesAgo
      };
    }
    
    // Get historical data for the official dollar (for the chart)
    const historicalData = await getDollarHistoricalData('OFICIAL', 30);
    
    return {
      rates: ratesMap,
      historicalData,
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching dollar data:', error);
    return {
      rates: {},
      historicalData: [],
      lastUpdate: new Date().toISOString()
    };
  }
}

// Information sections as server components
function DollarInfo() {
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
    <div className="container mx-auto px-4 mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Información sobre los tipos de dólar</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {dollarInfo.map((section, sectionIndex) => (
          <div key={section.category} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-green-600 mb-4">{section.category}</h3>
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="border-l-4 border-green-200 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function DollarPage() {
  const data = await getDollarPageData();
  
  return (
    <div className="relative min-h-screen">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.85] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Server-rendered static content */}
      <DollarHero 
        title="Cotizaciones del Dólar en Argentina"
        subtitle="Seguimiento en tiempo real de todas las cotizaciones del dólar argentino"
      />
      
      <DollarRatesGrid rates={data.rates} />
      
      {/* Client-rendered interactive sections */}
      <Suspense fallback={
        <div className="container mx-auto px-4 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }>
        <div className="container mx-auto px-4 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Evolución histórica</h2>
          </div>
          <EnhancedDollarChart />
        </div>
      </Suspense>

      {/* DollarConverter temporarily disabled for build fix
      <Suspense fallback={
        <div className="container mx-auto px-4 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }>
        <div className="container mx-auto px-4 mb-16">
          <DollarConverter />
        </div>
      </Suspense> */}

      {/* Server-rendered static info */}
      <DollarInfo />

      <Suspense fallback={null}>
        <ConverterPromoSection />
      </Suspense>

      {/* Minimal client component for interactivity */}
      <InteractiveFeatures />
    </div>
  );
}