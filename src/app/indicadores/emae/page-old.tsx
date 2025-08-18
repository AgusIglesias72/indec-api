// src/app/indicadores/emae/page.tsx (Server Component)
import { getLatestEMAEData, getEMAEHistoricalData, getEMAEBySectors } from '@/lib/db-queries';
import EMAEPageClient from './EMAEPageClient';

export const revalidate = 60; // Revalidate every 60 seconds

async function getEMAEPageData() {
  try {
    // Fetch all EMAE data in parallel
    const [latest, historical, sectors] = await Promise.all([
      getLatestEMAEData(),
      getEMAEHistoricalData(36), // 36 months of data
      getEMAEBySectors()
    ]);

    // Format data for the client component
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

export default async function EMAEPage() {
  const data = await getEMAEPageData();
  
  return <EMAEPageClient initialData={data} />;
}