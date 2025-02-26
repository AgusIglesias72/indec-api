'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CronTaskResult } from '@/types';
import { createClient } from '@supabase/supabase-js';

type CronExecution = {
  id: string;
  execution_time: string;
  status: 'success' | 'partial' | 'error';
  results: CronTaskResult[];
};

export default function CronJobsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [cronExecutions, setCronExecutions] = useState<CronExecution[]>([]);
  const [currentTask, setCurrentTask] = useState<string | null>(null);

  // Cargar el historial de ejecuciones al iniciar
  useEffect(() => {
    const fetchCronHistory = async () => {
      try {
        // Crear cliente de Supabase con clave anónima (solo lectura)
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data, error } = await supabase
          .from('cron_executions')
          .select('*')
          .order('execution_time', { ascending: false })
          .limit(10);

        if (error) throw error;
        setCronExecutions(data || []);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        setMessage({ 
          type: 'error', 
          text: `Error al cargar historial: ${(error as Error).message}` 
        });
      }
    };

    fetchCronHistory();
  }, []);

  // Función para ejecutar actualización manual completa
  async function handleRunFullCron() {
    if (!apiKey) {
      setMessage({ type: 'error', text: 'Debe ingresar la clave de API' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setCurrentTask('all');

    try {
      const response = await fetch('/api/cron/update-indec-data', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al ejecutar cron job');
      }

      // Actualizar la lista de ejecuciones con la nueva ejecución
      setCronExecutions(prev => [{
        id: Date.now().toString(),
        execution_time: data.execution_time,
        status: data.results.every((r: CronTaskResult) => r.status === 'success') ? 'success' : 'partial',
        results: data.results
      }, ...prev]);

      setMessage({ 
        type: 'success', 
        text: `Cron job completado: ${data.results?.length || 0} tareas ejecutadas` 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Error: ${(error as Error).message}` 
      });
    } finally {
      setIsLoading(false);
      setCurrentTask(null);
    }
  }

  // Función para ejecutar tareas individuales
  async function handleRunSpecificTask(task: string) {
    if (!apiKey) {
      setMessage({ type: 'error', text: 'Debe ingresar la clave de API' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setCurrentTask(task);

    try {
      const response = await fetch(`/api/test/update-functions?func=${task}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error al ejecutar tarea ${task}`);
      }

      setMessage({ 
        type: 'success', 
        text: `Tarea ${task} completada: ${data.result.count} registros actualizados` 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Error: ${(error as Error).message}` 
      });
    } finally {
      setIsLoading(false);
      setCurrentTask(null);
    }
  }

  // Formatea fecha en hora local
  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  // Obtiene el color de la etiqueta según el estado
  function getStatusColorClass(status: string): string {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Administración de Cron Jobs</h1>
      
      {/* Mensaje de estado */}
      {message && (
        <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      {/* Sección de autenticación */}
      <div className="mb-8 p-4 border rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Autenticación</h2>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Clave de API:</label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="max-w-md"
            placeholder="Ingrese la clave de API"
          />
          <p className="mt-1 text-sm text-gray-500">
            Necesaria para ejecutar tareas manualmente
          </p>
        </div>
      </div>
      
      {/* Sección de ejecutar tareas */}
      <div className="mb-8 p-4 border rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Ejecutar Tareas</h2>
        <p className="mb-4 text-gray-600">
          Puede ejecutar todas las tareas juntas o seleccionar una tarea específica para actualizar.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleRunFullCron}
            disabled={isLoading}
            variant={currentTask === 'all' ? 'default' : 'outline'}
            className="min-w-32"
          >
            {currentTask === 'all' ? 'Ejecutando...' : 'Ejecutar Todas las Tareas'}
          </Button>
          
          <Button
            onClick={() => handleRunSpecificTask('emae')}
            disabled={isLoading}
            variant={currentTask === 'emae' ? 'default' : 'outline'}
            className="min-w-32"
          >
            {currentTask === 'emae' ? 'Ejecutando...' : 'Actualizar EMAE'}
          </Button>
          
          <Button
            onClick={() => handleRunSpecificTask('emae_activity')}
            disabled={isLoading}
            variant={currentTask === 'emae_activity' ? 'default' : 'outline'}
            className="min-w-32"
          >
            {currentTask === 'emae_activity' ? 'Ejecutando...' : 'Actualizar EMAE por Actividad'}
          </Button>
        </div>
      </div>
      
      {/* Historial de ejecuciones */}
      <div className="p-4 border rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Historial de Ejecuciones</h2>
        
        {cronExecutions.length === 0 ? (
          <p className="text-gray-500 italic">No hay ejecuciones registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 border">Fecha y Hora</th>
                  <th className="p-3 border">Estado</th>
                  <th className="p-3 border">Tareas</th>
                  <th className="p-3 border">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {cronExecutions.map((exec) => (
                  <tr key={exec.id} className={exec.status === 'error' ? 'bg-red-50' : exec.status === 'partial' ? 'bg-yellow-50' : ''}>
                    <td className="p-3 border">{formatDateTime(exec.execution_time)}</td>
                    <td className="p-3 border">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColorClass(exec.status)}`}>
                        {exec.status}
                      </span>
                    </td>
                    <td className="p-3 border">{exec.results?.length || 0}</td>
                    <td className="p-3 border">
                      <details>
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          Ver resultados
                        </summary>
                        <div className="mt-2 pl-4 border-l-2 border-gray-200">
                          {exec.results?.map((result, index) => (
                            <div key={index} className="mb-3 p-2 bg-gray-50 rounded">
                              <div className="font-semibold">{result.dataSource}</div>
                              <div className="text-sm mt-1">
                                Estado: <span className={`px-1.5 py-0.5 rounded ${getStatusColorClass(result.status)}`}>{result.status}</span>
                              </div>
                              <div className="text-sm mt-1">Registros procesados: {result.recordsProcessed}</div>
                              {result.details && (
                                <div className="text-sm mt-1 text-gray-600">
                                  <span className="font-medium">Detalles:</span> {result.details}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}