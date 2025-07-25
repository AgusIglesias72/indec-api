'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Users, TrendingUp, AlertTriangle, Info, RefreshCw, ChevronRight, BarChart3, Home, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load components
const PovertyEnhancedChart = lazy(() => import('@/components/PovertyEnhancedChart'));
const PovertyRegionalTable = lazy(() => import('@/components/PovertyRegionalTable'));

interface PovertyStats {
  poverty_rate_persons: number;
  poverty_rate_households: number;
  indigence_rate_persons: number;
  indigence_rate_households: number;
  period: string;
  date: string;
}

export default function PovertyLanding() {
  const [povertyData, setPovertyData] = useState<PovertyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPovertyData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/poverty/latest');
        
        if (!response.ok) {
          throw new Error('Error al cargar datos de pobreza');
        }

        const data = await response.json();
        setPovertyData(data.data?.national || null);
      } catch (error) {
        console.error('Error fetching poverty data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPovertyData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Compact Hero + Immediate Stats */}
      <section className="relative py-8 md:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-orange-50 to-yellow-50 opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Pobreza e Indigencia en 
              <span className="block text-red-600 mt-1">Argentina</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Dashboard completo con estadísticas oficiales del INDEC sobre pobreza e indigencia en Argentina. 
              Datos actualizados de los 31 aglomerados urbanos más importantes, análisis histórico desde 2016 y comparación regional interactiva.
            </p>
            
            {/* Current Stats Cards */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-lg">
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-8 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            ) : povertyData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-2xl p-4 shadow-lg border-l-4 border-red-500"
                >
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Pobreza Personas</span>
                  </div>
                  <div className="text-2xl font-bold text-red-700">
                    {povertyData.poverty_rate_persons.toFixed(1)}%
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white rounded-2xl p-4 shadow-lg border-l-4 border-red-400"
                >
                  <div className="flex items-center justify-center mb-2">
                    <Home className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Pobreza Hogares</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {povertyData.poverty_rate_households.toFixed(1)}%
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white rounded-2xl p-4 shadow-lg border-l-4 border-orange-500"
                >
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Indigencia Personas</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-700">
                    {povertyData.indigence_rate_persons.toFixed(1)}%
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="bg-white rounded-2xl p-4 shadow-lg border-l-4 border-orange-400"
                >
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-400 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Indigencia Hogares</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {povertyData.indigence_rate_households.toFixed(1)}%
                  </div>
                </motion.div>
              </div>
            )}

            {povertyData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-8"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Último dato: {povertyData.period} ({formatDate(povertyData.date)})</span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/indicadores/pobreza">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl">
                  Ver Análisis Completo
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-red-200 text-red-700 hover:bg-red-50 px-8 py-3 rounded-xl"
                onClick={() => window.open('/api/poverty/export', '_blank')}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Descargar Datos
              </Button>
            </motion.div>
          </motion.div>
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
              Dashboard completo de pobreza e indigencia en Argentina con datos del INDEC.
              Analiza la evolución histórica y compara por regiones con información actualizada.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center justify-center gap-3 p-4 bg-red-50 rounded-xl">
                <RefreshCw className="h-6 w-6 text-red-600" />
                <span className="font-semibold text-gray-900">Datos Oficiales</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-4 bg-orange-50 rounded-xl">
                <BarChart3 className="h-6 w-6 text-orange-600" />
                <span className="font-semibold text-gray-900">Por Regiones</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Calendar className="h-6 w-6 text-purple-600" />
                <span className="font-semibold text-gray-900">Evolución Histórica</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Chart Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <Suspense fallback={
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <Skeleton className="h-96 w-full" />
              </div>
            }>
              <PovertyEnhancedChart 
                title="Gráfico Interactivo de Pobreza"
                description="Selecciona indicadores, regiones y períodos para personalizar tu análisis"
                height={450}
              />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* Regional Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comparación por Regiones
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre cómo varía la pobreza e indigencia entre las diferentes regiones de Argentina. 
              Datos actualizados de los principales aglomerados urbanos del país.
            </p>
          </motion.div>

          <Suspense fallback={
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Skeleton className="h-96 w-full" />
            </div>
          }>
            <PovertyRegionalTable />
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
              ¿Cómo se Miden la Pobreza e Indigencia?
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />
                  Línea de Pobreza
                </h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">•</span>
                    Basada en la Canasta Básica Total (CBT)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">•</span>
                    Incluye alimentos, vestimenta, transporte y servicios básicos
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">•</span>
                    Medida a través de la Encuesta Permanente de Hogares (EPH)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">•</span>
                    Publicada semestralmente por el INDEC
                  </li>
                </ol>
              </div>

              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Línea de Indigencia
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li><strong>Canasta Básica Alimentaria (CBA):</strong> Solo alimentos básicos</li>
                  <li><strong>Necesidades mínimas:</strong> Requerimientos nutricionales esenciales</li>
                  <li><strong>Adulto equivalente:</strong> Ajustado por edad y sexo del hogar</li>
                  <li><strong>Relación:</strong> Todo indigente es pobre, pero no viceversa</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Características del Dashboard de Pobreza
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 text-center"
              >
                <div className="h-16 w-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Datos Oficiales INDEC
                </h3>
                <p className="text-gray-700">
                  Información directa del Instituto Nacional de Estadística y Censos
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 text-center"
              >
                <div className="h-16 w-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  31 Aglomerados Urbanos
                </h3>
                <p className="text-gray-700">
                  Cobertura de los principales centros urbanos del país
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
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Análisis Interactivo
                </h3>
                <p className="text-gray-700">
                  Gráficos y tablas interactivas para explorar los datos
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-orange-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Explorá Todos los Indicadores Sociales
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Accedé a gráficos detallados, análisis de tendencias y herramientas 
              profesionales para entender la situación social argentina
            </p>
            <Link href="/indicadores/pobreza">
              <Button size="lg" className="bg-white text-red-700 hover:bg-red-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Ver Dashboard Completo
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="prose prose-lg max-w-none text-gray-700">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Estadísticas de Pobreza en Argentina: Análisis Completo y Actualizado
              </h2>

              <p className="mb-6">
                Nuestro <strong>dashboard de pobreza e indigencia en Argentina</strong> ofrece el análisis más completo y actualizado 
                de la situación social del país. Basado en datos oficiales del <strong>INDEC (Instituto Nacional de Estadística y Censos)</strong>, 
                proporcionamos información detallada sobre los indicadores de pobreza e indigencia en los 31 aglomerados urbanos principales de Argentina.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                ¿Por Qué Usar Nuestro Dashboard de Pobreza Argentina?
              </h3>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <RefreshCw className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Datos Oficiales INDEC</h4>
                    <p>Acceso directo a las estadísticas oficiales publicadas por el Instituto Nacional de Estadística y Censos, 
                    garantizando la máxima confiabilidad en cada dato mostrado.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BarChart3 className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Análisis por Regiones</h4>
                    <p>Comparación detallada entre los 31 aglomerados urbanos más importantes de Argentina, 
                    representando el 62% de la población total del país.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Evolución Histórica</h4>
                    <p>Seguimiento de la evolución de la pobreza e indigencia desde 2016, permitiendo 
                    identificar tendencias y patrones en los indicadores sociales.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Gráficos Interactivos</h4>
                    <p>Herramientas de visualización avanzadas que facilitan la comprensión y análisis 
                    de los datos de pobreza e indigencia en Argentina.</p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Preguntas Frecuentes sobre Pobreza e Indigencia en Argentina
              </h3>

              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    ¿Cuál es la diferencia entre pobreza e indigencia en Argentina?
                  </h4>
                  <p>
                    La <strong>línea de pobreza</strong> se basa en la Canasta Básica Total (CBT) que incluye alimentos y servicios básicos. 
                    La <strong>línea de indigencia</strong> se basa únicamente en la Canasta Básica Alimentaria (CBA). 
                    Es importante entender que toda persona indigente es también pobre, pero no viceversa.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    ¿Cómo se calculan los indicadores de pobreza en Argentina?
                  </h4>
                  <p>
                    El INDEC utiliza el <strong>método del ingreso</strong> basado en la Encuesta Permanente de Hogares (EPH). 
                    Se comparan los ingresos familiares con el costo de las canastas básicas, ajustado según la composición del hogar 
                    y utilizando escalas de equivalencia por edad y sexo.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    ¿Qué regiones están incluidas en la medición de pobreza?
                  </h4>
                  <p>
                    La medición incluye los <strong>31 aglomerados urbanos más importantes de Argentina</strong>, cubriendo 
                    aproximadamente el 62% de la población total del país. Esto incluye el Gran Buenos Aires, Córdoba, 
                    Rosario, Mendoza, Tucumán y otros centros urbanos principales.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    ¿Con qué frecuencia se actualizan los datos de pobreza?
                  </h4>
                  <p>
                    Los <strong>datos de pobreza e indigencia se publican semestralmente</strong> por el INDEC, 
                    correspondientes al primer y segundo semestre de cada año. Nuestro dashboard se actualiza 
                    automáticamente cada vez que se publican nuevos datos oficiales.
                  </p>
                </div>
              </div>

              <p className="text-lg font-medium text-gray-900">
                Manténgase actualizado con las <strong>estadísticas oficiales de pobreza en Argentina</strong> y utilice 
                nuestras herramientas de análisis para comprender mejor la situación socioeconómica del país.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}