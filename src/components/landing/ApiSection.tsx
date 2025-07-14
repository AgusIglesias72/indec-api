"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Code, 
  TrendingUp, 
  Share2, 
  ExternalLink,
  Database,
  LineChart,
  LogIn
} from "lucide-react"

import { Button } from "@/components/ui/button"

export default function APISection() {
  return (
    <section className="py-20 bg-indec-blue text-white relative overflow-hidden">      
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-white/5 translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center">
                <Code className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">API RESTFUL</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              API potente y fácil de integrar
            </h2>
            
            <p className="text-indec-gray-light text-lg font-light leading-relaxed mb-8 text-pretty text-center md:text-left">
              Accede programáticamente a todos los datos económicos para integrarlos en tus aplicaciones, 
              dashboards o análisis personalizados. Nuestra API está diseñada para ser intuitiva y flexible.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex gap-4">
                <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Endpoints RESTful intuitivos</h3>
                  <p className="text-indec-gray-light font-light">Estructura clara y consistente con filtrado flexible</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Series completas y actualizadas</h3>
                  <p className="text-indec-gray-light font-light">Datos históricos y actualizaciones automáticas</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Share2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Múltiples formatos de salida</h3>
                  <p className="text-indec-gray-light font-light">Respuestas en JSON y CSV según tus necesidades</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-indec-blue hover:bg-indec-gray-light flex-1 lg:flex-none">
                <Link href="/api-docs">
                  Documentación API <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="bg-indec-blue text-white hover:bg-indec-blue-dark hover:text-white flex-1 lg:flex-none">
                <Link href="/registro">
                  Iniciar prueba gratuita <LogIn className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>


          
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="bg-indec-blue-dark/80 rounded-lg shadow-lg overflow-hidden border border-white/10">
              {/* Code header */}
              <div className="flex items-center px-4 py-3 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 text-xs text-indec-gray-light font-mono">Ejemplo de petición API</div>
              </div>
              
              {/* Code block */}
              <div className="relative">
                {/* Line numbers */}
                <div className="absolute top-0 left-0 bottom-0 w-8 bg-black/20 flex flex-col items-center pt-5 text-xs font-mono text-white/30">
                  <div>1</div>
                  <div>2</div>
                  <div>3</div>
                  <div>4</div>
                  <div>5</div>
                  <div>6</div>
                  <div>7</div>
                  <div>8</div>
                  <div>9</div>
                  <div>10</div>
                  <div>11</div>
                  <div>12</div>
                </div>
                
                {/* Code content */}
                <pre className="font-mono text-xs sm:text-sm text-indec-gray-light p-5 pl-10 overflow-x-auto">
                  <code className="language-javascript">{`// Obtener datos del EMAE con variación interanual
fetch('https://argenstats.com/api/emae?start_date=2023-01-01&include_variations=true')
  .then(response => response.json())
  .then(data => {
    console.log('Último valor EMAE:', data.data[data.data.length - 1]);
    
    // Procesar datos para visualización
    const chartData = data.data.map(item => ({
      date: item.date,
      value: item.original_value,
      yearOverYear: item.year_over_year_change
    }));
    
    // Usar los datos en tu aplicación...
  });`}</code>
                </pre>
                
                {/* Floating icons for visual effect */}
                <div className="absolute -bottom-3 -right-3 text-indec-blue-light/10 transform rotate-12">
                  <Database className="h-16 w-16" />
                </div>
                <div className="absolute top-4 right-10 text-indec-blue-light/10 transform -rotate-6">
                  <LineChart className="h-8 w-8" />
                </div>
              </div>
              
              {/* API endpoint examples */}
              <div className="bg-black/20 px-4 py-3 border-t border-white/10">
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="bg-indec-blue-dark rounded-full px-3 py-1 border border-white/10">GET /api/emae</div>
                  <div className="bg-indec-blue-dark rounded-full px-3 py-1 border border-white/10">GET /api/ipc</div>
                  <div className="bg-indec-blue-dark rounded-full px-3 py-1 border border-white/10">GET /api/emae-by-activity</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}