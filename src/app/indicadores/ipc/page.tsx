'use client';

import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import IPCEnhancedChart from '@/components/IPCEnhancedChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import DataMetric from "@/components/DataMetric";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from 'next/link';

export default function IPCPage() {
  const [ipcData, setIpcData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener datos actuales del IPC
  useEffect(() => {
    const fetchLatestIPC = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ipc/latest');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.data) {
          setIpcData(result.data);
          setError(null);
        } else {
          setError('No se pudo obtener información actualizada del IPC');
        }
      } catch (err) {
        console.error('Error al cargar datos del IPC:', err);
        setError('Error al cargar datos del IPC');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestIPC();
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
        title="Índice de Precios al Consumidor" 
        subtitle="Seguimiento de la evolución de precios por regiones y rubros"
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
                <span className="font-medium">Último dato disponible:</span> {formatDate(ipcData?.date)}
              </p>
            
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                      Variación mensual
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Variación porcentual respecto al mes anterior.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      <DataMetric 
                        label="" 
                        value={`${ipcData?.monthly_pct_change?.toFixed(1) || "N/A"}%`} 
                        trend={ipcData?.monthly_change_variation < 0 ? "down" : "up"} 
                        trendValue={ipcData?.monthly_change_variation ? `${ipcData.monthly_change_variation > 0 ? '+' : ''}${ipcData.monthly_change_variation.toFixed(1)} pp` : undefined}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                      Variación interanual
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
                        value={`${ipcData?.yearly_pct_change?.toFixed(1) || "N/A"}%`} 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-indec-gray-medium/30 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-indec-gray-dark flex items-center gap-1">
                      Variación acumulada
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Variación acumulada en el año.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      <DataMetric 
                        label="" 
                        value={`${ipcData?.accumulated_pct_change?.toFixed(1) || "N/A"}%`} 
                      />
                    </div>
                  </CardContent>
                </Card>
                
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
                            <p>Valor actual del índice base 2016=100.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      <DataMetric 
                        label="" 
                        value={ipcData?.index_value?.toLocaleString('es-AR', { maximumFractionDigits: 1 }) || "N/A"} 
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
          <IPCEnhancedChart 
            title="Evolución del IPC"
            description="Selecciona el rango de tiempo, región y rubro para visualizar"
            height={450}
          />
        </div>
        
        {/* Sección: Tabla de rubros destacados */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Rubros destacados</h2>
          
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p>{error}</p>
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Variación por rubros</CardTitle>
                <CardDescription>
                  Principales rubros del IPC - Datos a {formatDate(ipcData?.date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Rubro</th>
                        <th className="px-4 py-3 text-right">Var. mensual</th>
                        <th className="px-4 py-3 text-right">Var. interanual</th>
                        <th className="px-4 py-3 text-right">Incidencia mensual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Datos estáticos, en una implementación real se generarían desde API */}
                      <tr className="bg-white border-b">
                        <td className="px-4 py-3 font-medium">Alimentos y bebidas</td>
                        <td className="px-4 py-3 text-right">3.8%</td>
                        <td className="px-4 py-3 text-right">87.1%</td>
                        <td className="px-4 py-3 text-right">1.22</td>
                      </tr>
                      <tr className="bg-gray-50 border-b">
                        <td className="px-4 py-3 font-medium">Vivienda y servicios</td>
                        <td className="px-4 py-3 text-right">5.3%</td>
                        <td className="px-4 py-3 text-right">97.4%</td>
                        <td className="px-4 py-3 text-right">0.75</td>
                      </tr>
                      <tr className="bg-white border-b">
                        <td className="px-4 py-3 font-medium">Prendas de vestir</td>
                        <td className="px-4 py-3 text-right">2.9%</td>
                        <td className="px-4 py-3 text-right">113.2%</td>
                        <td className="px-4 py-3 text-right">0.21</td>
                      </tr>
                      <tr className="bg-gray-50 border-b">
                        <td className="px-4 py-3 font-medium">Educación</td>
                        <td className="px-4 py-3 text-right">1.6%</td>
                        <td className="px-4 py-3 text-right">69.7%</td>
                        <td className="px-4 py-3 text-right">0.10</td>
                      </tr>
                      <tr className="bg-white border-b">
                        <td className="px-4 py-3 font-medium">Transporte</td>
                        <td className="px-4 py-3 text-right">4.1%</td>
                        <td className="px-4 py-3 text-right">83.5%</td>
                        <td className="px-4 py-3 text-right">0.41</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-xs text-right text-gray-500">
                  Nota: La incidencia mide la contribución de cada rubro a la variación del nivel general.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sección: Información adicional */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Acerca del IPC</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-indec-blue-dark mb-3">¿Qué es el IPC?</h3>
              <p className="text-indec-gray-dark text-sm mb-4">
                El Índice de Precios al Consumidor (IPC) mide la evolución de los precios de bienes y servicios representativos del gasto de consumo de los hogares residentes en el área específica.
              </p>
              <p className="text-indec-gray-dark text-sm mb-4">
                Es un indicador clave para la evaluación de la inflación, la política monetaria y la evolución del poder adquisitivo.
              </p>
              <h3 className="text-lg font-semibold text-indec-blue-dark mb-3 mt-6">Metodología</h3>
              <p className="text-indec-gray-dark text-sm">
                El IPC se calcula a partir del relevamiento mensual de precios de una canasta de bienes y servicios. La estructura de ponderaciones se basa en la Encuesta Nacional de Gastos de los Hogares 2017/2018, actualizada periódicamente.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-indec-blue-dark mb-3">Cobertura geográfica</h3>
              <p className="text-indec-gray-dark text-sm mb-4">
                El IPC-N (Nacional) refleja el promedio ponderado de los índices de precios de las seis regiones:
              </p>
              <ul className="list-disc list-inside text-indec-gray-dark text-sm space-y-1 mb-6 ml-2">
                <li>Gran Buenos Aires (GBA)</li>
                <li>Región Pampeana</li>
                <li>Región Noreste (NEA)</li>
                <li>Región Noroeste (NOA)</li>
                <li>Región Cuyo</li>
                <li>Región Patagonia</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-indec-blue-dark mb-3 mt-6">Principales rubros</h3>
              <ul className="list-disc list-inside text-indec-gray-dark text-sm space-y-1 ml-2">
                <li>Alimentos y bebidas no alcohólicas</li>
                <li>Bebidas alcohólicas y tabaco</li>
                <li>Prendas de vestir y calzado</li>
                <li>Vivienda, agua, electricidad y otros combustibles</li>
                <li>Equipamiento y mantenimiento del hogar</li>
                <li>Salud</li>
                <li>Transporte</li>
                <li>Comunicación</li>
                <li>Recreación y cultura</li>
                <li>Educación</li>
                <li>Restaurantes y hoteles</li>
                <li>Bienes y servicios varios</li>
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