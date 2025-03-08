// src/components/charts/SectorActivityList.tsx
import React, { useState } from 'react';
import { ArrowUpDown, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface SectorData {
  sector_name: string;
  sector_code: string;
  year_over_year_change: number;
  original_value?: number;
  date?: string;
}

interface SectorActivityListProps {
  data: SectorData[] | null;
  loading: boolean;
  error: any;
}

export default function SectorActivityList({ data, loading, error }: SectorActivityListProps) {
  const [sortOrder, setSortOrder] = useState<'value' | 'alphabetical'>('value');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCount, setShowCount] = useState<'all' | '10' | '5'>('all');

  // Función para ordenar y filtrar los datos
  const getFilteredSortedData = () => {
    if (!data) return [];
    
    // Primero filtrar por búsqueda
    let filteredData = data;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = data.filter(sector => 
        sector.sector_name.toLowerCase().includes(term) || 
        sector.sector_code.toLowerCase().includes(term)
      );
    }
    
    // Luego ordenar
    let sortedData = [...filteredData];
    if (sortOrder === 'value') {
      sortedData.sort((a, b) => b.year_over_year_change - a.year_over_year_change);
    } else {
      sortedData.sort((a, b) => a.sector_name.localeCompare(b.sector_name));
    }
    
    // Finalmente limitar la cantidad
    if (showCount === '5') {
      return sortedData.slice(0, 5);
    } else if (showCount === '10') {
      return sortedData.slice(0, 10);
    }
    
    return sortedData;
  };
  
  const displayData = getFilteredSortedData();
  
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    
    // Crear contenido CSV
    const headers = ['Código', 'Sector', 'Variación interanual (%)'];
    const csvContent = [
      headers.join(','),
      ...displayData.map(item => 
        [
          item.sector_code,
          `"${item.sector_name.replace(/"/g, '""')}"`,
          item.year_over_year_change.toFixed(1)
        ].join(',')
      )
    ].join('\n');
    
    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sectores_economicos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="w-1/3">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center h-60 bg-gray-50 rounded-md border border-gray-200">
          <div className="text-center">
            <p className="text-gray-500 mb-2">No se pudieron cargar los datos de sectores.</p>
            <p className="text-sm text-gray-400">Por favor, intenta nuevamente más tarde.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center h-60 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-gray-500">No hay datos disponibles para mostrar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="w-full sm:w-auto">
          <div className="relative max-w-sm">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input
              placeholder="Buscar sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={sortOrder} onValueChange={(value: 'value' | 'alphabetical') => setSortOrder(value)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Por variación</SelectItem>
              <SelectItem value="alphabetical">Alfabético</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={showCount} onValueChange={(value: 'all' | '10' | '5') => setShowCount(value)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Mostrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="5">Top 5</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="text-right">Variación interanual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((sector) => (
              <TableRow key={sector.sector_code}>
                <TableCell className="font-mono">{sector.sector_code}</TableCell>
                <TableCell>{sector.sector_name}</TableCell>
                <TableCell 
                  className={`text-right font-mono font-medium ${
                    sector.year_over_year_change >= 0 
                      ? 'text-indec-green' 
                      : 'text-indec-red'
                  }`}
                >
                  {sector.year_over_year_change >= 0 ? '+' : ''}
                  {sector.year_over_year_change.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-2 text-right text-xs text-gray-500">
        Mostrando {displayData.length} de {data.length} sectores
      </div>
    </div>
  );
}