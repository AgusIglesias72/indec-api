"use client"

import Link from "next/link"
import { 
  Code, 
  TrendingUp, 
  Share2, 
  ExternalLink 
} from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ApiSection() {
  return (
    <section className="py-20 bg-indec-blue text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold leading-tight mb-6">
              API potente y fácil de integrar
            </h2>
            <p className="text-indec-gray-light text-lg font-light leading-relaxed mb-8">
              Accede programáticamente a todos los datos económicos para integrarlo en tus aplicaciones, 
              dashboards o análisis personalizados.
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
              <Button asChild size="lg" className="bg-white text-indec-blue hover:bg-indec-gray-light">
                <Link href="/api-docs">
                  Documentación API <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="border-white hover:bg-white/10">
                <Link href="/registro">
                  Iniciar prueba gratuita
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-indec-blue-dark/80 rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-white/10">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="ml-4 text-xs text-indec-gray-light font-mono">Ejemplo de petición API</div>
            </div>
            
            <pre className="font-mono text-xs sm:text-sm text-indec-gray-light p-5 overflow-x-auto">
              <code className="language-javascript">{`// Obtener datos del EMAE con variación interanual
fetch('https://api.econovista.gov.ar/v1/emae?start_date=2023-01-01&include_variations=true')
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
          </div>
        </div>
      </div>
    </section>
  )
}