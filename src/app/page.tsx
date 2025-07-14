// src/app/page.tsx (Home Page)
import { Metadata } from 'next';
import { homeMetadata } from '@/lib/metadata';
import HeaderHero from "@/components/landing/HeaderHero";
import Stats from "@/components/landing/Stats";
import Indicators from "@/components/landing/Indicators";
import DashboardFeature from "@/components/landing/DashboardFeatures";
import APISection from "@/components/landing/ApiSection";
import EconomicMetricsSection from '@/components/KPI';
import EmploymentSection from '@/components/landing/LaborMarket';
import NetworkGraph from '@/components/Newsletter';

export const metadata: Metadata = homeMetadata;

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
      
      {/* <HeaderHero /> */}
      <EconomicMetricsSection />
      <EmploymentSection />
      {/* <DashboardFeature /> */}
      <APISection />
      <Indicators />
      <NetworkGraph />

       {/* <Features /> */}
    </div>
  )
}