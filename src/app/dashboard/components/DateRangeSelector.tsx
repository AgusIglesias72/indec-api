// src/app/dashboard/components/DateRangeSelector.tsx
import React from 'react';
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./DatePicker";

interface DateRangeSelectorProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onExportData?: () => void;
  fromYear?: number;
  toYear?: number;
}

export default function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onExportData,
  fromYear = 2004,
  toYear = new Date().getFullYear()
}: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <p className="text-sm font-medium mb-1">Desde</p>
          <DatePicker
            date={startDate}
            onDateChange={onStartDateChange}
            placeholder="Fecha inicial"
            fromYear={fromYear}
            toYear={toYear}
            className="w-[180px]"
          />
        </div>
        
        <div>
          <p className="text-sm font-medium mb-1">Hasta</p>
          <DatePicker
            date={endDate}
            onDateChange={onEndDateChange}
            placeholder="Fecha final"
            fromYear={fromYear}
            toYear={toYear}
            className="w-[180px]"
          />
        </div>
      </div>
      
      {onExportData && (
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={onExportData}
          disabled={!startDate || !endDate}
        >
          <Download className="h-4 w-4" />
          <span>Exportar datos</span>
        </Button>
      )}
    </div>
  );
}