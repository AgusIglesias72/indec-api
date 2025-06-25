"use client"

import { useState, useMemo } from "react"
import { 
  ResponsiveContainer, 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell
} from "recharts"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { TrendingUp, TrendingDown, PieChart, Activity, BarChart3 } from "lucide-react"

interface IPCHistoricalData {
  date: string;
  monthly_change: number;
  year_over_year_change: number;
}

interface IPCEnhancedChartProps {
  data: IPCHistoricalData[] | null;
  loading: boolean;
  error: Error | null;
  height?: number;
}

// Componente personalizado para el tooltip mejorado
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  variationType?: 'monthly' | 'yearly';
}

const CustomTooltip = ({ active, payload, label, variationType = 'monthly' }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formattedValue = value !== undefined && value !== null 
      ? `${value.toFixed(1)}%` 
      : '0.0%';
    
    const isPositive = value >= 0;
    const variationLabel = variationType === 'monthly' ? 'Var. mensual' : 'Var. interanual';
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm"
      >
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          {isPositive ? 
            <TrendingUp className="h-4 w-4 text-violet-600" /> : 
            <TrendingDown className="h-4 w-4 text-violet-600" />
          }
          <span className="font-semibold text-gray-700">{variationLabel}:</span>
          <span className={`font-bold ${variationType === 'monthly' ? 'text-violet-600' : 'text-violet-700'}`}>
            {formattedValue}
          </span>
        </div>
      </motion.div>
    );
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
      <PieChart className="h-8 w-8 text-violet-300 animate-pulse" />
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
            className="bg-violet-200 rounded-sm"
          />
        ))}
      </div>
    </motion.div>
  </div>
);

export default function IPCEnhancedChart({ 
  data, 
  loading, 
  error, 
  height = 320 
}: IPCEnhancedChartProps) {
  const [variationType, setVariationType] = useState<'monthly' | 'yearly'>('monthly');

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
        monthly: item.monthly_change || 0,
        yearly: item.year_over_year_change || 0,
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
        <PieChart className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-center text-sm">
          No se pudieron cargar los datos del IPC
        </p>
        <p className="text-center text-xs text-gray-400 mt-1">
          Verifica tu conexión e inténtalo nuevamente
        </p>
      </motion.div>
    );
  }

  // Determinar color y configuración según el tipo de variación
  const currentConfig = {
    monthly: {
      color: '#8b5cf6',
      dataKey: 'monthly',
      name: 'Variación Mensual',
      icon: BarChart3
    },
    yearly: {
      color: '#7c3aed', 
      dataKey: 'yearly',
      name: 'Variación Interanual',
      icon: Activity
    }
  };

  const config = currentConfig[variationType];
  const IconComponent = config.icon;

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
                <PieChart className="h-5 w-5 text-violet-600" />
                Variación del IPC
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Últimos 12 meses disponibles
              </CardDescription>
            </div>
            <Tabs 
              defaultValue="monthly" 
              className="w-auto"
              onValueChange={(value) => setVariationType(value as 'monthly' | 'yearly')}
            >
              <TabsList className="bg-gray-100 border border-gray-200">
                <TabsTrigger 
                  value="monthly" 
                  className="text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Mensual
                </TabsTrigger>
                <TabsTrigger 
                  value="yearly" 
                  className="text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Interanual
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <motion.div 
            key={variationType}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: height }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
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
                  domain={[0, 'auto']}
                />
                <Tooltip 
                  content={<CustomTooltip variationType={variationType} />}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar 
                  dataKey={config.dataKey}
                  name={config.name}
                  fill={config.color}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                >
                  <LabelList 
                    dataKey={config.dataKey}
                    position="top" 
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                    style={{ fontSize: 10, fill: '#6b7280' }}
                    offset={5}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}