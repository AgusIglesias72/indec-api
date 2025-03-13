export interface SectorData {
    value: number;
    monthly_pct_change: number;
    yearly_pct_change: number;
    weight: number;
  }
  
  export interface SectorHistoricalData {
    date: string;
    sectors: {
      [key: string]: SectorData;
    };
  }
  