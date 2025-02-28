"use client"

import { motion } from "framer-motion"
import { LineChart, ArrowUpRight, ArrowDownRight } from "lucide-react"
import Counter from "@/components/ui/counter"

export default function DashboardPreview() {
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
                  <Counter end={152.3} decimals={1} />
                </div>
              </div>
              <div className="flex items-center text-indec-green text-xs font-medium">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                <span><Counter end={2.1} decimals={1} suffix="%" duration={1.5} /></span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-indec-gray-medium/20 rounded-full overflow-hidden">
              <div className="h-full bg-indec-blue w-[70%] rounded-full"></div>
            </div>
          </div>

          <div className="rounded-lg bg-indec-gray-light/50 p-3 border border-indec-gray-medium/30">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs text-indec-gray-dark font-medium">
                  IPC (mensual)
                </div>
                <div className="text-xl font-mono font-semibold text-indec-red">
                  <Counter end={4.2} decimals={1} suffix="%" />
                </div>
              </div>
              <div className="flex items-center text-indec-red text-xs font-medium">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                <span><Counter end={0.3} decimals={1} prefix="+" suffix="pp" duration={1.5} /></span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-indec-gray-medium/20 rounded-full overflow-hidden">
              <div className="h-full bg-indec-red w-[60%] rounded-full"></div>
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
                d="M0,100 C20,90 40,85 60,75 C80,65 100,60 120,50 C140,40 160,45 180,35 C200,25 220,35 240,30" 
                fill="none" 
                stroke="#005288" 
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            
            {/* Data points */}
            <div className="absolute bottom-[90px] left-[20px] h-2 w-2 rounded-full bg-indec-blue"></div>
            <div className="absolute bottom-[85px] left-[40px] h-2 w-2 rounded-full bg-indec-blue"></div>
            <div className="absolute bottom-[75px] left-[60px] h-2 w-2 rounded-full bg-indec-blue"></div>
            <div className="absolute bottom-[50px] left-[120px] h-2 w-2 rounded-full bg-indec-blue"></div>
            <div className="absolute bottom-[35px] left-[180px] h-2 w-2 rounded-full bg-indec-blue"></div>
            <div className="absolute bottom-[30px] left-[240px] h-2 w-2 rounded-full bg-indec-blue"></div>
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
  )
}