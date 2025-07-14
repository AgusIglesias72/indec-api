"use client"

import Link from "next/link"
import { ArrowRight, Info, TrendingUp, BarChart3, PieChart, DollarSign, AlertTriangle, Users, Activity, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import DataMetric from "@/components/DataMetric"
import { 
  useHistoricalEmaeData,
  useHistoricalIPCData 
} from "@/hooks/useApiData"
import EmaeEnhancedChart from "@/components/charts/EmaeEnhancedChart"
import IPCEnhancedChart from "@/components/charts/IPCEnhancedChart"
import { useAppData } from '@/lib/DataProvider';
import ActivitySectorTabContent from "@/components/ActivityTab"

// Interface para datos del dólar
interface DollarData {
  buy_price: number;
  sell_price: number;
  spread: number;
  dollar_type: string;
  date: string;
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
      const response = await fetch('/api/dollar/latest?type=OFICIAL');
      
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

  // Cargar datos del dólar al montar el componente
  useEffect(() => {
    fetchDollarData();
    const interval = setInterval(fetchDollarData, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
{/* Tabs navegación rediseñada - ACTUALIZADA */}
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
      value="riesgo-pais" 
      className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-all duration-300 font-medium text-sm"
    >
      <AlertTriangle className="h-4 w-4 mr-2" />
      Riesgo País
    </TabsTrigger>
    <TabsTrigger 
      value="labor-market" 
      className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-all duration-300 font-medium text-sm"
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
                        data={emaeHistorical} 
                        loading={emaeHistoricalLoading} 
                        error={emaeHistoricalError}
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
                        data={ipcHistorical} 
                        loading={ipcHistoricalLoading} 
                        error={ipcHistoricalError} 
                        height={320} 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            
            {/* Tab Content Dólar */}
            <TabsContent value="dollar">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start"
              >
                {/* Información del Dólar */}
                <div className="lg:col-span-2">
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                      {/* Header con icono */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-indec-blue-dark">
                            Dólar Oficial
                          </h3>
                          <p className="text-sm text-indec-gray-dark font-medium">
                            Tipo de cambio oficial
                          </p>
                        </div>
                      </div>

                      {/* Último dato disponible */}
                      {loadingDollar ? (
                        <Skeleton className="h-4 w-40 mb-4" />
                      ) : (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-800 font-medium">
                            Última actualización: <span className="font-bold">Hoy</span>
                          </p>
                        </div>
                      )}
                      
                      {/* Descripción */}
                      <p className="text-indec-gray-dark mb-6 text-sm leading-relaxed">
                        Cotización oficial del dólar estadounidense establecida por el Banco Central de la República Argentina para operaciones cambiarias reguladas.
                      </p>
                      
                      {/* Métricas destacadas */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {loadingDollar ? (
                          <>
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                          </>
                        ) : (
                          <>
                            {/* Precio de compra */}
                            <Card className="border-green-200 bg-green-50/50">
                              <CardHeader className="pb-1 pt-2 px-2">
                                <CardTitle className="text-xs font-medium text-green-800">
                                  Compra
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-2 pb-2">
                                <DataMetric 
                                  label="" 
                                  value={`${formatNumber(dollarData?.buy_price || 0, 0)}`} 
                                  className="text-lg font-bold text-green-700"
                                />
                              </CardContent>
                            </Card>
                            
                            {/* Precio de venta */}
                            <Card className="border-green-200 bg-green-50/50">
                              <CardHeader className="pb-1 pt-2 px-2">
                                <CardTitle className="text-xs font-medium text-green-800">
                                  Venta
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-2 pb-2">
                                <DataMetric 
                                  label="" 
                                  value={`${formatNumber(dollarData?.sell_price || 0, 0)}`} 
                                  className="text-lg font-bold text-green-700"
                                />
                              </CardContent>
                            </Card>
                            
                            {/* Spread */}
                            <Card className="border-green-200 bg-green-50/50">
                              <CardHeader className="pb-1 pt-2 px-2">
                                <CardTitle className="text-xs font-medium text-green-800">
                                  Spread
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 px-2 pb-2">
                                <DataMetric 
                                  label="" 
                                  value={`${formatNumber(dollarData?.spread || 0, 1)}%`} 
                                  className="text-lg font-bold text-green-700"
                                />
                              </CardContent>
                            </Card>
                          </>
                        )}
                      </div>
                      
                      {/* CTA mejorado */}
                      <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                        <Link href="/cotizaciones" className="flex items-center justify-center gap-2">
                          Ver todas las cotizaciones <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Gráfico del Dólar (placeholder) */}
                <div className="lg:col-span-3">
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-green-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative bg-white shadow-xl border border-green-100 rounded-2xl p-4 h-[360px] flex items-center justify-center">
                      <div className="text-center">
                        <DollarSign className="h-16 w-16 text-green-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Gráfico de cotizaciones</h3>
                        <p className="text-gray-500 mb-4">Visualiza la evolución histórica del tipo de cambio</p>
                        <Button asChild variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                          <Link href="/cotizaciones">
                            Ver gráficos interactivos
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            
            {/* Tab Content Actividad Sectorial */}
            <TabsContent value="actividad">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-orange-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
                  <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
                    <ActivitySectorTabContent />
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            
{/* Tab content para Riesgo País */}
<TabsContent value="riesgo-pais" className="space-y-8">
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center"
  >
    <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
      <AlertTriangle className="h-4 w-4" />
      <span>Riesgo País Argentina</span>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">
      Indicador de Riesgo Soberano
    </h3>
    <p className="text-gray-600 max-w-2xl mx-auto">
      Monitorea en tiempo real el diferencial de rendimiento entre los bonos argentinos 
      y los bonos del Tesoro de EE.UU., indicador clave de la confianza del mercado.
    </p>
  </motion.div>
  
  <motion.div 
    className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-md mx-auto"
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    <div className="text-center mb-6">
      <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h4 className="text-lg font-semibold text-gray-900">Último Valor</h4>
    </div>
    
    <div className="text-center mb-4">
      <p className="text-3xl font-bold text-gray-900">1,247</p>
      <p className="text-sm text-gray-500">puntos básicos</p>
    </div>
    
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Nivel</span>
        <span className="text-sm font-bold text-orange-700">Alto</span>
      </div>
    </div>
    
    <div className="text-center">
      <Link href="/indicadores/riesgo-pais">
        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6">
          Ver detalles completos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  </motion.div>
</TabsContent>

{/* Tab content para Labor Market */}
<TabsContent value="labor-market" className="space-y-8">
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center"
  >
    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
      <Users className="h-4 w-4" />
      <span>Mercado Laboral</span>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">
      Indicadores de Empleo
    </h3>
    <p className="text-gray-600 max-w-2xl mx-auto">
      Seguimiento de las principales métricas del mercado laboral argentino 
      con datos oficiales del INDEC: tasas de empleo, desempleo y actividad.
    </p>
  </motion.div>
  
  <motion.div 
    className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    {/* Tasa de Empleo */}
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
      <div className="text-center mb-4">
        <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
        </div>
        <h4 className="font-semibold text-gray-900">Tasa de Empleo</h4>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-700">42.8%</p>
        <p className="text-xs text-gray-500">T4 2024</p>
      </div>
    </div>
    
    {/* Tasa de Desempleo */}
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
      <div className="text-center mb-4">
        <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
          <TrendingDown className="h-5 w-5 text-orange-600" />
        </div>
        <h4 className="font-semibold text-gray-900">Tasa de Desempleo</h4>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-orange-700">7.6%</p>
        <p className="text-xs text-gray-500">T4 2024</p>
      </div>
    </div>
    
    {/* Tasa de Actividad */}
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
      <div className="text-center mb-4">
        <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
          <Activity  className="h-5 w-5 text-blue-600" />
        </div>
        <h4 className="font-semibold text-gray-900">Tasa de Actividad</h4>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-700">46.3%</p>
        <p className="text-xs text-gray-500">T4 2024</p>
      </div>
    </div>
  </motion.div>
  
  <motion.div 
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.4 }}
  >
    <Link href="/indicadores/labor-market">
      <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6">
        Ver análisis completo
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>
  </motion.div>
</TabsContent>

          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}