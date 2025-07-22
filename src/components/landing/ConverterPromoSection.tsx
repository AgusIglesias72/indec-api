'use client';

import React from 'react';
import { Calculator, ArrowRight, Sparkles, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function ConverterPromoSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl p-8 md:p-12">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
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
            className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            Nueva Experiencia
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Conversor de Dólar
            <span className="block text-emerald-600">Completamente Renovado</span>
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-lg text-gray-700 leading-relaxed"
          >
            Experimentá nuestra nueva herramienta de conversión con una interfaz completamente 
            rediseñada, funciones avanzadas y acceso instantáneo a todas las cotizaciones en tiempo real.
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
              <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-gray-700 font-medium">Conversión instantánea mientras escribís</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">Datos históricos con calendario intuitivo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calculator className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">Interfaz optimizada para móviles</span>
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
            <Link href="/conversor-dolar-peso-argentino">
              <Button 
                size="lg" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 group"
              >
                Probar Nuevo Conversor
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              Acceso gratuito • Sin registro requerido
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
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-2xl blur-xl"></div>
            
            {/* Screenshot container */}
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-100">
              {/* Browser mockup header */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white rounded-lg px-3 py-1 ml-4">
                  <span className="text-xs text-gray-500">argenstats.com/conversor-dolar-peso-argentino</span>
                </div>
              </div>
              
              {/* Screenshot placeholder - will be replaced with actual screenshot */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 aspect-[4/3]">
                <div className="space-y-4">
                  {/* Mock title */}
                  <div className="text-center">
                    <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-6 bg-emerald-200 rounded w-1/2 mx-auto"></div>
                  </div>
                  
                  {/* Mock live rates */}
                  <div className="flex justify-center gap-2">
                    <div className="bg-white rounded-lg px-3 py-2 shadow-sm border">
                      <div className="h-4 bg-blue-200 rounded w-16"></div>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 shadow-sm border">
                      <div className="h-4 bg-green-200 rounded w-16"></div>
                    </div>
                  </div>
                  
                  {/* Mock converter */}
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-emerald-100 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-emerald-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-12 bg-gray-100 rounded-xl border"></div>
                      <div className="h-8 w-8 bg-emerald-200 rounded-lg"></div>
                      <div className="flex-1 h-12 bg-gray-50 rounded-xl border"></div>
                    </div>
                    <div className="h-8 bg-green-100 rounded"></div>
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
            className="absolute -top-4 -right-4 bg-emerald-500 text-white p-3 rounded-full shadow-lg"
          >
            <Calculator className="h-6 w-6" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            viewport={{ once: true }}
            className="absolute -bottom-4 -left-4 bg-white text-emerald-600 p-3 rounded-full shadow-lg border border-emerald-100"
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}