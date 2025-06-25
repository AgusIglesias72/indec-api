"use client"

import Link from "next/link"
import Logo from "@/components/Logo"
import { Github, Mail, Twitter } from "lucide-react"
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
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/10" asChild>
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/10" asChild>
                <Link href="/contacto" aria-label="Contacto">
                  <Mail className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Navegación */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Indicadores</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/emae" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                EMAE
              </Link>
              <Link href="/ipc" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                IPC
              </Link>
              <Link href="/cotizaciones" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                Cotizaciones
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Recursos</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/calendario" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                Calendario INDEC
              </Link>
              <Link href="/api-docs" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                API Docs
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Contacto</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/contacto" className="text-sm text-indec-blue-100 hover:text-white transition-colors">
                Formulario de contacto
              </Link>
              <p className="text-sm text-indec-blue-100">info@argenstats.com</p>
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