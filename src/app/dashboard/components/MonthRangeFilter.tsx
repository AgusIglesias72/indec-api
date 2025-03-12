// src/app/dashboard/components/MonthRangeFilter.tsx
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface MonthRangeFilterProps {
  dateRange: {
    startMonth: number;
    startYear: number;
    endMonth: number;
    endYear: number;
  };
  onChange: (newRange: {
    startMonth: number;
    startYear: number;
    endMonth: number;
    endYear: number;
  }) => void;
}

export default function MonthRangeFilter({ dateRange, onChange }: MonthRangeFilterProps) {
  // Estado temporal para guardar los cambios antes de aplicarlos
  const [tempRange, setTempRange] = React.useState(dateRange);

  // Genera un array de años para los selectores
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => currentYear - 20 + i);
  };

  // Genera un array de meses para los selectores
  const monthOptions = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  // Actualizar el estado temporal cuando cambie el rango
  React.useEffect(() => {
    setTempRange(dateRange);
  }, [dateRange]);

  // Manejar cambios en los filtros
  const handleRangeChange = (field: keyof typeof tempRange, value: number) => {
    setTempRange(prev => ({ ...prev, [field]: value }));
  };

  // Aplicar los cambios
  const applyFilter = () => {
    // Validar que el rango tenga sentido (fecha de inicio antes que la de fin)
    if (
      tempRange.startYear > tempRange.endYear || 
      (tempRange.startYear === tempRange.endYear && tempRange.startMonth > tempRange.endMonth)
    ) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }
    
    onChange(tempRange);
  };

  // Función para generar selectores de mes y año
  const renderDatePicker = (
    typeLabel: string,
    monthField: 'startMonth' | 'endMonth',
    yearField: 'startYear' | 'endYear'
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{typeLabel}</label>
      <div className="flex gap-2">
        <Select
          value={tempRange[monthField].toString()}
          onValueChange={(value) => handleRangeChange(monthField, parseInt(value))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={tempRange[yearField].toString()}
          onValueChange={(value) => handleRangeChange(yearField, parseInt(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            {getYearOptions().map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="flex flex-wrap items-end gap-4">
      {renderDatePicker('Desde', 'startMonth', 'startYear')}
      {renderDatePicker('Hasta', 'endMonth', 'endYear')}
      
      <Button 
        onClick={applyFilter} 
        className="flex items-center gap-1 bg-indec-blue hover:bg-indec-blue-dark"
      >
        <Filter className="h-4 w-4" />
        <span>Aplicar filtro</span>
      </Button>
    </div>
  );
}