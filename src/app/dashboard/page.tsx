'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, BarChart2, LineChart, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAppData } from '@/lib/DataProvider';
import Counter from '@/components/ui/counter';

export default function DashboardPage() {
  const { 
    emaeData, 
    ipcData, 
    loadingEmae, 
    loadingIPC 
  } = useAppData();

  // Función para formatear fechas
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No disponible";
    
    const date = new Date(dateString);
    const monthNames = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-indec-blue-dark mb-2">Panel de Indicadores Económicos</h1>
      <p className="text-gray-600 mb-8">Monitoreo de los principales indicadores económicos de Argentina con datos oficiales</p>
      
      {/* Tarjetas de indicadores principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* EMAE */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 text-indec-blue mr-2" />
              EMAE
            </CardTitle>
            <CardDescription>Estimador Mensual de Actividad Económica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Último dato</p>
                <p className="text-2xl font-bold text-indec-blue-dark">{formatDate(emaeData?.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Var. interanual</p>
                <div className={`flex items-center text-2xl font-bold ${
                  emaeData && emaeData.yearly_pct_change >= 0 
                    ? 'text-indec-green' 
                    : 'text-indec-red'
                }`}>
                  {loadingEmae ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : emaeData ? (
                    <>
                      {emaeData.yearly_pct_change >= 0 ? (
                        <ArrowUpRight className="h-6 w-6 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-6 w-6 mr-1" />
                      )}
                      <Counter end={Math.abs(emaeData.yearly_pct_change)} decimals={1} suffix="%" 
                              prefix={emaeData.yearly_pct_change >= 0 ? "+" : "-"} />
                    </>
                  ) : "-"}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link 
              href="/dashboard/emae" 
              className="text-indec-blue hover:text-indec-blue-dark text-sm font-medium flex items-center"
            >
              Ver dashboard completo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>
        
        {/* IPC */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 text-indec-blue mr-2" />
              IPC
            </CardTitle>
            <CardDescription>Índice de Precios al Consumidor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Último dato</p>
                <p className="text-2xl font-bold text-indec-blue-dark">{formatDate(ipcData?.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Var. mensual</p>
                <div className="flex items-center text-2xl font-bold text-indec-red">
                  {loadingIPC ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : ipcData ? (
                    <>
                      <Counter end={ipcData.monthly_change} decimals={1} suffix="%" />
                    </>
                  ) : "-"}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link 
              href="/dashboard/ipc" 
              className="text-indec-blue hover:text-indec-blue-dark text-sm font-medium flex items-center"
            >
              Ver dashboard completo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>
        
        {/* Sectores Económicos */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 text-indec-blue mr-2" />
              Sectores Económicos
            </CardTitle>
            <CardDescription>Actividad por sectores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Últimos datos por sector</p>
              <p className="text-xl font-bold text-indec-blue-dark">{formatDate(emaeData?.date)}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Agricultura
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Construcción
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Comercio
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link 
              href="/dashboard/actividad" 
              className="text-indec-blue hover:text-indec-blue-dark text-sm font-medium flex items-center"
            >
              Ver dashboard completo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Sección de características */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-indec-blue-dark mb-4">Características del Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indec-blue-light/10 text-indec-blue">
                <BarChart2 className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Visualización Interactiva</h3>
              <p className="mt-1 text-sm text-gray-500">
                Gráficos interactivos que permiten explorar los datos en detalle con diferentes perspectivas temporales.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indec-blue-light/10 text-indec-blue">
                <LineChart className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Series Temporales</h3>
              <p className="mt-1 text-sm text-gray-500">
                Análisis de tendencias con datos históricos completos, desestacionalizados y ajustados.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indec-blue-light/10 text-indec-blue">
                <PieChart className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Desglose Sectorial</h3>
              <p className="mt-1 text-sm text-gray-500">
                Análisis por sector económico para identificar fortalezas y debilidades en la economía.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sección de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="text-4xl font-bold text-indec-blue mb-2">10+</h3>
          <p className="text-gray-500">Indicadores económicos</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="text-4xl font-bold text-indec-blue mb-2">20 años</h3>
          <p className="text-gray-500">Series históricas</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="text-4xl font-bold text-indec-blue mb-2">16</h3>
          <p className="text-gray-500">Sectores económicos</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="text-4xl font-bold text-indec-blue mb-2">Mensual</h3>
          <p className="text-gray-500">Frecuencia de actualización</p>
        </div>
      </div>
    </div>
  );
}