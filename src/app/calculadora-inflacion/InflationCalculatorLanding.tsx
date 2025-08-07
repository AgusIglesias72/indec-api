'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Calculator, TrendingUp, Percent, Info, RefreshCw, ChevronRight, Shield, Clock, BarChart3, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StructuredData, { InflationCalculatorWebAppSchema, InflationCalculatorFAQSchema, BreadcrumbSchema } from '@/components/StructuredData';

// Lazy load the simple calculator with dates component
const SimpleInflationCalculatorWithDates = lazy(() => import('@/components/SimpleInflationCalculatorWithDates'));

interface CERData {
  date: string;
  value: number;
  daily_pct_change?: number;
  monthly_pct_change?: number;
  yearly_pct_change?: number;
}

export default function InflationCalculatorLanding() {
  const [cerData, setCerData] = useState<CERData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCERData = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchCERData();
  }, []);

  return (
    <>
      {/* Structured Data */}
      <StructuredData data={InflationCalculatorWebAppSchema} />
      <StructuredData data={InflationCalculatorFAQSchema} />
      <StructuredData data={BreadcrumbSchema([
        { name: "Inicio", url: "https://argenstats.com" },
        { name: "Calculadora de Inflación Argentina", url: "https://argenstats.com/calculadora-inflacion" }
      ])} />
      
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        {/* Compact Hero + Immediate Calculator */}
        <section className="relative py-8 md:py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-50 opacity-30"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Compact Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Calculadora de Inflación Argentina
                <span className="block text-orange-600 mt-1">¿Cuánto valen tus pesos de antes?</span>
              </h1>
              
              {/* CER Data Banner */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {!loading && cerData && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-lg px-4 py-2 shadow-md flex items-center gap-2 text-sm"
                    >
                      <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-gray-600">CER Actual</span>
                      <span className="font-bold text-orange-600">{cerData.value.toFixed(4)}</span>
                    </motion.div>
                    {cerData.yearly_pct_change && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg px-4 py-2 shadow-md flex items-center gap-2 text-sm"
                      >
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        <span className="font-medium text-gray-600">Inflación Anual</span>
                        <span className="font-bold text-red-600">+{cerData.yearly_pct_change.toFixed(2)}%</span>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Immediate Calculator - Hero Position */}
            <Suspense fallback={
              <div className="max-w-lg mx-auto">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            }>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-lg mx-auto"
              >
                <SimpleInflationCalculatorWithDates cerData={cerData} loading={loading} />
              </motion.div>
            </Suspense>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <p className="text-xl md:text-2xl text-gray-700 mb-8">
                Calculá el poder adquisitivo de tus pesos a través del tiempo usando el índice CER. 
                Descubrí cuánto valen hoy $1.000 de hace unos años, o cuánto necesitarías antes para tener el poder de compra actual.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center justify-center gap-3 p-4 bg-orange-50 rounded-xl">
                  <Calendar className="h-6 w-6 text-orange-600" />
                  <span className="font-semibold text-gray-900">Desde 2002</span>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 bg-yellow-50 rounded-xl">
                  <Percent className="h-6 w-6 text-yellow-600" />
                  <span className="font-semibold text-gray-900">Índice CER</span>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 bg-red-50 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                  <span className="font-semibold text-gray-900">Datos BCRA</span>
                </div>
              </div>
            </motion.div>
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
                ¿Cómo Usar la Calculadora de Inflación?
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-orange-600" />
                    Pasos para Calcular la Inflación
                  </h3>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-orange-600">1.</span>
                      Ingresá el monto en pesos que querés analizar
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-orange-600">2.</span>
                      Seleccioná la fecha desde cuando querés medir
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-orange-600">3.</span>
                      Elegí la fecha hasta cuando querés calcular (ej: hoy)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-orange-600">4.</span>
                      Obtené el resultado con el poder adquisitivo equivalente
                    </li>
                  </ol>
                </div>

                <div className="bg-orange-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-orange-600" />
                    ¿Qué es el Índice CER?
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li><strong>Coeficiente de Estabilización de Referencia</strong></li>
                    <li>Refleja la evolución de la inflación desde febrero 2002</li>
                    <li>Publicado diariamente por el Banco Central (BCRA)</li>
                    <li>Base de referencia: 2 de febrero de 2002 = 1</li>
                    <li>Se actualiza según el Índice de Precios al Consumidor</li>
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
                Calculadora de Inflación Argentina: Medí el Poder Adquisitivo
              </h2>

              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-6">
                  Nuestra <strong>calculadora de inflación argentina</strong> es la herramienta más precisa para medir 
                  cómo la inflación afectó tus pesos a lo largo del tiempo. Utilizando el índice CER del Banco Central, 
                  podés calcular el valor real de tu dinero en cualquier período desde 2002.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  ¿Por Qué Usar Nuestra Calculadora de Inflación?
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Datos Oficiales del BCRA</h4>
                      <p>Utilizamos el índice CER oficial del Banco Central de la República Argentina, 
                      garantizando máxima precisión en los cálculos.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Histórico Completo desde 2002</h4>
                      <p>Accedé a más de 20 años de datos de inflación argentina, 
                      desde la implementación del índice CER.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <RefreshCw className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Actualización Diaria</h4>
                      <p>Los valores se actualizan diariamente siguiendo las publicaciones 
                      oficiales del Banco Central.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calculator className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Cálculos Bidireccionales</h4>
                      <p>Calculá tanto el valor actual de pesos del pasado, como cuántos pesos 
                      del pasado equivalen a un monto actual.</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Preguntas Frecuentes sobre Inflación Argentina
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      ¿Cuánto vale hoy $1000 de 2010?
                    </h4>
                    <p>
                      Usando nuestra calculadora podés ver exactamente cuánto valen $1000 de 2010 en pesos actuales. 
                      La respuesta varía según la fecha específica y la evolución de la inflación.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      ¿Cómo se calcula la inflación acumulada?
                    </h4>
                    <p>
                      La inflación acumulada se calcula comparando el índice CER entre dos fechas. 
                      Nuestra calculadora hace este cálculo automáticamente mostrando tanto el valor 
                      equivalente como el porcentaje de inflación del período.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      ¿Qué diferencia hay entre CER e IPC?
                    </h4>
                    <p>
                      El CER (Coeficiente de Estabilización de Referencia) es un índice que refleja la evolución 
                      del IPC (Índice de Precios al Consumidor). El CER se usa para ajustar contratos y valores, 
                      mientras que el IPC mide directamente la variación de precios.
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
                La Calculadora de Inflación Más Completa de Argentina
              </h2>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 text-center"
                >
                  <div className="h-16 w-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                    <Percent className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Índice CER Oficial
                  </h3>
                  <p className="text-gray-700">
                    Datos directos del BCRA actualizados diariamente desde febrero de 2002
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 text-center"
                >
                  <div className="h-16 w-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Análisis Histórico
                  </h3>
                  <p className="text-gray-700">
                    Más de 20 años de datos para analizar la evolución del poder adquisitivo
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 text-center"
                >
                  <div className="h-16 w-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                    <Calculator className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Cálculo Instantáneo
                  </h3>
                  <p className="text-gray-700">
                    Resultados inmediatos con porcentajes de inflación y valores equivalentes
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-orange-600 to-red-700">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Explorá Todos los Indicadores Económicos
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                Accedé a gráficos del dólar, riesgo país, y más herramientas 
                para analizar la economía argentina
              </p>
              <Link href="/">
                <Button size="lg" className="bg-white text-orange-700 hover:bg-orange-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  Ver Todos los Indicadores
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}