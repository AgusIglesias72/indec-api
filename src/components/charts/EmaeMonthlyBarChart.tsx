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
  ResponsiveContainer,
  Cell
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
  height?: number; // Propiedad opcional para controlar la altura
}

// Componente personalizado para el tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formattedValue = value !== undefined && value !== null 
      ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` 
      : '0.0%';
    
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium">
          <span className="text-gray-700">m/m: </span>
          <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
            {formattedValue}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

export default function EmaeMonthlyBarChart({ 
  data, 
  loading, 
  error,
  height = 280 
}: EmaeMonthlyBarChartProps) {
  // Si está cargando o hay un error, mostrar un estado de carga o error
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Skeleton className="h-[350px] w-full" />
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

  // Colores para las barras
  const positiveColor = "#22c55e"; // Verde
  const negativeColor = "#ef4444"; // Rojo

  // Preparar los datos para el gráfico
  // Tomamos los últimos 12 meses de datos y los ordenamos cronológicamente
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12)
    .map(item => {
      // Extraer el mes y año de la fecha
      const date = new Date(item.date + 'T00:00:00-04:00');
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
        <CardTitle className="text-xl font-medium text-center">Variación mensual del EMAE (desestacionalizado)</CardTitle>
        <CardDescription className="text-base text-center">Últimos 12 meses disponibles</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.9} />
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
                width={30}
              />
              {/* Línea de referencia en el valor 0 */}
              <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
              {/* Usar el tooltip personalizado */}
              <ChartTooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                content={<CustomTooltip />}
              />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              >
                {/* Usar Cell para colorear cada barra individualmente */}
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value >= 0 ? positiveColor : negativeColor} 
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  offset={5}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) => value !== undefined && value !== null ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` : ''}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      {
        /*
           <CardFooter className="flex-col items-start gap-2 text-sm px-0 pb-0 mt-4 w-full justify-center">
        <div className="flex gap-2 font-medium leading-none text-base w-full justify-center items-center">
          {trend ? (
            <>
              Crecimiento mensual de {monthlyChange.toFixed(1).replace('.', ',')}% en el último mes <TrendingUp className="h-5 w-5 text-green-500" />
            </>
          ) : (
            <>
              Caída mensual de {Math.abs(monthlyChange).toFixed(1).replace('.', ',')}% en el último mes <TrendingDown className="h-5 w-5 text-red-500" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground text-sm mt-1 text-center w-full">
          Mostrando la variación mensual desestacionalizada del EMAE
        </div>
      </CardFooter>
        */
      }
   
    </Card>
  )
} 