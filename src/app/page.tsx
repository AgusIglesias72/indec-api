// src/app/page.tsx (Optimized Home Page)
import { Metadata } from 'next';
import React from 'react';
import { homeMetadata } from '@/lib/metadata';
import OptimizedKPI from '@/components/OptimizedKPI';
import { getKPIDataFromDB, fallbackKPIData } from '@/lib/kpi-db-queries';
import { CriticalStructuredData } from '@/components/StructuredData';
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData';
import PreloadResources, { homePagePreloads } from '@/components/PreloadResources';

// Import components
import DollarConverterSection from '@/components/landing/DollarConverterSection';
import InflationCalculatorSection from '@/components/landing/InflationCalculatorSection';

import RiskCountryPromoSection from '@/components/landing/RiskCountryPromoSection';
import IPCPromoSection from '@/components/landing/IPCPromoSection';
import PovertyPromoSection from '@/components/landing/PovertyPromoSection';
import APISection from '@/components/landing/ApiSection';
import NetworkGraph from '@/components/Newsletter';

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
      <DollarConverterSection />
      
      {/* Inflation Calculator Section - New feature showcase */}
      <InflationCalculatorSection />
      
      {/* Risk Country Promotion Section - API advantage showcase */}
      <RiskCountryPromoSection />
      
      {/* IPC Promotion Section - Inflation analysis showcase */}
      <IPCPromoSection />
      
      {/* Poverty Promotion Section - Social indicators showcase */}
      <PovertyPromoSection />
      
      {/* Heavy components are lazy loaded with professional skeletons */}
      {/* Employment section removed from landing */}
      {/* <Suspense fallback={<SectionSkeleton height="500px" title="Mercado Laboral" />}>
        <EmploymentSection />
      </Suspense> */}
      
      <APISection />
      
      {/* Indicators section removed from landing */}
      {/* <Suspense fallback={<SectionSkeleton height="600px" title="Indicadores Económicos" />}>
        <Indicators />
      </Suspense> */}
      
      <NetworkGraph />
      </div>
    </>
  )
}