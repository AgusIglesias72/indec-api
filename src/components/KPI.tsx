"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Code, 
  Github, 
  Sparkles,
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAppData } from '@/lib/DataProvider';

// Interfaces para los datos del dólar
interface DollarData {
  buy_price: number;
  sell_price: number;
  spread: number;
  dollar_type: string;
  date: string;
}

const HeroWithMetrics = () => {
  const { 
    emaeData, 
    ipcData, 
    sectorData,
    loadingEmae, 
    loadingIPC, 
    loadingSectors 
  } = useAppData();
  
  const [dollarData, setDollarData] = useState<DollarData | null>(null);
  const [loadingDollar, setLoadingDollar] = useState(true);

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
      
      // Manejar diferentes estructuras de respuesta
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
      // Datos de fallback en caso de error
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
    const initializeDollarData = async () => {
      try {
        await fetchDollarData();
      } catch (error) {
        console.error('Error inicializando datos del dólar:', error);
      }
    };
    
    initializeDollarData();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchDollarData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getEMAEChangeColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getInflationChangeColor = () => {
    return "text-purple-600";
  };

  // Obtener los top 3 sectores con mejor rendimiento
  const getTopSectors = () => {
    if (!sectorData || sectorData.length === 0) {
      return [
        { sector_name: 'Industria', yearly_pct_change: 2.1 },
        { sector_name: 'Comercio', yearly_pct_change: 1.8 },
        { sector_name: 'Construcción', yearly_pct_change: -0.5 },
      ];
    }
    
    return [...sectorData]
      .sort((a, b) => b.year_over_year_change - a.year_over_year_change)
      .slice(0, 3)
      .map(sector => ({
        sector_name: sector.sector_name.length > 12 
          ? sector.sector_name.substring(0, 12) + '...'
          : sector.sector_name,
        yearly_pct_change: sector.year_over_year_change
      }));
  };

  const topSectors = getTopSectors();

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
        
        {/* Lanzamiento oficial banner */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-indec-blue/10 text-indec-blue text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>¡Lanzamiento Oficial!</span>
          </div>
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
              Datos económicos,
              <span className="block text-indec-blue">en tiempo real.</span>
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
      <section className="py-16 relative">
        {/* Overlay para suavizar el fondo de puntos */}
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
              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[280px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      {loadingDollar ? "..." : `$${formatNumber(dollarData?.sell_price || 0, 0)}`}
                    </div>
                    <div className="text-sm text-gray-500">venta</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Dólar Oficial</h3>
                <div className="text-sm text-gray-600 space-y-2 flex-grow">
                  <div className="flex justify-between">
                    <span>Compra:</span>
                    <span className="font-medium">${loadingDollar ? "..." : formatNumber(dollarData?.buy_price || 0, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Venta:</span>
                    <span className="font-medium">${loadingDollar ? "..." : formatNumber(dollarData?.sell_price || 0, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spread:</span>
                    <span className="font-medium">{loadingDollar ? "..." : `${formatNumber(dollarData?.spread || 0, 1)}%`}</span>
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
              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[280px] flex flex-col">
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
                    Datos INDEC oficiales
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
              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[280px] flex flex-col">
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
                    Actividad económica
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sectores Top */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[280px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {loadingSectors ? "..." : (sectorData?.length || 15)}
                    </div>
                    <div className="text-sm text-gray-500">sectores</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Sectores EMAE</h3>
                <div className="text-sm text-gray-600 space-y-1 flex-grow">
                  {topSectors.map((sector, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{sector.sector_name}:</span>
                      <span className={`font-medium ${
                        sector.yearly_pct_change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {sector.yearly_pct_change >= 0 ? '+' : ''}{formatNumber(sector.yearly_pct_change, 1)}%
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-orange-100">
                  <div className="flex items-center text-xs text-orange-700">
                    <div className="h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse"></div>
                    Análisis por actividad
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
              {loadingDollar || loadingEmae || loadingIPC || loadingSectors 
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