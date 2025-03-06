"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  LabelList, 
  XAxis, 
  YAxis,
  ReferenceLine,
  ResponsiveContainer 
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

// Definir la interfaz para los datos del EMAE
interface EmaeMonthlyBarChartProps {
  data: any[] | null;
  loading: boolean;
  error: any;
}

export default function EmaeMonthlyBarChart({ data, loading, error }: EmaeMonthlyBarChartProps) {
  // Si está cargando o hay un error, mostrar un estado de carga o error
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-indec-gray-dark">
        No se pudieron cargar los datos del EMAE
      </div>
    )
  }

  // Preparar los datos para el gráfico
  // Tomamos los últimos 12 meses de datos y los ordenamos cronológicamente
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12)
    .map(item => {
      // Extraer el mes y año de la fecha
      const date = new Date(item.date);
      const monthNames = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear().toString().slice(2); // Solo los últimos 2 dígitos del año
      
      return {
        month: `${month} ${year}`,
        value: item.monthly_pct_change || 0, // Usar la variación mensual
        originalValue: item.original_value || 0,
        date: item.date
      };
    });

  // Calcular la tendencia para el footer
  const lastItem = chartData[chartData.length - 1];
  const monthlyChange = lastItem ? lastItem.value : 0;
  const trend = monthlyChange > 0;
  
  // Configuración del gráfico
  const chartConfig = {
    value: {
      label: "Var. m/m",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  // Encontrar los valores mínimo y máximo para el eje Y
  const values = chartData.map(item => item.value).filter(val => val !== undefined && val !== null);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  // Añadir un margen del 20% para que las barras no toquen los bordes
  const yAxisDomain = [
    Math.floor(minValue * 1.2), 
    Math.ceil(maxValue * 1.2)
  ];

  return (
    <Card className="border-0 shadow-none bg-transparent h-full">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-medium">Variación mensual del EMAE (desestacionalizado)</CardTitle>
        <CardDescription>Últimos 12 meses disponibles</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer config={chartConfig} className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={true}
                fontSize={12}
              />
              <YAxis 
                tickLine={false}
                axisLine={true}
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
                domain={yAxisDomain}
              />
              {/* Línea de referencia en el valor 0 */}
              <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    hideLabel 
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Var. m/m']}  
                  />
                }
              />
              <Bar 
                dataKey="value" 
                fill={(data: any) => data.value >= 0 ? "var(--color-value)" : "#ef4444"}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  offset={8}
                  className="fill-foreground"
                  fontSize={10}
                  formatter={(value: number) => value !== undefined && value !== null ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` : ''}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm px-0 pb-0">
        <div className="flex gap-2 font-medium leading-none">
          {trend ? (
            <>
              Crecimiento mensual de {monthlyChange.toFixed(1)}% en el último mes <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : (
            <>
              Caída mensual de {Math.abs(monthlyChange).toFixed(1)}% en el último mes <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando la variación mensual desestacionalizada del EMAE
        </div>
      </CardFooter>
    </Card>
  )
} 