"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import DataMetric from "@/components/DataMetric"
import { useLatestEmaeData, useLatestIPCData, useSectorPerformance } from "@/hooks/useApiData"

export default function Indicators() {
  const { data: emaeData, loading: emaeLoading, error: emaeError } = useLatestEmaeData();
  const { data: ipcData, loading: ipcLoading, error: ipcError } = useLatestIPCData();
  const { data: sectorData, loading: sectorLoading, error: sectorError } = useSectorPerformance();


  // Función para formatear fecha
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString + 'T00:00:00-04:00')
    
    // Nombres de meses en español
    const monthNames = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${month} ${year}`;
  }

  return (
    <section className="py-20 bg-white relative z-10">
      {/* Fondo sólido para bloquear los puntitos del fondo */}
      <div className="absolute inset-0 bg-white"></div>
      
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-indec-blue-dark mb-4">
            Indicadores económicos destacados
          </h2>
          <p className="text-indec-gray-dark text-lg">
            Monitorea los principales indicadores económicos de Argentina con datos oficiales
          </p>
        </div>
        
        <div className="mb-12">
          <Tabs defaultValue="emae" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-indec-gray-light">
                <TabsTrigger value="emae" className="data-[state=active]:bg-white">
                  EMAE
                </TabsTrigger>
                <TabsTrigger value="ipc" className="data-[state=active]:bg-white">
                  IPC
                </TabsTrigger>
                <TabsTrigger value="actividad" className="data-[state=active]:bg-white">
                  Actividad sectorial
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="emae">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold text-indec-blue-dark mb-4">
                    Estimador Mensual de Actividad Económica
                  </h3>
                  
                  {emaeLoading ? (
                    <Skeleton className="h-5 w-48 mb-6" />
                  ) : (
                    <p className="text-indec-gray-dark mb-6">
                      <span className="font-medium">Último dato disponible:</span> {formatDate(emaeData?.date)}
                    </p>
                  )}
                  
                  <p className="text-indec-gray-dark mb-6">
                    El EMAE refleja la evolución mensual de la actividad económica de los sectores productivos a nivel nacional, permitiendo anticipar las tasas de variación del PIB.
                  </p>
                  
                  <div className="flex flex-col md:flex-row md:flex-wrap items-start gap-6 mb-6">
                    {emaeLoading ? (
                      <>
                        <Skeleton className="h-16 w-40 mb-1" />
                        <Skeleton className="h-16 w-40 mb-1" />
                        <Skeleton className="h-16 w-40 mb-1" />
                      </>
                    ) : (
                      <>
                        <DataMetric 
                          label="Último valor" 
                          value={emaeError ? "N/A" : emaeData?.original_value.toFixed(1) || "N/A"} 
                        />
                        <DataMetric 
                          label="Var. intermensual (desest.)" 
                          value={`${emaeError ? "N/A" : (emaeData?.monthly_change.toFixed(1) || "N/A")}%`} 
                          trend={emaeData && emaeData.monthly_change > 0 ? "up" : "down"} 
                        />
                        <DataMetric 
                          label="Var. interanual" 
                          value={`${emaeError ? "N/A" : (emaeData?.year_over_year_change.toFixed(1) || "N/A")}%`} 
                          trend={emaeData && emaeData.year_over_year_change > 0 ? "up" : "down"} 
                        />
                      </>
                    )}
                  </div>
                  <Button asChild className="gap-2">
                    <Link href="/indicadores/emae">
                      Ver análisis completo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="lg:col-span-3 bg-indec-gray-light rounded-lg p-4 h-80 flex items-center justify-center">
                  {/* Aquí podría ir un gráfico simple con datos estáticos */}
                  <div className="w-full h-full bg-indec-gray-medium/30 rounded-lg flex items-center justify-center">
                    <p className="text-indec-gray-dark">Gráfico EMAE</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ipc">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold text-indec-blue-dark mb-4">
                    Índice de Precios al Consumidor
                  </h3>
                  
                  {ipcLoading ? (
                    <Skeleton className="h-5 w-48 mb-6" />
                  ) : (
                    <p className="text-indec-gray-dark mb-6">
                      <span className="font-medium">Último dato disponible:</span> {formatDate(ipcData?.date)}
                    </p>
                  )}
                  
                  <p className="text-indec-gray-dark mb-6">
                    El IPC mide la evolución de los precios de bienes y servicios representativos del gasto de consumo de los hogares residentes en la región especificada.
                  </p>
                  
                  <div className="flex flex-col md:flex-row md:flex-wrap items-start gap-6 mb-6">
                    {ipcLoading ? (
                      <>
                        <Skeleton className="h-16 w-40 mb-1" />
                        <Skeleton className="h-16 w-40 mb-1" />
                        <Skeleton className="h-16 w-40 mb-1" />
                      </>
                    ) : (
                      <>
                        <DataMetric 
                          label="Mensual" 
                          value={`${ipcError ? "N/A" : (ipcData?.monthly_change.toFixed(1) || "N/A")}%`}
                          trend="up" 
                        />
                        <DataMetric 
                          label="Interanual" 
                          value={`${ipcError ? "N/A" : (ipcData?.year_over_year_change.toFixed(1) || "N/A")}%`}
                          trend="up" 
                        />
                        <DataMetric 
                          label={`Acum. ${ipcData?.date.split('-')[0]}`} 
                          value={`${ipcError ? "N/A" : (ipcData?.accumulated_change.toFixed(1) || "N/A")}%`}
                          trend="up" 
                        />
                      </>
                    )}
                  </div>
                  <Button asChild className="gap-2">
                    <Link href="/indicadores/ipc">
                      Ver análisis completo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="lg:col-span-3 bg-indec-gray-light rounded-lg p-4 h-80 flex items-center justify-center">
                  {/* Aquí podría ir un gráfico simple con datos estáticos */}
                  <div className="w-full h-full bg-indec-gray-medium/30 rounded-lg flex items-center justify-center">
                    <p className="text-indec-gray-dark">Gráfico IPC</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="actividad">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold text-indec-blue-dark mb-4">
                    Actividad Económica por Sectores
                  </h3>
                  
                  {sectorLoading || !sectorData ? (
                    <Skeleton className="h-5 w-48 mb-6" />
                  ) : (
                    emaeData && (
                      <p className="text-indec-gray-dark mb-6">
                        <span className="font-medium">Último dato disponible:</span> {formatDate(emaeData.date)}
                      </p>
                    )
                  )}
                  
                  <p className="text-indec-gray-dark mb-6">
                    Análisis detallado del desempeño de distintos sectores económicos, permitiendo identificar fortalezas y debilidades en la economía argentina.
                  </p>
                  
                  <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-2">
                    {sectorLoading ? (
                      <>
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </>
                    ) : (
                      sectorError ? (
                        <p className="text-indec-red">Error al cargar datos sectoriales</p>
                      ) : (
                        sectorData?.map((sector, index) => (
                          <div key={index} className="flex justify-between items-center p-3 hover:bg-indec-gray-light rounded-md transition-colors border border-indec-gray-medium/30">
                            <span className="text-indec-gray-dark font-medium text-sm">{sector.sector_name}</span>
                            <div className={`font-mono font-medium ${sector.year_over_year_change > 0 ? 'text-indec-green' : 'text-indec-red'}`}>
                              {`${sector.year_over_year_change > 0 ? '+' : ''}${sector.year_over_year_change.toFixed(1)}%`}
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                  <Button asChild className="gap-2">
                    <Link href="/indicadores/emae-por-actividad">
                      Ver análisis completo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="lg:col-span-3 bg-indec-gray-light rounded-lg p-4 h-80 flex items-center justify-center">
                  {/* Aquí podría ir un gráfico simple con datos estáticos */}
                  <div className="w-full h-full bg-indec-gray-medium/30 rounded-lg flex items-center justify-center">
                    <p className="text-indec-gray-dark">Gráfico EMAE</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}