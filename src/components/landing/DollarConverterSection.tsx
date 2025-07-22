'use client';

import React, { useState, useEffect, memo } from 'react';
import { Calculator, TrendingUp, DollarSign, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { DollarType, DollarRateData } from '@/types/dollar';
import DollarConverter from '@/components/DollarConverter';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const DollarConverterSection = memo(function DollarConverterSection() {
  const [dollarRates, setDollarRates] = useState<Record<DollarType, DollarRateData | null>>({
    OFICIAL: null,
    BLUE: null,
    MEP: null,
    CCL: null,
    CRYPTO: null,
    MAYORISTA: null,
    TARJETA: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dollar rates
  useEffect(() => {
    const fetchDollarRates = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/dollar?type=latest');
        
        if (!response.ok) {
          throw new Error('Error al cargar cotizaciones');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          const rates: Record<DollarType, DollarRateData | null> = {
            OFICIAL: null,
            BLUE: null,
            MEP: null,
            CCL: null,
            CRYPTO: null,
            MAYORISTA: null,
            TARJETA: null
          };

          data.data.forEach((rate: DollarRateData) => {
            rates[rate.dollar_type as DollarType] = rate;
          });

          setDollarRates(rates);
        }
      } catch (error) {
        console.error('Error fetching dollar rates:', error);
        setError('Error al cargar las cotizaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchDollarRates();
  }, []);

  // Get the best available rate for display
  const featuredRate = dollarRates.BLUE || dollarRates.OFICIAL || Object.values(dollarRates).find(rate => rate !== null);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Herramienta Destacada
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Conversor de Dólar a Peso Argentino
            <span className="text-emerald-600"> en Tiempo Real</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Calculadora de dólar a peso argentino hoy - Conversor USD ARS con cotización dólar blue, 
            oficial, MEP y CCL actualizado minuto a minuto. La mejor herramienta para convertir dólares a pesos.
          </p>

          {/* Featured Rate Display */}
          {featuredRate && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-lg border border-emerald-100"
            >
              <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500 font-medium">
                  Dólar {featuredRate.dollar_type === 'OFICIAL' ? 'Oficial' : 'Blue'}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  ${featuredRate.sell_price?.toFixed(2) || 'N/A'}
                </div>
              </div>
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="text-xs text-gray-500">
                En vivo
                <div className="inline-block w-2 h-2 bg-emerald-500 rounded-full ml-2 animate-pulse"></div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Converter Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto mb-12"
        >
          <DollarConverter dollarRates={dollarRates} loading={loading} />
        </motion.div>

        {/* Features Grid - Centered with constrained width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          <div className="text-center">
            <div className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tiempo Real</h3>
            <p className="text-gray-600">
              Cotizaciones actualizadas al instante desde múltiples fuentes confiables
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
              <Calculator className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Múltiples Tipos</h3>
            <p className="text-gray-600">
              Oficial, Blue, MEP, CCL, Crypto, Mayorista y Tarjeta en una sola herramienta
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Datos Históricos</h3>
            <p className="text-gray-600">
              Consulta cotizaciones de fechas anteriores para análisis y comparación
            </p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/dolar">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              Ver Todas las Cotizaciones
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <p className="text-sm text-gray-600 mt-6 max-w-md mx-auto">
            Accedé a gráficos históricos del dólar, comparativas entre tipos de cambio y análisis de tendencias
          </p>
        </motion.div>
      </div>

      {/* CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
});

export default DollarConverterSection;