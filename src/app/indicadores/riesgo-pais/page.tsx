// src/app/indicadores/riesgo-pais/page.tsx (Optimized Server/Client Hybrid)
import { getLatestRiskCountryData, getRiskCountryHistoricalData } from '@/lib/db-queries';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';
import { Suspense, lazy } from 'react';
import PageHero from '@/components/server/PageHero';
import MetricCard from '@/components/server/MetricCard';
import { ErrorBoundary } from '@/components/client/ErrorBoundary';

export const revalidate = 60; // Revalidate every 60 seconds

// Lazy load client components
const EnhancedRiskChart = lazy(() => import('@/components/EnhancedRiskChart'));

async function getRiskCountryPageData() {
  try {
    const [latest, historical] = await Promise.all([
      getLatestRiskCountryData(),
      getRiskCountryHistoricalData(365) // 1 year of data
    ]);

    return {
      latest: latest || null,
      historical: historical || [],
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching Risk Country data:', error);
    return {
      latest: null,
      historical: [],
      lastUpdate: new Date().toISOString()
    };
  }
}

function formatRiskValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return Math.round(value).toString();
}

function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(2)}%`;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('es-AR');
}

// Risk Country Metrics Grid Server Component
function RiskCountryMetricsGrid({ data }: { data: any }) {
  const items = [
    {
      label: "Var. diaria",
      value: formatPercentage(data?.change_percentage),
      trend: (data?.change_percentage || 0) > 0 ? 'up' as const : 'down' as const
    },
    {
      label: "Var. mensual",
      value: formatPercentage(data?.monthlyVariation),
      trend: (data?.monthlyVariation || 0) > 0 ? 'up' as const : 'down' as const
    },
    {
      label: "Var. anual",
      value: formatPercentage(data?.yearlyVariation),
      trend: (data?.yearlyVariation || 0) > 0 ? 'up' as const : 'down' as const
    }
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-10 mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Main Risk Country Card */}
        <div className="sm:col-span-2 lg:col-span-1">
          <MetricCard
            title="Riesgo País"
            mainValue={formatRiskValue(data?.closing_value)}
            mainLabel="puntos básicos"
            items={items}
            icon={Globe}
            colorScheme="red"
            isLoading={!data}
          />
        </div>

        {/* Latest Data Info */}
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Globe className="h-4 w-4 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Último cierre</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-semibold text-gray-900">{formatDate(data?.closing_date)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Valor de cierre:</span>
                <span className="font-semibold text-red-700">
                  {formatRiskValue(data?.closing_value)} pb
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Variación diaria:</span>
                <span className={`font-semibold ${
                  (data?.change_percentage || 0) > 0 ? 'text-red-600' : 
                  (data?.change_percentage || 0) < 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {formatPercentage(data?.change_percentage)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Tendencia mensual:</span>
                <span className={`font-semibold ${
                  (data?.monthlyVariation || 0) > 0 ? 'text-red-600' : 
                  (data?.monthlyVariation || 0) < 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {formatPercentage(data?.monthlyVariation)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-red-100">
              <div className="flex items-center text-xs text-red-700">
                <div className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                Mercados internacionales
              </div>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-lg h-full flex flex-col justify-center">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-sm mb-3">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                Actualizado
              </div>
              <p className="text-red-800 text-sm">
                Indicador de riesgo soberano basado en bonos argentinos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Risk Country Information Server Component
function RiskCountryInfo() {
  const riskInfo = [
    {
      title: "¿Qué es el Riesgo País?",
      content: "El riesgo país es un indicador que mide la diferencia de tasa de interés entre los bonos del Tesoro de Estados Unidos y los bonos soberanos argentinos."
    },
    {
      title: "Cálculo",
      content: "Se expresa en puntos básicos (pb), donde 100 pb equivalen a 1%. Se calcula como la diferencia entre el rendimiento de bonos argentinos y estadounidenses."
    },
    {
      title: "Interpretación",
      content: "Valores más altos indican mayor percepción de riesgo. Por encima de 1000 pb se considera riesgo alto, por debajo de 500 pb riesgo moderado."
    },
    {
      title: "Importancia",
      content: "Es clave para determinar el costo de financiamiento del país en mercados internacionales y la confianza de inversores extranjeros."
    }
  ];

  return (
    <div className="container mx-auto px-4 mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
          <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Acerca del Riesgo País</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {riskInfo.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
            <h3 className="text-lg font-semibold text-red-600 mb-3">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

export default async function RiskCountryPage() {
  const data = await getRiskCountryPageData();
  
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
      <PageHero
        title="Riesgo País Argentina"
        subtitle="Seguimiento en tiempo real del indicador de riesgo soberano argentino"
        icon={Globe}
        bgColor="from-red-50 to-red-100"
        iconColor="bg-red-500"
      />
      
      <RiskCountryMetricsGrid data={data.latest} />
      
      {/* Client-rendered interactive chart */}
      <ErrorBoundary>
        <Suspense fallback={
          <div className="container mx-auto px-4 mb-16">
            <SectionHeader title="Evolución histórica" icon={TrendingUp} />
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        }>
          <div className="container mx-auto px-4 mb-16">
            <SectionHeader title="Evolución histórica" icon={TrendingUp} />
            <EnhancedRiskChart />
          </div>
        </Suspense>
      </ErrorBoundary>

      {/* Server-rendered static information */}
      <RiskCountryInfo />
    </div>
  );
}