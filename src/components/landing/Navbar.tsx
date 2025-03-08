"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MainNavigation } from "@/components/NavigationMenu"
import { cn } from "@/lib/utils"

export default function NavBar() {
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
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-300",
      isScrolled 
        ? "bg-white/95 backdrop-blur-sm border-b border-indec-gray-medium shadow-sm" 
        : "bg-white border-b border-white"
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-indec-blue text-white font-bold">
              E
            </div>
            <span className="font-semibold tracking-tight text-indec-blue transition-colors duration-300">
              EconoVista
            </span>
          </Link>
          
         
        </div>

          {/* Desktop Navigation */}
            <div className="hidden md:block">
                <MainNavigation />
            </div>
          
        {/* Auth buttons and mobile menu */}
        <div className="flex items-center gap-2">
          {/* Auth buttons - desktop */}
          <div className="hidden md:flex md:items-center md:gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="font-medium border-indec-blue text-indec-blue"
            >
              Iniciar sesión
            </Button>
            <Button 
              size="sm"
              className="font-medium bg-indec-blue text-white hover:bg-indec-blue-dark"
            >
              Registrarse
            </Button>
          </div>
          
          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-indec-blue"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col h-full">
                  <div className="px-2 py-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-indec-blue text-white font-bold">
                        E
                      </div>
                      <span className="font-semibold tracking-tight text-indec-blue">
                        EconoVista
                      </span>
                    </div>
                    
                    <nav className="flex flex-col space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground px-4">
                          Indicadores
                        </p>
                        <Link 
                          href="/indicadores/emae"
                          className="block px-4 py-2 text-sm rounded-md hover:bg-accent"
                        >
                          EMAE
                        </Link>
                        <Link 
                          href="/indicadores/ipc"
                          className="block px-4 py-2 text-sm rounded-md hover:bg-accent"
                        >
                          IPC
                        </Link>
                        <Link 
                          href="/indicadores/emae-por-actividad"
                          className="block px-4 py-2 text-sm rounded-md hover:bg-accent"
                        >
                          EMAE por Actividad
                        </Link>
                        <Link 
                          href="/indicadores/comparativas"
                          className="block px-4 py-2 text-sm rounded-md hover:bg-accent"
                        >
                          Comparativas
                        </Link>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground px-4">
                          API
                        </p>
                        <Link 
                          href="/api-docs"
                          className="block px-4 py-2 text-sm rounded-md hover:bg-accent"
                        >
                          Documentación
                        </Link>
                        <Link 
                          href="/api-docs/ejemplos"
                          className="block px-4 py-2 text-sm rounded-md hover:bg-accent"
                        >
                          Ejemplos de Código
                        </Link>
                        <Link 
                          href="/api-docs/endpoints"
                          className="block px-4 py-2 text-sm rounded-md hover:bg-accent"
                        >
                          Referencias de Endpoints
                        </Link>
                        <Link 
                          href="/api-docs/playground"
                          className="block px-4 py-2 text-sm rounded-md hover:bg-accent"
                        >
                          Playground
                        </Link>
                      </div>
                      
                      <Link 
                        href="/documentacion"
                        className="block px-4 py-2 text-sm rounded-md hover:bg-accent"
                      >
                        Documentación
                      </Link>
                      
                      <Link 
                        href="/acerca-de"
                        className="block px-4 py-2 text-sm rounded-md hover:bg-accent"
                      >
                        Acerca de
                      </Link>
                    </nav>
                  </div>
                  
                  {/* Mobile auth buttons */}
                  <div className="mt-auto p-6 border-t space-y-2">
                    <Button className="w-full" variant="outline">
                      Iniciar sesión
                    </Button>
                    <Button className="w-full bg-indec-blue text-white hover:bg-indec-blue-dark">
                      Registrarse
                    </Button>
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