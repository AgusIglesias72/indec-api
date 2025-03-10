"use client"

import Link from "next/link"
import { ArrowRight, Info, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import DataMetric from "@/components/DataMetric"
import { 
  useHistoricalEmaeData,
  useHistoricalIPCData 
} from "@/hooks/useApiData"
import EmaeMonthlyBarChart from "@/components/charts/EmaeMonthlyBarChart"
import IPCDualAxisChart from "@/components/charts/IPCDualAxisChart"
import { useAppData } from '@/lib/DataProvider';
import ActivitySectorTabContent from "@/components/ActivityTab"

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
    <section className="py-20 bg-transparent relative z-10" id="indicators">
      {/* Fondo sólido para bloquear los puntitos del fondo */}
      <div className="absolute inset-0 bg-transparent"></div>
      
      <div className="container mx-auto px-2 md:px-8 lg:px-12 max-w-7xl relative z-10">
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
                    EMAE 
                    <br />
                    <span className="text-indec-gray-dark text-base font-normal">
                    Estimador Mensual de Actividad Económica
                    </span>
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
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {emaeLoading ? (
                      <>
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                      </>
                    ) : (
                      <>
                        <Card className="border border-indec-gray-medium/30 shadow-sm">
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                              Último valor
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-indec-gray-dark/70" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-sm">
                                    <p>Valor del índice en la serie original.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <DataMetric 
                              label="" 
                              value={`${emaeError ? "N/A" : emaeData?.original_value?.toFixed(1) || "N/A"}`} 
                              trend={emaeData && emaeData.original_value > 0 ? "up" : "down"} 
                              className="text-xl font-bold"
                            
                            />
                          </CardContent>
                        </Card>
                        
                        <Card className="border border-indec-gray-medium/30 shadow-sm">
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                              Var. m/m (desest.)
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
                          <CardContent className="p-3 pt-0">
                            <DataMetric 
                              label="" 
                              value={`${emaeError ? "N/A" : (emaeData?.monthly_pct_change?.toFixed(1) || "N/A")}%`} 
                              trend={emaeData && emaeData.monthly_pct_change > 0 ? "up" : "down"} 
                              className="text-xl font-bold"
                            />
                          </CardContent>
                        </Card>
                        
                        <Card className="border border-indec-gray-medium/30 shadow-sm">
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                              Var. i/a
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
                          <CardContent className="p-3 pt-0">
                            <DataMetric 
                              label="" 
                              value={`${emaeError ? "N/A" : (emaeData?.yearly_pct_change?.toFixed(1) || "N/A")}%`} 
                              trend={emaeData && emaeData.yearly_pct_change > 0 ? "up" : "down"}
                              className="text-xl font-bold" 
                            />
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                  <Button asChild className="gap-2 w-full lg:w-auto">
                    <Link href="/indicadores/emae">
                      Ver análisis completo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="lg:col-span-3 bg-white shadow-md  border border-indec-gray-medium/30 rounded-lg p-4 h-auto">
                  {/* Usar el nuevo gráfico de variaciones mensuales con altura personalizada */}
                  <EmaeMonthlyBarChart 
                    data={emaeHistorical} 
                    loading={emaeHistoricalLoading} 
                    error={emaeHistoricalError}
                    height={220} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ipc">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold text-indec-blue-dark mb-4 text-center lg:text-left">
                    IPC 
                    <br />
                    <span className="text-indec-gray-dark text-base font-normal">
                      Índice de Precios al Consumidor
                    </span>
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
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {ipcLoading ? (
                      <>
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                      </>
                    ) : (
                      <>
                        <Card className="border border-indec-gray-medium/30 shadow-sm">
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                              Var. m/m
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
                          <CardContent className="p-3 pt-0">
                            <DataMetric 
                              label="" 
                              value={`${ipcError ? "N/A" : (ipcData?.monthly_change?.toFixed(1) || "N/A")}%`} 
                              className="text-xl font-bold"
                            />

                          </CardContent>
                        </Card>
                        
                        <Card className="border border-indec-gray-medium/30 shadow-sm">
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                              Var. i/a
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
                          <CardContent className="p-3 pt-0">
                            <DataMetric 
                              label="" 
                              value={`${ipcError ? "N/A" : (ipcData?.year_over_year_change?.toFixed(1) || "N/A")}%`} 
                              className="text-xl font-bold"
                            
                            />
                          </CardContent>
                        </Card>
                        
                        <Card className="border border-indec-gray-medium/30 shadow-sm">
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-xs font-medium text-indec-gray-dark flex items-center gap-1">
                              {`Acum. ${ipcData?.date ? new Date(ipcData.date).getFullYear() : ''}`}
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
                          <CardContent className="p-3 pt-0">
                            <DataMetric 
                              label="" 
                              value={`${ipcError ? "N/A" : (ipcData?.accumulated_change?.toFixed(1) || "N/A")}%`} 
                              className="text-xl font-bold"
                            />
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                  <Button asChild className="gap-2 w-full lg:w-auto">
                    <Link href="/indicadores/ipc">
                      Ver análisis completo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="lg:col-span-3 bg-white shadow-md  border border-indec-gray-medium/30 rounded-lg p-4 h-auto">
                  {/* Gráfico del IPC */}
                  <IPCDualAxisChart 
                    data={ipcHistorical} 
                    loading={ipcHistoricalLoading} 
                    error={ipcHistoricalError} 
                    height={220} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="actividad">
              <ActivitySectorTabContent />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}