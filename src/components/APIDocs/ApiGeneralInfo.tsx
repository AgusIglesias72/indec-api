// src/components/APIDocs/ApiGeneralInfo.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiGeneralInfoProps {
  baseUrl: string;
}

export default function ApiGeneralInfo({ baseUrl }: ApiGeneralInfoProps) {
  return (
    <Card className="mb-12 bg-white  relative">
      
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
              Todas las APIs devuelven datos en formato JSON y soportan formato CSV.
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
  );
}