'use client';

import React from 'react';
import { Code, ArrowRight, Sparkles, Zap, Database, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function APISection() {
  return (
    <section className="relative py-12 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Main Content Container with rounded borders and max width */}
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
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
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" />
                API RESTful
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-gray-900"
              >
                Integración Simple y Poderosa
                <span className="block text-blue-600">API para Desarrolladores</span>
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-lg text-gray-700 leading-relaxed"
              >
                Accede programáticamente a todos los datos económicos argentinos. 
                Integra fácilmente en tus aplicaciones, dashboards o análisis con nuestra API intuitiva y bien documentada.
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
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Code className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Endpoints RESTful intuitivos y bien estructurados</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Database className="h-4 w-4 text-cyan-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Datos históricos completos y actualizaciones automáticas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Share2 className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Respuestas en JSON y CSV según tus necesidades</span>
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
                <Button 
                  asChild 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/documentacion" className="flex items-center gap-2">
                    Ver Documentación API <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                
                {/* Secondary info */}
                <p className="text-sm text-gray-600 mt-4">
                  Documentación completa • Ejemplos de código • Sin autenticación requerida
                </p>
              </motion.div>
            </motion.div>

            {/* Visual Side - Terminal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Terminal Window */}
              <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
                {/* Terminal Header */}
                <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">argenstats.com/api</div>
                </div>
                
                {/* Terminal Content */}
                <div className="p-6 space-y-4 font-mono text-sm">
                  {/* Example API calls */}
                  <div className="text-gray-400">
                    <span className="text-green-400">$</span> curl https://argenstats.com/api/ipc?type=latest
                  </div>
                  
                  <div className="text-gray-300 bg-gray-800/50 p-3 rounded">
                    <div className="text-yellow-400">{"{"}</div>
                    <div className="pl-4">
                      <span className="text-blue-400">&quot;status&quot;</span>: <span className="text-green-400">&quot;success&quot;</span>,
                    </div>
                    <div className="pl-4">
                      <span className="text-blue-400">&quot;data&quot;</span>: {"["}
                    </div>
                    <div className="pl-8">
                      <span className="text-blue-400">&quot;index_value&quot;</span>: <span className="text-orange-400">145.2</span>,
                    </div>
                    <div className="pl-8">
                      <span className="text-blue-400">&quot;monthly_change&quot;</span>: <span className="text-orange-400">3.5</span>,
                    </div>
                    <div className="pl-8">
                      <span className="text-blue-400">&quot;date&quot;</span>: <span className="text-green-400">&quot;2024-11&quot;</span>
                    </div>
                    <div className="pl-4">{"]"}</div>
                    <div className="text-yellow-400">{"}"}</div>
                  </div>

                  <div className="text-gray-400">
                    <span className="text-green-400">$</span> curl https://argenstats.com/api/dollar?type=latest
                  </div>
                  
                  <div className="text-gray-300 bg-gray-800/50 p-3 rounded">
                    <div className="text-green-400">✓ 200 OK</div>
                    <div className="text-gray-400">Response time: 45ms</div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                viewport={{ once: true }}
                className="absolute -top-6 -right-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg"
              >
                <Zap className="h-4 w-4" />
                Ultra rápida
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                viewport={{ once: true }}
                className="absolute -bottom-4 -left-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg"
              >
                <Database className="h-4 w-4" />
                Datos actualizados
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}