// src/app/indicadores/ipc/page.tsx (Server Component)
import { getLatestIPCData, getIPCHistoricalData, getIPCByCategories } from '@/lib/db-queries';
import IPCPageClient from './IPCPageClient';

export const revalidate = 60; // Revalidate every 60 seconds

async function getIPCPageData() {
  try {
    // Fetch all IPC data in parallel
    const [latest, historical, categories] = await Promise.all([
      getLatestIPCData(),
      getIPCHistoricalData(24), // 24 months of data
      getIPCByCategories()
    ]);

    // Format data for the client component
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

export default async function IPCPage() {
  const data = await getIPCPageData();
  
  return <IPCPageClient initialData={data} />;
}