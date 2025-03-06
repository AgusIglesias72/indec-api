import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface Endpoint {
  method: string;
  path: string;
  description: string;
  parameters?: Parameter[];
  notes?: string[];
  responseExample?: string;
}

interface ApiSectionProps {
  title: string;
  description: string;
  baseUrl: string;
  endpoints: Endpoint[];
}

export default function ApiSection({ title, description, baseUrl, endpoints }: ApiSectionProps) {
  // Estado para controlar qué endpoints están expandidos
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>(
    // Por defecto, expandir solo el primer endpoint
    endpoints.reduce((acc, _, index) => {
      acc[index] = index === 0;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Función para alternar el estado de expansión de un endpoint
  const toggleEndpoint = (index: number) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-8">
      <div className="my-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {endpoints.map((endpoint, index) => (
        <Collapsible
          key={`${endpoint.method}-${endpoint.path}`}
          open={expandedEndpoints[index]}
          onOpenChange={() => toggleEndpoint(index)}
          className="border rounded-lg overflow-hidden"
        >
          <Card className="border-0 shadow-none">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                      endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                      endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <CardTitle className="text-lg font-mono">{endpoint.path}</CardTitle>
                  </div>
                  <CardDescription className="mt-1">{endpoint.description}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="ml-2">
                  {expandedEndpoints[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </Button>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {/* URL completa */}
                  <div>
                    <h4 className="text-sm font-semibold mb-1">URL Completa</h4>
                    <div className="bg-gray-100 p-2 rounded font-mono text-sm overflow-x-auto">
                      {baseUrl}{endpoint.path}
                    </div>
                  </div>
                  
                  {/* Parámetros */}
                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Parámetros</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requerido</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {endpoint.parameters.map((param, paramIndex) => (
                              <tr key={paramIndex} className={paramIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2 text-sm font-mono">{param.name}</td>
                                <td className="px-4 py-2 text-sm">{param.type}</td>
                                <td className="px-4 py-2 text-sm">{param.required ? 'Sí' : 'No'}</td>
                                <td className="px-4 py-2 text-sm">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Notas */}
                  {endpoint.notes && endpoint.notes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Notas</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {endpoint.notes.map((note, noteIndex) => (
                          <li key={noteIndex} className="text-sm text-gray-600">{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Ejemplos de código */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Ejemplos de Código</h4>
                    <Tabs defaultValue="javascript" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="javascript">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                          <code>{`// Usando fetch
fetch("${baseUrl}${endpoint.path}")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));

// Usando async/await
async function fetchData() {
  try {
    const response = await fetch("${baseUrl}${endpoint.path}");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
}`}</code>
                        </pre>
                      </TabsContent>
                      
                      <TabsContent value="curl">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                          <code>{`curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\
  -H "Accept: application/json"`}</code>
                        </pre>
                      </TabsContent>
                      
                      <TabsContent value="python">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                          <code>{`import requests

response = requests.${endpoint.method.toLowerCase()}("${baseUrl}${endpoint.path}")
data = response.json()
print(data)`}</code>
                        </pre>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  {/* Ejemplo de respuesta */}
                  {endpoint.responseExample && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Ejemplo de Respuesta</h4>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                        <code>{endpoint.responseExample}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}