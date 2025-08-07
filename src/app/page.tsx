// src/app/page.tsx (Optimized Home Page)
import { Metadata } from 'next';
import { lazy, Suspense } from 'react';
import { homeMetadata } from '@/lib/metadata';
import OptimizedKPI from '@/components/OptimizedKPI';
import { getKPIDataFromDB, fallbackKPIData } from '@/lib/kpi-db-queries';
import { CriticalStructuredData } from '@/components/StructuredData';
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData';
import PreloadResources, { homePagePreloads } from '@/components/PreloadResources';

// Lazy load heavy components to improve initial page load
// Dollar Converter gets priority preloading since it's high-conversion
const DollarConverterSection = lazy(() => 
  import('@/components/landing/DollarConverterSection').then(module => {
    // Preload dollar API data
    if (typeof window !== 'undefined') {
      fetch('/api/dollar?type=latest').catch(() => {});
    }
    return module;
  })
);

const InflationCalculatorSection = lazy(() => 
  import('@/components/landing/InflationCalculatorSection').then(module => {
    // Preload CER API data
    if (typeof window !== 'undefined') {
      fetch('/api/cer?type=latest').catch(() => {});
    }
    return module;
  })
);

const RiskCountryPromoSection = lazy(() => import('@/components/landing/RiskCountryPromoSection'));
const IPCPromoSection = lazy(() => import('@/components/landing/IPCPromoSection'));
const PovertyPromoSection = lazy(() => import('@/components/landing/PovertyPromoSection'));
const APISection = lazy(() => import("@/components/landing/ApiSection"));
const Indicators = lazy(() => import("@/components/landing/Indicators"));
const EmploymentSection = lazy(() => import('@/components/landing/LaborMarket'));
const NetworkGraph = lazy(() => import('@/components/Newsletter'));

// Preload commented components for potential future use
// const HeaderHero = lazy(() => import("@/components/landing/HeaderHero"));
// const Stats = lazy(() => import("@/components/landing/Stats"));
// const DashboardFeature = lazy(() => import("@/components/landing/DashboardFeatures"));

export const metadata: Metadata = homeMetadata;

// Cache de 1 minuto para datos dinámicos
export const revalidate = 60;

// Optimized loading component for lazy-loaded sections
function SectionSkeleton({ height = "400px", title }: { height?: string; title?: string }) {
  return (
    <section className="relative py-12 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12" style={{ minHeight: height }}>
          {title && (
            <div className="text-center mb-8">
              <div className="h-6 bg-gray-300 rounded-full w-48 mx-auto animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-full w-32 mx-auto animate-pulse"></div>
            </div>
          )}
          <div className="animate-pulse space-y-6">
            <div className="h-3 bg-gray-200 rounded-full w-3/4 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded-full w-1/2 mx-auto"></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <div className="h-48 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="h-24 bg-gray-100 rounded"></div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="h-24 bg-gray-100 rounded"></div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="h-24 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  // Critical structured data for SEO
  const criticalSchemas = [OrganizationSchema, WebsiteSchema];
  
  // Obtener datos KPI directamente de la base de datos
  let kpiData;
  try {
    kpiData = await getKPIDataFromDB();
    
    // Si algún campo es null, usar fallback
    if (!kpiData.emae || !kpiData.ipc || !kpiData.dollar || !kpiData.riskCountry) {
      kpiData = { ...fallbackKPIData, ...kpiData };
    }
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    kpiData = fallbackKPIData;
  }
  
  return (
    <>
      {/* Preload critical resources for better Core Web Vitals */}
      <PreloadResources resources={homePagePreloads} />
      
      {/* Critical SEO structured data */}
      <CriticalStructuredData schemas={criticalSchemas} />
      
      <div className="relative">
        {/* Main background pattern for the entire page */}
        <div 
            className="absolute inset-0 opacity-[0.85] pointer-events-none overflow-y-hidden"
            style={{
              backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          ></div>
        
        {/* Critical above-the-fold content loads immediately with DB data */}
        <OptimizedKPI data={kpiData} />
      
      {/* Dollar Converter Section - High engagement feature */}
      <Suspense fallback={<SectionSkeleton height="800px" title="Conversor de Divisas" />}>
        <DollarConverterSection />
      </Suspense>
      
      {/* Inflation Calculator Section - New feature showcase */}
      <Suspense fallback={<SectionSkeleton height="800px" title="Calculadora de Inflación" />}>
        <InflationCalculatorSection />
      </Suspense>
      
      {/* Risk Country Promotion Section - API advantage showcase */}
      <Suspense fallback={<SectionSkeleton height="600px" title="Riesgo País" />}>
        <RiskCountryPromoSection />
      </Suspense>
      
      {/* IPC Promotion Section - Inflation analysis showcase */}
      <Suspense fallback={<SectionSkeleton height="600px" title="IPC - Índice de Precios" />}>
        <IPCPromoSection />
      </Suspense>
      
      {/* Poverty Promotion Section - Social indicators showcase */}
      <Suspense fallback={<SectionSkeleton height="600px" title="Pobreza e Indigencia" />}>
        <PovertyPromoSection />
      </Suspense>
      
      {/* Heavy components are lazy loaded with professional skeletons */}
      <Suspense fallback={<SectionSkeleton height="500px" title="Mercado Laboral" />}>
        <EmploymentSection />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton height="400px" title="API Documentation" />}>
        <APISection />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton height="600px" title="Indicadores Económicos" />}>
        <Indicators />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton height="300px" />}>
        <NetworkGraph />
      </Suspense>
      </div>
    </>
  )
}