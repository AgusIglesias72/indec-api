"use client"

import Link from "next/link"
import Logo from "@/components/Logo"
import { Mail, Calculator, Trophy, FileText, TrendingUp, DollarSign, BarChart3, Globe, Calendar, Book, Code, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"


export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-6">
          {/* Logo y descripción */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Logo className="mb-2" textColor="text-white" />
            </Link>
            <p className="mb-6 max-w-lg text-gray-400 leading-relaxed">
              Análisis y visualización de los principales indicadores económicos de Argentina, 
              con datos oficiales actualizados y APIs para desarrolladores.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-300" asChild>
                <Link href="https://x.com/ArgenstatsAR" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en X">
                  <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.795 10.533 20.68 2h-3.073l-5.255 6.517L7.69 2H1l7.806 10.91L1.47 22h3.074l5.705-7.07L15.31 22H22l-8.205-11.467Zm-2.38 2.95L9.97 11.464 4.36 3.627h2.31l4.528 6.317 1.443 2.02 6.018 8.409h-2.31l-4.934-6.89Z"/>
                  </svg>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-300" asChild>
                <Link href="/contacto" aria-label="Contacto">
                  <Mail className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Herramientas */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-500" />
              Herramientas
            </h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/calculadora-inflacion" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform flex items-center gap-2">
                Calculadora Inflación
              </Link>
              <Link href="/dolar" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform flex items-center gap-2">
                Conversor de Divisas
              </Link>
              <Link href="/eventos" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform flex items-center gap-2">
                Eventos IPC <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Nuevo</span>
              </Link>
              <Link href="/calendario" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform flex items-center gap-2">
                Calendario INDEC
              </Link>
            </nav>
          </div>
          
          {/* Indicadores */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Indicadores
            </h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/indicadores/ipc" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                IPC - Inflación
              </Link>
              <Link href="/indicadores/emae" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                EMAE - Actividad
              </Link>
              <Link href="/indicadores/riesgo-pais" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Riesgo País
              </Link>
              <Link href="/indicadores/empleo" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Mercado Laboral
              </Link>
              <Link href="/indicadores/pobreza" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Pobreza e Indigencia
              </Link>
            </nav>
          </div>
          
          {/* API & Desarrolladores */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white flex items-center gap-2">
              <Code className="h-4 w-4 text-cyan-500" />
              Desarrolladores
            </h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/documentacion" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Documentación API
              </Link>
              <Link href="/documentacion#endpoints" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Endpoints
              </Link>
              <Link href="/documentacion#ejemplos" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Ejemplos de Código
              </Link>
              <Link href="/profile" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                API Keys
              </Link>
            </nav>
          </div>
          
          {/* Recursos */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white flex items-center gap-2">
              <Book className="h-4 w-4 text-orange-500" />
              Recursos
            </h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/acerca-de" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Acerca de
              </Link>
              <Link href="/fuentes" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Fuentes de Datos
              </Link>
              <Link href="/contacto" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Contacto
              </Link>
              <Link href="/terminos" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Términos de Uso
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500 leading-relaxed">
            ArgenStats © {new Date().getFullYear()}. Todos los datos provienen de fuentes oficiales (INDEC, BCRA). 
            <br className="hidden sm:block" />
            <span className="inline-block mt-1 sm:mt-0 sm:ml-2">
              Desarrollado con 💙 para la comunidad argentina.
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}