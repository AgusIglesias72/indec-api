import { useState, useEffect } from 'react';

export interface SectorActivity {
  sector_name: string;
  sector_code: string;
  year_over_year_change: number;
  original_value: number;
  date: string;
}

export function useSectorData() {
  const [data, setData] = useState<SectorActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener la fecha actual y calcular la fecha de hace un año
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        // Formatear fechas para la consulta (YYYY-MM-DD)
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          return `${year}-${month}-01`; // Primer día del mes
        };
        
        // Llamada a la API para obtener los datos más recientes por sector
        const response = await fetch('/api/emae/sectors?limit=20');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('Formato de respuesta inesperado');
        }
        
        // Transformar y filtrar los datos
        // Agrupar por sector y quedarse con el dato más reciente por sector
        const latestBySector = new Map<string, any>();
        
        // Ordenar por fecha descendente para tener primero los más recientes
        const sortedData = [...result.data].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Quedarse con el más reciente de cada sector
        sortedData.forEach(item => {
          if (!latestBySector.has(item.economy_sector_code)) {
            latestBySector.set(item.economy_sector_code, item);
          }
        });
        
        // Convertir al formato que esperamos
        const formattedData: SectorActivity[] = Array.from(latestBySector.values()).map(item => ({
          sector_name: item.economy_sector,
          sector_code: item.economy_sector_code,
          year_over_year_change: item.year_over_year_change || 0, // Asumiendo que viene de la API, si no, calcularlo
          original_value: item.original_value,
          date: item.date
        }));
        
        setData(formattedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching sector data:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        
        // Datos simulados en caso de error para desarrollo
        const mockData = [
          { sector_name: 'Agricultura, ganadería, caza y silvicultura', sector_code: 'A', year_over_year_change: 4.5, original_value: 120.5, date: '2024-02-01' },
          { sector_name: 'Pesca', sector_code: 'B', year_over_year_change: -2.3, original_value: 95.8, date: '2024-02-01' },
          { sector_name: 'Explotación de minas y canteras', sector_code: 'C', year_over_year_change: 6.2, original_value: 130.2, date: '2024-02-01' },
          { sector_name: 'Industria manufacturera', sector_code: 'D', year_over_year_change: -1.5, original_value: 115.3, date: '2024-02-01' },
          { sector_name: 'Electricidad, gas y agua', sector_code: 'E', year_over_year_change: 3.8, original_value: 125.9, date: '2024-02-01' },
          { sector_name: 'Construcción', sector_code: 'F', year_over_year_change: -4.7, original_value: 90.4, date: '2024-02-01' },
          { sector_name: 'Comercio', sector_code: 'G', year_over_year_change: 2.5, original_value: 118.7, date: '2024-02-01' },
        ];
        
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}