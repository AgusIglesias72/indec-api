// src/app/dolar/page.tsx
import { getAllDollarRates, getDollarHistoricalData } from '@/lib/db-queries';
import DollarPageClient from './DollarPageClient';
import { DollarType } from '@/types/dollar';

export const revalidate = 60; // Revalidate every 60 seconds

// Fetch all dollar data on the server
async function getDollarPageData() {
  try {
    // Get latest rates for all dollar types
    const latestRates = await getAllDollarRates();
    
    // Transform to the format expected by the client component
    const ratesMap: Record<string, any> = {};
    
    for (const rate of latestRates) {
      // Calculate variations if we have previous data
      const previousData = await getDollarHistoricalData(rate.dollar_type, 2);
      let buyVariation = 0;
      let sellVariation = 0;
      
      if (previousData.length >= 2) {
        const previous = previousData[previousData.length - 2];
        if (previous.buy_price && rate.buy_price) {
          buyVariation = ((rate.buy_price - previous.buy_price) / previous.buy_price) * 100;
        }
        if (previous.sell_price && rate.sell_price) {
          sellVariation = ((rate.sell_price - previous.sell_price) / previous.sell_price) * 100;
        }
      }
      
      // Calculate minutes ago
      const minutesAgo = rate.updated_at 
        ? Math.floor((Date.now() - new Date(rate.updated_at).getTime()) / (1000 * 60))
        : 0;
      
      ratesMap[rate.dollar_type] = {
        ...rate,
        buy_variation: buyVariation,
        sell_variation: sellVariation,
        minutes_ago: minutesAgo
      };
    }
    
    // Get historical data for the official dollar (for the chart)
    const historicalData = await getDollarHistoricalData('OFICIAL', 30);
    
    return {
      rates: ratesMap,
      historicalData,
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching dollar data:', error);
    return {
      rates: {},
      historicalData: [],
      lastUpdate: new Date().toISOString()
    };
  }
}

export default async function DollarPage() {
  const data = await getDollarPageData();
  
  return <DollarPageClient initialData={data} />;
}