"use client"

import Link from "next/link"
import { ArrowRight, Users, TrendingUp, TrendingDown, Activity, Info } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"

// Interface para los datos de empleo
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
  total_population?: number;
  economically_active_population?: number;
  employed_population?: number;
  unemployed_population?: number;
}

interface LaborMarketResponse {
  data: LaborMarketData[];
  metadata: {
    view: string;
    data_type: string;
    count: number;
  };
}

export default function EmploymentSection() {
  const [laborData, setLaborData] = useState<LaborMarketData | null>(null);
  const [laborHistorical, setLaborHistorical] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos del mercado laboral
  const fetchLaborMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener último dato nacional disponible
      const latestResponse = await fetch('/api/labor-market?view=latest&data_type=national&limit=1');
      
      if (!latestResponse.ok) {
        throw new Error(`Error ${latestResponse.status}: ${latestResponse.statusText}`);
      }
      
      const latestResult: LaborMarketResponse = await latestResponse.json();
      
      if (latestResult.data && latestResult.data.length > 0) {
        setLaborData(latestResult.data[0]);
      }

      // Obtener datos históricos TRIMESTRALES (últimos 5 años)
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 5;
      
      const historicalResponse = await fetch(
        `/api/labor-market?view=temporal&data_type=national&start_date=${startYear}-01-01&limit=100`
      );
      
      if (historicalResponse.ok) {
        const historicalResult: LaborMarketResponse = await historicalResponse.json();
        
        // Procesar datos para el gráfico - MANTENER DATOS TRIMESTRALES
        const processedData = historicalResult.data
          .filter(item => item.unemployment_rate !== null && item.period)
          .map(item => ({
            period: item.period,
            unemployment_rate: item.unemployment_rate,
            date: item.date,
            periodLabel: item.period,
            year: new Date(item.date).getFullYear(),
            // Crear etiqueta corta para el eje X
            shortLabel: item.period.replace('T', 'Q')
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-20); // Últimos 20 trimestres (5 años)
        
        setLaborHistorical(processedData);
      }

    } catch (error) {
      console.error('Error fetching labor market data:', error);
      setError((error as Error).message);
      
      // Datos de fallback
      setLaborData({
        id: 'fallback',
        date: '2025-03-31',
        period: 'T1 2025',
        data_type: 'national',
        activity_rate: 48.2,
        employment_rate: 44.4,
        unemployment_rate: 7.9,
        variation_yoy_activity_rate: 0.2,
        variation_yoy_employment_rate: 0.1,
        variation_yoy_unemployment_rate: 0.2
      });

      // Datos históricos de fallback TRIMESTRALES REALES
      setLaborHistorical([
        { period: 'T1 2020', unemployment_rate: 10.4, shortLabel: 'Q1 20', date: '2020-03-31' },
        { period: 'T2 2020', unemployment_rate: 13.1, shortLabel: 'Q2 20', date: '2020-06-30' },
        { period: 'T3 2020', unemployment_rate: 11.7, shortLabel: 'Q3 20', date: '2020-09-30' },
        { period: 'T4 2020', unemployment_rate: 11.0, shortLabel: 'Q4 20', date: '2020-12-31' },
        { period: 'T1 2021', unemployment_rate: 10.2, shortLabel: 'Q1 21', date: '2021-03-31' },
        { period: 'T2 2021', unemployment_rate: 9.6, shortLabel: 'Q2 21', date: '2021-06-30' },
        { period: 'T3 2021', unemployment_rate: 8.2, shortLabel: 'Q3 21', date: '2021-09-30' },
        { period: 'T4 2021', unemployment_rate: 7.0, shortLabel: 'Q4 21', date: '2021-12-31' },
        { period: 'T1 2022', unemployment_rate: 7.1, shortLabel: 'Q1 22', date: '2022-03-31' },
        { period: 'T2 2022', unemployment_rate: 6.9, shortLabel: 'Q2 22', date: '2022-06-30' },
        { period: 'T3 2022', unemployment_rate: 6.1, shortLabel: 'Q3 22', date: '2022-09-30' },
        { period: 'T4 2022', unemployment_rate: 5.7, shortLabel: 'Q4 22', date: '2022-12-31' },
        { period: 'T1 2023', unemployment_rate: 6.9, shortLabel: 'Q1 23', date: '2023-03-31' },
        { period: 'T2 2023', unemployment_rate: 6.2, shortLabel: 'Q2 23', date: '2023-06-30' },
        { period: 'T3 2023', unemployment_rate: 5.7, shortLabel: 'Q3 23', date: '2023-09-30' },
        { period: 'T4 2023', unemployment_rate: 5.7, shortLabel: 'Q4 23', date: '2023-12-31' },
        { period: 'T1 2024', unemployment_rate: 7.7, shortLabel: 'Q1 24', date: '2024-03-31' },
        { period: 'T2 2024', unemployment_rate: 7.6, shortLabel: 'Q2 24', date: '2024-06-30' },
        { period: 'T3 2024', unemployment_rate: 6.9, shortLabel: 'Q3 24', date: '2024-09-30' },
        { period: 'T1 2025', unemployment_rate: 7.9, shortLabel: 'Q1 25', date: '2025-03-31' }
      ]);

    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchLaborMarketData();
    
    // Actualizar cada 30 minutos
    const interval = setInterval(fetchLaborMarketData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${month} ${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // Función para formatear números
  const formatNumber = (num: number, decimals: number = 1) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  // Función para determinar tendencia
  const getTrend = (variation: number | undefined) => {
    if (!variation || variation === 0) return null;
    return variation > 0 ? "up" : "down";
  };

  // Función para formatear variación
  const formatVariation = (variation: number | undefined) => {
    if (!variation) return "N/A";
    const sign = variation > 0 ? "+" : "";
    return `${sign}${formatNumber(variation, 1)}pp`;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-amber-50 relative z-10 overflow-hidden" id="empleo">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-transparent"></div>
         {/* Círculos decorativos */}
         <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-orange-500/30 translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-orange-500/20 -translate-x-1/3 translate-y-1/3"></div>

 
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Users className="h-4 w-4" />
            <span>Mercado Laboral Argentino</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Indicadores de Empleo
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600">
            Seguimiento en tiempo real de las principales métricas del mercado laboral argentino 
            con datos oficiales del INDEC: tasas de empleo, desempleo y actividad económica.
          </p>
        </motion.div>

        {/* Grid principal */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch"
        >
          {/* Panel de información y métricas - 2 columnas */}
          <div className="lg:col-span-2">
            <div className="group relative h-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-orange-100 h-full flex flex-col">
                
                {/* Header con icono */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Mercado Laboral
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      Indicadores principales de empleo
                    </p>
                  </div>
                </div>

                {/* Último dato disponible */}
                {loading ? (
                  <Skeleton className="h-16 w-full mb-6" />
                ) : (
                  <div className="mb-6 p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-orange-800 font-medium">
                      Último dato disponible: <span className="font-bold">{laborData?.period}</span>
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Actualizado en {laborData?.date ? formatDate(laborData.date) : 'N/A'}
                    </p>
                    {error && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Usando datos de respaldo
                      </p>
                    )}
                  </div>
                )}
                
                {/* Descripción */}
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Los indicadores laborales reflejan la situación del empleo en Argentina. 
                  La tasa de empleo muestra el porcentaje de población ocupada, mientras que 
                  la tasa de desempleo indica quienes buscan trabajo activamente.
                </p>
                
                {/* Métricas en grid 3x1 */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {loading ? (
                    <>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
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
                              {formatNumber(laborData?.employment_rate || 0)}%
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
                              {formatNumber(laborData?.unemployment_rate || 0)}%
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
                              {formatNumber(laborData?.activity_rate || 0)}%
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
                
             
                
                {/* CTA */}
                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-11 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 mt-auto">
                  <Link href="/indicadores/empleo" className="flex items-center justify-center gap-2">
                    Ver análisis completo <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Gráfico de área TRIMESTRAL - 3 columnas */}
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
                
                {loading ? (
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
                          dataKey="shortLabel" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#6B7280' }}
                          interval={Math.floor(laborHistorical.length / 6)} // Mostrar ~6 etiquetas
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
                          labelFormatter={(label) => {
                            const item = laborHistorical.find(d => d.shortLabel === label);
                            return item ? item.period : label;
                          }}
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

     
   
      </div>
    </section>
  )
}