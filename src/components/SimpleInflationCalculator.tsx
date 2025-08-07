'use client';

import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Calculator, TrendingUp, ArrowRight, Clock, Calendar, ArrowUpDown, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeDatePicker } from '@/components/ui/native-date-picker';
import Flag from 'react-world-flags';

interface CERData {
  date: string;
  value: number;
  daily_pct_change?: number;
  monthly_pct_change?: number;
  yearly_pct_change?: number;
}

interface SimpleInflationCalculatorProps {
  cerData: CERData | null;
  loading?: boolean;
}

interface PeriodButton {
  label: string;
  years: number;
  description: string;
}

const periodButtons: PeriodButton[] = [
  { label: 'Hace 1 año', years: 1, description: '1 año atrás' },
  { label: 'Hace 5 años', years: 5, description: '5 años atrás' },
  { label: 'Hace 10 años', years: 10, description: '10 años atrás' },
  { label: 'Hace 15 años', years: 15, description: '15 años atrás' }
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

const SimpleInflationCalculator = memo(function SimpleInflationCalculator({ cerData, loading = false }: SimpleInflationCalculatorProps) {
  const [amount, setAmount] = useState<string>('1000');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodButton>(periodButtons[2]); // Default to 10 years
  const [fromCER, setFromCER] = useState<CERData | null>(null);
  const [toCER, setToCER] = useState<CERData | null>(null);
  const [loadingCER, setLoadingCER] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculationDirection, setCalculationDirection] = useState<CalculationDirection>('PAST_TO_PRESENT');
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 10);
    return date;
  });
  const [toDate, setToDate] = useState<Date | undefined>(new Date());

  // Update fromDate when selectedPeriod changes (only if not using custom dates)
  useEffect(() => {
    if (!useCustomDates) {
      const date = new Date();
      date.setFullYear(date.getFullYear() - selectedPeriod.years);
      setFromDate(date);
    }
  }, [selectedPeriod, useCustomDates]);

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
      })} equivalen a $${equivalentAmount.toLocaleString('es-AR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })} del ${toDate?.toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
    } else {
      // ¿Cuánto necesitaba en el pasado para tener el poder de compra actual?
      equivalentAmount = numAmount / inflationMultiplier;
      description = `Para tener el poder de compra de $${numAmount.toLocaleString('es-AR')} del ${toDate?.toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}, necesitabas $${equivalentAmount.toLocaleString('es-AR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })} del ${fromDate?.toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
    }

    return {
      equivalentAmount,
      inflationPercentage: Math.abs(inflationPercentage),
      inflationMultiplier,
      description
    };
  }, [fromCER, toCER, amount, calculationDirection, fromDate, toDate]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  }, []);

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
      <div className="w-full max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      {/* Period Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="h-4 w-4" />
            <span>
              {calculationDirection === 'PAST_TO_PRESENT' 
                ? '¿Cuánto vale hoy este dinero de...'
                : '¿Cuánto necesitabas en...'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseCustomDates(!useCustomDates)}
              className={useCustomDates 
                ? "bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200" 
                : "hover:bg-orange-50 hover:border-orange-200"
              }
            >
              <Settings className="h-4 w-4 mr-1" />
              Fechas personalizadas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalculationDirection(prev => 
                prev === 'PAST_TO_PRESENT' ? 'PRESENT_TO_PAST' : 'PAST_TO_PRESENT'
              )}
              className="hover:bg-blue-50 hover:border-blue-200"
              title="Cambiar dirección del cálculo"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Period Buttons - Only show when not using custom dates */}
        {!useCustomDates && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {periodButtons.map((period) => (
              <Button
                key={period.years}
                variant={selectedPeriod.years === period.years ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={selectedPeriod.years === period.years 
                  ? "bg-orange-600 hover:bg-orange-700 text-white" 
                  : "hover:bg-orange-50 hover:border-orange-200"
                }
                disabled={loadingCER}
              >
                {period.label}
              </Button>
            ))}
          </div>
        )}

        {/* Custom Date Pickers */}
        {useCustomDates && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {calculationDirection === 'PAST_TO_PRESENT' ? 'Fecha de origen' : 'Fecha final'}
              </label>
              <NativeDatePicker
                date={fromDate}
                onDateChange={setFromDate}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {calculationDirection === 'PAST_TO_PRESENT' ? 'Fecha destino' : 'Fecha de origen'}
              </label>
              <NativeDatePicker
                date={toDate}
                onDateChange={setToDate}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Date Display */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm">
          <Calendar className="h-4 w-4 text-orange-600" />
          <span className="text-orange-800 font-medium">
            {fromDate?.toLocaleDateString('es-AR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          <span className="text-orange-600">
            {calculationDirection === 'PAST_TO_PRESENT' ? '→' : '←'}
          </span>
          <span className="text-orange-800 font-medium">
            {toDate?.toLocaleDateString('es-AR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Currency Input - Similar to Dollar Converter */}
      <div className="space-y-4">
        {/* Desktop Layout - Side by Side */}
        <div className="hidden md:flex md:items-center md:gap-4">
          {/* From Currency (Past) */}
          <div className="flex-1">
            <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-opacity-20">
              <ArgentinaFlag className="w-8 h-6" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-500 mb-1 truncate">
                  {calculationDirection === 'PAST_TO_PRESENT' 
                    ? fromDate?.toLocaleDateString('es-AR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : toDate?.toLocaleDateString('es-AR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                  }
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="1.000,00"
                  className="w-full text-lg font-bold text-gray-900 bg-transparent border-none outline-none"
                  step="0.01"
                  min="0"
                  disabled={loadingCER}
                />
              </div>
              <div className="text-lg font-bold text-gray-600 shrink-0">
                ARS
              </div>
            </div>
          </div>

          {/* Arrow Right */}
          <div className="flex justify-center">
            <div className="p-2 bg-orange-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>

          {/* To Currency (Present) */}
          <div className="flex-1">
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <ArgentinaFlag className="w-8 h-6" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-500 mb-1 truncate">
                  {calculationDirection === 'PAST_TO_PRESENT'
                    ? toDate?.toLocaleDateString('es-AR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : fromDate?.toLocaleDateString('es-AR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                  }
                </div>
                <div className="text-lg font-bold text-gray-900 truncate min-h-[28px] flex items-center">
                  {loadingCER ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                      <span className="text-gray-500">Calculando...</span>
                    </div>
                  ) : calculationResults ? (
                    formatCurrency(calculationResults.equivalentAmount)
                  ) : error ? (
                    <span className="text-red-600 text-sm">{error}</span>
                  ) : (
                    '0,00'
                  )}
                </div>
              </div>
              <div className="text-lg font-bold text-gray-600 shrink-0">
                ARS
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="md:hidden space-y-4">
          {/* From Currency (Past) */}
          <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-opacity-20">
            <ArgentinaFlag className="w-8 h-6" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-500 mb-1 truncate">
                {calculationDirection === 'PAST_TO_PRESENT' 
                  ? fromDate?.toLocaleDateString('es-AR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : toDate?.toLocaleDateString('es-AR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                }
              </div>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="1.000,00"
                className="w-full text-lg font-bold text-gray-900 bg-transparent border-none outline-none"
                step="0.01"
                min="0"
                disabled={loadingCER}
              />
            </div>
            <div className="text-lg font-bold text-gray-600 shrink-0">
              ARS
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <div className="p-2 bg-orange-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>

          {/* To Currency (Present) */}
          <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <ArgentinaFlag className="w-8 h-6" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-500 mb-1 truncate">
                {calculationDirection === 'PAST_TO_PRESENT'
                  ? toDate?.toLocaleDateString('es-AR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : fromDate?.toLocaleDateString('es-AR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                }
              </div>
              <div className="text-lg font-bold text-gray-900 truncate min-h-[28px] flex items-center">
                {loadingCER ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                    <span className="text-gray-500">Calculando...</span>
                  </div>
                ) : calculationResults ? (
                  formatCurrency(calculationResults.equivalentAmount)
                ) : error ? (
                  <span className="text-red-600 text-sm">{error}</span>
                ) : (
                  '0,00'
                )}
              </div>
            </div>
            <div className="text-lg font-bold text-gray-600 shrink-0">
              ARS
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary - Fixed height container to prevent layout shift */}
      <div className="min-h-[120px] flex items-center">
        {calculationResults && !loadingCER && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full p-4 bg-orange-50/50 border border-orange-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800 leading-relaxed">
                <p className="font-medium mb-1">Resumen del cálculo:</p>
                <p>{calculationResults.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                  <div>
                    <span className="text-red-600 font-medium">Inflación: +{calculationResults.inflationPercentage.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-orange-600 font-medium">Multiplicador: {calculationResults.inflationMultiplier.toFixed(2)}x</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* CTA to Full Calculator */}
      <div className="text-center pt-2">
        <Button 
          variant="outline"
          size="sm"
          className="text-orange-600 border-orange-200 hover:bg-orange-50"
          asChild
        >
          <a href="/calculadora-inflacion">
            <Calculator className="mr-2 h-4 w-4" />
            Calculadora avanzada
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
});

export default SimpleInflationCalculator;