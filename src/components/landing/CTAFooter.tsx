"use client"

import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function CtaFooter() {
  return (
    <>
      {/* Sección de registro/CTA */}
      <section className="py-20 bg-indec-gray-light">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-indec-blue-dark mb-4">
            Comienza a explorar los datos económicos hoy mismo
          </h2>
          <p className="text-indec-gray-dark text-lg font-light leading-relaxed mb-8 max-w-2xl mx-auto">
            Regístrate gratis para acceder a todas las visualizaciones y obtener tu clave API para integrar los datos en tus proyectos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="gap-2 font-medium">
              <Link href="/registro">
                Crear cuenta gratuita <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/docs">
                Ver documentación <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-indec-gray-dark font-light">
            No se requiere tarjeta de crédito. Plan gratuito con <span className="font-mono">1000</span> peticiones diarias a la API.
          </p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-indec-gray-medium py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-indec-blue text-white font-bold">
                  E
                </div>
                <span className="font-semibold tracking-tight text-indec-blue">EconoVista</span>
              </div>
              <p className="text-indec-gray-dark text-sm font-light mb-4">
                Visualización y API de datos económicos de Argentina con información oficial del INDEC.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-indec-gray-dark hover:text-indec-blue transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-indec-gray-dark hover:text-indec-blue transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-indec-gray-dark hover:text-indec-blue transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-indec-blue-dark mb-4">Indicadores</h3>
              <ul className="space-y-2 text-sm text-indec-gray-dark">
                <li><Link href="/indicadores/emae" className="hover:text-indec-blue">EMAE</Link></li>
                <li><Link href="/indicadores/ipc" className="hover:text-indec-blue">IPC</Link></li>
                <li><Link href="/indicadores/emae-por-actividad" className="hover:text-indec-blue">EMAE por Actividad</Link></li>
                <li><Link href="/analisis/tendencias" className="hover:text-indec-blue">Tendencias</Link></li>
                <li><Link href="/analisis/comparativas" className="hover:text-indec-blue">Comparativas</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-indec-blue-dark mb-4">API</h3>
              <ul className="space-y-2 text-sm text-indec-gray-dark">
                <li><Link href="/api-docs" className="hover:text-indec-blue">Documentación</Link></li>
                <li><Link href="/api-docs/emae" className="hover:text-indec-blue">API EMAE</Link></li>
                <li><Link href="/api-docs/ipc" className="hover:text-indec-blue">API IPC</Link></li>
                <li><Link href="/api-docs/autenticacion" className="hover:text-indec-blue">Autenticación</Link></li>
                <li><Link href="/api-docs/ejemplos" className="hover:text-indec-blue">Ejemplos de uso</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-indec-blue-dark mb-4">Sobre nosotros</h3>
              <ul className="space-y-2 text-sm text-indec-gray-dark">
                <li><Link href="/acerca-de" className="hover:text-indec-blue">Proyecto</Link></li>
                <li><Link href="/fuentes" className="hover:text-indec-blue">Fuentes de datos</Link></li>
                <li><Link href="/terminos" className="hover:text-indec-blue">Términos de uso</Link></li>
                <li><Link href="/privacidad" className="hover:text-indec-blue">Política de privacidad</Link></li>
                <li><Link href="/contacto" className="hover:text-indec-blue">Contacto</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-indec-gray-medium pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-indec-gray-dark font-light mb-4 md:mb-0">
                © {new Date().getFullYear()} EconoVista. Datos provenientes del Instituto Nacional de Estadística y Censos.
              </p>
              <div className="flex gap-6">
                <Link href="/terminos" className="text-xs text-indec-gray-dark hover:text-indec-blue">
                  Términos
                </Link>
                <Link href="/privacidad" className="text-xs text-indec-gray-dark hover:text-indec-blue">
                  Privacidad
                </Link>
                <Link href="/cookies" className="text-xs text-indec-gray-dark hover:text-indec-blue">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}