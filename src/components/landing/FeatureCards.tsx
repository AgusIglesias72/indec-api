"use client"

import React from 'react'
import { motion } from "framer-motion"
import {  BarChart, Code, ArrowRight, Activity, Database, Search, Lock } from "lucide-react"
import Link from "next/link"

interface FeatureCardProps {
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  link: string; 
  linkText: string;
}

const FeatureCard = ({ icon, title, description, link, linkText }: FeatureCardProps) => {
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

export default function FeatureCards() {
  return (
    <section className="py-20 bg-transparent">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <FeatureCard
        icon={<Code className="h-6 w-6 text-indec-blue" />}
        title="API RESTful potente"
        description="Integra datos económicos en tus aplicaciones con nuestra API fácil de usar. Accede a endpoints bien documentados con filtrado flexible y múltiples formatos de salida."
        link="/documentacion"
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

// También exportamos el componente FeatureCard para que pueda ser 
// utilizado individualmente en otros lugares si es necesario
export { FeatureCard }