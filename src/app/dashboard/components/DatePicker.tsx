// src/app/dashboard/components/DatePicker.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha",
  label,
  className,
  fromYear = 2004,
  toYear = new Date().getFullYear()
}: DatePickerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"days" | "months" | "years">("months");
  const [selectedYear, setSelectedYear] = useState<number>(date?.getFullYear() || new Date().getFullYear());

  // Formatear la fecha para mostrar en el botón
  const formatDateForDisplay = (date: Date | undefined) => {
    if (!date) return placeholder;
    
    // Formatear como "Mes YYYY" (ej. "Noviembre 2022")
    const month = date.toLocaleString('es', { month: 'long' });
    const year = date.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  // Generar array de años disponibles
  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i).reverse();
  
  // Generar array de meses
  const months = [
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' }
  ];

  // Manejar selección de año
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setCurrentView("months");
  };

  // Manejar selección de mes
  const handleMonthSelect = (month: number) => {
    const newDate = new Date(selectedYear, month, 1);
    onDateChange(newDate);
    setCalendarOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateForDisplay(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {currentView === "years" && (
            <div className="p-2">
              <div className="flex justify-between items-center mb-2 px-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentView("months")}
                >
                  Volver a meses
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 p-2">
                {years.map(year => (
                  <Button
                    key={year}
                    variant="ghost"
                    className={cn(
                      "h-9 w-full rounded-md p-0",
                      selectedYear === year && "bg-indec-blue text-white"
                    )}
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {currentView === "months" && (
            <div className="p-2">
              <div className="flex justify-between items-center mb-2 px-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("years")}
                >
                  {selectedYear} ▾
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 p-2">
                {months.map(month => {
                  const isSelected = date && date.getMonth() === month.value && date.getFullYear() === selectedYear;
                  return (
                    <Button
                      key={month.value}
                      variant="ghost"
                      className={cn(
                        "h-9 w-full rounded-md p-0",
                        isSelected && "bg-indec-blue text-white"
                      )}
                      onClick={() => handleMonthSelect(month.value)}
                    >
                      {month.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}