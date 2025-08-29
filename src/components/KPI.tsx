"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Code, 
  Github, 
  Sparkles,
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/lib/DataProvider';


const HeroWithMetrics = () => {
  const { 
    emaeData, 
    ipcData, 
    sectorData,
    dollarData,
    riskCountryData,
    monthlyVariation,
    yearlyVariation,
    loadingEmae, 
    loadingIPC, 
    loadingSectors,
    loadingDollar,
    loadingRiskCountry
  } = useAppData();
  
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);



  const formatNumber = (num: number | undefined, decimals: number = 2) => {
    if (num === undefined || num === null) return "N/A";
    if (!isMounted) return num.toFixed(decimals);
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const formatRiskValue = (value: number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    if (!isMounted) return Math.round(value).toString();
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getChangeIcon = (value: number | undefined) => {
    if (!value) return <Minus className="h-2 w-2" />;
    if (value > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-2 w-2" />;
  };

  const getEMAEChangeColor = (value: number | undefined) => {
    if (!value) return "text-gray-600";
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getInflationChangeColor = () => {
    return "text-purple-600";
  };

  const getRiskChangeColor = (value: number | null | undefined) => {
    if (!value || value === null || value === undefined) return "text-gray-600";
    // Para riesgo país, subida es malo (rojo) y bajada es bueno (verde)
    if (value > 0) return "text-red-600";
    if (value < 0) return "text-green-600";
    return "text-gray-600";
  };

  const formatDateToMonthYear = (dateString: string | undefined) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${month} ${year}`;
  };


  return (
    <>
      {/* Hero section con texto */}
      <section className="relative bg-white text-indec-blue-dark pt-20 pb-4 md:pt-24 md:pb-6 overflow-y-visible overflow-x-clip">
        {/* Círculos azules decorativos */}
        <div className="hidden lg:block absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-indec-blue/20 -mr-96 -mt-96"></div>
        <div className="hidden lg:block absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-indec-blue/20 -ml-96 -mb-96"></div>
        
        {/* Patrón de puntos sutiles */}
        <div 
          className="absolute inset-0 opacity-[0.85] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>
        
        {/* Evento banner */}
        <div className="flex justify-center mb-8 relative z-20">
          <Link href="/eventos/ipc-agosto-2025" className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-indec-blue/10 text-indec-blue text-sm font-medium hover:bg-indec-blue/20 transition-all duration-200 cursor-pointer">
            <Sparkles className="h-4 w-4" />
            <span>🏆 Evento Activo: Predice el IPC Agosto 2025 - ¡Gana USD 100!</span>
          </Link>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Título principal modificado */}
          <div className="text-center">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Toda la economía argentina,
              <span className="block text-indec-blue">en un solo lugar y en tiempo real.</span>
            </motion.h1>
          </div>
        </div>
        
        {/* Estrella decorativa */}
        <div className="absolute top-[15%] right-[18%]">
          <motion.div 
            initial={{ rotate: 0, scale: 0 }}
            animate={{ rotate: 15, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.4 9.6H22L16.8 14.4L19.2 22L12 17.2L4.8 22L7.2 14.4L2 9.6H9.6L12 2Z" fill="blue" 
              fillOpacity="0.3" stroke="blue" strokeWidth="1"/>
            </svg>
          </motion.div>
        </div>
      </section>

      {/* Sección de métricas económicas */}
      <section className="py-12 relative">
        <div className="absolute inset-0"></div>
        
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            
            {/* Dólar Oficial */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div 
                className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[320px] flex flex-col cursor-pointer"
                onClick={() => window.location.href = '/dolar'}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      {loadingDollar || !dollarData ? "..." : `$${formatNumber(dollarData.sell_price, 0)}`}
                    </div>
                    <div className="text-sm text-gray-500">venta</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Dólar Oficial</h3>
                <div className="text-sm text-gray-600 space-y-2 flex-grow">
                  <div className="flex justify-between">
                    <span>Compra:</span>
                    <span className="font-medium">${loadingDollar || !dollarData ? "..." : formatNumber(dollarData.buy_price!, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Venta:</span>
                    <span className="font-medium">${loadingDollar || !dollarData ? "..." : formatNumber(dollarData.sell_price, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Variación:</span>
                    <span className={`font-medium flex items-center ${
                      !dollarData?.sell_variation ? "text-gray-600" :
                      dollarData.sell_variation > 0 ? "text-red-600" :
                      dollarData.sell_variation < 0 ? "text-green-600" :
                      "text-gray-600"
                    }`}>
                      {loadingDollar || !dollarData ? "..." : (
                        <>
                          {getChangeIcon(dollarData.sell_variation || 0)}
                          {formatNumber(Math.abs(dollarData.sell_variation || 0), 1)}%
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-green-100">
                  <div className="flex items-center text-xs text-green-700">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                    Actualizado en tiempo real
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Inflación General */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div 
                className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[320px] flex flex-col cursor-pointer"
                onClick={() => window.location.href = '/indicadores/ipc'}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {loadingIPC ? "..." : `${formatNumber(ipcData?.monthly_change || 0, 1)}%`}
                    </div>
                    <div className="text-sm text-gray-500">mensual</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Inflación (IPC)</h3>
                <div className="text-sm text-gray-600 space-y-2 flex-grow">
                  <div className="flex justify-between items-center">
                    <span>Interanual:</span>
                    <span className={`font-medium flex items-center ${getInflationChangeColor()}`}>
                      {getChangeIcon(ipcData?.year_over_year_change || 0)}
                      {loadingIPC ? "..." : `${formatNumber(ipcData?.year_over_year_change || 0, 1)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Acumulada:</span>
                    <span className={`font-medium flex items-center ${getInflationChangeColor()}`}>
                      {getChangeIcon(ipcData?.accumulated_change || 0)}
                      {loadingIPC ? "..." : `${formatNumber(ipcData?.accumulated_change || 0, 1)}%`}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-purple-100">
                  <div className="flex items-center text-xs text-purple-700">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></div>
                    {loadingIPC || !ipcData ? "INDEC" : `INDEC - ${formatDateToMonthYear(ipcData.date)}`}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* EMAE */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div 
                className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[320px] flex flex-col cursor-pointer"
                onClick={() => window.location.href = '/indicadores/emae'}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {loadingEmae ? "..." : `${formatNumber(emaeData?.monthly_pct_change || 0, 1)}%`}
                    </div>
                    <div className="text-sm text-gray-500">mensual</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Actividad (EMAE)</h3>
                <div className="text-sm text-gray-600 space-y-2 flex-grow">
                  <div className="flex justify-between items-center">
                    <span>Interanual:</span>
                    <span className={`font-medium flex items-center ${getEMAEChangeColor(emaeData?.yearly_pct_change || 0)}`}>
                      {getChangeIcon(emaeData?.yearly_pct_change || 0)}
                      {loadingEmae ? "..." : `${formatNumber(emaeData?.yearly_pct_change || 0, 1)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Índice:</span>
                    <span className="font-medium">{loadingEmae ? "..." : formatNumber(emaeData?.original_value || 0, 1)}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-blue-100">
                  <div className="flex items-center text-xs text-blue-700">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                    {loadingEmae || !emaeData ? "INDEC" : `INDEC - ${formatDateToMonthYear(emaeData.date)}`}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Riesgo País */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div 
                className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[320px] flex flex-col cursor-pointer"
                onClick={() => window.location.href = '/indicadores/riesgo-pais'}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Globe className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                      {loadingRiskCountry || !riskCountryData ? "..." : formatRiskValue(riskCountryData.closing_value)}
                    </div>
                    <div className="text-sm text-gray-500">puntos básicos</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Riesgo País</h3>
                <div className="text-sm text-gray-600 space-y-2 flex-grow">
                  <div className="flex justify-between items-center">
                    <span>Var. Diaria:</span>
                    <span className={`font-medium flex items-center ${getRiskChangeColor(riskCountryData?.change_percentage ?? null)}`}>
                      {loadingRiskCountry || !riskCountryData ? "..." : (
                        riskCountryData.change_percentage !== null && riskCountryData.change_percentage !== undefined ? (
                          <>
                            {getChangeIcon(riskCountryData.change_percentage)}
                            {formatNumber(riskCountryData.change_percentage, 2)}%
                          </>
                        ) : "N/A"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Var. Mensual:</span>
                    <span className={`font-medium flex items-center ${getRiskChangeColor(monthlyVariation)}`}>
                      {loadingRiskCountry ? "..." : (
                        monthlyVariation !== null ? (
                          <>
                            {getChangeIcon(monthlyVariation)}
                            {formatNumber(monthlyVariation, 1)}%
                          </>
                        ) : "N/A"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Var. Interanual:</span>
                    <span className={`font-medium flex items-center ${getRiskChangeColor(yearlyVariation)}`}>
                      {loadingRiskCountry ? "..." : (
                        yearlyVariation !== null ? (
                          <>
                            {getChangeIcon(yearlyVariation)}
                            {formatNumber(yearlyVariation, 1)}%
                          </>
                        ) : "N/A"
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-red-100">
                  <div className="flex items-center text-xs text-red-700">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                    Mercados internacionales
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Indicador de actualización */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              {loadingDollar || loadingRiskCountry || loadingEmae || loadingIPC
                ? "Actualizando datos..." 
                : "Datos actualizados en tiempo real"
              }
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HeroWithMetrics;