// src/app/dashboard/components/DashboardHeader.tsx
import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description: string;
  lastUpdateDate?: string;
}

export default function DashboardHeader({ title, description, lastUpdateDate }: DashboardHeaderProps) {
  // Función para formatear fechas
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No disponible";
    
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} de ${year}`;
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-indec-blue-dark">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        
        {lastUpdateDate && (
          <div className="text-right mt-2 md:mt-0">
            <p className="text-sm text-gray-600">Última actualización</p>
            <p className="font-medium text-indec-blue-dark">{formatDate(lastUpdateDate)}</p>
          </div>
        )}
      </div>
      
      <div className="h-1 w-20 bg-indec-blue mt-4"></div>
    </div>
  );
}