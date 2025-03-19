'use client';

import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import EMAEEnhancedChart from '@/components/EMAEEnhancedChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";
import DataMetric from "@/components/DataMetric";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from 'next/link';

export default function EMAEPage() {
  const [emaeData, setEmaeData] = useState<any>(null);
  const [sectorData, setSectorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorSectors, setErrorSectors] = useState<string | null>(null);

  // Obtener datos actuales del EMAE
  useEffect(() => {
    const fetchLatestEMAE = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/emae/latest');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setEmaeData(result);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos del EMAE:', err);
        setError('Error al cargar datos del EMAE');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestEMAE();
  }, []);

  // Obtener datos de sectores
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoadingSectors(true);
        
        // Obtener la última fecha disponible
        const metadataResponse = await fetch('/api/emae/metadata');
        if (!metadataResponse.ok) {
          throw new Error(`Error al obtener metadata: ${metadataResponse.status}`);
        }
        
        const metadata = await metadataResponse.json();
        const lastDate = metadata.date_range?.last_date;
        
        if (lastDate) {
          // Extraer mes y año del último dato disponible
          const dateObj = new Date(lastDate);
          const month = dateObj.getMonth() + 1; // getMonth() devuelve 0-11
          const year = dateObj.getFullYear();
          
          // Obtener datos de sectores para esa fecha
          const response = await fetch(`/api/emae/sectors?month=${month}&year=${year}&include_variations=true`);
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.data && Array.isArray(result.data)) {
            // Ordenar sectores por variación interanual (descendente)
            const sortedData = [...result.data].sort((a, b) => 
              b.year_over_year_change - a.year_over_year_change
            );
            
            setSectorData(sortedData);
            setErrorSectors(null);
          } else {
            throw new Error('Formato de respuesta inesperado');
          }
        } else {
          throw new Error('No se pudo determinar el último mes disponible');
        }
      } catch (err) {
        console.error('Error al cargar datos de sectores:', err);
        setErrorSectors('Error al cargar datos de sectores');
      } finally {
        setLoadingSectors(false);
      }
    };

    fetchSectors();
  }, []);

  // Formatear fecha
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      
      // Nombres de meses en español
      const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${month} ${year}`;
    } catch (e) {
      console.error("Error formateando fecha:", e);
      return dateString;
    }
  };

  return (
    <div className="relative min-h-screen">
      <HeroSection 
        title="Estimador Mensual de Actividad Económica" 
        subtitle="Seguimiento de la evolución de la actividad económica a nivel nacional"
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        {/* Sección: Valores actuales */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Valores actuales</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <p className="text-indec-gray-dark mb-6">
                <span className="font-medium">Último dato disponible:</span> {formatDate(emaeData?.date)}
              </p>
            
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                      Valor del índice
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Valor del índice de actividad económica (2004=100).</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      <DataMetric 
                        label="" 
                        value={emaeData?.original_value?.toLocaleString('es-AR', { maximumFractionDigits: 1 }) || "N/A"} 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                      Var. mensual
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Variación respecto al mes anterior (serie desestacionalizada).</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      <DataMetric 
                        label="" 
                        value={`${emaeData?.monthly_pct_change?.toFixed(1) || "N/A"}%`} 
                        trend={emaeData?.monthly_pct_change >= 0 ? "up" : "down"} 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                      Var. interanual
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Variación respecto al mismo mes del año anterior.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      <DataMetric 
                        label="" 
                        value={`${emaeData?.yearly_pct_change?.toFixed(1) || "N/A"}%`} 
                        trend={emaeData?.yearly_pct_change >= 0 ? "up" : "down"} 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                      Serie desestacionalizada
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Valor de la serie sin efectos estacionales.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      <DataMetric 
                        label="" 
                        value={emaeData?.seasonally_adjusted_value?.toLocaleString('es-AR', { maximumFractionDigits: 1 }) || "N/A"} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
        
        {/* Sección: Gráfico interactivo */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Análisis histórico</h2>
          <EMAEEnhancedChart 
            title="Evolución del EMAE"
            description="Selecciona el sector, tipo de visualización y rango de tiempo"
            height={450}
          />
        </div>
        
        {/* Sección: Tabla de sectores */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Sectores económicos</h2>
          
          {loadingSectors ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : errorSectors ? (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p>{errorSectors}</p>
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Desempeño por sector</CardTitle>
                <CardDescription>
                  Variación interanual por sector económico - Datos a {formatDate(sectorData?.[0]?.date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Sector</th>
                        <th className="px-4 py-3 text-right">Índice</th>
                        <th className="px-4 py-3 text-right">Var. interanual</th>
                        <th className="px-4 py-3">Tendencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectorData.slice(0, 8).map((sector, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-medium">
                            {sector.economy_sector || sector.sector}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {sector.original_value?.toFixed(1) || 'N/A'}
                          </td>
                          <td className={`px-4 py-3 text-right font-mono ${
                            sector.year_over_year_change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {sector.year_over_year_change >= 0 ? '+' : ''}
                            {sector.year_over_year_change?.toFixed(1) || 'N/A'}%
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  sector.year_over_year_change >= 0 ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{
                                  width: `${Math.min(Math.abs(sector.year_over_year_change || 0) * 1.5, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-xs text-right text-gray-500">
                  Nota: Los sectores se ordenan por variación interanual (descendente).
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sección: Información adicional */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Acerca del EMAE</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-indec-blue-dark mb-3">¿Qué es el EMAE?</h3>
              <p className="text-indec-gray-dark text-sm mb-4">
                El Estimador Mensual de Actividad Económica (EMAE) refleja la evolución mensual de la actividad económica de los sectores productivos a nivel nacional, lo que permite anticipar las tendencias del Producto Interno Bruto (PIB).
              </p>
              <p className="text-indec-gray-dark text-sm mb-4">
                Es un indicador clave para el seguimiento de la coyuntura económica y el análisis del ciclo económico a corto plazo.
              </p>
              <h3 className="text-lg font-semibold text-indec-blue-dark mb-3 mt-6">Metodología</h3>
              <p className="text-indec-gray-dark text-sm">
                El EMAE se construye a partir de indicadores representativos de diferentes sectores de la economía, combinados según su peso relativo en el PIB. Se utilizan tanto métodos directos (medición de producción física) como indirectos (empleo, salarios, ventas) según el sector.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-indec-blue-dark mb-3">Sectores económicos</h3>
              <p className="text-indec-gray-dark text-sm mb-4">
                El EMAE incluye los siguientes sectores económicos:
              </p>
              <ul className="list-disc list-inside text-indec-gray-dark text-sm space-y-1 ml-2">
                <li>Agricultura, ganadería, caza y silvicultura</li>
                <li>Pesca</li>
                <li>Explotación de minas y canteras</li>
                <li>Industria manufacturera</li>
                <li>Electricidad, gas y agua</li>
                <li>Construcción</li>
                <li>Comercio mayorista, minorista y reparaciones</li>
                <li>Hoteles y restaurantes</li>
                <li>Transporte y comunicaciones</li>
                <li>Intermediación financiera</li>
                <li>Actividades inmobiliarias, empresariales y de alquiler</li>
                <li>Administración pública y defensa</li>
                <li>Enseñanza</li>
                <li>Servicios sociales y de salud</li>
                <li>Otras actividades de servicios</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-indec-gray-dark text-center mt-8">
          <p>Fuente: Instituto Nacional de Estadística y Censos (INDEC)</p>
          <p className="mt-1">Los datos se actualizan mensualmente con la publicación oficial</p>
        </div>
      </div>
    </div>
  );
}