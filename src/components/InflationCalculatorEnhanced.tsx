'use client';

import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Calculator, TrendingUp, ArrowRight, Clock, Calendar, ArrowUpDown, Settings, Percent, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeDatePicker } from '@/components/ui/native-date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Flag from 'react-world-flags';

interface CERData {
  date: string;
  value: number;
  daily_pct_change?: number;
  monthly_pct_change?: number;
  yearly_pct_change?: number;
}

interface InflationCalculatorEnhancedProps {
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

const InflationCalculatorEnhanced = memo(function InflationCalculatorEnhanced({ cerData, loading = false }: InflationCalculatorEnhancedProps) {
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
      <div className="w-full max-w-5xl mx-auto">
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
      className="w-full max-w-5xl mx-auto space-y-8"
    >
      {/* Header with direction toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-medium text-gray-700">
          <Clock className="h-5 w-5" />
          <span>
            {calculationDirection === 'PAST_TO_PRESENT' 
              ? '¿Cuánto vale hoy este dinero de...'
              : '¿Cuánto necesitabas en...'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCalculationDirection(prev => 
            prev === 'PAST_TO_PRESENT' ? 'PRESENT_TO_PAST' : 'PAST_TO_PRESENT'
          )}
          className="hover:bg-blue-50 hover:border-blue-200"
          title="Cambiar dirección del cálculo"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Invertir cálculo
        </Button>
      </div>

      {/* Period Selection Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {periodButtons.map((period) => (
          <Button
            key={period.years}
            variant={selectedPeriod.years === period.years ? "default" : "outline"}
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

      {/* Date Pickers - Always visible with modern design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {calculationDirection === 'PAST_TO_PRESENT' ? 'Fecha de origen' : 'Fecha final'}
          </label>
          <NativeDatePicker
            date={fromDate}
            onDateChange={setFromDate}
            className="w-full"
            placeholder="Seleccionar fecha"
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
            placeholder="Seleccionar fecha"
          />
        </div>
      </div>

      {/* Amount Input - Enhanced design */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <ArgentinaFlag className="w-8 h-6" />
          <div>
            <h3 className="text-sm font-medium text-gray-700">Monto en pesos argentinos</h3>
            <p className="text-xs text-gray-500">Ingresá el valor que querés calcular</p>
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-xl">$</span>
          <Input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="pl-10 pr-4 py-6 text-2xl font-bold text-center border-2 focus:border-orange-500"
            placeholder="1.000"
            disabled={loadingCER}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results - Enhanced version from complete calculator */}
      {calculationResults && !loadingCER && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 pt-6 border-t border-gray-200"
        >
          {/* Main Result - Enhanced design */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 opacity-10 blur-3xl"></div>
            <div className="relative text-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-8 border border-orange-100 shadow-lg">
              <div className="text-sm font-medium text-orange-600 mb-3">Resultado del cálculo</div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                ${calculationResults.equivalentAmount.toLocaleString('es-AR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </div>
              <p className="text-gray-700 text-base md:text-lg max-w-2xl mx-auto">
                {calculationResults.description}
              </p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border rounded-xl p-4 text-center">
              <TrendingUp className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {calculationResults.inflationPercentage > 0 ? '+' : ''}{calculationResults.inflationPercentage.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Inflación acumulada</div>
            </div>

            <div className="bg-white border rounded-xl p-4 text-center">
              <Percent className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {calculationResults.inflationMultiplier.toFixed(2)}x
              </div>
              <div className="text-sm text-gray-600">Multiplicador CER</div>
            </div>

            <div className="bg-white border rounded-xl p-4 text-center">
              <Calculator className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">CER: {calculationResults.fromValue.toFixed(4)} → {calculationResults.toValue.toFixed(4)}</div>
              <div className="text-xs text-gray-500">Índices utilizados</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Acerca del cálculo:</p>
                <p>
                  Este cálculo utiliza el Coeficiente de Estabilización de Referencia (CER) del Banco Central, 
                  que refleja la evolución de la inflación desde febrero de 2002. Los valores se actualizan diariamente 
                  según el Índice de Precios al Consumidor (IPC).
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loadingCER && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculando inflación...</p>
        </div>
      )}
    </motion.div>
  );
});

export default InflationCalculatorEnhanced;