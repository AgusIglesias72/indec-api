// src/app/page.tsx (Optimized Home Page)
import { Metadata } from 'next';
import { lazy, Suspense } from 'react';
import { homeMetadata } from '@/lib/metadata';
import EconomicMetricsSection from '@/components/KPI';

// Lazy load heavy components to improve initial page load
const APISection = lazy(() => import("@/components/landing/ApiSection"));
const Indicators = lazy(() => import("@/components/landing/Indicators"));
const EmploymentSection = lazy(() => import('@/components/landing/LaborMarket'));
const NetworkGraph = lazy(() => import('@/components/Newsletter'));

// Preload commented components for potential future use
// const HeaderHero = lazy(() => import("@/components/landing/HeaderHero"));
// const Stats = lazy(() => import("@/components/landing/Stats"));
// const DashboardFeature = lazy(() => import("@/components/landing/DashboardFeatures"));

export const metadata: Metadata = homeMetadata;

// Loading component for lazy-loaded sections
function SectionSkeleton({ height = "400px", title }: { height?: string; title?: string }) {
  return (
    <div className="container mx-auto px-4 py-12" style={{ minHeight: height }}>
      {title && (
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
        </div>
      )}
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative">
      {/* Main background pattern for the entire page */}
      <div 
          className="absolute inset-0 opacity-[0.85] pointer-events-none overflow-y-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>
      
      {/* Critical above-the-fold content loads immediately */}
      <EconomicMetricsSection />
      
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
  )
}