"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import DataMetric from "@/components/DataMetric"
import { 
  useHistoricalEmaeData,
  useHistoricalIPCData 
} from "@/hooks/useApiData"
import EmaeChart from "@/components/charts/Emaechart"
import IPCChart from "@/components/charts/IPCChart"
import SectorActivityList  from "@/components/charts/SectorActivityList"

import { useAppData } from '@/lib/DataProvider';


export default function Indicators() {
    const { 
        emaeData, 
        ipcData, 
        loadingEmae: emaeLoading, 
        loadingIPC: ipcLoading,
        errorEmae: emaeError,
        errorIPC: ipcError
      } = useAppData();
    
  
  // Datos históricos para los gráficos
  const { 
    data: emaeHistorical, 
    loading: emaeHistoricalLoading, 
    error: emaeHistoricalError 
  } = useHistoricalEmaeData();
  
  const { 
    data: ipcHistorical, 
    loading: ipcHistoricalLoading, 
    error: ipcHistoricalError 
  } = useHistoricalIPCData();

  // Función para formatear fecha
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString + 'T00:00:00-04:00')
      
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
  }

  return (
    <section className="py-20 bg-transparent relative z-10">
      {/* Fondo sólido para bloquear los puntitos del fondo */}
      <div className="absolute inset-0 bg-transparent"></div>
      
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
                  <h3 className="text-2xl font-bold text-indec-blue-dark mb-4 text-center lg:text-left">
                    Estimador Mensual de Actividad Económica
                  </h3>
                  
                  {emaeLoading ? (
                    <Skeleton className="h-5 w-48 mb-6" />
                  ) : (
                    <p className="text-indec-gray-dark mb-6 text-center lg:text-left">
                      <span className="font-medium">Último dato disponible:</span> {formatDate(emaeData?.date)}
                    </p>
                  )}
                  
                  <p className="text-indec-gray-dark mb-6 text-center lg:text-left">
                    El EMAE refleja la evolución mensual de la actividad económica de los sectores productivos a nivel nacional, permitiendo anticipar las tasas de variación del PIB.
                  </p>
                  
                  <div className="flex flex-row flex-wrap-reverse items-start gap-6 mb-6 justify-evenly lg:justify-start">
                    {emaeLoading ? (
                      <>
                        <Skeleton className="h-16 w-40 mb-1" />
                        <Skeleton className="h-16 w-40 mb-1" />
                        <Skeleton className="h-16 w-40 mb-1" />
                      </>
                    ) : (
                      <>
                        <DataMetric 
                          label="Últ. valor" 
                          value={emaeError ? "N/A" : emaeData?.original_value.toFixed(1) || "N/A"} 
                        />
                        <DataMetric 
                          label="Var. m/m (desest.)" 
                          value={`${emaeError ? "N/A" : (emaeData?.monthly_change.toFixed(1) || "N/A")}%`} 
                          trend={emaeData && emaeData.monthly_change > 0 ? "up" : "down"} 
                        />
                        <DataMetric 
                          label="Var. i/a" 
                          value={`${emaeError ? "N/A" : (emaeData?.year_over_year_change.toFixed(1) || "N/A")}%`} 
                          trend={emaeData && emaeData.year_over_year_change > 0 ? "up" : "down"} 
                        />
                      </>
                    )}
                  </div>
                  <Button asChild className="gap-2 w-full lg:w-auto ">
                    <Link href="/indicadores/emae">
                      Ver análisis completo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="lg:col-span-3 bg-indec-gray-light/50 rounded-lg p-4 h-80">
                  {/* Gráfico del EMAE */}
                  <EmaeChart 
                    data={emaeHistorical} 
                    loading={emaeHistoricalLoading} 
                    error={emaeHistoricalError} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ipc">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold text-indec-blue-dark mb-4 text-center lg:text-left">
                    Índice de Precios al Consumidor
                  </h3>
                  
                  {ipcLoading ? (
                    <Skeleton className="h-5 w-48 mb-6" />
                  ) : (
                    <p className="text-indec-gray-dark mb-6 text-center lg:text-left">
                      <span className="font-medium">Último dato disponible:</span> {formatDate(ipcData?.date)}
                    </p>
                  )}
                  
                  <p className="text-indec-gray-dark mb-6 text-center lg:text-left">
                    El IPC mide la evolución de los precios de bienes y servicios representativos del gasto de consumo de los hogares residentes en la región especificada.
                  </p>
                  
                  <div className="flex flex-row flex-wrap-reverse items-start gap-6 mb-6 justify-evenly lg:justify-start">
                    {ipcLoading ? (
                      <>
                        <Skeleton className="h-16 w-40 mb-1" />
                        <Skeleton className="h-16 w-40 mb-1" />
                        <Skeleton className="h-16 w-40 mb-1" />
                      </>
                    ) : (
                      <>
                        <DataMetric 
                          label="Var. m/m" 
                          value={`${ipcError ? "N/A" : (ipcData?.monthly_change.toFixed(1) || "N/A")}%`}
                          trend="up" 
                        />
                        <DataMetric 
                          label="Var. i/a" 
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
                  <Button asChild className="gap-2 w-full lg:w-auto ">
                    <Link href="/indicadores/ipc">
                      Ver análisis completo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="lg:col-span-3 bg-indec-gray-light/50 rounded-lg p-4 h-80">
                  {/* Gráfico del IPC */}
                  <IPCChart 
                    data={ipcHistorical} 
                    loading={ipcHistoricalLoading} 
                    error={ipcHistoricalError} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="actividad">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold text-indec-blue-dark mb-4 text-center lg:text-left">
                    Actividad Económica por Sectores
                  </h3>
                  
                  {emaeLoading ? (
                    <Skeleton className="h-5 w-48 mb-6" />
                  ) : (
                    <p className="text-indec-gray-dark mb-6 text-center lg:text-left">
                      <span className="font-medium">Último dato disponible:</span> {formatDate(emaeData?.date)}
                    </p>
                  )}
                  
                  <p className="text-indec-gray-dark mb-6 text-center lg:text-left">
                    Análisis detallado del desempeño de los distintos sectores económicos, permitiendo identificar 
                    fortalezas y debilidades en la economía argentina. Las variaciones interanuales muestran el 
                    crecimiento o contracción respecto al mismo mes del año anterior.
                  </p>
                  
                  <Button asChild className="gap-2 w-full lg:w-auto ">
                    <Link href="/indicadores/emae-por-actividad">
                      Ver análisis completo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="lg:col-span-3">
                  <SectorActivityList />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}