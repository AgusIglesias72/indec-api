'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Minus,
  Download,
  MapPin,
  Users,
  Home,
  AlertTriangle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PovertyRegionalTableProps {
  lastUpdate?: string;
}

interface RegionalData {
  region: string;
  period: string;
  poverty_rate_persons: number;
  poverty_rate_households: number;
  indigence_rate_persons: number;
  indigence_rate_households: number;
  date: string;
}

type SortField = 'region' | 'poverty_rate_persons' | 'poverty_rate_households' | 'indigence_rate_persons' | 'indigence_rate_households';
type SortDirection = 'asc' | 'desc';

const PovertyRegionalTable: React.FC<PovertyRegionalTableProps> = ({ lastUpdate }) => {
  const [data, setData] = useState<RegionalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('poverty_rate_persons');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const fetchRegionalData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/poverty/comparison?type=regional');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        console.error('Error fetching regional poverty data:', err);
        setError('Error al cargar datos regionales');
      } finally {
        setLoading(false);
      }
    };

    fetchRegionalData();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <Minus className="h-4 w-4 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-red-600" />
      : <ChevronDown className="h-4 w-4 text-red-600" />;
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getRegionRank = (region: string, field: SortField) => {
    const sorted = [...data].sort((a, b) => (b[field] as number) - (a[field] as number));
    return sorted.findIndex(item => item.region === region) + 1;
  };

  const downloadCSV = () => {
    if (!data.length) return;

    const csvContent = [
      ['Región', 'Período', 'Pobreza Personas (%)', 'Pobreza Hogares (%)', 'Indigencia Personas (%)', 'Indigencia Hogares (%)'].join(','),
      ...sortedData.map(item => [
        item.region,
        item.period,
        item.poverty_rate_persons?.toFixed(1) || '',
        item.poverty_rate_households?.toFixed(1) || '',
        item.indigence_rate_persons?.toFixed(1) || '',
        item.indigence_rate_households?.toFixed(1) || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pobreza_regional_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const columns = [
    {
      field: 'region' as SortField,
      label: 'Región',
      icon: MapPin,
      align: 'left' as const
    },
    {
      field: 'poverty_rate_persons' as SortField,
      label: 'Pobreza Personas',
      icon: Users,
      align: 'center' as const,
      suffix: '%'
    },
    {
      field: 'poverty_rate_households' as SortField,
      label: 'Pobreza Hogares',
      icon: Home,
      align: 'center' as const,
      suffix: '%'
    },
    {
      field: 'indigence_rate_persons' as SortField,
      label: 'Indigencia Personas',
      icon: AlertTriangle,
      align: 'center' as const,
      suffix: '%'
    },
    {
      field: 'indigence_rate_households' as SortField,
      label: 'Indigencia Hogares',
      icon: AlertTriangle,
      align: 'center' as const,
      suffix: '%'
    }
  ];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="group relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-red-400/10 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
          <div className="p-6">
            <Skeleton className="h-6 w-64 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex gap-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="group relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-red-400/20 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-red-100">
          <div className="text-center text-red-600">
            <MapPin className="h-12 w-12 mx-auto opacity-50 mb-3" />
            <p className="font-medium">Error al cargar datos regionales</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="group relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-red-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
      <div className="relative bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Comparación por regiones</h3>
              <p className="text-sm text-gray-600">
                Datos del período {data[0]?.period || 'N/A'} {lastUpdate && `• Actualizado: ${lastUpdate}`}
              </p>
            </div>
            
            <button
              onClick={downloadCSV}
              disabled={!data.length}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Descargar CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.field}
                    className={`px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors ${
                      column.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                    onClick={() => handleSort(column.field)}
                  >
                    <div className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : ''}`}>
                      <column.icon className="h-4 w-4" />
                      <span>{column.label}</span>
                      {getSortIcon(column.field)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedData.map((item, index) => {
                const isNational = item.region === 'Total 31 aglomerados';
                
                return (
                  <motion.tr
                    key={item.region}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`hover:bg-gray-50 transition-colors ${
                      isNational ? 'bg-red-50/50 font-semibold' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          isNational ? 'bg-red-500' : 'bg-gray-300'
                        }`}></div>
                        <span className={`text-sm ${
                          isNational ? 'font-semibold text-gray-900' : 'text-gray-700'
                        }`}>
                          {item.region}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-sm font-medium ${
                          isNational ? 'text-red-700' : 'text-gray-900'
                        }`}>
                          {item.poverty_rate_persons?.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          #{getRegionRank(item.region, 'poverty_rate_persons')}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-sm font-medium ${
                          isNational ? 'text-red-700' : 'text-gray-900'
                        }`}>
                          {item.poverty_rate_households?.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          #{getRegionRank(item.region, 'poverty_rate_households')}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-sm font-medium ${
                          isNational ? 'text-orange-700' : 'text-gray-900'
                        }`}>
                          {item.indigence_rate_persons?.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          #{getRegionRank(item.region, 'indigence_rate_persons')}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-sm font-medium ${
                          isNational ? 'text-orange-700' : 'text-gray-900'
                        }`}>
                          {item.indigence_rate_households?.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          #{getRegionRank(item.region, 'indigence_rate_households')}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>Total regiones: {data.length}</span>
              <span>•</span>
              <span>Datos ordenados por: {columns.find(c => c.field === sortField)?.label}</span>
              <span>•</span>
              <span>Ranking de menor a mayor</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PovertyRegionalTable;