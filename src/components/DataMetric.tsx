import React from 'react';
import { cn } from "@/lib/utils";

interface DataMetricProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string | number;
  className?: string;
}

export default function DataMetric({ 
  label, 
  value, 
  trend, 
  trendValue,
  className 
}: DataMetricProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-indec-gray-dark text-sm mb-1">{label}</p>
      <div className="flex items-baseline">
        <span className="text-2xl md:text-3xl font-mono font-semibold text-indec-blue">{value.toString().replace('.', ',')}</span>
        
        {trend && (
          <div className={cn(
            "flex items-center ml-2 text-sm font-medium",
            trend === "up" ? "text-indec-green" : 
            trend === "down" ? "text-indec-red" : 
            "text-indec-gray-dark"
          )}>
            {trend === "up" && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
              </svg>
            )}
            {trend === "down" && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
              </svg>
            )}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}