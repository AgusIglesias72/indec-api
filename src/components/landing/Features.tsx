"use client"

import { 
  LineChart,
  Database, 
  Activity,
  ChevronRight
} from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Definiciones de animación para elementos
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}


export default function Features() {
  return (
    <section className="py-20 bg-indec-gray-light">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-indec-blue-dark mb-4">
            Toda la economía argentina en un solo lugar
          </h2>
          <p className="text-indec-gray-dark text-lg">
            Accede a visualizaciones interactivas y datos actualizados de los principales indicadores económicos
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          <motion.div variants={fadeIn}>
            <Card className="h-full bg-white border-indec-gray-medium hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indec-blue/10 rounded-full flex items-center justify-center mb-4">
                  <LineChart className="h-6 w-6 text-indec-blue" />
                </div>
                <CardTitle>Visualización interactiva</CardTitle>
                <CardDescription>
                  Explora los datos mediante gráficos interactivos y personalizables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-indec-gray-dark">
                  <li className="flex items-start">
                    <ChevronRight className="h-4 w-4 mt-1 mr-2 text-indec-blue" />
                    <span>Gráficos de series temporales dinámicos</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-4 w-4 mt-1 mr-2 text-indec-blue" />
                    <span>Comparación de diferentes períodos</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-4 w-4 mt-1 mr-2 text-indec-blue" />
                    <span>Descarga de datos en múltiples formatos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={fadeIn}>
            <Card className="h-full bg-white border-indec-gray-medium hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indec-blue/10 rounded-full flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-indec-blue" />
                </div>
                <CardTitle>API robusta</CardTitle>
                <CardDescription>
                  Integra los datos en tus propias aplicaciones y análisis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-indec-gray-dark">
                  <li className="flex items-start">
                    <ChevronRight className="h-4 w-4 mt-1 mr-2 text-indec-blue" />
                    <span>Endpoints RESTful para todos los indicadores</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-4 w-4 mt-1 mr-2 text-indec-blue" />
                    <span>Filtrado por fecha, región y componentes</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-4 w-4 mt-1 mr-2 text-indec-blue" />
                    <span>Respuestas en JSON y CSV optimizadas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={fadeIn}>
            <Card className="h-full bg-white border-indec-gray-medium hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indec-blue/10 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-indec-blue" />
                </div>
                <CardTitle>Datos actualizados</CardTitle>
                <CardDescription>
                  Información actualizada automáticamente desde fuentes oficiales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-indec-gray-dark">
                  <li className="flex items-start">
                    <ChevronRight className="h-4 w-4 mt-1 mr-2 text-indec-blue" />
                    <span>Actualización automática desde el INDEC</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-4 w-4 mt-1 mr-2 text-indec-blue" />
                    <span>Series históricas completas</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-4 w-4 mt-1 mr-2 text-indec-blue" />
                    <span>Notificaciones de nuevas publicaciones</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}