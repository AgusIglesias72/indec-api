"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, DollarSign, TrendingUp, BarChart3, Globe, Calendar, FileText, Users, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { MainNavigation } from "@/components/NavigationMenu"
import { cn } from "@/lib/utils"
import Logo from "../Logo"

// Datos de navegación sincronizados con MainNavigation
const indicators = [
  {
    title: "EMAE",
    href: "/indicadores/emae",
    description: "Estimador Mensual de Actividad Económica",
    icon: BarChart3,
  },
  {
    title: "IPC",
    href: "/indicadores/ipc",
    description: "Índice de Precios al Consumidor",
    icon: TrendingUp,
  },
  {
    title: "Riesgo País",
    href: "/indicadores/riesgo-pais",
    description: "Indicador de riesgo soberano argentino",
    icon: Globe,
  },
  {
    title: "Mercado de Trabajo",
    href: "/indicadores/empleo",
    description: "Índice de Empleo y Mercado Laboral",
    icon: Users,
  },
]

const mainNavItems = [
  { title: "Dólar", href: "/dolar", icon: DollarSign },
  { title: "Calendario INDEC", href: "/calendario", icon: Calendar },
  { title: "API Docs", href: "/documentacion", icon: FileText },
]

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Manejar scroll para efectos visuales
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cerrar menú móvil al navegar
  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false)
  }
  
  // No renderizar hasta que el componente esté montado en el cliente
  if (!isMounted) {
    return (
      <header className="sticky top-0 z-40 w-full bg-white border-b border-white">
        <div className="mx-auto h-16 px-4 xl:px-12 grid grid-cols-2 md:grid-cols-3 items-center">
          <div className="flex items-center justify-start">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>
          <div className="hidden md:flex justify-center font-clear-sans font-extrabold">
            <MainNavigation />
          </div>
          <div className="flex items-center justify-end gap-2">
            <div className="hidden md:flex md:items-center md:gap-2">
              <Button 
                asChild
                variant="outline" 
                size="sm"
                className="font-medium border-indec-blue text-indec-blue hover:bg-indec-blue hover:text-white transition-colors"
              >
                <Link href="/contacto" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contacto
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
    )
  }
  
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-300",
      isScrolled 
        ? "bg-white/95 backdrop-blur-sm border-b border-indec-gray-medium shadow-sm" 
        : "bg-white border-b border-white"
    )}>
      {/* Grid layout - móvil: 2 columnas, desktop: 3 columnas */}
      <div className="mx-auto h-16 px-4 xl:px-12 grid grid-cols-2 md:grid-cols-3 items-center">
        {/* Logo - columna izquierda */}
        <div className="flex items-center justify-start">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation - columna central, solo visible en desktop */}
        <div className="hidden md:flex justify-center font-clear-sans font-extrabold">
          <MainNavigation />
        </div>
          
        {/* Contact button and mobile menu - columna derecha */}
        <div className="flex items-center justify-end gap-2">
          {/* Contact button - desktop */}
          <div className="hidden md:flex md:items-center md:gap-2">
            <Button 
              asChild
              variant="outline" 
              size="sm"
              className="font-medium border-indec-blue text-indec-blue hover:bg-indec-blue hover:text-white transition-colors"
            >
              <Link href="/contacto" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contacto
              </Link>
            </Button>
          </div>
          
          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-indec-blue hover:bg-indec-blue/10"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                {/* Título accesible oculto */}
                <SheetTitle className="sr-only">
                  Menú de navegación principal
                </SheetTitle>
                
                <div className="flex flex-col h-full">
                  {/* Header del menú móvil */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-2">
                      <Logo />
                    </div>
                  </div>
                  
                  {/* Contenido de navegación */}
                  <div className="flex-1 overflow-y-auto py-6 px-6">
                    <nav className="space-y-6">
                      {/* Sección Indicadores */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-indec-blue uppercase tracking-wider">
                          Indicadores
                        </h3>
                        <div className="space-y-1">
                          {indicators.map((indicator) => {
                            const IconComponent = indicator.icon;
                            return (
                              <Link
                                key={indicator.title}
                                href={indicator.href}
                                onClick={handleMobileNavClick}
                                className="flex items-start gap-3 rounded-lg p-3 hover:bg-indec-blue/5 transition-colors group"
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  <IconComponent className="h-5 w-5 text-indec-blue group-hover:text-indec-blue-dark transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 group-hover:text-indec-blue transition-colors">
                                    {indicator.title}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1 font-clear-sans font-light">
                                    {indicator.description}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Separador */}
                      <div className="border-t border-gray-200"></div>
                      
                      {/* Sección Principal */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-indec-blue uppercase tracking-wider">
                          Navegación
                        </h3>
                        <div className="space-y-1">
                          {mainNavItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={handleMobileNavClick}
                                className="flex items-center gap-3 rounded-lg p-3 hover:bg-indec-blue/5 transition-colors group"
                              >
                                <div className="flex-shrink-0">
                                  <IconComponent className="h-5 w-5 text-indec-blue group-hover:text-indec-blue-dark transition-colors" />
                                </div>
                                <div className="font-medium text-gray-900 group-hover:text-indec-blue transition-colors">
                                  {item.title}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Separador */}
                      <div className="border-t border-gray-200"></div>
                      
                      {/* Enlaces adicionales */}
                      <div className="space-y-1">
                        <Link 
                          href="/contacto"
                          onClick={handleMobileNavClick}
                          className="flex items-center gap-3 rounded-lg p-3 hover:bg-indec-blue/5 transition-colors group"
                        >
                          <div className="flex-shrink-0">
                            <Mail className="h-5 w-5 text-indec-blue group-hover:text-indec-blue-dark transition-colors" />
                          </div>
                          <div className="font-medium text-gray-900 group-hover:text-indec-blue transition-colors">
                            Contacto
                          </div>
                        </Link>
                        
                        <Link 
                          href="/documentacion"
                          onClick={handleMobileNavClick}
                          className="flex items-center gap-3 rounded-lg p-3 hover:bg-indec-blue/5 transition-colors group"
                        >
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-indec-blue group-hover:text-indec-blue-dark transition-colors" />
                          </div>
                          <div className="font-medium text-gray-900 group-hover:text-indec-blue transition-colors">
                            Documentación
                          </div>
                        </Link>
                      </div>
                    </nav>
                  </div>
                  
                  {/* Footer del menú móvil */}
                  <div className="p-6 border-t bg-gray-50/80">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        ArgenStats • Datos económicos en tiempo real
                      </p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}