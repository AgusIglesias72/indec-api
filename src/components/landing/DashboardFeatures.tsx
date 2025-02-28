"use client"

import React from 'react'
import { motion } from "framer-motion"
import { LineChart, BarChart, Code, ArrowRight, Activity, Database, Search, Lock } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import DashboardPreview from "@/components/DashboardPreview"

const FeatureCard = ({ icon, title, description, link, linkText }: { icon: React.ReactNode, title: string, description: string, link: string, linkText: string }) => {
  return (
    <motion.div
      className="relative group bg-white border border-indec-gray-medium 
      rounded-xl p-6 h-full shadow-sm hover:shadow-md transition-all duration-200"
      whileHover={{ y: -5 }}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4 bg-indec-blue/10 w-12 h-12 rounded-lg flex 
        items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-indec-blue-dark mb-2">{title}</h3>
        <p className="text-indec-gray-dark mb-5">{description}</p>
        {link && (
          <div className="mt-auto">
            <Link 
              href={link} 
              className="inline-flex items-center text-indec-blue font-medium hover:underline"
            >
              {linkText || "Ver más"} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function EnhancedFeaturesSection() {
  return (
    <section className="py-20 bg-transparent relative">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 
        max-w-7xl relative z-10">
       

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16 bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-indec-gray-medium/50">
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 bg-indec-blue/10 rounded-full flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-indec-blue" />
                </div>
                <span className="text-sm font-semibold text-indec-blue">DASHBOARD INTERACTIVO</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-indec-blue-dark mb-6">
                Visualiza datos en tiempo real
              </h3>
              <p className="text-indec-gray-dark mb-6">
                Nuestro dashboard te permite analizar los principales indicadores económicos 
                con gráficos interactivos y personalizables. Obtén información relevante para 
                la toma de decisiones y comparte tus hallazgos fácilmente.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Visualizaciones interactivas con filtros avanzados",
                  "Comparación entre períodos y sectores económicos",
                  "Exportación de datos y gráficos en múltiples formatos",
                  "Actualización automática desde fuentes oficiales"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="h-5 w-5 text-indec-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-3 text-indec-gray-dark">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild className="bg-indec-blue text-white hover:bg-indec-blue-dark">
                  <Link href="/dashboard" className="inline-flex items-center">
                    Explorar dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
          
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="lg:scale-110"
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            icon={<Code className="h-6 w-6 text-indec-blue" />}
            title="API RESTful potente"
            description="Integra datos económicos en tus aplicaciones con nuestra API fácil de usar. Accede a endpoints bien documentados con filtrado flexible y múltiples formatos de salida."
            link="/api-docs"
            linkText="Ver documentación"
          />
          
          <FeatureCard
            icon={<Database className="h-6 w-6 text-indec-blue" />}
            title="Datos históricos completos"
            description="Accede a series temporales completas de todos los indicadores económicos, con datos históricos desde el inicio de cada medición oficial."
            link="/indicadores"
            linkText="Explorar indicadores"
          />
          
          <FeatureCard
            icon={<Activity className="h-6 w-6 text-indec-blue" />}
            title="Análisis comparativo"
            description="Compara y correlaciona diferentes indicadores económicos para obtener insights más profundos sobre la economía argentina."
            link="/analisis"
            linkText="Ver análisis"
          />

          <FeatureCard
            icon={<Search className="h-6 w-6 text-indec-blue" />}
            title="Desestacionalización"
            description="Accede a series desestacionalizadas y componentes de tendencia-ciclo calculados con metodologías estándar."
            link="/metodologia"
            linkText="Leer más"
          />
          
          <FeatureCard
            icon={<Lock className="h-6 w-6 text-indec-blue" />}
            title="Acceso seguro"
            description="Obtén tu clave de API personal y accede a funcionalidades avanzadas con nuestro sistema de autenticación seguro."
            link="/registro"
            linkText="Crear cuenta"
          />
          
          <FeatureCard
            icon={<BarChart className="h-6 w-6 text-indec-blue" />}
            title="Exportación flexible"
            description="Descarga datos en múltiples formatos como CSV, Excel o JSON para utilizarlos en tus análisis o presentaciones."
            link="/exportar"
            linkText="Probar ahora"
          />
        </div>
      </div>
    </section>
  )
}