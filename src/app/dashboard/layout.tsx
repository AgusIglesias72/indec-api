// src/app/dashboard/layout.tsx
import React from 'react';
import Link from 'next/link';
import { ChevronRight, BarChart, PieChart, Activity, TrendingUp } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb y navegación superior */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link 
                    href="/" 
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indec-blue"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link
                      href="/dashboard"
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-indec-blue md:ml-2"
                    >
                      Dashboard
                    </Link>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="ml-1 text-sm font-medium text-indec-blue md:ml-2">
                      EMAE
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center space-x-4">
              {/* Opciones adicionales del encabezado, como filtros globales o botones de acción */}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de pestañas para diferentes dashboards */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-4 overflow-x-auto">
            <Link 
              href="/dashboard/emae" 
              className="flex items-center py-4 px-2 text-sm font-medium border-b-2 border-indec-blue text-indec-blue"
            >
              <BarChart className="w-4 h-4 mr-1" />
              EMAE
            </Link>
            <Link
              href="/dashboard/ipc"
              className="flex items-center py-4 px-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-indec-blue hover:border-indec-blue/50"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              IPC
            </Link>
            <Link
              href="/dashboard/actividad"
              className="flex items-center py-4 px-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-indec-blue hover:border-indec-blue/50"
            >
              <PieChart className="w-4 h-4 mr-1" />
              Sectores Económicos
            </Link>
            <Link
              href="/dashboard/comparativa"
              className="flex items-center py-4 px-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-indec-blue hover:border-indec-blue/50"
            >
              <Activity className="w-4 h-4 mr-1" />
              Comparativa
            </Link>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <main>
        {children}
      </main>

      {/* Pie de página del dashboard */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} EconoVista | Datos proporcionados por el Instituto Nacional de Estadística y Censos (INDEC)
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/api-docs" className="text-sm text-indec-blue hover:underline">
                Documentación de API
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}