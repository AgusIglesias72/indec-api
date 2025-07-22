'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Calculator, TrendingUp, DollarSign, Info, RefreshCw, ChevronRight, Shield, Clock, Globe, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { DollarType, DollarRateData } from '@/types/dollar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the converter component
const DollarConverter = lazy(() => import('@/components/DollarConverter'));

export default function DollarConverterLanding() {
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

  useEffect(() => {
    const fetchDollarRates = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchDollarRates();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section with SEO-optimized content */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-green-50 to-teal-50 opacity-50"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Conversor de Dólar a Peso Argentino
              <span className="block text-emerald-600 mt-2">Cotización en Tiempo Real</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-8">
              Calculadora de dólar a peso argentino con todas las cotizaciones del mercado. 
              Convertí USD a ARS con el tipo de cambio actualizado minuto a minuto.
            </p>

            {/* Live Rates Banner */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {!loading && (
                <>
                  {dollarRates.BLUE && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-xl px-6 py-3 shadow-lg flex items-center gap-3"
                    >
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-600">Dólar Blue</span>
                      <span className="text-lg font-bold text-blue-600">${dollarRates.BLUE.sell_price?.toFixed(2)}</span>
                    </motion.div>
                  )}
                  {dollarRates.OFICIAL && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-xl px-6 py-3 shadow-lg flex items-center gap-3"
                    >
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-600">Dólar Oficial</span>
                      <span className="text-lg font-bold text-green-600">${dollarRates.OFICIAL.sell_price?.toFixed(2)}</span>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Converter Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Suspense fallback={
            <div className="max-w-5xl mx-auto">
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          }>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl mx-auto"
            >
              <DollarConverter dollarRates={dollarRates} loading={loading} />
            </motion.div>
          </Suspense>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              ¿Cómo Usar el Conversor de Dólar a Peso Argentino?
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-emerald-600" />
                  Pasos para Convertir USD a ARS
                </h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">1.</span>
                    Ingresá el monto en dólares o pesos que querés convertir
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">2.</span>
                    Seleccioná el tipo de cambio (Blue, Oficial, MEP, CCL, etc.)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">3.</span>
                    Elegí entre precio de compra, venta o promedio
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">4.</span>
                    Obtené el resultado instantáneo con la cotización actual
                  </li>
                </ol>
              </div>

              <div className="bg-emerald-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-emerald-600" />
                  Tipos de Dólar en Argentina
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li><strong>Dólar Blue:</strong> Cotización del mercado informal</li>
                  <li><strong>Dólar Oficial:</strong> Tipo de cambio del Banco Central</li>
                  <li><strong>Dólar MEP:</strong> Mercado Electrónico de Pagos</li>
                  <li><strong>Dólar CCL:</strong> Contado con Liquidación</li>
                  <li><strong>Dólar Tarjeta:</strong> Para compras en el exterior</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Conversor de Divisas Argentina: Tu Herramienta Confiable
            </h2>

            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-6">
                Nuestro <strong>conversor de dólar a peso argentino</strong> es la herramienta más completa y actualizada 
                del mercado para realizar conversiones de USD a ARS. Con datos en tiempo real de todas las cotizaciones 
                disponibles en Argentina, podés calcular el valor exacto de tus dólares en pesos argentinos.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                ¿Por Qué Usar Nuestro Conversor USD ARS?
              </h3>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <RefreshCw className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Actualización en Tiempo Real</h4>
                    <p>Las cotizaciones del dólar se actualizan automáticamente cada minuto, garantizando 
                    que siempre tengas el tipo de cambio más reciente.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Datos Confiables</h4>
                    <p>Obtenemos nuestras cotizaciones de fuentes oficiales y del mercado, 
                    asegurando la máxima precisión en cada conversión.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Todos los Tipos de Cambio</h4>
                    <p>Desde el dólar oficial hasta el blue, MEP, CCL y crypto. 
                    Todas las cotizaciones en un solo lugar.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Histórico de Cotizaciones</h4>
                    <p>Consultá el valor del dólar en fechas anteriores para análisis 
                    y comparaciones históricas.</p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Preguntas Frecuentes sobre el Conversor
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    ¿Cuánto vale el dólar hoy en Argentina?
                  </h4>
                  <p>
                    El valor del dólar varía según el tipo de cambio. Podés ver todas las cotizaciones 
                    actualizadas en nuestro conversor, incluyendo dólar blue, oficial, MEP, CCL y más.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    ¿Cómo calcular dólares a pesos argentinos?
                  </h4>
                  <p>
                    Simplemente ingresá el monto en USD en nuestro conversor, seleccioná el tipo de cambio 
                    deseado y obtendrás instantáneamente el equivalente en pesos argentinos.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    ¿Cuál es la diferencia entre dólar blue y oficial?
                  </h4>
                  <p>
                    El dólar oficial es el tipo de cambio establecido por el Banco Central, mientras que 
                    el dólar blue es la cotización del mercado informal o paralelo, generalmente más alta.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Características del Mejor Conversor USD ARS
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 text-center"
              >
                <div className="h-16 w-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Cotización al Instante
                </h3>
                <p className="text-gray-700">
                  Datos actualizados cada 60 segundos de todas las casas de cambio y bancos
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center"
              >
                <div className="h-16 w-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                  <BarChart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Análisis Histórico
                </h3>
                <p className="text-gray-700">
                  Consultá cotizaciones pasadas y analizá tendencias del mercado cambiario
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center"
              >
                <div className="h-16 w-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Fácil de Usar
                </h3>
                <p className="text-gray-700">
                  Interfaz intuitiva para convertir dólares a pesos en segundos
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-green-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Explorá Todas las Cotizaciones del Dólar
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Accedé a gráficos detallados, análisis de tendencias y herramientas 
              profesionales para el mercado cambiario
            </p>
            <Link href="/dolar">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Ver Todas las Cotizaciones
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}