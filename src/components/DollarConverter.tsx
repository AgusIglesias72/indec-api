'use client';

import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { ArrowUpDown, Calculator, TrendingUp, DollarSign, Calendar, ChevronDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { DollarType, DollarRateData } from '@/types/dollar';
import Flag from 'react-world-flags';
import { NativeDatePicker } from '@/components/ui/native-date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DollarConverterProps {
  dollarRates: Record<DollarType, DollarRateData | null>;
  loading?: boolean;
}

type ConversionDirection = 'USD_TO_ARS' | 'ARS_TO_USD';
type PriceType = 'buy' | 'sell' | 'average';

const CountryFlag = memo(function CountryFlag({ country, className }: { country: 'US' | 'AR'; className?: string }) {
  const countryCode = country === 'US' ? 'US' : 'AR';

  return (
    <div className={`${className} rounded-sm overflow-hidden flex items-center justify-center shadow-sm`}>
      <Flag code={countryCode} className="w-full h-full object-cover" />
    </div>
  );
});

const DollarConverter = memo(function DollarConverter({ dollarRates, loading = false }: DollarConverterProps) {
  const [amount, setAmount] = useState<string>('100');
  const [selectedDollarType, setSelectedDollarType] = useState<DollarType>('OFICIAL');
  const [priceType, setPriceType] = useState<PriceType>('average');
  const [conversionDirection, setConversionDirection] = useState<ConversionDirection>('USD_TO_ARS');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [historicalRate, setHistoricalRate] = useState<DollarRateData | null>(null);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [dollarTypeOpen, setDollarTypeOpen] = useState(false);

  // Dollar type options with friendly names and colors
  const dollarTypeOptions = useMemo(() => [
    { value: 'OFICIAL' as DollarType, label: 'Oficial', description: 'Cotización oficial del BCRA', color: 'blue' },
    { value: 'BLUE' as DollarType, label: 'Blue', description: 'Mercado paralelo', color: 'indigo' },
    { value: 'MEP' as DollarType, label: 'MEP', description: 'Mercado Electrónico de Pagos', color: 'green' },
    { value: 'CCL' as DollarType, label: 'CCL', description: 'Contado con Liquidación', color: 'purple' },
    { value: 'CRYPTO' as DollarType, label: 'Cripto', description: 'Criptomonedas stables', color: 'orange' },
    { value: 'MAYORISTA' as DollarType, label: 'Mayorista', description: 'Mercado mayorista', color: 'gray' },
    { value: 'TARJETA' as DollarType, label: 'Tarjeta', description: 'Compras en el exterior', color: 'red' }
  ], []);

  // Get current or historical rate
  const currentRate = useMemo(() => {
    if (selectedDate && historicalRate) {
      return historicalRate;
    }
    return dollarRates[selectedDollarType] || null;
  }, [selectedDate, historicalRate, dollarRates, selectedDollarType]);

  // Calculate exchange rate based on price type
  const exchangeRate = useMemo(() => {
    if (!currentRate) return 0;

    switch (priceType) {
      case 'buy':
        return currentRate.buy_price || currentRate.sell_price || 0;
      case 'sell':
        return currentRate.sell_price || 0;
      case 'average':
        if (currentRate.buy_price && currentRate.sell_price) {
          return (currentRate.buy_price + currentRate.sell_price) / 2;
        }
        return currentRate.sell_price || 0;
      default:
        return 0;
    }
  }, [currentRate, priceType]);

  // Calculate conversion result
  const conversionResult = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    if (conversionDirection === 'USD_TO_ARS') {
      return numAmount * exchangeRate;
    } else {
      return numAmount / exchangeRate;
    }
  }, [amount, exchangeRate, conversionDirection]);

  // Format currency
  const formatCurrency = useMemo(() => (value: number, currency: 'USD' | 'ARS') => {
    const locale = currency === 'USD' ? 'en-US' : 'es-AR';
    const currencyCode = currency;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  // Generate conversion phrase
  const conversionPhrase = useMemo(() => {
    if (!currentRate || !amount || isNaN(parseFloat(amount))) return '';

    const numAmount = parseFloat(amount);
    const dollarTypeName = dollarTypeOptions.find(opt => opt.value === selectedDollarType)?.label || selectedDollarType;
    const priceTypeName = priceType === 'buy' ? 'compra' :
      priceType === 'sell' ? 'venta' :
        'promedio';

    const dateContext = selectedDate ? `el ${selectedDate.toLocaleDateString('es-AR')}` : 'en este momento';

    if (conversionDirection === 'USD_TO_ARS') {
      return `${dateContext}, ${formatCurrency(numAmount, 'USD')} ${numAmount === 1 ? 'corresponde' : 'corresponden'} a ${formatCurrency(conversionResult, 'ARS')} al tipo de cambio ${dollarTypeName.toLowerCase()} (${priceTypeName}).`;
    } else {
      return `${dateContext}, ${formatCurrency(numAmount, 'ARS')} ${numAmount === 1 ? 'corresponde' : 'corresponden'} a ${formatCurrency(conversionResult, 'USD')} al tipo de cambio ${dollarTypeName.toLowerCase()} (${priceTypeName}).`;
    }
  }, [currentRate, amount, selectedDollarType, priceType, conversionDirection, conversionResult, formatCurrency, dollarTypeOptions, selectedDate]);

  // Fetch historical data when date is selected
  const fetchHistoricalRate = useCallback(async (date: Date) => {
    const dateString = date.toISOString().split('T')[0];

    setLoadingHistorical(true);
    try {
      const response = await fetch(`/api/dollar?type=daily&dollar_type=${selectedDollarType}&start_date=${dateString}&end_date=${dateString}&limit=1`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        setHistoricalRate(result.data[0]);
      } else {
        setHistoricalRate(null);
      }
    } catch (error) {
      console.error('Error fetching historical rate:', error);
      setHistoricalRate(null);
    } finally {
      setLoadingHistorical(false);
    }
  }, [selectedDollarType]);

  // Handle date selection
  const handleDateChange = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    if (newDate) {
      fetchHistoricalRate(newDate);
    } else {
      setHistoricalRate(null);
    }
  };

  // Re-fetch historical data when dollar type changes (if date is selected)
  useEffect(() => {
    if (selectedDate && selectedDollarType) {
      fetchHistoricalRate(selectedDate);
    }
  }, [selectedDollarType, selectedDate, fetchHistoricalRate]);

  // Handle conversion direction swap
  const handleSwapDirection = () => {
    setConversionDirection(prev =>
      prev === 'USD_TO_ARS' ? 'ARS_TO_USD' : 'USD_TO_ARS'
    );
  };

  const isFromUSD = conversionDirection === 'USD_TO_ARS';

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="group relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-green-400/20 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-green-100">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="group relative"
    >
      {/* Gradient background effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-green-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>

      {/* Main converter card */}
      <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-green-100">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Calculator className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Conversor de Dólar</h3>
              <p className="text-sm text-gray-500">Conversión en tiempo real</p>
            </div>
          </div>

          {/* Date selector */}
          <div className="w-full md:w-auto">
            <NativeDatePicker
              date={selectedDate}
              onDateChange={handleDateChange}
              placeholder="Seleccionar fecha histórica"
              disabled={loadingHistorical}
              className="w-full md:w-64"
            />
          </div>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Dollar Type Selector - Con Popover personalizado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cambio</label>
            <Popover open={dollarTypeOpen} onOpenChange={setDollarTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 font-normal"
                  disabled={loadingHistorical}
                >
                  <span>
                    Dólar {dollarTypeOptions.find(opt => opt.value === selectedDollarType)?.label || 'Oficial'}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
                <div className="max-h-[300px] overflow-auto">
                  {dollarTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedDollarType(option.value);
                        setDollarTypeOpen(false);
                      }}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-3 px-3 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                        selectedDollarType === option.value && "bg-accent"
                      )}
                    >
                      <div className="flex items-start justify-between w-full gap-4">
                        <div className="min-w-0 text-left">
                          <div className="font-medium">Dólar {option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs shrink-0"
                        >
                          {option.label.toUpperCase()}
                        </Badge>
                      </div>
                      {selectedDollarType === option.value && (
                        <Check className="ml-2 h-4 w-4 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Price Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
            <Select
              value={priceType}
              onValueChange={(value) => setPriceType(value as PriceType)}
              disabled={loadingHistorical}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Seleccionar precio">
                  {priceType && (
                    <span>
                      {priceType === 'buy' ? 'Compra' :
                        priceType === 'sell' ? 'Venta' :
                          'Promedio'}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy" className="py-3">
                  <div className="w-full">
                    <div className="font-medium">Compra</div>
                    <div className="text-xs text-muted-foreground">Precio de compra</div>
                  </div>
                </SelectItem>
                <SelectItem value="sell" className="py-3">
                  <div className="w-full">
                    <div className="font-medium">Venta</div>
                    <div className="text-xs text-muted-foreground">Precio de venta</div>
                  </div>
                </SelectItem>
                <SelectItem value="average" className="py-3">
                  <div className="w-full">
                    <div className="font-medium">Promedio</div>
                    <div className="text-xs text-muted-foreground">Promedio compra/venta</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Exchange Rate Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cotización</label>
            <div className="h-10 px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-green-600">1 USD =</span>
              <span className="font-bold text-green-700">
                {loadingHistorical ? '...' : `$${exchangeRate.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Conversion Interface */}
        <div className="space-y-4">
          {/* From Currency Input */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-opacity-20">
                <CountryFlag country={isFromUSD ? 'US' : 'AR'} className="w-8 h-6" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-500 mb-1 truncate">
                    {isFromUSD ? 'Dólares estadounidenses' : 'Pesos argentinos'}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-lg font-bold text-gray-900 bg-transparent border-none outline-none"
                    step="0.01"
                    min="0"
                    disabled={loadingHistorical}
                  />
                </div>
                <div className="text-lg font-bold text-gray-600 shrink-0">
                  {isFromUSD ? 'USD' : 'ARS'}
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center lg:block">
              <button
                onClick={handleSwapDirection}
                className="p-3 bg-green-100 hover:bg-green-200 rounded-xl transition-colors duration-200 group"
                disabled={loadingHistorical}
                aria-label="Intercambiar monedas"
              >
                <ArrowUpDown className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* To Currency Display */}
            <div className="flex-1">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <CountryFlag country={!isFromUSD ? 'US' : 'AR'} className="w-8 h-6" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-500 mb-1 truncate">
                    {!isFromUSD ? 'Dólares estadounidenses' : 'Pesos argentinos'}
                  </div>
                  <div className="text-lg font-bold text-gray-900 truncate">
                    {loadingHistorical ? '...' : formatCurrency(conversionResult, !isFromUSD ? 'USD' : 'ARS').replace(/[^\d.,]/g, '')}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-600 shrink-0">
                  {!isFromUSD ? 'USD' : 'ARS'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Phrase */}
        {conversionPhrase && !loadingHistorical && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-4 bg-green-50/50 border border-green-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800 leading-relaxed">
                {conversionPhrase}
              </p>
            </div>
          </motion.div>
        )}

        {/* Loading indicator for historical data */}
        {loadingHistorical && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span className="text-sm text-gray-600">Buscando cotización histórica...</span>
            </div>
          </div>
        )}

        {/* No historical data message */}
        {selectedDate && !loadingHistorical && !historicalRate && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                No se encontraron datos para la fecha seleccionada. Mostrando cotización actual.
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default DollarConverter;