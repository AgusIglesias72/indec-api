// src/app/indicadores/emae/page.tsx (Optimized Server/Client Hybrid)
import { getLatestEMAEData, getEMAEHistoricalData, getEMAEBySectors } from '@/lib/db-queries';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import { Suspense, lazy } from 'react';
import PageHero from '@/components/server/PageHero';
import MetricCard from '@/components/server/MetricCard';
import { ErrorBoundary } from '@/components/client/ErrorBoundary';

export const revalidate = 60; // Revalidate every 60 seconds

// Lazy load client components
const EMAEEnhancedChart = lazy(() => import('@/components/EMAEEnhancedChart'));
const EMAESectorsTable = lazy(() => import('@/components/EMAESectorsTable'));

async function getEMAEPageData() {
  try {
    const [latest, historical, sectors] = await Promise.all([
      getLatestEMAEData(),
      getEMAEHistoricalData(36), // 36 months of data
      getEMAEBySectors()
    ]);

    return {
      latest: latest || null,
      historical: historical || [],
      sectors: sectors || [],
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching EMAE data:', error);
    return {
      latest: null,
      historical: [],
      sectors: [],
      lastUpdate: new Date().toISOString()
    };
  }
}

function formatPercentage(value: number | undefined): string {
  if (value === undefined || value === null) return "N/A";
  return `${value.toFixed(1)}%`;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  return `${month} ${year}`;
}

// EMAE Metrics Grid Server Component
function EMAEMetricsGrid({ data }: { data: any }) {
  const items = [
    {
      label: "Interanual",
      value: formatPercentage(data?.yearly_pct_change),
      trend: (data?.yearly_pct_change || 0) > 0 ? 'up' as const : 'down' as const
    },
    {
      label: "Índice",
      value: data?.original_value ? data.original_value.toFixed(1) : "N/A",
      trend: 'neutral' as const
    }
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-10 mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Main EMAE Card */}
        <div className="sm:col-span-2 lg:col-span-1">
          <MetricCard
            title="Actividad (EMAE)"
            mainValue={formatPercentage(data?.monthly_pct_change)}
            mainLabel="mensual"
            items={items}
            icon={BarChart3}
            colorScheme="blue"
            isLoading={!data}
          />
        </div>

        {/* Latest Data Info */}
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Último período</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Período:</span>
                <span className="font-semibold text-gray-900">{formatDate(data?.date)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Variación mensual:</span>
                <span className="font-semibold text-blue-700">
                  {formatPercentage(data?.monthly_pct_change)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Variación interanual:</span>
                <span className="font-semibold text-blue-700">
                  {formatPercentage(data?.yearly_pct_change)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Índice desestacionalizado:</span>
                <span className="font-semibold text-blue-700">
                  {data?.original_value ? data.original_value.toFixed(1) : "N/A"}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-100">
              <div className="flex items-center text-xs text-blue-700">
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                Fuente: INDEC
              </div>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg h-full flex flex-col justify-center">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm mb-3">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                Actualizado
              </div>
              <p className="text-blue-800 text-sm">
                Estimador mensual de actividad económica del INDEC
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// EMAE Information Server Component
function EMAEInfo() {
  const emaeInfo = [
    {
      title: "¿Qué es el EMAE?",
      content: "El Estimador Mensual de Actividad Económica (EMAE) es un indicador de coyuntura que permite estimar la evolución del nivel de actividad económica en forma mensual."
    },
    {
      title: "Metodología",
      content: "Se basa en indicadores parciales de los distintos sectores de actividad económica, con una cobertura superior al 80% del PIB."
    },
    {
      title: "Sectores incluidos",
      content: "Abarca sectores como agricultura, industria manufacturera, construcción, comercio, transporte, servicios financieros, y administración pública."
    },
    {
      title: "Uso e importancia",
      content: "Es fundamental para el seguimiento de la actividad económica entre las publicaciones trimestrales del PIB, permitiendo un análisis más frecuente."
    }
  ];

  return (
    <div className="container mx-auto px-4 mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Acerca del EMAE</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {emaeInfo.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">{item.title}</h3>
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
      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

export default async function EMAEPage() {
  const data = await getEMAEPageData();
  
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
        title="Estimador Mensual de Actividad Económica (EMAE)"
        subtitle="Seguimiento mensual de la actividad económica argentina con datos oficiales del INDEC"
        icon={BarChart3}
        bgColor="from-blue-50 to-blue-100"
        iconColor="bg-blue-500"
      />
      
      <EMAEMetricsGrid data={data.latest} />
      
      {/* Client-rendered interactive chart */}
      <ErrorBoundary>
        <Suspense fallback={
          <div className="container mx-auto px-4 mb-16">
            <SectionHeader title="Análisis histórico" icon={TrendingUp} />
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
            <SectionHeader title="Análisis histórico" icon={TrendingUp} />
            <EMAEEnhancedChart 
              title="Evolución del EMAE"
              description="Selecciona el sector, tipo de visualización y rango de tiempo"
              initialData={data.historical}
              height={450}
            />
          </div>
        </Suspense>
      </ErrorBoundary>

      {/* Client-rendered sectors table */}
      <ErrorBoundary>
        <Suspense fallback={
          <div className="container mx-auto px-4 mb-16">
            <SectionHeader title="Sectores económicos" icon={BarChart3} />
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }>
          <div className="container mx-auto px-4 mb-16">
            <SectionHeader title="Sectores económicos" icon={BarChart3} />
            <EMAESectorsTable 
              lastUpdate={data.latest?.date ? formatDate(data.latest.date) : ""}
              initialData={data.sectors}
            />
          </div>
        </Suspense>
      </ErrorBoundary>

      {/* Server-rendered static information */}
      <EMAEInfo />
    </div>
  );
}