'use client';

import { useState } from 'react';
import ApiSection from '@/components/APIDocs/ApiSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocsPage() {
  const [baseUrl, setBaseUrl] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com');
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Documentación de API</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Guía completa para utilizar nuestras APIs de datos económicos y estadísticos
        </p>
      </div>
      
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>Aspectos comunes a todas las APIs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">URL Base</h3>
              <p className="text-gray-600">{baseUrl}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Autenticación</h3>
              <p className="text-gray-600">
                Actualmente, nuestras APIs son de acceso público y no requieren autenticación.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Formato de Respuesta</h3>
              <p className="text-gray-600">
                Todas las APIs devuelven datos en formato JSON.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Manejo de Errores</h3>
              <p className="text-gray-600">
                En caso de error, las APIs devuelven un código de estado HTTP apropiado junto con un mensaje de error en formato JSON.
              </p>
              <pre className="bg-gray-100 p-4 rounded-md mt-2 overflow-x-auto">
                <code>{`{
  "error": "Mensaje descriptivo del error"
}`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="calendar">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendario Económico</TabsTrigger>
          <TabsTrigger value="emae">EMAE</TabsTrigger>
          <TabsTrigger value="ipc">IPC</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <ApiSection 
            title="API de Calendario Económico"
            description="Accede a información sobre eventos económicos programados"
            baseUrl={baseUrl}
            endpoints={[
              {
                method: "GET",
                path: "/api/calendar",
                description: "Obtiene eventos del calendario económico",
                parameters: [
                  { name: "month", type: "number", required: false, description: "Mes (1-12)" },
                  { name: "year", type: "number", required: false, description: "Año (ej. 2023)" },
                  { name: "start_date", type: "string", required: false, description: "Fecha de inicio (YYYY-MM-DD)" },
                  { name: "end_date", type: "string", required: false, description: "Fecha de fin (YYYY-MM-DD)" }
                ],
                responseExample: `{
  "data": [
    {
      "date": "2023-08-15",
      "day_week": "martes",
      "indicator": "Índice de Precios al Consumidor",
      "period": "Julio 2023"
    },
    {
      "date": "2023-08-23",
      "day_week": "miércoles",
      "indicator": "Estimador Mensual de Actividad Económica",
      "period": "Junio 2023"
    }
  ],
  "metadata": {
    "count": 2,
    "filtered_by": {
      "month": 8,
      "year": 2023
    },
    "last_updated": "2023-08-01T12:00:00Z",
    "total_events": 150,
    "source": "INDEC"
  }
}`
              }
            ]}
          />
        </TabsContent>
        
        <TabsContent value="emae">
          <ApiSection 
            title="API de EMAE"
            description="Estimador Mensual de Actividad Económica"
            baseUrl={baseUrl}
            endpoints={[
              {
                method: "GET",
                path: "/api/emae",
                description: "Obtiene datos del EMAE",
                parameters: [
                  { name: "start_date", type: "string", required: false, description: "Fecha de inicio (YYYY-MM-DD)" },
                  { name: "end_date", type: "string", required: false, description: "Fecha de fin (YYYY-MM-DD)" },
                  { name: "series", type: "string", required: false, description: "Tipos de series a incluir (separadas por comas)" }
                ],
                responseExample: `{
  "data": [
    {
      "date": "2023-06-01",
      "value": 145.2,
      "variation_monthly": 0.8,
      "variation_yearly": 4.2,
      "series_type": "original"
    },
    {
      "date": "2023-06-01",
      "value": 144.5,
      "variation_monthly": 0.5,
      "variation_yearly": 3.9,
      "series_type": "desestacionalizada"
    }
  ],
  "metadata": {
    "count": 2,
    "last_updated": "2023-08-23T14:30:00Z",
    "source": "INDEC"
  }
}`
              }
            ]}
          />
        </TabsContent>
        
        <TabsContent value="ipc">
          <ApiSection 
            title="API de IPC"
            description="Índice de Precios al Consumidor"
            baseUrl={baseUrl}
            endpoints={[
              {
                method: "GET",
                path: "/api/ipc",
                description: "Obtiene datos del IPC",
                parameters: [
                  { name: "start_date", type: "string", required: false, description: "Fecha de inicio (YYYY-MM-DD)" },
                  { name: "end_date", type: "string", required: false, description: "Fecha de fin (YYYY-MM-DD)" },
                  { name: "categories", type: "string", required: false, description: "Categorías a incluir (separadas por comas)" }
                ],
                responseExample: `{
  "data": [
    {
      "date": "2023-07-01",
      "value": 272.8,
      "variation_monthly": 6.3,
      "variation_yearly": 113.4,
      "category": "nivel_general"
    },
    {
      "date": "2023-07-01",
      "value": 285.6,
      "variation_monthly": 5.8,
      "variation_yearly": 115.2,
      "category": "alimentos_bebidas"
    }
  ],
  "metadata": {
    "count": 2,
    "last_updated": "2023-08-15T10:00:00Z",
    "source": "INDEC"
  }
}`
              }
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}