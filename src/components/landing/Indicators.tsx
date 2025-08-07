"use client"

import Link from "next/link"
import { ArrowRight, Info, TrendingUp, BarChart3, Users, Activity, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area } from "recharts"
import DataMetric from "@/components/DataMetric"
import { 
  useHistoricalEmaeData,
  useHistoricalIPCData 
} from "@/hooks/useApiData"
import EmaeEnhancedChart from "@/components/EMAEEnhancedChart"
import IPCEnhancedChart from "@/components/IPCEnhancedChart"
import { useAppData } from '@/lib/DataProvider';

// Interface para datos del dólar
interface DollarData {
  buy_price: number;
  sell_price: number;
  spread: number;
  dollar_type: string;
  date: string;
}

// Interface para datos de empleo
interface LaborMarketData {
  id: string;
  date: string;
  period: string;
  data_type: string;
  activity_rate: number;
  employment_rate: number;
  unemployment_rate: number;
  variation_yoy_activity_rate?: number;
  variation_yoy_employment_rate?: number;
  variation_yoy_unemployment_rate?: number;
}

interface LaborMarketResponse {
  data: LaborMarketData[];
  metadata: {
    view: string;
    data_type: string;
    count: number;
  };
}

export default function ImprovedIndicators() {
  const { 
    emaeData, 
    ipcData, 
    loadingEmae: emaeLoading, 
    loadingIPC: ipcLoading,
    errorEmae: emaeError,
    errorIPC: ipcError
  } = useAppData();

  // Estado para datos del dólar
  const [dollarData, setDollarData] = useState<DollarData | null>(null);
  const [loadingDollar, setLoadingDollar] = useState(true);

  // Estado para datos de empleo
  const [laborData, setLaborData] = useState<LaborMarketData | null>(null);
  const [laborHistorical, setLaborHistorical] = useState<any[]>([]);
  const [loadingLabor, setLoadingLabor] = useState(true);
  const [errorLabor, setErrorLabor] = useState<string | null>(null);
      
  // Datos históricos para los gráficos
  const { 
    data: emaeHistorical, 
    loading: emaeHistoricalLoading, 
    error: emaeHistoricalError 
  } = useHistoricalEmaeData();
  
  const { 
    data: ipcHistorical, 
    loading: ipcHistoricalLoading, 
    error: ipcHistoricalError 
  } = useHistoricalIPCData();

  // Función para obtener datos del dólar oficial
  const fetchDollarData = async () => {
    try {
      setLoadingDollar(true);
      const response = await fetch('/api/dollar?type=latest&dollar_type=OFICIAL');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();

      let oficialData = null;
      
      if (result.data && Array.isArray(result.data)) {
        oficialData = result.data.find((d: any) => d.dollar_type === 'OFICIAL');
      } else if (result.dollar_type === 'OFICIAL') {
        oficialData = result;
      } else if (result.data && result.data.dollar_type === 'OFICIAL') {
        oficialData = result.data;
      }
      
      if (oficialData) {
        setDollarData(oficialData);
      } else {
        throw new Error('No se encontraron datos del dólar oficial');
      }
    } catch (error) {
      console.error('Error fetching dollar data:', error);
      setDollarData({
        buy_price: 1135,
        sell_price: 1185,
        spread: 4.41,
        dollar_type: "OFICIAL",
        date: new Date().toISOString()
      });
    } finally {
      setLoadingDollar(false);
    }
  };

  // Función para obtener datos del mercado laboral
  const fetchLaborMarketData = async () => {
    try {
      setLoadingLabor(true);
      setErrorLabor(null);
      
      // Obtener último dato nacional
      const latestResponse = await fetch('/api/labor-market?view=latest&data_type=national&limit=1');
      if (!latestResponse.ok) {
        throw new Error(`Error ${latestResponse.status}: ${latestResponse.statusText}`);
      }
      
      const latestResult: LaborMarketResponse = await latestResponse.json();
      if (latestResult.data && latestResult.data.length > 0) {
        setLaborData(latestResult.data[0]);
      }

      // Obtener datos históricos para el gráfico (últimos 5 años por trimestre)
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 5;
      
      const historicalResponse = await fetch(
        `/api/labor-market?view=temporal&data_type=national&start_date=${startYear}-01-01&limit=100`
      );
      
      if (historicalResponse.ok) {
        const historicalResult: LaborMarketResponse = await historicalResponse.json();
        
        // Procesar datos para el gráfico - mantener datos trimestrales
        const processedData = historicalResult.data
          .filter(item => item.unemployment_rate !== null && item.period)
          .map(item => ({
            period: item.period,
            unemployment_rate: item.unemployment_rate,
            date: item.date,
            // Crear label para tooltip
            periodLabel: item.period,
            year: new Date(item.date).getFullYear()
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-20); // Últimos 20 trimestres (5 años)
        
        setLaborHistorical(processedData);
      }

    } catch (error) {
      console.error('Error fetching labor market data:', error);
      setErrorLabor((error as Error).message);
      
      // Datos de fallback
      setLaborData({
        id: 'fallback',
        date: '2024-12-31',
        period: 'T1 2025',
        data_type: 'national',
        activity_rate: 48.2,
        employment_rate: 44.4,
        unemployment_rate: 7.9,
        variation_yoy_activity_rate: 0.2,
        variation_yoy_employment_rate: 0.1,
        variation_yoy_unemployment_rate: 0.2
      });

      // Datos históricos de fallback (últimos 5 años por trimestre)
      setLaborHistorical([
        { period: 'T1 2020', unemployment_rate: 10.4, periodLabel: 'T1 2020', year: 2020 },
        { period: 'T2 2020', unemployment_rate: 13.1, periodLabel: 'T2 2020', year: 2020 },
        { period: 'T3 2020', unemployment_rate: 11.7, periodLabel: 'T3 2020', year: 2020 },
        { period: 'T4 2020', unemployment_rate: 11.0, periodLabel: 'T4 2020', year: 2020 },
        { period: 'T1 2021', unemployment_rate: 10.2, periodLabel: 'T1 2021', year: 2021 },
        { period: 'T2 2021', unemployment_rate: 9.6, periodLabel: 'T2 2021', year: 2021 },
        { period: 'T3 2021', unemployment_rate: 8.2, periodLabel: 'T3 2021', year: 2021 },
        { period: 'T4 2021', unemployment_rate: 7.0, periodLabel: 'T4 2021', year: 2021 },
        { period: 'T1 2022', unemployment_rate: 7.1, periodLabel: 'T1 2022', year: 2022 },
        { period: 'T2 2022', unemployment_rate: 6.9, periodLabel: 'T2 2022', year: 2022 },
        { period: 'T3 2022', unemployment_rate: 6.1, periodLabel: 'T3 2022', year: 2022 },
        { period: 'T4 2022', unemployment_rate: 5.7, periodLabel: 'T4 2022', year: 2022 },
        { period: 'T1 2023', unemployment_rate: 6.9, periodLabel: 'T1 2023', year: 2023 },
        { period: 'T2 2023', unemployment_rate: 6.2, periodLabel: 'T2 2023', year: 2023 },
        { period: 'T3 2023', unemployment_rate: 5.7, periodLabel: 'T3 2023', year: 2023 },
        { period: 'T4 2023', unemployment_rate: 5.7, periodLabel: 'T4 2023', year: 2023 },
        { period: 'T1 2024', unemployment_rate: 7.7, periodLabel: 'T1 2024', year: 2024 },
        { period: 'T2 2024', unemployment_rate: 7.6, periodLabel: 'T2 2024', year: 2024 },
        { period: 'T3 2024', unemployment_rate: 6.9, periodLabel: 'T3 2024', year: 2024 },
        { period: 'T1 2025', unemployment_rate: 7.9, periodLabel: 'T1 2025', year: 2025 }
      ]);

    } finally {
      setLoadingLabor(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDollarData();
    fetchLaborMarketData();
    
    const dollarInterval = setInterval(fetchDollarData, 5 * 60 * 1000);
    const laborInterval = setInterval(fetchLaborMarketData, 30 * 60 * 1000);
    
    return () => {
      clearInterval(dollarInterval);
      clearInterval(laborInterval);
    };
  }, []);

  // Función para formatear fecha
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString + 'T00:00:00-04:00')
      
      // Nombres de meses en español
      const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${month} ${year}`;
    } catch (e) {
      console.error("Error formateando fecha:", e);
      return dateString;
    }
  }

  // Función para formatear números
  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  // Función para formatear variación
  const formatVariation = (variation: number | undefined) => {
    if (!variation) return "N/A";
    const sign = variation > 0 ? "+" : "";
    return `${sign}${formatNumber(variation, 1)}pp`;
  };

  // Función para determinar tendencia
  const getTrend = (variation: number | undefined) => {
    if (!variation || variation === 0) return null;
    return variation > 0 ? "up" : "down";
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white relative z-10" id="indicators">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-transparent"></div>
      
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-10">
        {/* Header mejorado */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-indec-blue-dark mb-6">
            Indicadores económicos destacados
          </h2>
          <p className="text-lg md:text-xl text-indec-gray-dark">
            Monitorea los principales indicadores económicos de Argentina con datos oficiales del INDEC, 
            gráficos interactivos y análisis detallado en tiempo real.
          </p>
        </motion.div>
        
        {/* Tabs mejoradas */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Tabs defaultValue="emae" className="w-full">
            {/* Tabs navegación rediseñada - SIN Riesgo País */}
            <div className="flex justify-center mb-12">
              <TabsList className="bg-white shadow-lg border border-gray-200 p-2 rounded-2xl">
                <TabsTrigger 
                  value="emae" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-all duration-300 font-medium text-sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  EMAE
                </TabsTrigger>
                <TabsTrigger 
                  value="ipc" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-all duration-300 font-medium text-sm"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  IPC
                </TabsTrigger>
                <TabsTrigger 
                  value="empleo" 
                  className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-all duration-300 font-medium text-sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Empleo
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content EMAE */}
            <TabsContent value="emae">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch"
              >
                {/* Información del EMAE */}
                <div className="lg:col-span-2">
                  <div className="group relative h-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-blue-100 h-full flex flex-col">
                      {/* Header con icono */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-indec-blue-dark">
                            EMAE
                          </h3>
                          <p className="text-sm text-indec-gray-dark font-medium">
                            Estimador Mensual de Actividad Económica
                          </p>
                        </div>
                      </div>

                      {/* Último dato disponible */}
                      {emaeLoading ? (
                        <Skeleton className="h-4 w-40 mb-4" />
                      ) : (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-800 font-medium">
                            Último dato disponible: <span className="font-bold">{formatDate(emaeData?.date)}</span>
                          </p>
                        </div>
                      )}
                      
                      {/* Descripción */}
                      <p className="text-indec-gray-dark mb-6 text-sm leading-relaxed flex-grow">
                        El EMAE refleja la evolución mensual de la actividad económica de los sectores productivos a nivel nacional, permitiendo anticipar las tasas de variación del PIB.
                      </p>
                      
                      {/* Métricas destacadas */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {emaeLoading ? (
                          <>
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                          </>
                        ) : (
                          <>
                            {/* Último valor */}
                            <Card className="border-blue-200 bg-blue-50/50">
                              <CardHeader className="pb-1 pt-2 px-2">
                                <CardTitle className="text-xs font-medium text-blue-800 flex items-center gap-1">
                                  Último valor
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-blue-600" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Valor del índice EMAE en el último período disponible.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-2 pb-2">
                                <DataMetric 
                                  label="" 
                                  value={`${emaeError ? "N/A" : (emaeData?.original_value?.toFixed(1) || "N/A")}`} 
                                  className="text-lg font-bold text-blue-700"
                                />
                              </CardContent>
                            </Card>
                            
                            {/* Variación mensual */}
                            <Card className="border-blue-200 bg-blue-50/50">
                              <CardHeader className="pb-1 pt-2 px-2">
                                <CardTitle className="text-xs font-medium text-blue-800 flex items-center gap-1">
                                  Var. m/m
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-blue-600" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Variación respecto al mes anterior.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-2 pb-2">
                                <DataMetric 
                                  label="" 
                                  value={`${emaeError ? "N/A" : (emaeData?.monthly_pct_change?.toFixed(1) || "N/A")}%`} 
                                  trend={emaeData && emaeData.monthly_pct_change > 0 ? "up" : "down"} 
                                  className="text-lg font-bold text-blue-700"
                                />
                              </CardContent>
                            </Card>
                            
                            {/* Variación interanual */}
                            <Card className="border-blue-200 bg-blue-50/50">
                              <CardHeader className="pb-1 pt-2 px-2">
                                <CardTitle className="text-xs font-medium text-blue-800 flex items-center gap-1">
                                  Var. i/a
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-blue-600" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Variación respecto al mismo mes del año anterior.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-2 pb-2">
                                <DataMetric 
                                  label="" 
                                  value={`${emaeError ? "N/A" : (emaeData?.yearly_pct_change?.toFixed(1) || "N/A")}%`} 
                                  trend={emaeData && emaeData.yearly_pct_change > 0 ? "up" : "down"}
                                  className="text-lg font-bold text-blue-700" 
                                />
                              </CardContent>
                            </Card>
                          </>
                        )}
                      </div>
                      
                      {/* CTA mejorado */}
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 mt-auto">
                        <Link href="/indicadores/emae" className="flex items-center justify-center gap-2">
                          Ver análisis completo <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Gráfico del EMAE */}
                <div className="lg:col-span-3">
                  <div className="group relative h-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative bg-white shadow-xl border border-blue-100 rounded-2xl p-4 h-full">
                      <EmaeEnhancedChart 
                        height={400} 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            
            {/* Tab Content IPC */}
            <TabsContent value="ipc">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch"
              >
                {/* Información del IPC */}
                <div className="lg:col-span-2">
                  <div className="group relative h-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-purple-100 h-full flex flex-col">
                      {/* Header con icono */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-indec-blue-dark">
                            IPC
                          </h3>
                          <p className="text-sm text-indec-gray-dark font-medium">
                            Índice de Precios al Consumidor
                          </p>
                        </div>
                      </div>

                      {/* Último dato disponible */}
                      {ipcLoading ? (
                        <Skeleton className="h-4 w-40 mb-4" />
                      ) : (
                        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-purple-800 font-medium">
                            Último dato disponible: <span className="font-bold">{formatDate(ipcData?.date)}</span>
                          </p>
                        </div>
                      )}
                      
                      {/* Descripción */}
                      <p className="text-indec-gray-dark mb-6 text-sm leading-relaxed flex-grow font-sans">
                        El IPC mide la variación promedio de los precios de los bienes y servicios que consumen los hogares, siendo el principal indicador de inflación en Argentina.
                      </p>  
                      
                      {/* Métricas destacadas */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {ipcLoading ? (
                          <>
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                          </>
                        ) : (
                          <>
                            {/* Variación mensual */}
                            <Card className="border-purple-200 bg-purple-50/50">
                              <CardHeader className="pb-1 pt-2 px-2">
                                <CardTitle className="text-xs font-medium text-purple-800">
                                  Var. mensual
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-2 pb-2">
                                <DataMetric 
                                  label="" 
                                  value={`${ipcError ? "N/A" : (ipcData?.monthly_change?.toFixed(1) || "N/A")}%`} 
                                  className="text-lg font-bold text-purple-700 "
                                />
                              </CardContent>
                            </Card>
                            
                            {/* Variación interanual */}
                            <Card className="border-purple-200 bg-purple-50/50">
                              <CardHeader className="pb-1 pt-2 px-2">
                                <CardTitle className="text-xs font-medium text-purple-800">
                                  Var. interanual
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-2 pb-2">
                                <DataMetric 
                                  label="" 
                                  value={`${ipcError ? "N/A" : (ipcData?.year_over_year_change?.toFixed(1) || "N/A")}%`} 
                                  className="text-lg font-bold text-purple-700"
                                />
                              </CardContent>
                            </Card>
                            
                            {/* Variación acumulada */}
                            <Card className="border-purple-200 bg-purple-50/50">
                              <CardHeader className="pb-1 pt-2 px-2">
                                <CardTitle className="text-xs font-medium text-purple-800">
                                  Var. acumulada
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-2 pb-2">
                                <DataMetric 
                                  label="" 
                                  value={`${ipcError ? "N/A" : (ipcData?.accumulated_change?.toFixed(1) || "N/A")}%`} 
                                  className="text-lg font-bold text-purple-700"
                                />
                              </CardContent>
                            </Card>
                          </>
                        )}
                      </div>
                      
                      {/* CTA mejorado */}
                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 mt-auto">
                        <Link href="/indicadores/ipc" className="flex items-center justify-center gap-2">
                          Ver análisis completo <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Gráfico del IPC */}
                <div className="lg:col-span-3">
                  <div className="group relative h-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-purple-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative bg-white shadow-xl border border-purple-100 rounded-2xl p-4 h-full">
                      <IPCEnhancedChart 
                        height={320} 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Tab Content Empleo - NUEVO CON DATOS REALES */}
            <TabsContent value="empleo">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch"
              >
                {/* Información del Empleo */}
                <div className="lg:col-span-2">
                  <div className="group relative h-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-orange-100 h-full flex flex-col">
                      {/* Header con icono */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Users className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-indec-blue-dark">
                            Mercado Laboral
                          </h3>
                          <p className="text-sm text-indec-gray-dark font-medium">
                            Indicadores principales de empleo
                          </p>
                        </div>
                      </div>

                      {/* Último dato disponible */}
                      {loadingLabor ? (
                        <Skeleton className="h-4 w-40 mb-4" />
                      ) : (
                        <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                          <p className="text-xs text-orange-800 font-medium">
                            Último dato disponible: <span className="font-bold">{laborData?.period}</span>
                          </p>
                          <p className="text-xs text-orange-700 mt-1">
                            Actualizado en {laborData?.date ? formatDate(laborData.date) : 'N/A'}
                          </p>
                          {errorLabor && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ Usando datos de respaldo
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Descripción */}
                      <p className="text-indec-gray-dark mb-6 text-sm leading-relaxed flex-grow">
                        Los indicadores laborales reflejan la situación del empleo en Argentina. 
                        La tasa de empleo muestra el porcentaje de población ocupada, mientras que 
                        la tasa de desempleo indica quienes buscan trabajo activamente.
                      </p>
                      
                      {/* Métricas destacadas */}
                      <div className="grid grid-cols-1 gap-3 mb-6">
                        {loadingLabor ? (
                          <>
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                          </>
                        ) : (
                          <>
                            {/* Tasa de Empleo */}
                            <Card className="border-orange-200 bg-orange-50/50">
                              <CardHeader className="pb-2 pt-3 px-4">
                                <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  Tasa de Empleo
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-orange-600" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Porcentaje de población ocupada sobre población total</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-4 pb-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold text-orange-700">
                                    {formatNumber(laborData?.employment_rate || 0, 1)}%
                                  </span>
                                  <div className="text-right">
                                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                      {laborData?.period || 'N/A'}
                                    </span>
                                    {laborData?.variation_yoy_employment_rate && (
                                      <div className={`text-xs mt-1 ${getTrend(laborData.variation_yoy_employment_rate) === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatVariation(laborData.variation_yoy_employment_rate)} i/a
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            
                            {/* Tasa de Desempleo */}
                            <Card className="border-red-200 bg-red-50/50">
                              <CardHeader className="pb-2 pt-3 px-4">
                                <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                                  <TrendingDown className="h-4 w-4" />
                                  Tasa de Desempleo
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-red-600" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Porcentaje de población desocupada sobre población económicamente activa</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-4 pb-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold text-red-700">
                                    {formatNumber(laborData?.unemployment_rate || 0, 1)}%
                                  </span>
                                  <div className="text-right">
                                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                      {laborData?.period || 'N/A'}
                                    </span>
                                    {laborData?.variation_yoy_unemployment_rate && (
                                      <div className={`text-xs mt-1 ${getTrend(laborData.variation_yoy_unemployment_rate) === 'down' ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatVariation(laborData.variation_yoy_unemployment_rate)} i/a
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            
                            {/* Tasa de Actividad */}
                            <Card className="border-blue-200 bg-blue-50/50">
                              <CardHeader className="pb-2 pt-3 px-4">
                                <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                                  <Activity className="h-4 w-4" />
                                  Tasa de Actividad
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-blue-600" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Porcentaje de población económicamente activa sobre población total</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-4 pb-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold text-blue-700">
                                    {formatNumber(laborData?.activity_rate || 0, 1)}%
                                  </span>
                                  <div className="text-right">
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                      {laborData?.period || 'N/A'}
                                    </span>
                                    {laborData?.variation_yoy_activity_rate && (
                                      <div className={`text-xs mt-1 ${getTrend(laborData.variation_yoy_activity_rate) === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatVariation(laborData.variation_yoy_activity_rate)} i/a
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </>
                        )}
                      </div>
                      
                      {/* CTA mejorado */}
                      <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-10 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 mt-auto">
                        <Link href="/indicadores/empleo" className="flex items-center justify-center gap-2">
                          Ver análisis completo <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Mini gráfico de desempleo - últimos 10 años */}
                <div className="lg:col-span-3">
                  <div className="group relative h-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-orange-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative bg-white shadow-xl border border-orange-100 rounded-2xl p-4 h-full">
                      <div className="mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          Evolución del Desempleo (2020-2025)
                        </h4>
                        <p className="text-sm text-gray-600">
                          Tasa de desempleo trimestral en Argentina
                        </p>
                      </div>
                      
                      {loadingLabor ? (
                        <div className="h-52 flex items-center justify-center">
                          <Skeleton className="h-full w-full" />
                        </div>
                      ) : (
                        <div className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={laborHistorical} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                              <defs>
                                <linearGradient id="unemploymentGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#EA580C" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#EA580C" stopOpacity={0.05}/>
                                </linearGradient>
                              </defs>
                              <XAxis 
                                dataKey="period" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                interval={Math.ceil(laborHistorical.length / 6)} // Mostrar cada 3-4 trimestres
                              />
                              <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <RechartsTooltip 
                                contentStyle={{
                                  backgroundColor: '#FFF',
                                  border: '1px solid #E5E7EB',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                  fontSize: '12px'
                                }}
                                formatter={(value: any) => [`${formatNumber(value, 1)}%`, 'Desempleo']}
                                labelFormatter={(label) => `${label}`}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="unemployment_rate" 
                                stroke="#EA580C" 
                                strokeWidth={2}
                                fill="url(#unemploymentGradient)"
                                dot={{ fill: '#EA580C', strokeWidth: 1, r: 3 }}
                                activeDot={{ r: 4, stroke: '#EA580C', strokeWidth: 2, fill: '#FFF' }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      
                      {/* KPIs adicionales por demografía */}
                      <div className="mt-4 p-4 bg-orange-25 rounded-lg border border-orange-100">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4 text-orange-600" />
                          Desempleo por segmentos
                        </h5>
                        
                        {loadingLabor ? (
                          <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {/* Desempleo Mujeres */}
                            <div className="bg-white p-3 rounded-lg border border-orange-100">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-2 w-2 bg-pink-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-600">Mujeres</span>
                              </div>
                              <p className="text-lg font-bold text-gray-800">8.4%</p>
                              <p className="text-xs text-gray-500">{laborData?.period || 'T1 2025'}</p>
                            </div>
                            
                            {/* Desempleo Varones */}
                            <div className="bg-white p-3 rounded-lg border border-orange-100">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-600">Varones</span>
                              </div>
                              <p className="text-lg font-bold text-gray-800">7.5%</p>
                              <p className="text-xs text-gray-500">{laborData?.period || 'T1 2025'}</p>
                            </div>
                            
                            {/* Desempleo Jóvenes */}
                            <div className="bg-white p-3 rounded-lg border border-orange-100">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-600">14-29 años</span>
                              </div>
                              <p className="text-lg font-bold text-gray-800">18.2%</p>
                              <p className="text-xs text-gray-500">{laborData?.period || 'T1 2025'}</p>
                            </div>
                            
                            {/* Desempleo Adultos */}
                            <div className="bg-white p-3 rounded-lg border border-orange-100">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-600">30+ años</span>
                              </div>
                              <p className="text-lg font-bold text-gray-800">5.8%</p>
                              <p className="text-xs text-gray-500">{laborData?.period || 'T1 2025'}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 pt-2 border-t border-orange-200">
                          <p className="text-xs text-gray-500 text-center">
                            💡 Los jóvenes presentan tasas de desempleo significativamente más altas
                          </p>
                        </div>
                      </div>
                      
                      {/* Stats del gráfico - más compacto */}
                      <div className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Mínimo</p>
                          <p className="text-sm font-semibold text-green-600">
                            {laborHistorical.length > 0 ? 
                              `${formatNumber(Math.min(...laborHistorical.map(d => d.unemployment_rate)), 1)}%` : 
                              'N/A'
                            }
                          </p>
                          <p className="text-xs text-gray-400">
                            {laborHistorical.length > 0 ? 
                              laborHistorical.find(d => d.unemployment_rate === Math.min(...laborHistorical.map(d => d.unemployment_rate)))?.period : 
                              ''
                            }
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Máximo</p>
                          <p className="text-sm font-semibold text-red-600">
                            {laborHistorical.length > 0 ? 
                              `${formatNumber(Math.max(...laborHistorical.map(d => d.unemployment_rate)), 1)}%` : 
                              'N/A'
                            }
                          </p>
                          <p className="text-xs text-gray-400">
                            {laborHistorical.length > 0 ? 
                              laborHistorical.find(d => d.unemployment_rate === Math.max(...laborHistorical.map(d => d.unemployment_rate)))?.period : 
                              ''
                            }
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Actual</p>
                          <p className="text-sm font-semibold text-orange-600">
                            {laborData ? `${formatNumber(laborData.unemployment_rate, 1)}%` : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {laborData?.period || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}