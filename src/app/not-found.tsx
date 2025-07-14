'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, ArrowLeft, Search, TrendingUp, BarChart3, DollarSign, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';

// Sugerencias de páginas populares
const popularPages = [
  {
    title: "EMAE",
    href: "/indicadores/emae",
    description: "Estimador Mensual de Actividad Económica",
    icon: BarChart3,
    color: "blue"
  },
  {
    title: "Cotizaciones de Dólar",
    href: "/dolar",
    description: "Seguimiento en tiempo real de tipos de cambio",
    icon: DollarSign,
    color: "green"
  },
  {
    title: "IPC",
    href: "/indicadores/ipc",
    description: "Índice de Precios al Consumidor",
    icon: TrendingUp,
    color: "purple"
  },
  {
    title: "Calendario INDEC",
    href: "/calendario",
    description: "Próximas publicaciones estadísticas",
    icon: Calendar,
    color: "blue"
  }
];

// Función para obtener el color según la categoría
const getColorClasses = (color: string) => {
  const colors = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-100',
      gradient: 'from-blue-600/20 to-blue-400/20'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-100',
      gradient: 'from-purple-600/20 to-purple-400/20'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-100',
      gradient: 'from-green-600/20 to-green-400/20'
    }
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

// Componente Hero Section
function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-red-50 to-orange-100 py-20 mb-8">
      {/* Círculos decorativos */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-red-500/10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-orange-500/5 translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-16 w-16 bg-red-500 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Página no encontrada
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida. 
            Te ayudamos a encontrar lo que necesitas.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-indec-blue text-white hover:bg-indec-blue-dark">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Ir al Inicio
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-gray-400 text-gray-700 hover:bg-gray-50">
              <Link href="javascript:history.back()" className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Volver Atrás
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Componente para los headers de sección
function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-8 w-8 bg-indec-blue/10 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-indec-blue" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}


// Componente principal
export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen">
      <HeroSection />

      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.85] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">

        {/* Páginas populares */}
        <div className="mb-16">
          <SectionHeader title="Páginas más visitadas" icon={TrendingUp} />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularPages.map((page, index) => {
              const colorClasses = getColorClasses(page.color);
              const IconComponent = page.icon;
              
              return (
                <motion.div
                  key={page.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="group relative"
                >
                  <div className={`absolute -inset-1 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500`}></div>
                  
                  <Link href={page.href}>
                    <Card className={`relative bg-white ${colorClasses.border} h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`h-10 w-10 ${colorClasses.bg} rounded-xl flex items-center justify-center`}>
                            <IconComponent className={`h-5 w-5 ${colorClasses.text}`} />
                          </div>
                          <h3 className="font-bold text-gray-900">{page.title}</h3>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">
                          {page.description}
                        </p>

                        <div className="mt-4 flex items-center text-sm font-medium text-indec-blue group-hover:text-indec-blue-dark transition-colors">
                          Ver página
                          <ArrowLeft className="ml-2 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer de ayuda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="group relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indec-blue/20 to-indec-blue/10 rounded-2xl blur opacity-50"></div>
          <Card className="relative bg-white border-indec-blue/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Aún no encontrás lo que buscas?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Nuestro equipo está aquí para ayudarte. Contáctanos si necesitas asistencia 
                para encontrar datos específicos o tienes alguna consulta.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" className="bg-indec-blue text-white hover:bg-indec-blue-dark">
                  <Link href="/contacto">
                    Contactar Soporte
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="border-indec-blue text-indec-blue hover:bg-indec-blue/5">
                  <Link href="/documentacion">
                    Ver Documentación API
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}