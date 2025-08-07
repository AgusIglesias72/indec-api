'use client';

import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { ArrowUpDown, Calculator, TrendingUp, Percent, Calendar, ChevronDown, Check, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { NativeDatePicker } from '@/components/ui/native-date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface CERData {
  date: string;
  value: number;
  daily_pct_change?: number;
  monthly_pct_change?: number;
  yearly_pct_change?: number;
}

interface InflationCalculatorProps {
  cerData: CERData | null;
  loading?: boolean;
}

type CalculationDirection = 'PAST_TO_PRESENT' | 'PRESENT_TO_PAST';

const InflationCalculator = memo(function InflationCalculator({ cerData, loading = false }: InflationCalculatorProps) {
  const [amount, setAmount] = useState<string>('1000');
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date('2023-01-01'));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [calculationDirection, setCalculationDirection] = useState<CalculationDirection>('PAST_TO_PRESENT');
  const [fromCER, setFromCER] = useState<CERData | null>(null);
  const [toCER, setToCER] = useState<CERData | null>(null);
  const [loadingCER, setLoadingCER] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch CER data for specific dates
  const fetchCERForDate = useCallback(async (date: Date): Promise<CERData | null> => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // First try to get exact date
      const response = await fetch(`/api/cer?type=specific-date&date=${dateStr}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
      
      // If exact date not found, try to get closest date before
      const fallbackResponse = await fetch(`/api/cer?type=historical&end_date=${dateStr}&limit=1&order=desc`);
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success && fallbackData.data?.length > 0) {
          return fallbackData.data[0];
        }
      }
      
      // As last resort, try to get closest date after
      const forwardResponse = await fetch(`/api/cer?type=historical&start_date=${dateStr}&limit=1&order=asc`);
      if (forwardResponse.ok) {
        const forwardData = await forwardResponse.json();
        if (forwardData.success && forwardData.data?.length > 0) {
          return forwardData.data[0];
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
          const dateStr = fromDate.toISOString().split('T')[0];
          setError(`No se encontraron datos de CER para la fecha ${dateStr}. Los datos están disponibles desde febrero 2002.`);
          setFromCER(null);
          setToCER(null);
          return;
        }

        if (!toCERData) {
          const dateStr = toDate?.toISOString().split('T')[0];
          setError(`No se encontraron datos de CER para la fecha ${dateStr}. Intenta con una fecha anterior.`);
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

  // Calculate inflation and equivalent amounts
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
      description = `$${numAmount.toLocaleString('es-AR')} de ${fromDate?.getFullYear()} equivalen a $${equivalentAmount.toLocaleString('es-AR', { maximumFractionDigits: 2 })} de ${toDate?.getFullYear()}`;
    } else {
      // ¿Cuánto necesitaba en el pasado para tener el poder de compra actual?
      equivalentAmount = numAmount / inflationMultiplier;
      description = `Para tener el poder de compra de $${numAmount.toLocaleString('es-AR')} de ${toDate?.getFullYear()}, necesitabas $${equivalentAmount.toLocaleString('es-AR', { maximumFractionDigits: 2 })} en ${fromDate?.getFullYear()}`;
    }

    return {
      equivalentAmount,
      inflationPercentage,
      inflationMultiplier,
      description,
      fromValue: fromCER.value,
      toValue: toCER.value
    };
  }, [fromCER, toCER, amount, calculationDirection, fromDate, toDate]);

  const handleDirectionSwap = useCallback(() => {
    setCalculationDirection(prev => 
      prev === 'PAST_TO_PRESENT' ? 'PRESENT_TO_PAST' : 'PAST_TO_PRESENT'
    );
  }, []);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Calculator className="h-8 w-8 text-orange-600" />
            Calculadora de Inflación
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Calculá el poder adquisitivo usando el índice CER del BCRA
          </p>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Date Selection */}
          <div className="space-y-6">
            <div className="text-center">
              <Button
                onClick={handleDirectionSwap}
                variant="outline"
                className="group hover:bg-orange-50 border-orange-200"
              >
                <ArrowUpDown className="h-4 w-4 mr-2 group-hover:text-orange-600" />
                {calculationDirection === 'PAST_TO_PRESENT' 
                  ? '¿Cuánto valen hoy pesos del pasado?' 
                  : '¿Cuánto necesitaba antes para el poder actual?'
                }
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {calculationDirection === 'PAST_TO_PRESENT' ? 'Fecha de origen' : 'Fecha de referencia pasada'}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <NativeDatePicker
                    date={fromDate}
                    onDateChange={setFromDate}
                    className="pl-10"
                    placeholder="Seleccionar fecha"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {calculationDirection === 'PAST_TO_PRESENT' ? 'Fecha de destino' : 'Fecha actual'}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <NativeDatePicker
                    date={toDate}
                    onDateChange={setToDate}
                    className="pl-10"
                    placeholder="Seleccionar fecha"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Monto en pesos argentinos
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="pl-8 text-lg font-medium text-center"
                placeholder="Ingresá el monto"
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

          {/* Results */}
          {calculationResults && !loadingCER && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pt-6 border-t border-gray-200"
            >
              {/* Main Result */}
              <div className="text-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6">
                <div className="text-sm text-gray-600 mb-2">Resultado del cálculo</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  ${calculationResults.equivalentAmount.toLocaleString('es-AR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
                <p className="text-gray-700 text-sm md:text-base">
                  {calculationResults.description}
                </p>
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
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default InflationCalculator;