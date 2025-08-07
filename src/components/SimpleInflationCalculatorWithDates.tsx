'use client';

import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Calculator, TrendingUp, ArrowRight, Clock, Calendar, ArrowUpDown, Settings, ChevronDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeDatePicker } from '@/components/ui/native-date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Flag from 'react-world-flags';

interface CERData {
  date: string;
  value: number;
  daily_pct_change?: number;
  monthly_pct_change?: number;
  yearly_pct_change?: number;
}

interface SimpleInflationCalculatorWithDatesProps {
  cerData: CERData | null;
  loading?: boolean;
}

interface PeriodButton {
  label: string;
  years: number;
  description: string;
}

const periodButtons: PeriodButton[] = [
  { label: '1 año', years: 1, description: '1 año atrás' },
  { label: '5 años', years: 5, description: '5 años atrás' },
  { label: '10 años', years: 10, description: '10 años atrás' },
  { label: '15 años', years: 15, description: '15 años atrás' }
];

// Flag component for Argentina
const ArgentinaFlag = memo(function ArgentinaFlag({ className }: { className?: string }) {
  return (
    <div className={`${className} rounded-sm overflow-hidden flex items-center justify-center shadow-sm`}>
      <Flag code="AR" className="w-full h-full object-cover" />
    </div>
  );
});

type CalculationDirection = 'PAST_TO_PRESENT' | 'PRESENT_TO_PAST';

const SimpleInflationCalculatorWithDates = memo(function SimpleInflationCalculatorWithDates({ cerData, loading = false }: SimpleInflationCalculatorWithDatesProps) {
  const [amount, setAmount] = useState<string>('1000');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodButton>(periodButtons[2]); // Default to 10 years
  const [fromCER, setFromCER] = useState<CERData | null>(null);
  const [toCER, setToCER] = useState<CERData | null>(null);
  const [loadingCER, setLoadingCER] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculationDirection, setCalculationDirection] = useState<CalculationDirection>('PAST_TO_PRESENT');
  const [fromDate, setFromDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 10);
    return date;
  });
  const [toDate, setToDate] = useState<Date | undefined>(new Date());

  // Update fromDate when selectedPeriod changes
  useEffect(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - selectedPeriod.years);
    setFromDate(date);
  }, [selectedPeriod]);

  // Fetch CER data for the calculated date
  const fetchCERForDate = useCallback(async (date: Date): Promise<CERData | null> => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Try exact date first, then closest before, then closest after
      const response = await fetch(`/api/cer?type=specific-date&date=${dateStr}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
      
      // Fallback to closest date before
      const fallbackResponse = await fetch(`/api/cer?type=historical&end_date=${dateStr}&limit=1&order=desc`);
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success && fallbackData.data?.length > 0) {
          return fallbackData.data[0];
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching CER data:', error);
      return null;
    }
  }, []);

  // Fetch CER data when dates change
  useEffect(() => {
    if (!fromDate || !toDate) return;

    const fetchCERData = async () => {
      setLoadingCER(true);
      setError(null);

      try {
        const [fromCERData, toCERData] = await Promise.all([
          fetchCERForDate(fromDate),
          toDate ? fetchCERForDate(toDate) : Promise.resolve(cerData)
        ]);

        if (!fromCERData) {
          const dateStr = fromDate.toLocaleDateString('es-AR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          setError(`No se encontraron datos de CER para ${dateStr}. Los datos están disponibles desde febrero 2002.`);
          setFromCER(null);
          setToCER(null);
          return;
        }

        if (!toCERData) {
          const dateStr = toDate?.toLocaleDateString('es-AR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          setError(`No se encontraron datos de CER para ${dateStr}. Intenta con una fecha anterior.`);
          setFromCER(null);
          setToCER(null);
          return;
        }

        setFromCER(fromCERData);
        setToCER(toCERData);
      } catch (error) {
        console.error('Error fetching CER data:', error);
        setError('Error al obtener los datos de inflación. Inténtalo nuevamente.');
        setFromCER(null);
        setToCER(null);
      } finally {
        setLoadingCER(false);
      }
    };

    // Add a small delay to avoid too frequent API calls
    const timeoutId = setTimeout(fetchCERData, 300);
    return () => clearTimeout(timeoutId);
  }, [fromDate, toDate, cerData, fetchCERForDate]);

  // Calculate inflation results
  const calculationResults = useMemo(() => {
    if (!fromCER || !toCER || !fromCER.value || !toCER.value) {
      return null;
    }

    const numAmount = parseFloat(amount) || 0;
    const inflationMultiplier = toCER.value / fromCER.value;
    const inflationPercentage = ((toCER.value - fromCER.value) / fromCER.value) * 100;
    
    let equivalentAmount: number;
    let description: string;

    if (calculationDirection === 'PAST_TO_PRESENT') {
      // ¿Cuánto valen hoy X pesos del pasado?
      equivalentAmount = numAmount * inflationMultiplier;
      description = `$${numAmount.toLocaleString('es-AR')} del ${fromDate?.toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })} equivalen hoy a $${equivalentAmount.toLocaleString('es-AR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    } else {
      // ¿Cuánto necesitaba en el pasado para tener el poder de compra actual?
      equivalentAmount = numAmount / inflationMultiplier;
      description = `Para tener el poder de compra de $${numAmount.toLocaleString('es-AR')} de hoy, necesitabas $${equivalentAmount.toLocaleString('es-AR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })} el ${fromDate?.toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
    }

    return {
      equivalentAmount,
      inflationPercentage: Math.abs(inflationPercentage),
      inflationMultiplier,
      description,
      fromValue: fromCER.value,
      toValue: toCER.value
    };
  }, [fromCER, toCER, amount, calculationDirection, fromDate, toDate]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters except dots
    const rawValue = e.target.value.replace(/[^\d.]/g, '');
    
    // Prevent multiple dots
    const parts = rawValue.split('.');
    if (parts.length > 2) return;
    
    // Format the integer part with thousand separators
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    // Join back together
    const formattedValue = parts.length === 2 ? `${parts[0]},${parts[1]}` : parts[0];
    
    // Store the raw number value (without formatting)
    const numericValue = rawValue.replace(/\./g, '').replace(',', '.');
    setAmount(numericValue);
  }, []);

  // Format amount for display
  const displayAmount = useMemo(() => {
    if (!amount) return '';
    const parts = amount.split('.');
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return parts.length === 2 ? `${parts[0]},${parts[1]}` : parts[0];
  }, [amount]);

  // Format currency for display
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value).replace('ARS', '').trim();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="group relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-orange-400/20 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
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
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-orange-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>

      {/* Main calculator card */}
      <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calculator className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Calculadora de Inflación</h3>
              <p className="text-sm text-gray-500">
                {calculationDirection === 'PAST_TO_PRESENT' 
                  ? 'Valor actualizado por inflación' 
                  : 'Valor necesario en el pasado'}
              </p>
            </div>
          </div>

          {/* Direction toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCalculationDirection(prev => 
              prev === 'PAST_TO_PRESENT' ? 'PRESENT_TO_PAST' : 'PAST_TO_PRESENT'
            )}
            className="hover:bg-orange-50 hover:border-orange-200 shrink-0"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Invertir
          </Button>
        </div>

        {/* Quick Period Selection Buttons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Períodos rápidos</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {periodButtons.map((period) => (
              <button
                key={period.years}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "px-4 py-2.5 rounded-lg font-medium transition-all duration-200",
                  "border-2 hover:shadow-md",
                  selectedPeriod.years === period.years
                    ? "bg-orange-500 text-white border-orange-500 shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                )}
                disabled={loadingCER}
              >
                <div className="text-sm font-semibold">Hace {period.label}</div>
                <div className="text-xs opacity-80 mt-0.5">{period.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Configuration Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {calculationDirection === 'PAST_TO_PRESENT' ? 'Desde' : 'Hasta'}
            </label>
            <NativeDatePicker
              date={fromDate}
              onDateChange={setFromDate}
              className="w-full h-10"
              placeholder="Fecha inicial"
              disabled={loadingCER}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {calculationDirection === 'PAST_TO_PRESENT' ? 'Hasta' : 'Desde'}
            </label>
            <NativeDatePicker
              date={toDate}
              onDateChange={setToDate}
              className="w-full h-10"
              placeholder="Fecha final"
              disabled={loadingCER}
            />
          </div>
        </div>

        {/* Conversion Interface */}
        <div className="space-y-4">

          {/* Amount Input */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-opacity-20">
                <ArgentinaFlag className="w-8 h-6" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-500 mb-1 truncate">
                    {calculationDirection === 'PAST_TO_PRESENT' ? 'Pesos del pasado' : 'Pesos de hoy'}
                  </div>
                  <input
                    type="text"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    placeholder="1.000"
                    className="w-full text-lg font-bold text-gray-900 bg-transparent border-none outline-none"
                    disabled={loadingCER}
                  />
                </div>
                <div className="text-lg font-bold text-gray-600 shrink-0">
                  ARS
                </div>
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="flex justify-center lg:block">
              <div className="p-3 bg-orange-100 rounded-xl">
                <ArrowRight className="h-5 w-5 text-orange-600" />
              </div>
            </div>

            {/* Result Display */}
            <div className="flex-1">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <ArgentinaFlag className="w-8 h-6" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-500 mb-1 truncate">
                    {calculationDirection === 'PAST_TO_PRESENT' ? 'Equivalente hoy' : 'Necesario entonces'}
                  </div>
                  <div className="text-lg font-bold text-gray-900 truncate">
                    {loadingCER || !calculationResults ? '...' : calculationResults.equivalentAmount.toLocaleString('es-AR', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-600 shrink-0">
                  ARS
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Phrase */}
        {calculationResults && !loadingCER && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-4 bg-orange-50/50 border border-orange-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-3">
                <p className="text-sm text-orange-800 leading-relaxed">
                  {calculationResults.description}
                </p>
                
                {/* Stats Row */}
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Inflación: </span>
                    <span className="font-bold text-red-600">+{calculationResults.inflationPercentage.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Factor: </span>
                    <span className="font-bold text-orange-600">{calculationResults.inflationMultiplier.toFixed(2)}x</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loadingCER && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
              <span className="text-sm text-gray-600">Calculando inflación...</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default SimpleInflationCalculatorWithDates;