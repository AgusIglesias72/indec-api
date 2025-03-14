import React from 'react';
import { CalendarRange } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interfaces
export interface DateRange {
  startYear: string;
  startMonth: string;
  endYear: string;
  endMonth: string;
}

interface DateRangeFilterProps {
  dateRange: DateRange;
  onChange: (newRange: DateRange) => void;
  className?: string;
}

/**
 * Componente para filtrar por rango de fechas (mes-año)
 */
export default function DateRangeFilter({ dateRange, onChange, className = '' }: DateRangeFilterProps) {
  // Generar array de años desde 2004 al actual
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2003 }, (_, i) => (currentYear - i).toString());
  
  // Array de meses
  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  // Manejadores de cambio
  const handleStartMonthChange = (value: string) => {
    onChange({ ...dateRange, startMonth: value });
  };

  const handleStartYearChange = (value: string) => {
    onChange({ ...dateRange, startYear: value });
  };

  const handleEndMonthChange = (value: string) => {
    onChange({ ...dateRange, endMonth: value });
  };

  const handleEndYearChange = (value: string) => {
    onChange({ ...dateRange, endYear: value });
  };

  return (
    <div className={`inline-flex items-center border rounded-md p-1 bg-indec-gray-light/20 ${className}`}>
      <div className="flex items-center gap-1 px-2">
        <CalendarRange className="h-4 w-4 text-indec-gray-dark" />
        <span className="text-sm text-indec-gray-dark">Rango:</span>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-sm text-indec-gray-dark px-1">Desde</span>
        <div className="flex items-center">
          <Select value={dateRange.startMonth} onValueChange={handleStartMonthChange}>
            <SelectTrigger className="h-8 w-32 sm:w-28 text-xs border-0 focus:ring-0">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange.startYear} onValueChange={handleStartYearChange}>
            <SelectTrigger className="h-8 w-24 sm:w-20 text-xs border-0 focus:ring-0">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-sm text-indec-gray-dark px-1">Hasta</span>
        <div className="flex items-center">
          <Select value={dateRange.endMonth} onValueChange={handleEndMonthChange}>
            <SelectTrigger className="h-8 w-32 sm:w-28 text-xs border-0 focus:ring-0">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange.endYear} onValueChange={handleEndYearChange}>
            <SelectTrigger className="h-8 w-24 sm:w-20 text-xs border-0 focus:ring-0">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}