"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getDollarRatesHistory } from '@/services/api-dollar';
import { DollarRateData } from '@/types/dollar';
import { DollarType } from '@/types/dollar';

interface DollarRatesChartProps {
  title?: string;
  description?: string;
  types?: DollarType[];
  days?: number;
  height?: number;
  showBuy?: boolean;
  showSell?: boolean;
  className?: string;
}

export default function DollarRatesChart({
  title = "Evolución del Dólar",
  description = "Cotizaciones históricas",
  types = ['BLUE', 'OFICIAL', 'CCL', 'MEP', 'CRYPTO', 'MAYORISTA', 'TARJETA'],
  days = 30,
  height = 350,
  showBuy = true,
  showSell = true,
  className = ""
}: DollarRatesChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Colores para diferentes tipos de dólar
  const typeColors: Record<DollarType, { buy: string, sell: string }> = {
    'BLUE': { buy: '#3b82f6', sell: '#1d4ed8' },
    'OFICIAL': { buy: '#10b981', sell: '#047857' },
    'CCL': { buy: '#f97316', sell: '#c2410c' },
    'MEP': { buy: '#8b5cf6', sell: '#6d28d9' },
    'CRYPTO': { buy: '#ec4899', sell: '#be185d' },
    'MAYORISTA': { buy: '#64748b', sell: '#334155' },
    'TARJETA': { buy: '#f43f5e', sell: '#be123c' }
  };

  // Nombres más amigables para la leyenda
  const typeNames: Record<DollarType, string> = {
    'BLUE': 'Blue',
    'OFICIAL': 'Oficial',
    'CCL': 'Contado con Liqui',
    'MEP': 'MEP (Bolsa)',
    'CRYPTO': 'Cripto',
    'MAYORISTA': 'Mayorista',
    'TARJETA': 'Tarjeta'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Calcular fecha de inicio (hace N días)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];
        
        // Obtener datos históricos
        const historicalData = await getDollarRatesHistory(types, startDate, endDate);
        
        if (historicalData && historicalData.length > 0) {
          // Agrupar por fecha para el gráfico
          const groupedByDate = historicalData.reduce((acc, item) => {
            if (!acc[item.date]) {
              acc[item.date] = { date: item.date };
            }
            
            // Añadir precios de compra y venta con prefijo del tipo de dólar
            if (showBuy) {
              acc[item.date][`${item.dollar_type}_buy`] = item.buy_price;
            }
            if (showSell) {
              acc[item.date][`${item.dollar_type}_sell`] = item.sell_price;
            }
            
            return acc;
          }, {} as Record<string, any>);
          
          // Convertir a array y ordenar por fecha
          const chartData = Object.values(groupedByDate).sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          
          setData(chartData);
          setError(null);
        } else {
          setError('No se encontraron datos para el período solicitado');
        }
      } catch (err) {
        console.error('Error al cargar datos históricos:', err);
        setError('Error al cargar datos históricos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [types, days, showBuy, showSell]);

  // Formatear fechas para el eje X
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };

  // Formatear valores para el tooltip
  const formatTooltipValue = (value: number) => {
    return `${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('es-AR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric' 
      });
      
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium mb-2">{formattedDate}</p>
          {payload.map((entry: any, index: number) => {
            // Extraer tipo de dólar y operación (compra/venta) del nombre del dataKey
            const [dollarType, operation] = entry.dataKey.split('_');
            const displayName = `${typeNames[dollarType as DollarType] || dollarType} (${operation === 'buy' ? 'Compra' : 'Venta'})`;
            
            return (
              <div key={index} className="flex items-center gap-2 my-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-700">{displayName}:</span>
                <span className="text-sm font-medium">{formatTooltipValue(entry.value)}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Renderizar esqueleto de carga
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className={`w-full h-[${height}px]`} />
        </CardContent>
      </Card>
    );
  }

  // Renderizar mensaje de error
  if (error || !data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-indec-gray-dark">{error || 'No hay datos disponibles'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis} 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                tickFormatter={(value) => `${value}`} 
                tick={{ fontSize: 12 }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Renderizar líneas para cada tipo de dólar */}
              {types.map(type => (
                <React.Fragment key={type}>
                  {showBuy && (
                    <Line 
                      type="monotone" 
                      dataKey={`${type}_buy`}
                      stroke={typeColors[type]?.buy || '#000000'}
                      strokeWidth={2}
                      name={`${typeNames[type] || type} (Compra)`}
                      dot={{ r: 1 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {showSell && (
                    <Line 
                      type="monotone" 
                      dataKey={`${type}_sell`}
                      stroke={typeColors[type]?.sell || '#666666'}
                      strokeWidth={2}
                      name={`${typeNames[type] || type} (Venta)`}
                      dot={{ r: 1 }}
                      activeDot={{ r: 6 }}
                      style={{ opacity: 0.85 }}
                    />
                  )}
                </React.Fragment>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Fuente: INDEC
        </div>
      </CardFooter>
    </Card>
  );
}