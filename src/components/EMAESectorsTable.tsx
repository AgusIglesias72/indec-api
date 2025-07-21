// src/components/EMAESectorsTable.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowUpRight, ArrowDownRight, Info, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Definir la estructura de los datos de sector
interface SectorData {
  sector_name: string;
  sector_code: string;
  original_value: number;
  year_over_year_change: number;
  monthly_pct_change?: number; // Solo disponible para Nivel General
}

type SortField = 'sector_name' | 'original_value' | 'year_over_year_change' | 'monthly_pct_change';
type SortDirection = 'asc' | 'desc';

interface EMAESectorsTableProps {
  lastUpdate?: string;
  className?: string;
}

export default function EMAESectorsTable({ lastUpdate, className }: EMAESectorsTableProps) {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<SortField>('sector_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Cargar los datos de la API
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      
      // Obtener metadata para conocer la última fecha disponible
      const metadataResponse = await fetch('/api/emae/metadata');
      if (!metadataResponse.ok) {
        throw new Error(`Error al obtener metadatos: ${metadataResponse.status}`);
      }
      
      const metadata = await metadataResponse.json();
      const lastDate = metadata.date_range?.last_date;
      
      if (!lastDate) {
        throw new Error('No se pudo determinar la última fecha disponible');
      }
      
      // Extraer mes y año de la última fecha
      const dateObj = new Date(lastDate);
      const month = dateObj.getMonth() + 1; // getMonth() devuelve 0-11
      const year = dateObj.getFullYear();
      
      // Obtener datos de sectores para ese mes/año
      const sectorsResponse = await fetch(`/api/emae/sectors?month=${month}&year=${year}&include_variations=true`);
      
      if (!sectorsResponse.ok) {
        throw new Error(`Error al obtener datos de sectores: ${sectorsResponse.status}`);
      }
      
      const sectorsResult = await sectorsResponse.json();
      
      if (!sectorsResult.data || !Array.isArray(sectorsResult.data)) {
        throw new Error('Formato de respuesta inesperado para sectores');
      }
      
      // Obtener el Nivel General para la misma fecha (para tener variación mensual)
      const generalResponse = await fetch(`/api/emae/latest`);
      
      if (!generalResponse.ok) {
        throw new Error(`Error al obtener Nivel General: ${generalResponse.status}`);
      }
      
      const generalData = await generalResponse.json();
      
      // Crear un array con todos los sectores más el nivel general
      const processedSectors = sectorsResult.data.map((item: any) => ({
        sector_name: item.economy_sector || item.sector,
        sector_code: item.economy_sector_code || item.sector_code,
        original_value: item.original_value || 0,
        year_over_year_change: item.year_over_year_change || 0
      }));
      
      // Agregar el Nivel General al inicio con variación mensual
      processedSectors.unshift({
        sector_name: "Nivel General",
        sector_code: "GENERAL",
        original_value: generalData.original_value || 0,
        year_over_year_change: generalData.yearly_pct_change || 0,
        monthly_pct_change: generalData.monthly_pct_change || 0
      });
      
      setSectors(processedSectors);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos de sectores:', err);
      setError('Error al cargar datos de sectores');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Cargar datos al iniciar el componente
  useEffect(() => {
    fetchData();
  }, []);

  // Función para manejar el cambio de ordenación
  const handleSort = (field: SortField) => {
    // Si hacemos clic en el mismo campo, invertimos la dirección
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si cambiamos de campo, establecer la nueva dirección (asc por defecto)
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Ordenar sectores según el campo y dirección actuales
  const getSortedSectors = () => {
    // Copia para no modificar el original
    const sortedSectors = [...sectors];
    
    return sortedSectors.sort((a, b) => {
      // Siempre mantener Nivel general al principio, independientemente de la ordenación
      if (a.sector_code === 'GENERAL') return -1;
      if (b.sector_code === 'GENERAL') return 1;
      
      // Ordenar según el campo seleccionado
      if (sortField === 'sector_name') {
        return sortDirection === 'asc' 
          ? a.sector_name.localeCompare(b.sector_name)
          : b.sector_name.localeCompare(a.sector_name);
      } else {
        // Ordenación numérica
        const aValue = a[sortField] ?? 0;
        const bValue = b[sortField] ?? 0;
        return sortDirection === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
    });
  };

  // Formatear valores porcentuales
  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Renderizar la tabla
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Desempeño por sector</CardTitle>
            <CardDescription>
              Variación interanual por sector económico - {lastUpdate ? `Datos a ${lastUpdate}` : 'Datos más recientes'}
            </CardDescription>
          </div>

        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort('sector_name')}
                  >
                    <div className="flex items-center gap-1">
                      Sector
                      <div className="flex flex-col">
                        {sortField === 'sector_name' && sortDirection === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : sortField === 'sector_name' && sortDirection === 'desc' ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </th>
                
                  {/* Solo para nivel general: columna de variación mensual */}
                  <th 
                    className="px-4 py-3 text-right cursor-pointer"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-end gap-1">
                            Var. mensual
                          
                            <Info className="h-3 w-3 text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Variación respecto al mes anterior (desestacionalizada, solo disponible para Nivel General)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer"
                    onClick={() => handleSort('year_over_year_change')}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-end gap-1">
                            Var. interanual
                            <div className="flex flex-col">
                              {sortField === 'year_over_year_change' && sortDirection === 'asc' ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : sortField === 'year_over_year_change' && sortDirection === 'desc' ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            <Info className="h-3 w-3 text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Variación respecto al mismo mes del año anterior</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedSectors().map((sector, index) => {
                  // Determinar si es una fila con fondo alternativo
                  const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                  // Destacar Nivel General
                  const isGeneral = sector.sector_code === 'GENERAL';
                  
                  return (
                    <tr key={sector.sector_code} className={`${rowClass} ${isGeneral ? 'font-semibold' : ''}`}>
                      <td className={`px-4 py-3 ${isGeneral ? 'font-semibold' : ''}`}>
                        {sector.sector_name}
                      </td>
                     
                      {/* Columna de variación mensual - solo con valor para Nivel General */}
                      <td className="px-4 py-3 text-right">
                        {isGeneral && sector.monthly_pct_change !== undefined ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className={`${sector.monthly_pct_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(sector.monthly_pct_change)}
                            </span>
                            {sector.monthly_pct_change > 0 ? (
                              <ArrowUpRight className="h-3 w-3 text-green-600" />
                            ) : sector.monthly_pct_change < 0 ? (
                              <ArrowDownRight className="h-3 w-3 text-red-600" />
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className={`${sector.year_over_year_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(sector.year_over_year_change)}
                          </span>
                          {sector.year_over_year_change > 0 ? (
                            <ArrowUpRight className="h-3 w-3 text-green-600" />
                          ) : sector.year_over_year_change < 0 ? (
                            <ArrowDownRight className="h-3 w-3 text-red-600" />
                          ) : null}
                        </div>
                      </td>
                    
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 text-xs text-right text-gray-500">
          Fuente: Instituto Nacional de Estadística y Censos (INDEC)
        </div>
      </CardContent>
    </Card>
  );
}