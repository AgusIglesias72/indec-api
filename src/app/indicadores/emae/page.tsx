'use client';
import React, { useState } from 'react';
import { 
  Calendar, 
  Filter, 
  Download, 
  Info, 
  LineChart, 
  BarChart, 
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CalendarRange
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from "@/components/ui/skeleton";
import DataMetric from '@/components/DataMetric';
import DotBackground from '@/components/DotBackground';
import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ReferenceArea } from 'recharts';
import { useAppData } from '@/lib/DataProvider';
import { useHistoricalEmaeData } from '@/hooks/useApiData';

// Activity sectors for the filter
const activitySectors = [
  { code: 'all', name: 'General (todos los sectores)' },
  { code: 'A', name: 'Agricultura, ganadería, caza y silvicultura' },
  { code: 'B', name: 'Pesca' },
  { code: 'C', name: 'Explotación de minas y canteras' },
  { code: 'D', name: 'Industria manufacturera' },
  { code: 'E', name: 'Electricidad, gas y agua' },
  { code: 'F', name: 'Construcción' },
  { code: 'G', name: 'Comercio mayorista, minorista y reparaciones' },
  { code: 'H', name: 'Hoteles y restaurantes' },
  { code: 'I', name: 'Transporte, almacenamiento y comunicaciones' },
  { code: 'J', name: 'Intermediación financiera' },
  { code: 'K', name: 'Actividades inmobiliarias, empresariales y de alquiler' },
];

// Para generar años y meses para los selectores
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 20; year--) {
    years.push(year);
  }
  return years;
};

const months = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

// Component para gráfico
const EmaeTimeSeriesChart = ({ data, loading, error, dateRange }: { data: any[], loading: boolean, error: boolean, dateRange: string }) => {
  // Filtrar datos según el rango seleccionado
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  // Encontrar los valores mínimo y máximo para el eje Y sin comenzar en cero
  const yDomain = React.useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [0, 100];
    
    const allValues = filteredData.flatMap((item: any) => [
      item.original_value, 
      item.seasonally_adjusted_value,
      item.cycle_trend_value || 0
    ]);
    
    // Restar 5% al mínimo y añadir 5% al máximo para tener margen visual
    const min = Math.floor(Math.min(...allValues) * 0.95);
    const max = Math.ceil(Math.max(...allValues) * 1.05);
    
    return [min, max];
  }, [filteredData]);

  // Función para formatear fechas en el eje X
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Usar toLocaleString para obtener el nombre del mes en español 
    const month = date.toLocaleString('es', { month: 'short' });
    const year = date.getFullYear();
    
    // Solo mostrar año si es enero
    if (date.getMonth() === 0) {
      return `${month} ${year}`;
    }
    return month;
  };

  // Componente para el tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: { active: boolean, payload: any[], label: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border border-indec-gray-medium rounded shadow-sm">
          <p className="font-medium">{formatDate(data.date)}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
              <span>{item.name}:</span>
              <span className="font-mono font-medium">{item.value?.toFixed(1) || 'N/D'}</span>
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };

  // Identificar períodos de recesión (ejemplo, en implementación real se usarían datos reales)
  const recessions = [
    { start: '2018-04-01', end: '2019-12-01', label: 'Recesión 2018-2019' },
    { start: '2020-03-01', end: '2020-11-01', label: 'Pandemia COVID-19' }
  ];

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }
  
  if (error || !data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-indec-gray-dark text-center">
          No se pudieron cargar los datos del EMAE
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={filteredData}
        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
          // Limitar número de ticks para evitar sobrecarga
          tickCount={Math.min(12, filteredData.length)}
        />
        <YAxis 
          domain={yDomain}
          tickFormatter={(value) => `${value.toFixed(0)}`}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
        />
        <RechartsTooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
        <Legend 
          wrapperStyle={{
            paddingTop: 15,
            fontSize: 12
          }}
        />
        
        
        {/* Las tres series de datos */}
        <Line 
          name="Serie Original" 
          type="monotone" 
          dataKey="original_value" 
          stroke="#005288" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line 
          name="Serie Desestacionalizada" 
          type="monotone" 
          dataKey="seasonally_adjusted_value" 
          stroke="#FF9F1C" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line 
          name="Tendencia-Ciclo" 
          type="monotone" 
          dataKey="cycle_trend_value" 
          stroke="#10893E" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default function EmaeDashboard() {
  // Get data from context and hooks
  const { 
    emaeData, 
    loadingEmae  } = useAppData();
  
  const { 
    data: historicalData, 
    loading: loadingHistorical, 
    error: errorHistorical 
  } = useHistoricalEmaeData();
  
  // State for filters
  const [sector, setSector] = useState('all');
  const [seriesType, setSeriesType] = useState('both');
  
  // New date range state with actual dates
  const currentDate = new Date();
  const [startDate, setStartDate] = useState({
    year: (currentDate.getFullYear() - 1).toString(),
    month: (currentDate.getMonth() + 1).toString().padStart(2, '0')
  });
  const [endDate, setEndDate] = useState({
    year: currentDate.getFullYear().toString(),
    month: (currentDate.getMonth() + 1).toString().padStart(2, '0')
  });
  
  // Format ISO date from year and month
  const formatDateString = (year: string, month: string) => {
    return `${year}-${month}-01`;
  };
  
  // Calculate the actual date range for filtering
  const dateRange = {
    start: formatDateString(startDate.year, startDate.month),
    end: formatDateString(endDate.year, endDate.month)
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      console.error("Error formateando fecha:", e);
      return dateString;
    }
  };

  // Filtrar datos según el rango de fechas seleccionado
  const filteredData = React.useMemo(() => {
    if (!historicalData) return [];
    
    return historicalData.filter(item => 
      new Date(item.date) >= new Date(dateRange.start) && 
      new Date(item.date) <= new Date(dateRange.end)
    );
  }, [historicalData, dateRange]);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section - Styled like main page hero */}
      <section className="relative bg-white text-indec-blue-dark pt-16 pb-16 md:pt-20 md:pb-20 overflow-y-visible overflow-x-clip">
        {/* Background elements */}
        <div className="hidden lg:block absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-indec-blue/20 -mr-96 -mt-96"></div>
        <div className="hidden lg:block absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-indec-blue/20 -ml-96 -mb-96"></div>
        
        {/* Dot pattern background */}
        <DotBackground className="opacity-[0.85]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-indec-blue/10 text-indec-blue text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>Indicador Económico Clave</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Estimador Mensual de
              <span className="block text-indec-blue">Actividad Económica</span>
            </h1>
            <p className="text-lg text-indec-gray-dark">
              El EMAE refleja la evolución mensual de la actividad económica de los sectores productivos a nivel 
              nacional, anticipando las tendencias del Producto Interno Bruto (PIB).
              Explore las series de datos, filtre por sector económico y analice las tendencias mes a mes.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button className="bg-indec-blue text-white hover:bg-indec-blue-dark rounded-full px-6">
              <LineChart className="mr-2 h-4 w-4" />
              Ver metodología
            </Button>
            <Button variant="outline" className="border-indec-blue text-indec-blue hover:bg-indec-blue/5 rounded-full px-6">
              <Download className="mr-2 h-4 w-4" />
              Descargar datos
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Section with Card Wrapper similar to DashboardPreview */}
      <div className="bg-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="relative w-full rounded-xl border border-indec-gray-medium shadow-lg overflow-hidden bg-white mb-8"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Dashboard Header */}
            <div className="flex items-center justify-between p-4 border-b border-indec-gray-medium">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-indec-blue flex items-center justify-center">
                  <LineChart className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-indec-blue-dark">Dashboard EMAE</span>
              </div>
              <div className="flex space-x-1">
                <div className="h-2.5 w-2.5 rounded-full bg-indec-gray-medium"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-indec-gray-medium"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-indec-gray-medium"></div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-4">
              {/* Filters and Controls */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Select value={sector} onValueChange={setSector}>
                      <SelectTrigger className="w-full sm:w-64">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Seleccionar sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {activitySectors.map(s => (
                          <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center border rounded-md p-1 bg-indec-gray-light/20">
                      <div className="flex items-center gap-1 px-2">
                        <CalendarRange className="h-4 w-4 text-indec-gray-dark" />
                        <span className="text-sm text-indec-gray-dark">Rango:</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          <span className="text-sm text-indec-gray-dark px-1">Desde</span>
                          <Select value={startDate.month} onValueChange={(value) => setStartDate({...startDate, month: value})}>
                            <SelectTrigger className="h-8 w-32 sm:w-28 text-xs border-0 focus:ring-0">
                              <SelectValue placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map(month => (
                                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={startDate.year} onValueChange={(value) => setStartDate({...startDate, year: value})}>
                            <SelectTrigger className="h-8 w-24 sm:w-20 text-xs border-0 focus:ring-0">
                              <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                              {generateYearOptions().map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-indec-gray-dark px-1">Hasta</span>
                        <div className="flex items-center">
                          <Select value={endDate.month} onValueChange={(value) => setEndDate({...endDate, month: value})}>
                            <SelectTrigger className="h-8 w-32 sm:w-28 text-xs border-0 focus:ring-0">
                              <SelectValue placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map(month => (
                                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={endDate.year} onValueChange={(value) => setEndDate({...endDate, year: value})}>
                            <SelectTrigger className="h-8 w-24 sm:w-20 text-xs border-0 focus:ring-0">
                              <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                              {generateYearOptions().map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar datos
                  </Button>
                </div>
              </div>

              {/* Series Type Toggle */}
              <div className="mb-6">
                <Tabs value={seriesType} onValueChange={setSeriesType} className="w-full max-w-md">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="original">Serie Original</TabsTrigger>
                    <TabsTrigger value="seasonal">Desestacionalizada</TabsTrigger>
                    <TabsTrigger value="both">Ambas Series</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Main Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                      Último período disponible
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Fecha del último dato disponible en la serie.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {loadingEmae ? (
                      <div className="h-7 w-40 bg-indec-gray-light/50 animate-pulse rounded"></div>
                    ) : (
                      <div className="text-xl font-bold text-indec-blue-dark">
                        {emaeData?.date ? formatDate(emaeData.date) : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                      Índice EMAE (Original)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Valor del índice en la serie original. Base 2004=100.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {loadingEmae ? (
                      <div className="h-7 w-24 bg-indec-gray-light/50 animate-pulse rounded"></div>
                    ) : (
                      <div className="text-xl font-bold text-indec-blue-dark">
                        {emaeData?.original_value.toFixed(1)}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                      Var. interanual
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Variación porcentual respecto al mismo mes del año anterior.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {loadingEmae ? (
                      <div className="h-7 w-28 bg-indec-gray-light/50 animate-pulse rounded"></div>
                    ) : (
                      <DataMetric 
                        label="" 
                        value={`${emaeData?.year_over_year_change.toFixed(1)}%`} 
                        trend={emaeData && emaeData.year_over_year_change >= 0 ? "up" : "down"} 
                        className="text-xl font-bold" 
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Chart */}
              <div className="h-[350px] relative mb-4">
                <EmaeTimeSeriesChart 
                  data={filteredData} 
                  loading={loadingHistorical} 
                  error={errorHistorical ? true : false} 
                  dateRange="custom"
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-indec-gray-dark mt-4 mb-2">
                <span>Fuente: Instituto Nacional de Estadística y Censos (INDEC)</span>
                <span>Base 2004 = 100</span>
              </div>
              
              {/* Bottom toolbar */}
              <div className="flex flex-wrap gap-2 pt-1 justify-center">
                <div className="rounded-md bg-indec-blue text-white text-xs px-3 py-1.5 flex items-center">
                  <span>General</span>
                </div>
                <div className="rounded-md bg-indec-gray-light text-indec-gray-dark text-xs px-3 py-1.5 flex items-center">
                  <span>Por Actividad</span>
                </div>
                <div className="rounded-md bg-indec-gray-light text-indec-gray-dark text-xs px-3 py-1.5 flex items-center">
                  <span>Análisis</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Additional Options */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button variant="outline" className="flex items-center">
              Análisis de tendencia
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center">
              Comparación sectorial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center">
              Pronósticos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>


      {/* Methodology Section */}
      <div className="bg-indec-gray-light/30 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-4">Acerca del EMAE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-indec-gray-dark mb-4">
                El Estimador Mensual de Actividad Económica (EMAE) es un indicador de coyuntura que permite anticipar 
                las tasas de variación del Producto Interno Bruto (PIB). Su objetivo es proporcionar una pauta del 
                comportamiento de la actividad económica real con una frecuencia mayor a la del PIB trimestral.
              </p>
              <p className="text-indec-gray-dark">
                El indicador se elabora mediante la agregación ponderada de los índices que corresponden a los sectores
                productivos. Estos índices se calculan con las fuentes de información disponibles mensualmente,
                siguiendo el método de extrapolación del valor agregado por sector de actividad económica.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-indec-blue-dark mb-2">Series disponibles</h3>
              <ul className="list-disc list-inside space-y-2 text-indec-gray-dark mb-4">
                <li><span className="font-medium">Serie original:</span> Refleja los valores reales registrados mes a mes.</li>
                <li><span className="font-medium">Serie desestacionalizada:</span> Elimina los efectos estacionales para permitir comparaciones más precisas entre períodos consecutivos.</li>
                <li><span className="font-medium">Serie tendencia-ciclo:</span> Muestra la tendencia a largo plazo, eliminando variaciones estacionales y componentes irregulares.</li>
              </ul>
              <Button className="bg-indec-blue text-white hover:bg-indec-blue-dark">
                Ver metodología completa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}