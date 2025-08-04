'use client';

import React from 'react';
import { TrendingUp, ArrowRight, Sparkles, Zap, Activity, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RiskCountryPromoSection() {
  return (
    <section className="relative py-12 overflow-hidden" suppressHydrationWarning>
      <div className="container mx-auto px-4 relative z-10">
        {/* Main Content Container with rounded borders and max width */}
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Content Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            API Exclusiva
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Riesgo País en Tiempo Real
            <span className="block text-red-600">Con Cálculo Proxy Avanzado</span>
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-lg text-gray-700 leading-relaxed"
          >
            Accedé a nuestro índice de Riesgo País con ventaja única: cuando JP Morgan presenta demoras, 
            calculamos un proxy en tiempo real basado en cotizaciones de bonos soberanos argentinos.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-gray-700 font-medium">Cálculo proxy automático cuando hay demoras</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-gray-700 font-medium">Basado en spreads de bonos soberanos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">API disponible para desarrolladores</span>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="pt-4"
          >
            <Link href="/indicadores/riesgo-pais">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 group"
                suppressHydrationWarning
              >
                Ver Riesgo País
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              Datos en tiempo real • API incluida
            </p>
          </motion.div>
        </motion.div>

        {/* Screenshot Side */}
        <motion.div
          initial={{ opacity: 0, x: 20, rotateY: 15 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Container with tilt effect */}
          <div className="relative transform rotate-2 hover:rotate-1 transition-transform duration-500">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-2xl blur-xl"></div>
            
            {/* Screenshot container */}
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100">
              {/* Browser mockup header */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white rounded-lg px-3 py-1 ml-4">
                  <span className="text-xs text-gray-500">argenstats.com/riesgo-pais</span>
                </div>
              </div>
              
              {/* Screenshot placeholder with KPI mockup */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 aspect-[4/3]">
                <div className="space-y-4">
                  {/* Mock title */}
                  <div className="text-center">
                    <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-6 bg-red-200 rounded w-1/2 mx-auto"></div>
                  </div>
                  
                  {/* Mock KPIs grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm border">
                      <div className="h-3 bg-red-200 rounded w-12 mb-2"></div>
                      <div className="h-6 bg-red-400 rounded w-16"></div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                        <div className="h-2 bg-green-200 rounded w-6"></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border">
                      <div className="h-3 bg-orange-200 rounded w-10 mb-2"></div>
                      <div className="h-6 bg-orange-400 rounded w-14"></div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                        <div className="h-2 bg-red-200 rounded w-8"></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border">
                      <div className="h-3 bg-purple-200 rounded w-8 mb-2"></div>
                      <div className="h-6 bg-purple-400 rounded w-12"></div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
                        <div className="h-2 bg-purple-200 rounded w-4"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock interactive chart */}
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-red-100">
                    <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="h-24 bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-lg relative overflow-hidden">
                      {/* Mock chart line */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40">
                        <path
                          d="M 5 35 Q 20 30 25 25 T 45 20 T 65 15 T 85 25 L 95 30"
                          stroke="#dc2626"
                          strokeWidth="2"
                          fill="none"
                          className="opacity-60"
                        />
                        <path
                          d="M 5 35 Q 20 30 25 25 T 45 20 T 65 15 T 85 25 L 95 30 L 95 40 L 5 40 Z"
                          fill="url(#redGradient)"
                          className="opacity-20"
                        />
                        <defs>
                          <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#dc2626" />
                            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Mock data points */}
                      <div className="absolute top-3 left-4 w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="absolute top-5 left-12 w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="absolute top-2 left-20 w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="absolute top-6 right-8 w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="h-2 bg-gray-200 rounded w-8"></div>
                      <div className="h-2 bg-gray-200 rounded w-6"></div>
                      <div className="h-2 bg-gray-200 rounded w-10"></div>
                      <div className="h-2 bg-gray-200 rounded w-7"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            viewport={{ once: true }}
            className="absolute -top-4 -right-4 bg-red-500 text-white p-3 rounded-full shadow-lg"
          >
            <TrendingUp className="h-6 w-6" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            viewport={{ once: true }}
            className="absolute -bottom-4 -left-4 bg-white text-red-600 p-3 rounded-full shadow-lg border border-red-100"
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
        </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}