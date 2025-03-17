"use client"

import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, RefreshCw, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getLatestDollarRates, DollarRateData } from '@/services/api-dollar';
import { DollarType } from '@/types/dollar';
import Link from 'next/link';

interface DollarRatesCardProps {
  title?: string;
  description?: string;
  showTypes?: DollarType[];
  className?: string;
}

export default function DollarRatesCard({
  title = "Cotizaciones de Dólar",
  description = "Últimas cotizaciones disponibles",
  showTypes = ['BLUE', 'OFICIAL', 'CCL', 'MEP'],
  className = ""
}: DollarRatesCardProps) {
  const [dollarRates, setDollarRates] = useState<DollarRateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Definir nombres más amigables para mostrar
  const typeNames: Record<DollarType, string> = {
    'BLUE': 'Blue',
    'OFICIAL': 'Oficial',
    'CCL': 'Contado con Liqui',
    'MEP': 'MEP (Bolsa)',
    'CRYPTO': 'Cripto',
    'MAYORISTA': 'Mayorista',
    'TARJETA': 'Tarjeta'
  };

  // Cargar datos
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const data = await getLatestDollarRates();
      
      if (data && data.length > 0) {
        // Filtrar por tipos solicitados y ordenar según el array showTypes
        const filteredData = showTypes
          .map(type => data.find(rate => rate.dollar_type === type))
          .filter(rate => rate !== undefined) as DollarRateData[];
        
        setDollarRates(filteredData);
        
        // Obtener la fecha de última actualización
        if (data[0]?.last_updated) {
          const date = new Date(data[0].last_updated);
          setLastUpdated(date.toLocaleString('es-AR'));
        }
        
        setError(null);
      } else {
        setError('No se encontraron datos');
      }
    } catch (err) {
      console.error('Error al cargar cotizaciones:', err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Formatear valores monetarios
  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Renderizar esqueleto de carga
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="grid grid-cols-3 gap-4 items-center">
                <Skeleton className="h-10" />
                <Skeleton className="h-7" />
                <Skeleton className="h-7" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-24" />
        </CardFooter>
      </Card>
    );
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48">
            <p className="text-indec-gray-dark mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dollarRates.map((rate, index) => (
            <motion.div
              key={rate.dollar_type}
              className="grid grid-cols-3 text-sm md:text-base bg-background rounded-md p-3 shadow-sm border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="font-semibold">{typeNames[rate.dollar_type] || rate.dollar_type}</div>
              <div className="text-right font-mono">
                ${formatCurrency(rate.buy_price)}
              </div>
              <div className="text-right font-mono">
                ${formatCurrency(rate.sell_price)}
              </div>
            </motion.div>
          ))}

          {/* Leyenda */}
          <div className="text-xs text-indec-gray-dark grid grid-cols-3 px-3 mt-2">
            <div></div>
            <div className="text-right">Compra</div>
            <div className="text-right">Venta</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-indec-gray-dark">
          {lastUpdated ? `Actualizado: ${lastUpdated}` : 'Datos actualizados diariamente'}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={fetchData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Actualizar</span>
        </Button>
      </CardFooter>
    </Card>
  );
}