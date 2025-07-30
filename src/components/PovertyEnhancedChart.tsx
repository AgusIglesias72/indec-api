'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { ChevronDown, Download, Calendar, MapPin, TrendingUp, X, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PovertyEnhancedChartProps {
  title: string;
  description: string;
  height?: number;
}

interface ChartSelection {
  id: string;
  indicator: string;
  region: string;
  label: string;
  color: string;
}

interface ChartFilters {
  selections: ChartSelection[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const PovertyEnhancedChart: React.FC<PovertyEnhancedChartProps> = ({ 
  title, 
  description, 
  height = 400 
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ChartFilters>({
    selections: [
      {
        id: '1',
        indicator: 'poverty_rate_persons',
        region: 'Total 31 aglomerados',
        label: 'Pobreza Personas - Total Nacional',
        color: '#dc2626'
      }
    ]
  });
  const [newIndicator, setNewIndicator] = useState<string>('poverty_rate_persons');
  const [newRegion, setNewRegion] = useState<string>('Total 31 aglomerados');
  const [targetGroup, setTargetGroup] = useState<'persons' | 'households'>('persons');

  const getFilteredIndicators = useCallback(() => {
    const baseIndicators = [
      { value: 'poverty_rate_persons', label: 'Pobreza (%)', color: '#dc2626', shortLabel: 'Pobreza' },
      { value: 'indigence_rate_persons', label: 'Indigencia (%)', color: '#f59e0b', shortLabel: 'Indigencia' }
    ];
    
    const householdIndicators = [
      { value: 'poverty_rate_households', label: 'Pobreza (%)', color: '#dc2626', shortLabel: 'Pobreza' },
      { value: 'indigence_rate_households', label: 'Indigencia (%)', color: '#f59e0b', shortLabel: 'Indigencia' }
    ];
    
    return targetGroup === 'persons' ? baseIndicators : householdIndicators;
  }, [targetGroup]);

  const colors = ['#dc2626', '#ea580c', '#f59e0b', '#fbbf24', '#3b82f6', '#8b5cf6', '#10b981', '#f97316'];

  const regions = useMemo(() => [
    { value: 'Total 31 aglomerados', label: 'Total' },
    { value: 'Gran Buenos Aires', label: 'Gran Buenos Aires' },
    { value: 'Cuyo', label: 'Cuyo' },
    { value: 'Noreste', label: 'Noreste' },
    { value: 'Noroeste', label: 'Noroeste' },
    { value: 'Pampeana', label: 'Pampeana' },
    { value: 'Patagonia', label: 'Patagonia' }
  ], []);

  // Removed years filter as requested

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data for all unique regions
        const uniqueRegions = [...new Set(filters.selections.map(s => s.region))];
        const allData: any = {};

        for (const region of uniqueRegions) {
          const params = new URLSearchParams({
            region: region,
            start_date: '2016-01-01',
            end_date: '2024-12-31'
          });

          const response = await fetch(`/api/poverty/series?${params}`);
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          allData[region] = result;
        }

        setData(allData);
      } catch (err) {
        console.error('Error fetching poverty data:', err);
        setError('Error al cargar datos de pobreza');
      } finally {
        setLoading(false);
      }
    };

    // Convert selections when target group changes
    if (filters.selections.length > 0) {
      const needsUpdate = filters.selections.some(selection => {
        const isPersonsIndicator = selection.indicator.includes('_persons');
        const isHouseholdsIndicator = selection.indicator.includes('_households');
        
        return (targetGroup === 'persons' && isHouseholdsIndicator) || 
               (targetGroup === 'households' && isPersonsIndicator);
      });
      
      if (needsUpdate) {
        // Convert existing selections to new target group
        const convertedSelections = filters.selections.map(selection => {
          let newIndicator = selection.indicator;
          if (targetGroup === 'persons') {
            newIndicator = newIndicator.replace('_households', '_persons');
          } else {
            newIndicator = newIndicator.replace('_persons', '_households');
          }
          
          const targetSuffix = targetGroup === 'persons' ? 'Personas' : 'Hogares';
          const indicatorType = newIndicator.includes('poverty') ? 'Pobreza' : 'Indigencia';
          const region = regions.find(r => r.value === selection.region);
          
          return {
            ...selection,
            indicator: newIndicator,
            label: `${indicatorType} ${targetSuffix} - ${region?.label || selection.region}`
          };
        });
        
        setFilters({ selections: convertedSelections });
        
        // Also update the newIndicator to match the new target group
        const currentFilteredIndicators = getFilteredIndicators();
        if (!currentFilteredIndicators.find(i => i.value === newIndicator)) {
          setNewIndicator(currentFilteredIndicators[0]?.value || 'poverty_rate_persons');
        }
        return;
      }
    }
    
    // Ensure newIndicator is valid for current target group
    const currentFilteredIndicators = getFilteredIndicators();
    if (!currentFilteredIndicators.find(i => i.value === newIndicator)) {
      setNewIndicator(currentFilteredIndicators[0]?.value || 'poverty_rate_persons');
    }
    
    fetchData();
  }, [filters, targetGroup, getFilteredIndicators, newIndicator, regions]);

  const addSelection = () => {
    if (filters.selections.length >= 4) {
      return; // Max 4 selections
    }

    const indicator = getFilteredIndicators().find(i => i.value === newIndicator);
    const region = regions.find(r => r.value === newRegion);
    
    if (!indicator || !region) return;

    // Check if this combination already exists
    const exists = filters.selections.some(s => s.indicator === newIndicator && s.region === newRegion);
    if (exists) return;

    const targetSuffix = targetGroup === 'persons' ? 'Personas' : 'Hogares';
    const newSelection: ChartSelection = {
      id: Date.now().toString(),
      indicator: newIndicator,
      region: newRegion,
      label: `${indicator.shortLabel} ${targetSuffix} - ${region.label}`,
      color: colors[filters.selections.length % colors.length]
    };

    setFilters(prev => ({
      selections: [...prev.selections, newSelection]
    }));
  };

  const removeSelection = (id: string) => {
    setFilters(prev => ({
      selections: prev.selections.filter(s => s.id !== id)
    }));
  };

  const downloadCSV = () => {
    if (!data || Object.keys(data).length === 0) return;

    // Get all data points from all regions
    const allDataPoints: any[] = [];
    Object.entries(data).forEach(([region, regionData]: [string, any]) => {
      if (regionData?.data) {
        regionData.data.forEach((item: any) => {
          allDataPoints.push({
            region,
            period: item.period,
            date: item.date,
            poverty_rate_persons: item.poverty_rate_persons,
            poverty_rate_households: item.poverty_rate_households,
            indigence_rate_persons: item.indigence_rate_persons,
            indigence_rate_households: item.indigence_rate_households
          });
        });
      }
    });

    const csvContent = [
      ['Región', 'Período', 'Fecha', 'Pobreza Personas (%)', 'Pobreza Hogares (%)', 'Indigencia Personas (%)', 'Indigencia Hogares (%)'].join(','),
      ...allDataPoints.map((item: any) => [
        item.region,
        item.period,
        item.date,
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
    link.setAttribute('download', `pobreza_comparacion_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const prepareChartData = () => {
    if (!data || Object.keys(data).length === 0) return [];

    // Get all unique periods from all regions
    const allPeriods = new Set<string>();
    Object.values(data).forEach((regionData: any) => {
      if (regionData?.data) {
        regionData.data.forEach((item: any) => {
          allPeriods.add(item.period);
        });
      }
    });

    // Create chart data structure - sort periods chronologically
    const sortedPeriods = Array.from(allPeriods).sort((a, b) => {
      // Extract semester and year from period (e.g., "S1 2020")
      const [semA, yearA] = a.split(' ');
      const [semB, yearB] = b.split(' ');
      
      // First compare by year
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }
      // Then by semester within the same year
      return parseInt(semA.charAt(1)) - parseInt(semB.charAt(1));
    });
    
    const chartData = sortedPeriods.map(period => {
      const dataPoint: any = { period, date: '' };
      
      // Add data for each selection
      filters.selections.forEach(selection => {
        const regionData = data[selection.region];
        if (regionData?.data) {
          const periodData = regionData.data.find((item: any) => item.period === period);
          if (periodData) {
            dataPoint[selection.id] = periodData[selection.indicator];
            if (!dataPoint.date) {
              dataPoint.date = periodData.date;
            }
          }
        }
      });
      
      return dataPoint;
    });

    return chartData;
  };

  // Removed getSelectedIndicatorData as we now use multiple selections

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const selection = filters.selections.find(s => s.id === entry.dataKey);
            if (!selection || entry.value === null || entry.value === undefined) return null;
            
            return (
              <div key={index} className="flex items-center gap-2 my-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selection.color }}
                />
                <span className="text-sm text-gray-600">
                  {selection.label}:
                </span>
                <span className="font-medium">
                  {entry.value?.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    return `${value}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="group relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-red-400/10 rounded-none md:rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
      <div className="relative bg-white rounded-none md:rounded-2xl shadow-lg border-0 md:border border-red-100 overflow-hidden -mx-4 md:mx-0">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            
            <button
              onClick={downloadCSV}
              disabled={loading || !data}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Descargar CSV
            </button>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="p-4 md:p-4 bg-gray-50 border-b border-gray-100">
          {/* Compact layout - everything in one or two lines */}
          <div className="space-y-3">
            {/* First row: Target Group and Add New Selection */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Target Group Radio - more compact */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Población:
                </label>
                <RadioGroup 
                  value={targetGroup} 
                  onValueChange={(value: 'persons' | 'households') => setTargetGroup(value)}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="persons" id="persons" />
                    <Label htmlFor="persons" className="text-sm cursor-pointer">Personas</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="households" id="households" />
                    <Label htmlFor="households" className="text-sm cursor-pointer">Hogares</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Add New Selection - desktop inline */}
              {filters.selections.length < 4 && (
                <div className="hidden md:flex md:items-center md:gap-2">
                  <Select value={newIndicator} onValueChange={setNewIndicator}>
                    <SelectTrigger className="w-40 text-sm h-8">
                      <SelectValue placeholder="Indicador" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredIndicators().map(indicator => (
                        <SelectItem key={indicator.value} value={indicator.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: indicator.color }}
                            />
                            {indicator.shortLabel}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={newRegion} onValueChange={setNewRegion}>
                    <SelectTrigger className="w-36 text-sm h-8">
                      <SelectValue placeholder="Región" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={addSelection} 
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700 active:bg-red-800 h-8 px-3 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
                    disabled={filters.selections.some(s => s.indicator === newIndicator && s.region === newRegion)}
                  >
                    <Plus className="h-3 w-3 mr-1 transition-transform group-hover:rotate-90" />
                    Agregar
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Add New Selection */}
            {filters.selections.length < 4 && (
              <div className="md:hidden">
                <div className="flex gap-1 text-xs">
                  <Select value={newIndicator} onValueChange={setNewIndicator}>
                    <SelectTrigger className="flex-1 text-xs h-7 px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredIndicators().map(indicator => (
                        <SelectItem key={indicator.value} value={indicator.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: indicator.color }}
                            />
                            {indicator.shortLabel}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={newRegion} onValueChange={setNewRegion}>
                    <SelectTrigger className="flex-1 text-xs h-7 px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={addSelection} 
                  className="bg-red-600 hover:bg-red-700 active:bg-red-800 w-full mt-2 h-9 text-sm font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
                  disabled={filters.selections.some(s => s.indicator === newIndicator && s.region === newRegion)}
                >
                  <Plus className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" />
                  Agregar
                </Button>
              </div>
            )}

            {/* Current Selections - compact badges */}
            {filters.selections.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.selections.map((selection) => (
                  <Badge key={selection.id} variant="secondary" className="flex items-center gap-1 px-2 py-1 text-xs h-6 bg-gray-100 hover:bg-gray-200 transition-colors">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: selection.color }}
                    />
                    <span className="font-semibold truncate max-w-[100px] md:max-w-[140px] text-gray-800">{selection.label}</span>
                    <button
                      onClick={() => removeSelection(selection.id)}
                      className="text-gray-600 hover:text-red-600 flex-shrink-0 transition-colors p-0.5 rounded hover:bg-red-50"
                      aria-label={`Remover ${selection.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {filters.selections.length >= 4 && (
              <div className="text-xs text-gray-500">
                Máximo 4 combinaciones permitidas
              </div>
            )}
          </div>
        </div>

        {/* Chart Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">
                <TrendingUp className="h-12 w-12 mx-auto opacity-50" />
              </div>
              <p className="text-red-600 font-medium">Error al cargar datos</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
          ) : data && Object.keys(data).length > 0 && prepareChartData().length > 0 ? (
            <div 
              style={{ height: `${height}px` }} 
              className="w-full max-h-[60vh] md:max-h-none"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={prepareChartData()}
                  margin={{ top: 10, right: 8, left: 8, bottom: 60 }}
                >
                  {/* Gradients for areas */}
                  <defs>
                    {filters.selections.map((selection) => (
                      <linearGradient
                        key={`gradient-${selection.id}`}
                        id={`gradient-${selection.id}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={selection.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={selection.color} stopOpacity={0.05} />
                      </linearGradient>
                    ))}
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    stroke="#6b7280"
                    tick={{ fontSize: 10 }}
                    interval={1}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    className="text-xs"
                  />
                  <YAxis 
                    tickFormatter={formatYAxis}
                    stroke="#6b7280"
                    tick={{ fontSize: 10 }}
                    orientation="right"
                    width={32}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    iconType="line"
                  />
                  
                  {/* Areas for each selection */}
                  {filters.selections.map((selection) => (
                    <Area
                      key={selection.id}
                      type="monotone"
                      dataKey={selection.id}
                      name={selection.label}
                      stroke={selection.color}
                      strokeWidth={2}
                      fill={`url(#gradient-${selection.id})`}
                      fillOpacity={1}
                      dot={{ fill: selection.color, strokeWidth: 2, r: 3, stroke: '#fff' }}
                      activeDot={{ r: 5, stroke: selection.color, strokeWidth: 2, fill: '#fff' }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <TrendingUp className="h-12 w-12 mx-auto opacity-50" />
              </div>
              <p className="text-gray-600 font-medium">No hay datos disponibles</p>
              <p className="text-sm text-gray-500 mt-1">Prueba con otros filtros</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex flex-wrap items-center gap-4">
            <span>Selecciones activas: {filters.selections.length}/4</span>
            <span>Período: 2016 - 2024</span>
            <span>Fuente: INDEC</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PovertyEnhancedChart;