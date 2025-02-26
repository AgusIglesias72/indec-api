"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import DataMetric from "@/components/DataMetric"

export default function Indicators() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
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
                  <p className="text-indec-gray-dark mb-6">
                    El EMAE refleja la evolución mensual de la actividad económica de los sectores productivos a nivel nacional, permitiendo anticipar las tasas de variación del PIB.
                  </p>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                    <DataMetric 
                      label="Último valor" 
                      value="159.3" 
                    />
                    <DataMetric 
                      label="Variación interanual" 
                      value="3.2%" 
                      trend="up" 
                    />
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
                  <p className="text-indec-gray-dark mb-6">
                    El IPC mide la evolución de los precios de bienes y servicios representativos del gasto de consumo de los hogares residentes en la región especificada.
                  </p>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                    <DataMetric 
                      label="Mensual" 
                      value="3.5%" 
                      trend="up" 
                    />
                    <DataMetric 
                      label="Interanual" 
                      value="142.7%" 
                      trend="up" 
                    />
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
                  <p className="text-indec-gray-dark mb-6">
                    Análisis detallado del desempeño de distintos sectores económicos, permitiendo identificar fortalezas y debilidades en la economía argentina.
                  </p>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center p-2 hover:bg-indec-gray-light rounded-md transition-colors">
                      <span className="text-indec-gray-dark">Agricultura</span>
                      <div className="font-mono font-medium text-indec-green">+4.8%</div>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-indec-gray-light rounded-md transition-colors">
                      <span className="text-indec-gray-dark">Industria</span>
                      <div className="font-mono font-medium text-indec-red">-1.2%</div>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-indec-gray-light rounded-md transition-colors">
                      <span className="text-indec-gray-dark">Servicios</span>
                      <div className="font-mono font-medium text-indec-green">+2.7%</div>
                    </div>
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
                    <p className="text-indec-gray-dark">Gráfico Sectores</p>
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