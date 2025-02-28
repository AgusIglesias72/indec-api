"use client"

import { motion } from "framer-motion"
import { ArrowRight, Code, Github, Sparkles } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import NavBar from "@/components/navigation/NavBar"

export default function HeaderHero() {
  return (
    <>
      <NavBar />
      
      {/* Hero section con solo texto */}
      <section className="relative bg-white text-indec-blue-dark pt-20 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Círculos azules decorativos */}
        <div className="hidden md:block absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-indec-blue/20 -mr-96 -mt-96"></div>
        <div className="hidden md:block absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-indec-blue/20 -ml-96 -mb-96"></div>
        
        {/* Patrón de puntos sutiles */}
        <div 
          className="absolute inset-0 opacity-[0.85] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>
        
        {/* Lanzamiento oficial banner */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-indec-blue/10 text-indec-blue text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>¡Lanzamiento Oficial!</span>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Título principal con estilo de dos líneas */}
          <div className="text-center mb-14">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Datos económicos,
              <span className="block text-indec-blue">en tiempo real.</span>
            </motion.h1>
          </div>
          
          <div className="max-w-3xl mx-auto text-center">
            <motion.p 
              className="text-lg md:text-xl text-indec-gray-dark mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Potencia la visualización de indicadores económicos con datos actualizados. 
              Mejora tu toma de decisiones con información relevante del INDEC a través 
              de una interfaz moderna y una API potente.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4 justify-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button size="lg" className="bg-indec-blue text-white hover:bg-indec-blue-dark rounded-full px-6">
                <Link href="/indicadores" className="flex items-center">
                  Ver indicadores <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="border-indec-blue text-indec-blue hover:bg-indec-blue/5 rounded-full px-6">
                <Link href="/api-docs" className="flex items-center">
                  Documentación API <Code className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-center gap-2 mt-6 text-sm text-indec-gray-dark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Github className="h-4 w-4" />
              <span>Proyecto open source · Datos actualizados automáticamente</span>
            </motion.div>
          </div>
        </div>
        
        {/* Estrella decorativa */}
        <div className="absolute top-[15%] right-[18%]">
          <motion.div 
            initial={{ rotate: 0, scale: 0 }}
            animate={{ rotate: 15, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.4 9.6H22L16.8 14.4L19.2 22L12 17.2L4.8 22L7.2 14.4L2 9.6H9.6L12 2Z" fill="#4F46E5" fillOpacity="0.3" stroke="#4F46E5" strokeWidth="1.5"/>
            </svg>
          </motion.div>
        </div>
      </section>
    </>
  )
}