import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParameterTable from './ParameterTable';
import CodeExample from './CodeExample';

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface EndpointProps {
  endpoint: {
    method: string;
    path: string;
    description: string;
    parameters: Parameter[];
    responseExample: string;
    notes?: string[];
  };
  baseUrl: string;
}

export default function EndpointCard({ endpoint, baseUrl }: EndpointProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const fullUrl = `${baseUrl}${endpoint.path}`;
  
  // Generar ejemplos de código según el endpoint
  const getExampleParams = () => {
    if (endpoint.path === '/api/calendar') {
      return {
        queryString: 'month=8&year=2023',
        curlParams: '?month=8&year=2023',
        jsParams: {
          month: 8,
          year: 2023
        },
        pythonParams: {
          "month": 8,
          "year": 2023
        }
      };
    } else {
      // Para EMAE e IPC, usar start_date y end_date
      return {
        queryString: 'start_date=2023-01-01&end_date=2023-07-31',
        curlParams: '?start_date=2023-01-01&end_date=2023-07-31',
        jsParams: {
          start_date: '2023-01-01',
          end_date: '2023-07-31'
        },
        pythonParams: {
          "start_date": "2023-01-01",
          "end_date": "2023-07-31"
        }
      };
    }
  };
  
  const exampleParams = getExampleParams();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-md font-mono text-sm font-medium ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </span>
          <CardTitle className="font-mono text-lg">{endpoint.path}</CardTitle>
        </div>
        <CardDescription>{endpoint.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {endpoint.parameters.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Parámetros</h3>
              <ParameterTable parameters={endpoint.parameters} />
            </div>
          )}

          {endpoint.notes && endpoint.notes.length > 0 && (
            <div>
              <h3 className="text-md font-medium mb-3">Notas</h3>
              <ul className="list-disc text-sm pl-5 space-y-1 text-gray-600">
                {endpoint.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-3">Ejemplos de Uso</h3>
            <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>
              
              <TabsContent value="curl">
                <CodeExample 
                  language="bash"
                  code={`curl -X ${endpoint.method} "${fullUrl}${exampleParams.curlParams}"`}
                />
              </TabsContent>
              
              <TabsContent value="javascript">
                <CodeExample 
                  language="javascript"
                  code={`// Usando fetch
fetch("${fullUrl}?${exampleParams.queryString}")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Usando async/await
async function fetchData() {
  try {
    const response = await fetch("${fullUrl}?${exampleParams.queryString}");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}`}
                />
              </TabsContent>
              
              <TabsContent value="python">
                <CodeExample 
                  language="python"
                  code={`import requests

response = requests.${endpoint.method.toLowerCase()}("${fullUrl}", params=${JSON.stringify(exampleParams.pythonParams, null, 4)})

data = response.json()
print(data)`}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Respuesta de Ejemplo</h3>
            <CodeExample 
              language="json"
              code={endpoint.responseExample}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}