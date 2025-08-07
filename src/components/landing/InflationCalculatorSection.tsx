'use client';

import React, { useState, useEffect, memo } from 'react';
import { Calculator, TrendingUp, Percent, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import SimpleInflationCalculator from '@/components/SimpleInflationCalculator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CERData {
  date: string;
  value: number;
  daily_pct_change?: number;
  monthly_pct_change?: number;
  yearly_pct_change?: number;
}

const InflationCalculatorSection = memo(function InflationCalculatorSection() {
  const [cerData, setCerData] = useState<CERData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch CER data
  useEffect(() => {
    const fetchCERData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/cer?type=latest');
        
        if (!response.ok) {
          throw new Error('Error al cargar datos del CER');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setCerData(data.data);
        }
      } catch (error) {
        console.error('Error fetching CER data:', error);
        setError('Error al cargar los datos de inflación');
      } finally {
        setLoading(false);
      }
    };

    fetchCERData();
  }, []);

  return (
    <section className="relative py-12 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Main Content Container with rounded borders and max width */}
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

          <div className="relative z-10">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Nueva Herramienta
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Calculadora de Inflación Argentina
                <span className="text-orange-600"> con Índice CER</span>
              </h2>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                ¿Cuánto valen hoy $1.000 de hace 10 años? Descubrí el poder adquisitivo de tus pesos a través del tiempo 
                usando el Coeficiente de Estabilización de Referencia del BCRA.
              </p>
            </motion.div>

            {/* Simple Calculator Component */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
                <SimpleInflationCalculator cerData={cerData} loading={loading} />
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6 mb-12"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-md border border-white/50">
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Percent className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Índice CER Oficial
                </h3>
                <p className="text-gray-600 text-sm">
                  Datos directos del BCRA actualizados diariamente desde febrero de 2002
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-md border border-white/50">
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cálculo Bidireccional
                </h3>
                <p className="text-gray-600 text-sm">
                  Calculá tanto el valor actual de pesos del pasado como el equivalente histórico
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-md border border-white/50">
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Más de 20 Años de Datos
                </h3>
                <p className="text-gray-600 text-sm">
                  Análisis histórico completo del poder adquisitivo desde la implementación del CER
                </p>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link href="/calculadora-inflacion">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Usar Calculadora Completa
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-600">
                  Herramienta gratuita • Datos oficiales del BCRA • Sin registros requeridos
                </p>
                <p className="text-xs text-gray-500">
                  Datos del BCRA actualizados diariamente desde febrero 2002
                </p>
              </div>
            </motion.div>

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-red-700 text-sm">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

export default InflationCalculatorSection;