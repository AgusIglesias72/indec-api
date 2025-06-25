"use client"

import { useState, useMemo } from "react"
import { 
  ResponsiveContainer, 
  LineChart,
  BarChart,
  AreaChart,
  Area,
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from "recharts"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react"

interface EmaeEnhancedChartProps {
  data: any[] | null;
  loading: boolean;
  error: any;
  height?: number;
}

// Componente personalizado para el tooltip mejorado
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  viewType?: 'series' | 'variations';
}

const CustomTooltip = ({ active, payload, label, viewType = 'variations' }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    if (viewType === 'variations') {
      const value = payload[0].value;
      const formattedValue = value !== undefined && value !== null 
        ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` 
        : '0.0%';
      
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm"
        >
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            {value >= 0 ? 
              <TrendingUp className="h-4 w-4 text-green-600" /> : 
              <TrendingDown className="h-4 w-4 text-red-600" />
            }
            <span className="font-semibold text-gray-700">Var. m/m:</span>
            <span className={`font-bold ${value >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formattedValue}
            </span>
          </div>
        </motion.div>
      );
    } else {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm"
        >
          <p className="text-sm text-gray-500 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4" style={{ color: entry.color }} />
              <span className="font-semibold text-gray-700">{entry.name}:</span>
              <span className="font-bold" style={{ color: entry.color }}>
                {entry.value.toFixed(1)}
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
  }

  return null;
};

// Componente de loading mejorado
const ChartSkeleton = ({ height }: { height: number }) => (
  <div className="w-full h-full flex flex-col justify-center items-center" style={{ height }}>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <BarChart3 className="h-8 w-8 text-blue-300 animate-pulse" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="grid grid-cols-12 gap-1 w-full max-w-md">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: Math.random() * 60 + 20 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bg-blue-200 rounded-sm"
          />
        ))}
      </div>
    </motion.div>
  </div>
);

export default function EmaeEnhancedChart({ 
  data, 
  loading, 
  error,
  height = 320 
}: EmaeEnhancedChartProps) {
  const [viewType, setViewType] = useState<'series' | 'variations'>('variations');

  // Procesamos los datos para ambos tipos de visualización
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sortedData = [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-12);
      
    return sortedData.map(item => {
      const date = new Date(item.date);
      const monthNames = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear().toString().slice(2);
      
      return {
        month: `${month} ${year}`,
        value: item.monthly_pct_change || 0,
        originalValue: item.original_value || 0,
        seriesValue: item.seasonally_adjusted_value || 0,
        date: item.date
      };
    });
  }, [data]);

  // Estados de loading y error mejorados
  if (loading) {
    return <ChartSkeleton height={height} />;
  }

  if (error || !data || data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex flex-col items-center justify-center text-gray-500"
        style={{ height }}
      >
        <BarChart3 className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-center text-sm">
          No se pudieron cargar los datos del EMAE
        </p>
        <p className="text-center text-xs text-gray-400 mt-1">
          Verifica tu conexión e inténtalo nuevamente
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="border-0 shadow-none bg-transparent h-full">
        <CardHeader className="px-0 pt-0 pb-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                EMAE (desestacionalizado)
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Últimos 12 meses disponibles
              </CardDescription>
            </div>
            <Tabs 
              defaultValue="variations" 
              className="w-auto"
              onValueChange={(value) => setViewType(value as 'series' | 'variations')}
            >
              <TabsList className="bg-gray-100 border border-gray-200">
                <TabsTrigger 
                  value="variations" 
                  className="text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Variaciones
                </TabsTrigger>
                <TabsTrigger 
                  value="series" 
                  className="text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Serie
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <motion.div 
            key={viewType}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: height - 80 }}
          >
            {viewType === 'variations' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                >
                  <CartesianGrid 
                    vertical={false} 
                    strokeDasharray="3 3" 
                    stroke="#e5e7eb" 
                    opacity={0.6} 
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    height={60}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickFormatter={(value) => `${value}%`}
                    width={45}
                  />
                  <ReferenceLine 
                    y={0} 
                    stroke="#374151" 
                    strokeWidth={1.5} 
                    strokeDasharray="2 2"
                    opacity={0.7}
                  />
                  <Tooltip 
                    content={<CustomTooltip viewType="variations" />}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Variación Mensual"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={28}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value >= 0 ? "#10b981" : "#ef4444"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#e5e7eb" 
                    opacity={0.6} 
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    height={60}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickFormatter={(value) => value.toFixed(0)}
                    width={45}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip 
                    content={<CustomTooltip viewType="series" />}
                    cursor={{ stroke: 'rgba(59, 130, 246, 0.3)', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="seriesValue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#blueGradient)"
                    dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ 
                      r: 6, 
                      fill: "#3b82f6", 
                      strokeWidth: 3, 
                      stroke: "#ffffff",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}