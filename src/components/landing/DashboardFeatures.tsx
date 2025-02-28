"use client"

import { motion } from "framer-motion"
import { LineChart, ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import DashboardPreview from "@/components/DashboardPreview"

export default function DashboardFeature() {
  return (
    <section className="py-10 bg-transparent relative">
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
      </div>
    </section>
  )
}