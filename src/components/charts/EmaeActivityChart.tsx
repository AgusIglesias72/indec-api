import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Scatter,
  BarChart
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tipo de datos que espera el componente
interface EmaeActivityChartProps {
  activity: string; // Código de actividad económica, 'all' para todas
  dateRange: string; // '1Y', '2Y', '5Y', '10Y', 'ALL'
}

// Estas interfaces serían reemplazadas por tipos concretos de la API
interface ActivityData {
  date: string;
  value: number;
  year_over_year_change: number;
}

interface SectorComparison {
  sector_code: string;
  sector_name: string;
  latest_value: number;
  year_over_year_change: number;
}

// Función para formatear fecha (YYYY-MM-DD a MMM YYYY)
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const month = date.toLocaleString('es', { month: 'short' });
  const year = date.getFullYear();
  
  // Solo mostrar año si es enero o si dateRange es más de 5 años
  if (date.getMonth() === 0) {
    return `${month} ${year}`;
  }
  return month;
};

// Componente para renderizar el CustomTooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-indec-gray-medium rounded shadow-sm">
        <p className="font-medium">{formatDate(data.date)}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm flex items-center gap-1">
            <span 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: item.fill || item.color }}
            ></span>
            <span>{item.name}:</span>
            <span className="font-mono font-medium">
              {item.dataKey === 'year_over_year_change' 
                ? `${item.value >= 0 ? '+' : ''}${item.value?.toFixed(1)}%` 
                : item.value?.toFixed(1)}
            </span>
          </p>
        ))}
      </div>
    );
  }
  
  return null;
};

// Componente para el tooltip de comparación sectorial
const ComparisonTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-indec-gray-medium rounded shadow-sm">
        <p className="font-medium">{data.sector_name}</p>
        <p className="text-sm flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-indec-blue"></span>
          <span>Valor:</span>
          <span className="font-mono font-medium">{data.latest_value?.toFixed(1)}</span>
        </p>
        <p className="text-sm flex items-center gap-1">
          <span className={`w-3 h-3 rounded-sm ${data.year_over_year_change >= 0 ? 'bg-indec-green' : 'bg-indec-red'}`}></span>
          <span>Var. i/a:</span>
          <span className="font-mono font-medium">
            {`${data.year_over_year_change >= 0 ? '+' : ''}${data.year_over_year_change?.toFixed(1)}%`}
          </span>
        </p>
      </div>
    );
  }
  
  return null;
};

const EmaeActivityChart = ({ activity, dateRange }: EmaeActivityChartProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [sectorComparisons, setSectorComparisons] = useState<SectorComparison[]>([]);
  
  // Efecto para simular la carga de datos desde la API
  useEffect(() => {
    setLoading(true);
    
    // Simular retardo de API
    const timer = setTimeout(() => {
      try {
        // Generar datos simulados para la serie histórica
        // En la implementación real, estos datos vendrían de la API
        const today = new Date();
        const startDate = new Date();
        
        switch (dateRange) {
          case '1Y': startDate.setFullYear(today.getFullYear() - 1); break;
          case '2Y': startDate.setFullYear(today.getFullYear() - 2); break;
          case '5Y': startDate.setFullYear(today.getFullYear() - 5); break;
          case '10Y': startDate.setFullYear(today.getFullYear() - 10); break;
          default: startDate.setFullYear(today.getFullYear() - 10); // ALL
        }
        
        // Generar datos mensuales desde startDate hasta hoy
        const simulatedData: ActivityData[] = [];
        const currentDate = new Date(startDate);
        
        // Valores base y tendencias según sector
        let baseValue = 100;
        let trendFactor = 0.3; // tendencia positiva por defecto
        
        // Ajustar valores base y tendencias según sector seleccionado
        if (activity !== 'all') {
          // Personalizar según sector
          switch (activity) {
            case 'A': // Agricultura
              baseValue = 120;
              trendFactor = 0.2;
              break;
            case 'C': // Minería
              baseValue = 90;
              trendFactor = 0.4;
              break;
            case 'D': // Industria
              baseValue = 110;
              trendFactor = -0.1; // tendencia negativa
              break;
            case 'F': // Construcción
              baseValue = 95;
              trendFactor = -0.2; // tendencia negativa más fuerte
              break;
            default:
              baseValue = 100 + (activity.charCodeAt(0) % 20); // Valor aleatorio pero consistente
              trendFactor = (activity.charCodeAt(0) % 10 - 5) / 10; // Entre -0.5 y 0.4
          }
        }
        
        while (currentDate <= today) {
          // Añadir algo de variación aleatoria y estacionalidad
          const monthFactor = 1 + Math.sin(currentDate.getMonth() / 11 * Math.PI) * 0.03; // Estacionalidad
          const randomFactor = 1 + (Math.random() - 0.5) * 0.06; // Variación aleatoria ±3%
          
          // Calcular tendencia acumulada desde el inicio
          const monthsFromStart = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                 (currentDate.getMonth() - startDate.getMonth());
          const trendComponent = 1 + (trendFactor * monthsFromStart / 12); // Tendencia anual
          
          // Combinar factores
          const value = baseValue * monthFactor * randomFactor * trendComponent;
          
          // Calcular cambio interanual simulado
          const lastYear = new Date(currentDate);
          lastYear.setFullYear(lastYear.getFullYear() - 1);
          
          // Calcular cambio interanual con algo de ruido
          const yearOverYearChange = trendFactor * 100 + (Math.random() - 0.5) * 5;
          
          simulatedData.push({
            date: currentDate.toISOString().split('T')[0],
            value: parseFloat(value.toFixed(1)),
            year_over_year_change: parseFloat(yearOverYearChange.toFixed(1))
          });
          
          // Avanzar al siguiente mes
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        // Generar datos para comparación de sectores
        const sectorCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        const sectorNames = [
          'Agricultura, ganadería, caza y silvicultura',
          'Pesca',
          'Explotación de minas y canteras',
          'Industria manufacturera',
          'Electricidad, gas y agua',
          'Construcción',
          'Comercio mayorista, minorista y reparaciones',
          'Hoteles y restaurantes',
          'Transporte, almacenamiento y comunicaciones',
          'Intermediación financiera',
          'Actividades inmobiliarias, empresariales y de alquiler',
          'Administración pública y defensa'
        ];
        
        const comparisonData: SectorComparison[] = sectorCodes.map((code, index) => {
          // Generar valores simulados para cada sector
          const baseVal = 80 + Math.random() * 40;
          const change = (Math.random() - 0.4) * 12; // Tendencia a cambios negativos
          
          return {
            sector_code: code,
            sector_name: sectorNames[index] || `Sector ${code}`,
            latest_value: parseFloat(baseVal.toFixed(1)),
            year_over_year_change: parseFloat(change.toFixed(1))
          };
        });
        
        // Ordenar por cambio interanual (de mayor a menor)
        comparisonData.sort((a, b) => b.year_over_year_change - a.year_over_year_change);
        
        setActivityData(simulatedData);
        setSectorComparisons(comparisonData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }, 800); // Simular retardo de 800ms
    
    return () => clearTimeout(timer);
  }, [activity, dateRange]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-indec-gray-dark text-center">
          Error al cargar datos: {error.message}
        </p>
      </div>
    );
  }

  if (activity === 'all') {
    // Si no hay un sector específico seleccionado, mostrar comparativa de sectores
    return (
      <Tabs defaultValue="performance" className="h-full">
        <TabsList className="mb-4">
          <TabsTrigger value="performance">Desempeño por sector</TabsTrigger>
          <TabsTrigger value="ranking">Ranking sectorial</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="h-[calc(100%-40px)]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sectorComparisons}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number"
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <YAxis 
                dataKey="sector_name" 
                type="category" 
                tick={{ fontSize: 11 }}
                width={180}
              />
              <Tooltip content={<ComparisonTooltip />} />
              <Legend />
              <Bar 
                name="Variación interanual" 
                dataKey="year_over_year_change" 
                fill={((entry: { year_over_year_change: number }) => entry.year_over_year_change >= 0 ? '#10893E' : '#D10A10').toString()}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="ranking" className="h-[calc(100%-40px)]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sectorComparisons}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis 
                dataKey="sector_name" 
                type="category" 
                tick={{ fontSize: 11 }}
                width={180}
              />
              <Tooltip content={<ComparisonTooltip />} />
              <Legend />
              <Bar 
                name="Índice sectorial" 
                dataKey="latest_value" 
                fill="#005288"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    );
  }

  // Mostrar gráfico detallado para un sector específico
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={activityData}
        margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
          tickCount={12}
        />
        <YAxis 
          yAxisId="left"
          tickFormatter={(value) => `${value.toFixed(0)}`}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `${value.toFixed(1)}%`}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{
            paddingTop: 15,
            fontSize: 12
          }}
        />
        <Line 
          name="Valor índice" 
          type="monotone" 
          dataKey="value" 
          stroke="#005288" 
          yAxisId="left"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Bar 
          name="Var. interanual" 
          dataKey="year_over_year_change" 
          yAxisId="right"
          fill={((entry: { year_over_year_change: number }) => entry.year_over_year_change >= 0 ? '#10893E' : '#D10A10').toString()}
          opacity={0.6}
          radius={[2, 2, 0, 0]}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default EmaeActivityChart;