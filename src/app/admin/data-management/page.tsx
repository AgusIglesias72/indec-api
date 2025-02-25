'use client';

import { useState, FormEvent } from 'react';
import { CronTaskResult } from '@/types';

export default function DataManagementPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState('emae');
  const [cronResults, setCronResults] = useState<CronTaskResult[]>([]);

  // Función para ejecutar actualización manual
  async function handleManualUpdate() {
    if (!apiKey) {
      setMessage({ type: 'error', text: 'Debe ingresar la clave de API' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/cron/update-indec-data', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar datos');
      }

      setCronResults(data.results || []);
      setMessage({ 
        type: 'success', 
        text: `Actualización completada: ${data.results?.length || 0} tareas ejecutadas` 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Error: ${(error as Error).message}` 
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Función para importar datos históricos
  async function handleFileImport(e: FormEvent) {
    e.preventDefault();
    
    if (!selectedFile || !apiKey) {
      setMessage({ 
        type: 'error', 
        text: 'Debe seleccionar un archivo y proporcionar la clave de API' 
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('indicator', selectedIndicator);

      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al importar datos');
      }

      setMessage({
        type: 'success',
        text: `Importación exitosa: ${data.count} registros importados`
      });
      setSelectedFile(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error: ${(error as Error).message}`
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Administración de Datos INDEC</h1>
      
      {/* Mensaje de estado */}
      {message && (
        <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      {/* Sección de autenticación */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Autenticación</h2>
        <div className="mb-4">
          <label className="block mb-2">Clave de API:</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Ingrese la clave de API"
          />
        </div>
      </div>
      
      {/* Sección de actualización manual */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Actualización Manual</h2>
        <p className="mb-4">
          Esta acción obtiene los últimos datos disponibles del INDEC y actualiza la base de datos.
        </p>
        <button
          onClick={handleManualUpdate}
          disabled={isLoading}
          className={`px-4 py-2 rounded ${isLoading ? 'bg-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          {isLoading ? 'Actualizando...' : 'Actualizar Datos'}
        </button>
        
        {/* Resultados de la actualización */}
        {cronResults.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Resultados:</h3>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Tarea</th>
                  <th className="p-2 border">Estado</th>
                  <th className="p-2 border">Registros</th>
                  <th className="p-2 border">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {cronResults.map((result, index) => (
                  <tr key={index} className={result.status === 'error' ? 'bg-red-50' : ''}>
                    <td className="p-2 border">{result.dataSource}</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-sm ${
                        result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="p-2 border">{result.recordsProcessed}</td>
                    <td className="p-2 border">{result.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Sección de importación de datos históricos */}
      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Importar Datos Históricos</h2>
        <form onSubmit={handleFileImport}>
          <div className="mb-4">
            <label className="block mb-2">Indicador:</label>
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="emae">EMAE - General</option>
              <option value="emae_by_activity">EMAE - Por Actividad</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Archivo CSV:</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Archivo seleccionado: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !selectedFile}
            className={`px-4 py-2 rounded ${
              isLoading || !selectedFile ? 'bg-gray-400' : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isLoading ? 'Importando...' : 'Importar Datos'}
          </button>
        </form>
      </div>
    </div>
  );
}