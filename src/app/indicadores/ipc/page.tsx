// src/app/indicadores/ipc/page.tsx (Optimized Server/Client Hybrid)
import { getLatestIPCData, getIPCHistoricalData, getIPCByCategories } from '@/lib/db-queries';
import { TrendingUp, PieChart, Activity } from 'lucide-react';
import { Suspense, lazy } from 'react';
import PageHero from '@/components/server/PageHero';
import IPCMetricsGrid from './components/IPCMetricsGrid';
import { ErrorBoundary } from '@/components/client/ErrorBoundary';

export const revalidate = 60; // Revalidate every 60 seconds

// Lazy load client components that require interactivity
const IPCEnhancedChart = lazy(() => import('@/components/IPCEnhancedChart'));
const IPCCategoriesTable = lazy(() => import('@/components/IPCCategoriesTable'));

async function getIPCPageData() {
  try {
    // Fetch all IPC data in parallel
    const [latest, historical, categories] = await Promise.all([
      getLatestIPCData(),
      getIPCHistoricalData(24), // 24 months of data
      getIPCByCategories()
    ]);

    return {
      latest: latest || null,
      historical: historical || [],
      categories: categories || [],
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching IPC data:', error);
    return {
      latest: null,
      historical: [],
      categories: [],
      lastUpdate: new Date().toISOString()
    };
  }
}

// Server component for IPC information
function IPCInfo() {
  const ipcInfo = [
    {
      title: "¿Qué es el IPC?",
      content: "El Índice de Precios al Consumidor (IPC) mide la evolución de los precios de los bienes y servicios que adquieren los consumidores para su consumo."
    },
    {
      title: "Metodología",
      content: "Se calcula mensualmente considerando una canasta representativa de bienes y servicios que consumen los hogares argentinos."
    },
    {
      title: "Regiones",
      content: "El INDEC publica datos para el total nacional y para diferentes regiones del país, permitiendo análisis geográficos detallados."
    },
    {
      title: "Usos principales",
      content: "Se utiliza para medir la inflación, ajustar contratos, políticas monetarias y como referencia para aumentos salariales."
    }
  ];

  return (
    <div className="container mx-auto px-4 mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="h-4 w-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Acerca del IPC</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {ipcInfo.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <h3 className="text-lg font-semibold text-purple-600 mb-3">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component for section headers
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

export default async function IPCPage() {
  const data = await getIPCPageData();
  
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
        title="Índice de Precios al Consumidor (IPC)"
        subtitle="Seguimiento de la inflación argentina con datos oficiales del INDEC"
        icon={TrendingUp}
        bgColor="from-purple-50 to-purple-100"
        iconColor="bg-purple-500"
      />
      
      <IPCMetricsGrid data={data.latest ? {
        monthly_pct_change: data.latest.monthly_pct_change ?? undefined,
        yearly_pct_change: data.latest.yearly_pct_change ?? undefined,
        accumulated_pct_change: data.latest.accumulated_pct_change ?? undefined,
        date: data.latest.date ?? undefined
      } : null} />
      
      {/* Client-rendered interactive chart */}
      <ErrorBoundary>
        <Suspense fallback={
          <div className="container mx-auto px-4 mb-16">
            <SectionHeader title="Análisis histórico" icon={Activity} />
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
            <SectionHeader title="Análisis histórico" icon={Activity} />
            <IPCEnhancedChart 
              title="Evolución del IPC"
              description="Selecciona el rango de tiempo, región y rubro para visualizar"
              height={450}
            />
          </div>
        </Suspense>
      </ErrorBoundary>

      {/* Client-rendered categories table */}
      <ErrorBoundary>
        <Suspense fallback={
          <div className="container mx-auto px-4 mb-16">
            <SectionHeader title="Rubros y categorías" icon={PieChart} />
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }>
          <div className="container mx-auto px-4 mb-16">
            <SectionHeader title="Rubros y categorías" icon={PieChart} />
            <IPCCategoriesTable 
              lastUpdate={data.latest?.date ? new Date(data.latest.date).toLocaleDateString() : ""}
            />
          </div>
        </Suspense>
      </ErrorBoundary>

      {/* Server-rendered static information */}
      <IPCInfo />
    </div>
  );
}