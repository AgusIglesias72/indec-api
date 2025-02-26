"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowRight,
  Code,
  Github
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function HeaderHero() {
  const [isScrolled, setIsScrolled] = useState(false)
  
  // Manejar scroll para efectos visuales
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  return (
    <>
      {/* Header con transparencia inicial */}
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled ? "bg-white border-b border-indec-gray-medium shadow-sm" : "bg-transparent"
      }`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-indec-blue text-white font-bold">
              E
            </div>
            <span className={`font-semibold tracking-tight text-indec-blue transition-colors duration-300 ${
              isScrolled ? "" : "text-white"
            }`}>
              EconoVista
            </span>
          </Link>

          {/* Navegación */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" className={isScrolled ? "" : "text-white hover:bg-white/10"}>
              Indicadores
            </Button>
            <Button variant="ghost" className={isScrolled ? "" : "text-white hover:bg-white/10"}>
              API
            </Button>
            <Button variant="ghost" className={isScrolled ? "" : "text-white hover:bg-white/10"}>
              Documentación
            </Button>
            <Button variant="ghost" className={isScrolled ? "" : "text-white hover:bg-white/10"}>
              Acerca de
            </Button>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Button variant="outline" className={isScrolled ? "" : "text-white border-white hover:bg-white/10"}>
              Iniciar sesión
            </Button>
            <Button>Registrarse</Button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative bg-gradient-to-r from-indec-blue to-indec-blue-dark text-white pt-20 pb-16 md:pt-24 md:pb-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] md:leading-[1.1]"
              >
                Datos económicos de <span className="text-white">Argentina</span> <span className="text-indec-gray-light font-normal">en tus manos</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-indec-gray-light font-light leading-relaxed max-w-lg"
              >
                Visualiza y accede a los principales indicadores económicos del INDEC a través de una interfaz moderna y una API potente.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 mt-2"
              >
                <Button size="lg" className="bg-white text-indec-blue hover:bg-indec-gray-light font-medium">
                  Ver indicadores <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Documentación API <Code className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-2 mt-2 text-sm text-indec-gray-light font-light"
              >
                <Github className="h-4 w-4" />
                <span>Proyecto open source · Datos actualizados automáticamente</span>
              </motion.div>
            </motion.div>
            
            {/* Panel de visualización */}
            <motion.div 
              className="relative h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indec-blue/80 to-transparent z-10 rounded-lg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Simulación de dashboard */}
                <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="h-8 w-1/2 bg-white/20 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="h-20 bg-white/20 rounded"></div>
                    <div className="h-20 bg-white/20 rounded"></div>
                  </div>
                  <div className="h-40 bg-white/20 rounded"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decoración de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </section>
    </>
  )
}