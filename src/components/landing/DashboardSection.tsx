"use client"

import { motion } from "framer-motion"
import { LineChart, BarChart } from "lucide-react"
import DashboardPreview from "@/components/DashboardPreview"

export default function DashboardSection() {
  return (
    <section className="py-20 bg-indec-gray-light/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LineChart className="h-6 w-6 text-indec-blue" />
            <BarChart className="h-6 w-6 text-indec-blue" />
          </div>
          <h2 className="text-3xl font-bold text-center text-indec-blue-dark mb-4">
            Visualiza la información de forma intuitiva
          </h2>
          <p className="text-center text-indec-gray-dark max-w-2xl mx-auto">
            Nuestro dashboard te permite analizar los principales indicadores económicos
            con gráficos interactivos, filtros personalizados y datos actualizados.
          </p>
        </div>
        
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  )
}