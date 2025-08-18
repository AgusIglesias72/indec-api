// src/app/indicadores/riesgo-pais/page.tsx (Server Component)
import { getLatestRiskCountryData, getRiskCountryHistoricalData } from '@/lib/db-queries';
import RiskCountryPageClient from './RiskCountryPageClient';

export const revalidate = 60; // Revalidate every 60 seconds

async function getRiskCountryPageData() {
  try {
    // Fetch all risk country data in parallel
    const [latest, historical] = await Promise.all([
      getLatestRiskCountryData(),
      getRiskCountryHistoricalData(365) // 1 year of data
    ]);

    // Format data for the client component
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

export default async function RiskCountryPage() {
  const data = await getRiskCountryPageData();
  
  return <RiskCountryPageClient initialData={data} />;
}