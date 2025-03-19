"use client"

import Link from "next/link"
import Logo from "@/components/Logo"
import { Github, Mail, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="border-t border-indec-gray-medium/30 bg-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Logo y descripción */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5">
              <Logo className="mb-2" textColor="text-indec-blue" />
            </Link>
            <p className="mb-4 max-w-sm text-sm text-indec-gray-dark">
              Análisis y visualización de los principales indicadores económicos de Argentina, 
              con datos oficiales actualizados y APIs para desarrolladores.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                <Link href="/contacto" aria-label="Contacto">
                  <Mail className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Navegación */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-indec-blue-dark">Indicadores</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/indicadores/emae" className="text-sm text-indec-gray-dark hover:text-indec-blue">
                EMAE
              </Link>
              <Link href="/indicadores/ipc" className="text-sm text-indec-gray-dark hover:text-indec-blue">
                IPC
              </Link>
              <Link href="/cotizaciones" className="text-sm text-indec-gray-dark hover:text-indec-blue">
                Cotizaciones
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-indec-blue-dark">Recursos</h3>
            <nav className="flex flex-col space-y-2">

              <Link href="/calendario" className="text-sm text-indec-gray-dark hover:text-indec-blue">
                Calendario INDEC
              </Link>
              <Link href="/api-docs" className="text-sm text-indec-gray-dark hover:text-indec-blue">
                API Docs
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-indec-blue-dark">Contacto</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/contacto" className="text-sm text-indec-gray-dark hover:text-indec-blue">
                Formulario de contacto
              </Link>
              <p className="text-sm text-indec-gray-dark">info@argenstats.com</p>
            </nav>
          </div>
        </div>
        
        <div className="mt-12 border-t border-indec-gray-medium/20 pt-6 text-center">
          <p className="text-xs text-indec-gray-dark">
            ArgenStats © {new Date().getFullYear()}. Todos los datos provienen de fuentes oficiales. 
            <br />
            El uso de este servicio implica la aceptación de nuestros <Link href="/terms" className="underline hover:text-indec-blue">Términos y Condiciones</Link>.
          </p>
        </div>
      </div>
    </footer>
  )
}