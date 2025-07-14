"use client"

import Link from "next/link"
import Logo from "@/components/Logo"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-indec-blue border-t border-indec-blue-dark">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Logo y descripción */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5">
              <Logo className="mb-2" textColor="text-white" />
            </Link>
            <p className="mb-4 max-w-sm text-sm text-indec-blue-100">
              Análisis y visualización de los principales indicadores económicos de Argentina, 
              con datos oficiales actualizados y APIs para desarrolladores.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/10" asChild>
                <Link href="https://x.com/ArgenstatsAR" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en X">
                  <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.795 10.533 20.68 2h-3.073l-5.255 6.517L7.69 2H1l7.806 10.91L1.47 22h3.074l5.705-7.07L15.31 22H22l-8.205-11.467Zm-2.38 2.95L9.97 11.464 4.36 3.627h2.31l4.528 6.317 1.443 2.02 6.018 8.409h-2.31l-4.934-6.89Z"/>
                  </svg>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/10" asChild>
                <Link href="/contacto" aria-label="Contacto">
                  <Mail className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Indicadores */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Indicadores</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/indicadores/emae" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                EMAE
              </Link>
              <Link href="/indicadores/ipc" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                IPC
              </Link>
              <Link href="/indicadores/riesgo-pais" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                Riesgo País
              </Link>
              <Link href="/indicadores/empleo" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                Mercado de Trabajo
              </Link>
            </nav>
          </div>
          
          {/* Navegación Principal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Navegación</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/dolar" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                Dólar
              </Link>
              <Link href="/calendario" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                Calendario INDEC
              </Link>
              <Link href="/api-docs" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                API Docs
              </Link>
            </nav>
          </div>
          
          {/* Información */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Información</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/documentacion" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                Documentación
              </Link>
              <Link href="/acerca-de" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                Acerca de
              </Link>
              <Link href="/contacto" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                Contacto
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="mt-12 border-t border-indec-blue-dark pt-6 text-center">
          <p className="text-xs text-indec-blue-100">
            ArgenStats © {new Date().getFullYear()}. Todos los datos provienen de fuentes oficiales. 
            <br />
            El uso de este servicio implica la aceptación de nuestros{" "}
            <Link href="/terms" className="underline hover:text-white transition-colors">
              Términos y Condiciones
            </Link>.
          </p>
        </div>
      </div>
    </footer>
  )
}
