import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAppData } from "@/lib/DataProvider";
import Counter from "@/components/ui/counter";

export default function DashboardPreview() {
  const { emaeData, ipcData, loadingEmae, loadingIPC } = useAppData();
  const [chartData, setChartData] = useState<{x: number, y: number}[]>([]);

  // Generar datos simulados para el gráfico basados en EMAE real
  useEffect(() => {
    if (emaeData) {
      // Crear puntos para la línea del gráfico
      // Simulamos datos de 6 meses basados en el valor real y tendencias aleatorias
      const monthlyChange = emaeData.monthly_change / 100; // convertir a decimal
      
      // Generar puntos para 6 meses usando el cambio mensual como tendencia base
      const newChartData = [
        { x: 20, y: 90 }, // Enero (punto inicial más bajo)
        { x: 40, y: 85 }, // Febrero (bajada)
        { x: 60, y: 75 }, // Marzo (más bajada)
        { x: 120, y: 50 }, // Abril (gran bajada)
        { x: 180, y: 35 }, // Mayo (continuando bajada)
        { x: 240, y: 30 }  // Junio (último punto, el más bajo)
      ];

      // Si la tendencia es positiva, invertimos la dirección de la línea
      if (monthlyChange > 0) {
        newChartData.reverse();
      }
      
      setChartData(newChartData);
    }
  }, [emaeData]);

  return (
    <motion.div 
      className="relative w-full h-full rounded-lg bg-white shadow-lg border border-indec-gray-medium overflow-hidden"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-indec-gray-medium">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-indec-blue flex items-center justify-center">
            <LineChart className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-indec-blue-dark">Panel Económico</span>
        </div>
        <div className="flex space-x-1">
          <div className="h-2.5 w-2.5 rounded-full bg-indec-gray-medium"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-indec-gray-medium"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-indec-gray-medium"></div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-4">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-indec-gray-light/50 p-3 border border-indec-gray-medium/30">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs text-indec-gray-dark font-medium">
                  EMAE
                </div>
                <div className="text-xl font-mono font-semibold text-indec-blue-dark">
                  {loadingEmae ? (
                    <div className="animate-pulse h-6 w-16 bg-indec-gray-light rounded"></div>
                  ) : (
                    <Counter end={emaeData?.original_value || 0} decimals={1} />
                  )}
                </div>
              </div>
              <div className={`flex items-center ${
                emaeData && emaeData.year_over_year_change >= 0 
                  ? 'text-indec-green' 
                  : 'text-indec-red'
              } text-xs font-medium`}>
                {loadingEmae ? (
                  <div className="animate-pulse h-4 w-12 bg-indec-gray-light rounded"></div>
                ) : emaeData && (
                  <>
                    {emaeData.year_over_year_change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    <span>
                      <Counter 
                        end={Math.abs(emaeData.year_over_year_change)} 
                        decimals={1} 
                        suffix="%" 
                        prefix={emaeData.year_over_year_change >= 0 ? "+" : "-"}
                        duration={1.5} 
                      />
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="h-1.5 w-full bg-indec-gray-medium/20 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${
                emaeData && emaeData.year_over_year_change >= 0 
                  ? 'bg-indec-blue' 
                  : 'bg-indec-red'
              } transition-all duration-1000`} style={{
                width: loadingEmae 
                  ? '50%' 
                  : `${Math.min(Math.abs(emaeData?.year_over_year_change || 0) * 3 + 30, 90)}%`
              }}></div>
            </div>
          </div>

          <div className="rounded-lg bg-indec-gray-light/50 p-3 border border-indec-gray-medium/30">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs text-indec-gray-dark font-medium">
                  IPC (mensual)
                </div>
                <div className="text-xl font-mono font-semibold text-indec-red">
                  {loadingIPC ? (
                    <div className="animate-pulse h-6 w-16 bg-indec-gray-light rounded"></div>
                  ) : (
                    <Counter end={ipcData?.monthly_change || 0} decimals={1} suffix="%" />
                  )}
                </div>
              </div>
              <div className="flex items-center text-indec-red text-xs font-medium">
                {loadingIPC ? (
                  <div className="animate-pulse h-4 w-12 bg-indec-gray-light rounded"></div>
                ) : ipcData && (
                  <>
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span>
                      <Counter 
                        end={0.3} 
                        decimals={1} 
                        prefix="+" 
                        suffix="pp" 
                        duration={1.5} 
                      />
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="h-1.5 w-full bg-indec-gray-medium/20 rounded-full overflow-hidden">
              <div className="h-full bg-indec-red transition-all duration-1000" style={{
                width: loadingIPC 
                  ? '50%' 
                  : `${Math.min((ipcData?.monthly_change || 0) * 10 + 20, 90)}%`
              }}></div>
            </div>
          </div>
        </div>

        {/* Gráfico simulado */}
        <div className="rounded-lg border border-indec-gray-medium/30 p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-indec-blue-dark">Evolución EMAE</div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-6 rounded-sm bg-indec-blue"></div>
              <div className="h-2 w-6 rounded-sm bg-indec-gray-medium"></div>
            </div>
          </div>
          
          {/* Chart simulation */}
          <div className="h-32 relative">
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-indec-gray-medium"></div>
            <div className="absolute inset-y-0 left-0 w-[1px] bg-indec-gray-medium"></div>
            
            {/* Background grid lines */}
            <div className="absolute left-0 bottom-1/4 right-0 h-[1px] bg-indec-gray-medium/20"></div>
            <div className="absolute left-0 bottom-2/4 right-0 h-[1px] bg-indec-gray-medium/20"></div>
            <div className="absolute left-0 bottom-3/4 right-0 h-[1px] bg-indec-gray-medium/20"></div>
            
            {/* Primary line */}
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <path 
                d={`M${chartData.map(point => `${point.x},${point.y}`).join(' ')}`}
                fill="none" 
                stroke={emaeData && emaeData.monthly_change >= 0 ? "#005288" : "#D10A10"}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            
            {/* Data points */}
            {chartData.map((point, index) => (
              <div 
                key={index} 
                className={`absolute h-2 w-2 rounded-full ${
                  emaeData && emaeData.monthly_change >= 0 ? 'bg-indec-blue' : 'bg-indec-red'
                }`}
                style={{ 
                  bottom: `${point.y}px`, 
                  left: `${point.x}px` 
                }}
              ></div>
            ))}
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-indec-gray-dark">
            <div>Ene</div>
            <div>Feb</div>
            <div>Mar</div>
            <div>Abr</div>
            <div>May</div>
            <div>Jun</div>
          </div>
        </div>
        
        {/* Bottom toolbar */}
        <div className="flex gap-2 pt-1">
          <div className="rounded-md bg-indec-blue text-white text-xs px-3 py-1.5 flex items-center">
            <span>General</span>
          </div>
          <div className="rounded-md bg-indec-gray-light text-indec-gray-dark text-xs px-3 py-1.5 flex items-center">
            <span>Actividad</span>
          </div>
          <div className="rounded-md bg-indec-gray-light text-indec-gray-dark text-xs px-3 py-1.5 flex items-center">
            <span>Precios</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}