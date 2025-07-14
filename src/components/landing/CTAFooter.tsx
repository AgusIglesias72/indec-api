"use client"

import Link from "next/link"
import Logo from "@/components/Logo"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"


export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-800 ">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Logo y descripción */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Logo className="mb-2" textColor="text-white" />
            </Link>
            <p className="mb-6 max-w-lg text-lg text-gray-300 leading-relaxed">
              Análisis y visualización de los principales indicadores económicos de Argentina, 
              con datos oficiales actualizados y APIs para desarrolladores.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-white hover:bg-white/10 rounded-xl transition-all duration-300" asChild>
                <Link href="https://x.com/ArgenstatsAR" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en X">
                  <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.795 10.533 20.68 2h-3.073l-5.255 6.517L7.69 2H1l7.806 10.91L1.47 22h3.074l5.705-7.07L15.31 22H22l-8.205-11.467Zm-2.38 2.95L9.97 11.464 4.36 3.627h2.31l4.528 6.317 1.443 2.02 6.018 8.409h-2.31l-4.934-6.89Z"/>
                  </svg>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-white hover:bg-white/10 rounded-xl transition-all duration-300" asChild>
                <Link href="/contacto" aria-label="Contacto">
                  <Mail className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Indicadores */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Indicadores</h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/indicadores/emae" className="text-md text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                EMAE
              </Link>
              <Link href="/indicadores/ipc" className="text-md text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                IPC
              </Link>
              <Link href="/indicadores/riesgo-pais" className="text-md text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Riesgo País
              </Link>
              <Link href="/indicadores/empleo" className="text-md text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Mercado de Trabajo
              </Link>
            </nav>
          </div>
          
          {/* Navegación Principal */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Navegación</h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/dolar" className="text-md text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Dólar
              </Link>
              <Link href="/calendario" className="text-md text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Calendario INDEC
              </Link>
              <Link href="/documentacion" className="text-md text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                API Docs
              </Link>
            </nav>
          </div>
          
          {/* Información */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Información</h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/documentacion" className="text-md text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Documentación
              </Link>
           
              <Link href="/contacto" className="text-md text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform">
                Contacto
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-blue-800/50 text-center">
          <p className="text-sm text-gray-400 leading-relaxed">
            ArgenStats © {new Date().getFullYear()}. Todos los datos provienen de fuentes oficiales. 
            <br className="hidden sm:block" />
           {/* <span className="inline-block mt-1 sm:mt-0 sm:ml-2">
              El uso de este servicio implica la aceptación de nuestros{" "}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline transition-colors duration-300">
                Términos y Condiciones
              </Link>.
            </span>
            */}
          </p>
        </div>
      </div>
    </footer>
  )
}