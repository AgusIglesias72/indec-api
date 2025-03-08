import { useState, useEffect } from 'react';

export interface SectorActivity {
  sector_name: string;
  sector_code: string;
  year_over_year_change: number;
  original_value: number;
  date: string;
}

interface SectorDataResult {
  data: SectorActivity[];
  loading: boolean;
  error: Error | null;
  latestDate: string | null;
  latestMonth: number | null;
  latestYear: number | null;
  refetch: () => Promise<void>;
}

export function useSectorData(): SectorDataResult {
  const [data, setData] = useState<SectorActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [latestDate, setLatestDate] = useState<string | null>(null);
  const [latestMonth, setLatestMonth] = useState<number | null>(null);
  const [latestYear, setLatestYear] = useState<number | null>(null);

  const fetchSectorData = async () => {
    try {
      setLoading(true);
      
      // Primero obtenemos metadatos para saber cuál es el último mes disponible
      const metadataResponse = await fetch('/api/emae/metadata');
      if (!metadataResponse.ok) {
        throw new Error(`Error ${metadataResponse.status}: ${metadataResponse.statusText}`);
      }
      
      const metadataResult = await metadataResponse.json();
      const lastDate = metadataResult.date_range?.last_date;
      
      if (lastDate) {
        setLatestDate(lastDate);
        
        // Extraer mes y año del último dato disponible
        const dateObj = new Date(lastDate);
        const month = dateObj.getMonth() + 1; // getMonth() devuelve 0-11
        const year = dateObj.getFullYear();
        
        setLatestMonth(month);
        setLatestYear(year);
        
        // Ahora obtenemos los datos de sectores específicamente para ese mes/año
        const response = await fetch(`/api/emae/sectors?month=${month}&year=${year}&limit=20&include_variations=true`);

        console.log(response);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('Formato de respuesta inesperado');
        }
        
        // Transformar datos
        const formattedData: SectorActivity[] = result.data.map((item: any) => ({
          economy_sector: item.economy_sector,
          economy_sector_code: item.economy_sector_code,
          year_over_year_change: item.year_over_year_change || 0,
          original_value: item.original_value || 0,
          date: item.date
        }));
        
        setData(formattedData);
        setError(null);
      } else {
        throw new Error('No se pudo determinar el último mes disponible');
      }
    } catch (err) {
      console.error('Error fetching sector data:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
      
      // Datos simulados en caso de error
      const mockData: SectorActivity[] = [
        { sector_name: 'Agricultura, ganadería, caza y silvicultura', sector_code: 'A', year_over_year_change: 4.5, original_value: 120.5, date: '2024-02-01' },
        { sector_name: 'Pesca', sector_code: 'B', year_over_year_change: -2.3, original_value: 95.8, date: '2024-02-01' },
        { sector_name: 'Explotación de minas y canteras', sector_code: 'C', year_over_year_change: 6.2, original_value: 130.2, date: '2024-02-01' },
        { sector_name: 'Industria manufacturera', sector_code: 'D', year_over_year_change: -1.5, original_value: 115.3, date: '2024-02-01' },
        { sector_name: 'Electricidad, gas y agua', sector_code: 'E', year_over_year_change: 3.8, original_value: 125.9, date: '2024-02-01' },
        { sector_name: 'Construcción', sector_code: 'F', year_over_year_change: -4.7, original_value: 90.4, date: '2024-02-01' },
        { sector_name: 'Comercio', sector_code: 'G', year_over_year_change: 2.5, original_value: 118.7, date: '2024-02-01' },
      ];
      
      setData(mockData);
      
      // En caso de error, establecer una fecha por defecto
      if (!latestDate) {
        setLatestDate('2024-02-01');
        setLatestMonth(2);
        setLatestYear(2024);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargamos los datos cuando se monta el componente
  useEffect(() => {
    fetchSectorData();
  }, []);

  return { 
    data, 
    loading, 
    error, 
    latestDate, 
    latestMonth, 
    latestYear,
    refetch: fetchSectorData  // Exponemos la función para recargar datos
  };
}