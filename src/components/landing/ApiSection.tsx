"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { 
  Code, 
  TrendingUp, 
  Share2, 
  ExternalLink,
  Database,
  LineChart,
  DollarSign,
  BarChart3,
  Globe,
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"

const apiExamples = [
  {
    id: 'emae',
    title: 'EMAE',
    subtitle: 'Actividad Económica',
    icon: BarChart3,
    color: 'text-blue-400',
    endpoint: '/api/emae',
    description: 'Obtener datos del Estimador Mensual de Actividad Económica',
    code: `// Obtener datos del EMAE con variación interanual
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
  });`,
    endpoints: ['GET /api/emae', 'GET /api/emae-by-activity', 'GET /api/emae/latest']
  },
  {
    id: 'ipc',
    title: 'IPC',
    subtitle: 'Índice de Precios',
    icon: TrendingUp,
    color: 'text-purple-400',
    endpoint: '/api/ipc',
    description: 'Acceder a datos de inflación y variaciones de precios',
    code: `// Obtener datos de inflación mensual e interanual
fetch('https://argenstats.com/api/ipc?period=monthly&limit=12')
  .then(response => response.json())
  .then(data => {
    const inflation = data.data;
    
    // Calcular inflación acumulada
    const accumulated = inflation.reduce((acc, month) => {
      return acc * (1 + month.monthly_change / 100);
    }, 1) - 1;
    
    console.log('Inflación acumulada:', accumulated * 100, '%');
  });`,
    endpoints: ['GET /api/ipc', 'GET /api/ipc/categories', 'GET /api/ipc/latest']
  },
  {
    id: 'dollar',
    title: 'Dólar',
    subtitle: 'Cotizaciones',
    icon: DollarSign,
    color: 'text-green-400',
    endpoint: '/api/dollar',
    description: 'Cotizaciones actualizadas del dólar en sus diferentes tipos',
    code: `// Obtener cotizaciones del dólar oficial y blue
fetch('https://argenstats.com/api/dollar/latest')
  .then(response => response.json())
  .then(data => {
    const official = data.data.find(d => d.type === 'OFICIAL');
    const blue = data.data.find(d => d.type === 'BLUE');
    
    console.log('Dólar Oficial:', official.sell_price);
    console.log('Dólar Blue:', blue.sell_price);
    console.log('Brecha:', ((blue.sell_price / official.sell_price - 1) * 100).toFixed(1) + '%');
  });`,
    endpoints: ['GET /api/dollar/latest', 'GET /api/dollar/history', 'GET /api/dollar/types']
  },
  {
    id: 'risk',
    title: 'Riesgo País',
    subtitle: 'Indicador Soberano',
    icon: Globe,
    color: 'text-red-400',
    endpoint: '/api/riesgo-pais',
    description: 'Seguimiento del riesgo soberano argentino',
    code: `// Obtener riesgo país con variaciones históricas
fetch('https://argenstats.com/api/riesgo-pais?include_variations=true&limit=30')
  .then(response => response.json())
  .then(data => {
    const latest = data.data[0];
    
    console.log('Riesgo País actual:', latest.closing_value, 'puntos básicos');
    console.log('Variación diaria:', latest.daily_change, '%');
    
    // Analizar tendencia
    const trend = data.data.slice(0, 5).every((day, i, arr) => 
      i === 0 || day.closing_value < arr[i-1].closing_value
    ) ? 'bajista' : 'alcista';
    
    console.log('Tendencia reciente:', trend);
  });`,
    endpoints: ['GET /api/riesgo-pais', 'GET /api/riesgo-pais/latest', 'GET /api/riesgo-pais/history']
  },
  {
    id: 'filters',
    title: 'Filtros',
    subtitle: 'Consultas Avanzadas',
    icon: Filter,
    color: 'text-cyan-400',
    endpoint: '/api/*',
    description: 'Utilizar filtros y parámetros para consultas específicas',
    code: `// Ejemplo de filtros avanzados en cualquier endpoint
const params = new URLSearchParams({
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  format: 'csv',
  limit: '100',
  order: 'desc'
});

fetch(\`https://argenstats.com/api/emae?\${params}\`)
  .then(response => response.text()) // CSV response
  .then(csvData => {
    console.log('Datos en formato CSV:', csvData);
    
    // O para JSON con filtros específicos
    return fetch('https://argenstats.com/api/ipc?categories=alimentos,transporte');
  })
  .then(response => response.json())
  .then(data => {
    console.log('IPC por categorías específicas:', data);
  });`,
    endpoints: ['?start_date=YYYY-MM-DD', '?format=json|csv', '?limit=N&order=asc|desc']
  }
];

export default function APISection() {
  const [activeExample, setActiveExample] = useState('emae');
  
  const currentExample = apiExamples.find(example => example.id === activeExample) || apiExamples[0];

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
                <Link href="/documentacion">
                  Documentación API <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Interactive Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {apiExamples.map((example) => {
                const IconComponent = example.icon;
                return (
                  <motion.button
                    key={example.id}
                    onClick={() => setActiveExample(example.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeExample === example.id
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-indec-gray-light hover:bg-white/10 hover:text-white border border-transparent'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    suppressHydrationWarning

                  >
                    <IconComponent className={`h-4 w-4 ${example.color}`} />
                    <span>{example.title}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Code Block Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeExample}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-indec-blue-dark/80 rounded-lg shadow-lg overflow-hidden border border-white/10 min-h-[500px] flex flex-col"
              >
                {/* Code header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-indec-gray-light font-mono">
                      {currentExample.subtitle} - {currentExample.description}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${currentExample.color}`}>
                    <currentExample.icon className="h-4 w-4" />
                  </div>
                </div>
                
                {/* Code block */}
                <div className="relative flex-1">
                  {/* Line numbers */}
                  <div className="absolute top-0 left-0 bottom-0 w-8 bg-black/20 flex flex-col items-center pt-5 text-xs font-mono text-white/30">
                    {currentExample.code.split('\n').map((_, index) => (
                      <div key={index}>{index + 1}</div>
                    ))}
                  </div>
                  
                  {/* Code content */}
                  <div className="h-full min-h-[300px]">
                    <pre className="font-mono text-xs sm:text-sm text-indec-gray-light p-5 pl-10 overflow-x-auto h-full">
                      <code className="language-javascript">{currentExample.code}</code>
                    </pre>
                  </div>
                  
                  {/* Floating icons for visual effect */}
                  <div className="absolute -bottom-3 -right-3 text-indec-blue-light/10 transform rotate-12">
                    <Database className="h-16 w-16" />
                  </div>
                  <div className={`absolute top-4 right-10 text-indec-blue-light/10 transform -rotate-6`}>
                    <currentExample.icon className="h-8 w-8" />
                  </div>
                </div>
                
                {/* API endpoint examples */}
                <div className="bg-black/20 px-4 py-3 border-t border-white/10">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {currentExample.endpoints.map((endpoint, index) => (
                      <motion.div
                        key={`${activeExample}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-indec-blue-dark rounded-full px-3 py-1 border border-white/10"
                      >
                        {endpoint}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}