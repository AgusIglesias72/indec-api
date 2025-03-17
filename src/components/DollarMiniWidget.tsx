"use client"

import React, { useState, useEffect } from 'react';
import { getLatestDollarRate, DollarRateData } from '@/services/api-dollar';
import { DollarType } from '@/types/dollar';
import { cn } from '@/lib/utils';

interface DollarMiniWidgetProps {
  dollarType: DollarType;
  showLabel?: boolean;
  showBuy?: boolean;
  showSell?: boolean;
  compact?: boolean;
  className?: string;
}

export default function DollarMiniWidget({
  dollarType,
  showLabel = true,
  showBuy = false,
  showSell = true,
  compact = false,
  className
}: DollarMiniWidgetProps) {
  const [dollarRate, setDollarRate] = useState<DollarRateData | null>(null);
  const [loading, setLoading] = useState(true);

  // Definir nombres cortos para las etiquetas
  const typeLabels: Record<DollarType, string> = {
    'BLUE': 'Blue',
    'OFICIAL': 'Oficial',
    'CCL': 'CCL',
    'MEP': 'MEP',
    'CRYPTO': 'Cripto',
    'MAYORISTA': 'Mayorista',
    'TARJETA': 'Tarjeta'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getLatestDollarRate(dollarType);
        setDollarRate(data);
      } catch (err) {
        console.error(`Error al cargar cotización de ${dollarType}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dollarType]);

  // Formatear valores monetarios
  const formatCurrency = (value: number) => {
    if (compact) {
      // Formato corto (ej: 1.250)
      return value.toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    
    // Formato normal (ej: 1.250,00)
    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <div className={cn("inline-flex items-center gap-1 bg-indec-gray-light/50 px-2 py-1 rounded-md animate-pulse", className)}>
        <div className="h-3 w-8 bg-indec-gray-medium rounded"></div>
        <div className="h-3 w-12 bg-indec-gray-medium rounded"></div>
      </div>
    );
  }

  if (!dollarRate) {
    return null;
  }

  return (
    <div className={cn("inline-flex items-center gap-1 bg-indec-gray-light/30 px-2 py-1 rounded-md whitespace-nowrap", className)}>
      {showLabel && (
        <span className="text-xs font-medium text-indec-gray-dark">
          {typeLabels[dollarType]}:
        </span>
      )}
      
      {showBuy && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-indec-gray-dark">C:</span>
          <span className="text-xs font-mono font-medium">
            ${formatCurrency(dollarRate.buy_price)}
          </span>
        </div>
      )}
      
      {showBuy && showSell && (
        <span className="text-xs text-indec-gray-dark">/</span>
      )}
      
      {showSell && (
        <div className="flex items-center gap-1">
          {showBuy && <span className="text-xs text-indec-gray-dark">V:</span>}
          <span className="text-xs font-mono font-medium">
            ${formatCurrency(dollarRate.sell_price)}
          </span>
        </div>
      )}
    </div>
  );
}