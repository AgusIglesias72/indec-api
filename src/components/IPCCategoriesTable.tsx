// src/components/IPCCategoriesTable.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowUpRight, ArrowDownRight, Info, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Definir la estructura de los datos de categoría
interface CategoryData {
  category: string;
  category_code: string;
  monthly_pct_change: number;
  yearly_pct_change: number;
}

type SortField = 'category' | 'monthly_pct_change' | 'yearly_pct_change';
type SortDirection = 'asc' | 'desc';

interface IPCCategoriesTableProps {
  lastUpdate?: string;
  className?: string;
}

export default function IPCCategoriesTable({ lastUpdate, className }: IPCCategoriesTableProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<SortField>('category');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Obtener nombres canónicos para los códigos de categoría
  const getCategoryFullName = (code: string, name: string): string => {
    // Si el nombre ya está completo (para GENERAL o categorías principales), dejarlo como está
    if (name === "Nivel general" || !code.includes("_")) {
      return name;
    }

    // Para rubros, mapear códigos a nombres completos si es necesario
    const categoryMap: Record<string, string> = {
      "RUBRO_ALIMENTOS": "Alimentos y bebidas no alcohólicas",
      "RUBRO_BEB_ALC_Y_TAB": "Bebidas alcohólicas y tabaco",
      "RUBRO_PRE_DE_VES_Y_CAL": "Prendas de vestir y calzado",
      "RUBRO_VIVIENDA": "Vivienda, agua, electricidad y otros combustibles",
      "RUBRO_EQUIPAMIENTO": "Equipamiento y mantenimiento del hogar",
      "RUBRO_SALUD": "Salud",
      "RUBRO_TRANSPORTE": "Transporte",
      "RUBRO_COMUNICACION": "Comunicación",
      "RUBRO_RECREACION_Y_CULTURA": "Recreación y cultura",
      "RUBRO_EDUCACION": "Educación",
      "RUBRO_RESTAURANTES": "Restaurantes y hoteles",
      "RUBRO_BIE_Y_SER_VAR": "Bienes y servicios varios",
      "CAT_ESTACIONAL": "Estacional",
      "CAT_NUCLEO": "Núcleo",
      "CAT_REGULADOS": "Regulados",
      "BYS_BIENES": "Bienes",
      "BYS_SERVICIOS": "Servicios"
    };

    return categoryMap[code] || name;
  };

  // Cargar los datos de la API
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      
      // Obtener la lista de componentes disponibles con sus metadatos
      const metadataResponse = await fetch('/api/ipc?type=metadata');
      if (!metadataResponse.ok) {
        throw new Error(`Error al obtener metadatos: ${metadataResponse.status}`);
      }
      
      const metadata = await metadataResponse.json();
      
      // Extraer las categorías que queremos mostrar
      const categoriesToFetch: string[] = ['GENERAL']; // Siempre incluir el nivel general
      
      // Agregar Bienes y Servicios
      if (metadata.components?.BYS) {
        metadata.components.BYS.forEach((component: any) => {
          categoriesToFetch.push(component.code);
        });
      }
      
      // Agregar las categorías
      if (metadata.components?.CATEGORIA) {
        metadata.components.CATEGORIA.forEach((component: any) => {
          categoriesToFetch.push(component.code);
        });
      }
      
      // Agregar rubros
      if (metadata.components?.RUBRO) {
        metadata.components.RUBRO.forEach((component: any) => {
          categoriesToFetch.push(component.code);
        });
      }
      
      // Obtener el último dato disponible para cada categoría
      const latestDate = metadata.metadata?.last_updated || '';
      
      if (!latestDate) {
        throw new Error('No se pudo determinar la última fecha disponible');
      }
      
      // Construir un array de promesas para obtener los datos de cada categoría
      const fetchPromises = categoriesToFetch.map(async (categoryCode) => {
        try {
          const response = await fetch(`/api/ipc?category=${categoryCode}&region=Nacional&month=${new Date(latestDate).getMonth() + 1}&year=${new Date(latestDate).getFullYear()}`);
          
          if (!response.ok) {
            console.warn(`Error al obtener datos para ${categoryCode}: ${response.status}`);
            return null;
          }
          
          const result = await response.json();
          
          if (result.data && result.data.length > 0) {
            const categoryData = result.data[0];
            return {
              category: categoryData.category,
              category_code: categoryData.category_code,
              monthly_pct_change: categoryData.monthly_pct_change || 0,
              yearly_pct_change: categoryData.yearly_pct_change || 0
            };
          }
          return null;
        } catch (error) {
          console.warn(`Error al procesar datos para ${categoryCode}:`, error);
          return null;
        }
      });
      
      // Esperar a que todas las solicitudes se completen
      const results = await Promise.all(fetchPromises);
      
      // Filtrar los resultados para eliminar valores nulos
      const validResults = results.filter(result => result !== null) as CategoryData[];
      
      // Ordenación inicial: primero Nivel general, luego por orden alfabético
      const sortedResults = validResults.sort((a, b) => {
        if (a.category_code === 'GENERAL') return -1;
        if (b.category_code === 'GENERAL') return 1;
        return getCategoryFullName(a.category_code, a.category).localeCompare(
          getCategoryFullName(b.category_code, b.category)
        );
      });
      
      setCategories(sortedResults);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos de categorías IPC:', err);
      setError('Error al cargar datos de categorías');
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

  // Ordenar categorías según el campo y dirección actuales
  const getSortedCategories = () => {
    // Copia para no modificar el original
    const sortedCategories = [...categories];
    
    return sortedCategories.sort((a, b) => {
      // Siempre mantener Nivel general al principio, independientemente de la ordenación
      if (a.category_code === 'GENERAL') return -1;
      if (b.category_code === 'GENERAL') return 1;
      
      // Ordenar según el campo seleccionado
      if (sortField === 'category') {
        const aName = getCategoryFullName(a.category_code, a.category);
        const bName = getCategoryFullName(b.category_code, b.category);
        return sortDirection === 'asc' 
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      } else {
        // Ordenación numérica para valores porcentuales
        const aValue = a[sortField];
        const bValue = b[sortField];
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
            <CardTitle className="text-lg">Variación por rubros</CardTitle>
            <CardDescription>
              Todos los rubros del IPC - {lastUpdate ? `Datos a ${lastUpdate}` : 'Datos más recientes'}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
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
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      Categoría / Rubro
                      <div className="flex flex-col">
                        {sortField === 'category' && sortDirection === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : sortField === 'category' && sortDirection === 'desc' ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer"
                    onClick={() => handleSort('monthly_pct_change')}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-end gap-1">
                            Var. mensual
                            <div className="flex flex-col">
                              {sortField === 'monthly_pct_change' && sortDirection === 'asc' ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : sortField === 'monthly_pct_change' && sortDirection === 'desc' ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Variación respecto al mes anterior</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer"
                    onClick={() => handleSort('yearly_pct_change')}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-end gap-1">
                            Var. interanual
                            <div className="flex flex-col">
                              {sortField === 'yearly_pct_change' && sortDirection === 'asc' ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : sortField === 'yearly_pct_change' && sortDirection === 'desc' ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            <Info className="h-3 w-3 text-indec-gray-dark/70" />
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
                {getSortedCategories().map((category, index) => {
                  // Determinar si es una fila con fondo alternativo
                  const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                  // Destacar Nivel General
                  const isGeneral = category.category_code === 'GENERAL';
                  
                  return (
                    <tr key={category.category_code} className={`${rowClass} ${isGeneral ? 'font-semibold' : 'border-b'}`}>
                      <td className={`px-4 py-3 ${isGeneral ? 'font-semibold' : ''}`}>
                        {getCategoryFullName(category.category_code, category.category)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-indec-blue">
                            {formatPercentage(category.monthly_pct_change)}
                          </span>
                          {category.monthly_pct_change > 0 ? (
                            <ArrowUpRight className="h-3 w-3 text-indec-blue" />
                          ) : category.monthly_pct_change < 0 ? (
                            <ArrowDownRight className="h-3 w-3 text-indec-blue" />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-indec-blue">
                            {formatPercentage(category.yearly_pct_change)}
                          </span>
                          {category.yearly_pct_change > 0 ? (
                            <ArrowUpRight className="h-3 w-3 text-indec-blue" />
                          ) : category.yearly_pct_change < 0 ? (
                            <ArrowDownRight className="h-3 w-3 text-indec-blue" />
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