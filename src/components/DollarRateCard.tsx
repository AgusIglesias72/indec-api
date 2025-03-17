"use client"

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getLatestDollarRate, DollarRateData } from '@/services/api-dollar';
import { DollarType } from '@/types/dollar';

interface DollarRateCardProps {
  title?: string;
  dollarType: DollarType;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showBuy?: boolean;
  showSell?: boolean;
  compactMode?: boolean;
  onChange?: (data: DollarRateData | null) => void;
}

export default function DollarRateCard({
  title,
  dollarType,
  className = "",
  showHeader = true,
  showFooter = true,
  showBuy = true,
  showSell = true,
  compactMode = false,
  onChange
}: DollarRateCardProps) {
  const [dollarRate, setDollarRate] = useState<DollarRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Definir nombres más amigables para mostrar
  const typeNames: Record<DollarType, string> = {
    'BLUE': 'Dólar Blue',
    'OFICIAL': 'Dólar Oficial',
    'CCL': 'Contado con Liqui',
    'MEP': 'Dólar MEP (Bolsa)',
    'CRYPTO': 'Dólar Cripto',
    'MAYORISTA': 'Dólar Mayorista',
    'TARJETA': 'Dólar Tarjeta'
  };

  // Cargar datos
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const data = await getLatestDollarRate(dollarType);
      
      if (data) {
        setDollarRate(data);
        
        // Obtener la fecha de última actualización
        if (data.last_updated) {
          const date = new Date(data.last_updated);
          setLastUpdated(date.toLocaleString('es-AR'));
        }
        
        setError(null);
        
        // Notificar el cambio si se proporcionó un callback
        if (onChange) {
          onChange(data);
        }
      } else {
        setError('No se encontraron datos');
        
        // Notificar el cambio si se proporcionó un callback
        if (onChange) {
          onChange(null);
        }
      }
    } catch (err) {
      console.error(`Error al cargar cotización de ${dollarType}:`, err);
      setError('Error al cargar datos');
      
      // Notificar el cambio si se proporcionó un callback
      if (onChange) {
        onChange(null);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dollarType]);

  // Formatear valores monetarios
  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Definir título dinámico si no se proporciona uno
  const displayTitle = title || typeNames[dollarType] || `Dólar ${dollarType}`;

  // Renderizar esqueleto de carga
  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader className={compactMode ? "p-4 pb-0" : undefined}>
            <CardTitle className={compactMode ? "text-base" : undefined}>{displayTitle}</CardTitle>
            {!compactMode && <CardDescription>Última cotización disponible</CardDescription>}
          </CardHeader>
        )}
        <CardContent className={compactMode ? "p-4" : undefined}>
          <div className="space-y-2">
            {showBuy && <Skeleton className="h-8 w-full" />}
            {showSell && <Skeleton className="h-8 w-full" />}
          </div>
        </CardContent>
        {showFooter && (
          <CardFooter className={compactMode ? "p-4 pt-0" : undefined}>
            <Skeleton className="h-4 w-32" />
          </CardFooter>
        )}
      </Card>
    );
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader className={compactMode ? "p-4 pb-0" : undefined}>
            <CardTitle className={compactMode ? "text-base" : undefined}>{displayTitle}</CardTitle>
            {!compactMode && <CardDescription>Última cotización disponible</CardDescription>}
          </CardHeader>
        )}
        <CardContent className={compactMode ? "p-4" : undefined}>
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-indec-gray-dark mb-2">{error}</p>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-3 w-3 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className={compactMode ? "p-4 pb-0" : undefined}>
          <CardTitle className={compactMode ? "text-base" : undefined}>{displayTitle}</CardTitle>
          {!compactMode && <CardDescription>Última cotización disponible</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={compactMode ? "p-4" : undefined}>
        {dollarRate && (
          <div className="space-y-3">
            {showBuy && (
              <div className="flex justify-between items-center">
                <span className={`text-indec-gray-dark ${compactMode ? "text-sm" : ""}`}>Compra</span>
                <span className={`font-mono font-semibold ${compactMode ? "text-xl" : "text-2xl"}`}>
                  ${formatCurrency(dollarRate.buy_price)}
                </span>
              </div>
            )}
            
            {showSell && (
              <div className="flex justify-between items-center">
                <span className={`text-indec-gray-dark ${compactMode ? "text-sm" : ""}`}>Venta</span>
                <span className={`font-mono font-semibold ${compactMode ? "text-xl" : "text-2xl"}`}>
                  ${formatCurrency(dollarRate.sell_price)}
                </span>
              </div>
            )}
            
            {/* Spread (diferencia porcentual) */}
            {showBuy && showSell && dollarRate.spread !== undefined && !compactMode && (
              <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t">
                <span className="text-indec-gray-dark">Spread</span>
                <span className="font-medium">
                  {dollarRate.spread.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {showFooter && (
        <CardFooter className={`flex justify-between ${compactMode ? "p-4 pt-0 text-xs" : "text-sm"}`}>
          <div className="text-indec-gray-dark">
            {lastUpdated ? 
              (compactMode ? `Act: ${lastUpdated.split(' ')[0]}` : `Actualizado: ${lastUpdated}`) 
              : 'Datos actualizados diariamente'}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2"
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}