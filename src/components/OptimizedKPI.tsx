// src/components/OptimizedKPI.tsx
import React from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles
} from 'lucide-react';
import { KPIServerData } from '@/lib/kpi-db-queries';
import { KPICard } from './KPIClientWrapper';

interface OptimizedKPIProps {
  data: KPIServerData;
}

// Utility functions
const formatNumber = (num: number | undefined | null, decimals: number = 2) => {
  if (num === undefined || num === null) return "N/A";
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

const formatRiskValue = (value: number | undefined | null) => {
  if (value === undefined || value === null) return "N/A";
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const getChangeIcon = (value: number | undefined | null) => {
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

const formatDateToMonthYear = (dateString: string | undefined | null) => {
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

const OptimizedKPI: React.FC<OptimizedKPIProps> = ({ data }) => {
  return (
    <>
      {/* Hero section con texto */}
      <section className="relative bg-white text-indec-blue-dark pt-16 pb-4 sm:pt-20 md:pt-24 md:pb-6 overflow-y-visible overflow-x-clip">
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
        <div className="flex justify-center mb-6 sm:mb-8 relative z-20">
          <Link href="/eventos/ipc-agosto-2025" className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 sm:px-4 bg-indec-blue/10 text-indec-blue text-xs sm:text-sm font-medium hover:bg-indec-blue/20 transition-all duration-200 cursor-pointer">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>🏆 Evento Activo: Predice el IPC Agosto 2025 - ¡Gana USD 100!</span>
          </Link>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Título principal */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] px-2 sm:px-0">
              Toda la economía argentina,
              <span className="block text-indec-blue">en un solo lugar y en tiempo real.</span>
            </h1>
          </div>
        </div>
        
        {/* Estrella decorativa */}
        <div className="absolute top-[15%] right-[18%]">
          <div>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.4 9.6H22L16.8 14.4L19.2 22L12 17.2L4.8 22L7.2 14.4L2 9.6H9.6L12 2Z" fill="blue" 
              fillOpacity="0.3" stroke="blue" strokeWidth="1"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Sección de métricas económicas */}
      <section className="py-8 sm:py-10 md:py-12 relative">
        <div className="absolute inset-0"></div>
        
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
            
            {/* Dólar Oficial */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <KPICard
                href="/dolar"
                className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[240px] sm:min-h-[280px] lg:min-h-[320px] flex flex-col cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div className="text-right min-w-0 ml-2">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 group-hover:text-green-600 transition-colors leading-tight">
                      {data.dollar ? `$${formatNumber(data.dollar.sell_price, 0)}` : "N/A"}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">venta</div>
                  </div>
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Dólar Oficial</h3>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2 flex-grow">
                  <div className="flex justify-between">
                    <span>Compra:</span>
                    <span className="font-medium">${data.dollar ? formatNumber(data.dollar.buy_price!, 0) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Venta:</span>
                    <span className="font-medium">${data.dollar ? formatNumber(data.dollar.sell_price, 0) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Variación:</span>
                    <span className={`font-medium flex items-center ${
                      !data.dollar?.sell_variation ? "text-gray-600" :
                      data.dollar.sell_variation > 0 ? "text-red-600" :
                      data.dollar.sell_variation < 0 ? "text-green-600" :
                      "text-gray-600"
                    }`}>
                      {data.dollar ? (
                        <>
                          {getChangeIcon(data.dollar.sell_variation || 0)}
                          {formatNumber(Math.abs(data.dollar.sell_variation || 0), 1)}%
                        </>
                      ) : "N/A"}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-green-100">
                  <div className="flex items-center text-xs text-green-700">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 mr-2 animate-pulse flex-shrink-0"></div>
                    <span className="truncate">Actualizado en tiempo real</span>
                  </div>
                </div>
              </KPICard>
            </div>

            {/* Inflación General */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <KPICard
                href="/indicadores/ipc"
                className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[240px] sm:min-h-[280px] lg:min-h-[320px] flex flex-col cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <div className="text-right min-w-0 ml-2">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">
                      {data.ipc ? `${formatNumber(data.ipc.monthly_change || 0, 1)}%` : "N/A"}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">mensual</div>
                  </div>
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Inflación (IPC)</h3>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2 flex-grow">
                  <div className="flex justify-between items-center">
                    <span>Interanual:</span>
                    <span className={`font-medium flex items-center ${getInflationChangeColor()}`}>
                      {getChangeIcon(data.ipc?.year_over_year_change || 0)}
                      {data.ipc ? `${formatNumber(data.ipc.year_over_year_change || 0, 1)}%` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Acumulada:</span>
                    <span className={`font-medium flex items-center ${getInflationChangeColor()}`}>
                      {getChangeIcon(data.ipc?.accumulated_change || 0)}
                      {data.ipc ? `${formatNumber(data.ipc.accumulated_change || 0, 1)}%` : "N/A"}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-purple-100">
                  <div className="flex items-center text-xs text-purple-700">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-500 mr-2 animate-pulse flex-shrink-0"></div>
                    <span className="truncate">{data.ipc ? `INDEC - ${formatDateToMonthYear(data.ipc.date)}` : "INDEC"}</span>
                  </div>
                </div>
              </KPICard>
            </div>

            {/* EMAE */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <KPICard
                href="/indicadores/emae"
                className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[240px] sm:min-h-[280px] lg:min-h-[320px] flex flex-col cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div className="text-right min-w-0 ml-2">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {data.emae ? `${formatNumber(data.emae.monthly_pct_change || 0, 1)}%` : "N/A"}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">mensual</div>
                  </div>
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Actividad (EMAE)</h3>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2 flex-grow">
                  <div className="flex justify-between items-center">
                    <span>Interanual:</span>
                    <span className={`font-medium flex items-center ${getEMAEChangeColor(data.emae?.yearly_pct_change || 0)}`}>
                      {getChangeIcon(data.emae?.yearly_pct_change || 0)}
                      {data.emae ? `${formatNumber(data.emae.yearly_pct_change || 0, 1)}%` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Índice:</span>
                    <span className="font-medium">{data.emae ? formatNumber(data.emae.original_value || 0, 1) : "N/A"}</span>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-blue-100">
                  <div className="flex items-center text-xs text-blue-700">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 mr-2 animate-pulse flex-shrink-0"></div>
                    <span className="truncate">{data.emae ? `INDEC - ${formatDateToMonthYear(data.emae.date)}` : "INDEC"}</span>
                  </div>
                </div>
              </KPICard>
            </div>

            {/* Riesgo País */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <KPICard
                href="/indicadores/riesgo-pais"
                className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[240px] sm:min-h-[280px] lg:min-h-[320px] flex flex-col cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <div className="text-right min-w-0 ml-2">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-tight">
                      {data.riskCountry ? formatRiskValue(data.riskCountry.closing_value) : "N/A"}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">puntos básicos</div>
                  </div>
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Riesgo País</h3>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2 flex-grow">
                  <div className="flex justify-between items-center">
                    <span>Var. Diaria:</span>
                    <span className={`font-medium flex items-center ${getRiskChangeColor(data.riskCountry?.change_percentage ?? null)}`}>
                      {data.riskCountry && data.riskCountry.change_percentage !== null && data.riskCountry.change_percentage !== undefined ? (
                        <>
                          {getChangeIcon(data.riskCountry.change_percentage)}
                          {formatNumber(data.riskCountry.change_percentage, 2)}%
                        </>
                      ) : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Var. Mensual:</span>
                    <span className={`font-medium flex items-center ${getRiskChangeColor(data.riskCountry?.monthlyVariation)}`}>
                      {data.riskCountry?.monthlyVariation !== null && data.riskCountry?.monthlyVariation !== undefined ? (
                        <>
                          {getChangeIcon(data.riskCountry.monthlyVariation)}
                          {formatNumber(data.riskCountry.monthlyVariation, 1)}%
                        </>
                      ) : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Var. Interanual:</span>
                    <span className={`font-medium flex items-center ${getRiskChangeColor(data.riskCountry?.yearlyVariation)}`}>
                      {data.riskCountry?.yearlyVariation !== null && data.riskCountry?.yearlyVariation !== undefined ? (
                        <>
                          {getChangeIcon(data.riskCountry.yearlyVariation)}
                          {formatNumber(data.riskCountry.yearlyVariation, 1)}%
                        </>
                      ) : "N/A"}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-red-100">
                  <div className="flex items-center text-xs text-red-700">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-500 mr-2 animate-pulse flex-shrink-0"></div>
                    <span className="truncate">Mercados internacionales</span>
                  </div>
                </div>
              </KPICard>
            </div>

          </div>

          {/* Indicador de actualización */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm border border-green-200">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></div>
              <span className="truncate">Datos actualizados en tiempo real</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OptimizedKPI;