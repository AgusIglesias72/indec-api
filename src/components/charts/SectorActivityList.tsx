import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppData } from '@/lib/DataProvider';

const SectorActivityList = () => {
  const { sectorData, loadingSectors: sectorLoading, errorSectors: sectorError } = useAppData();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-indec-blue-dark">Variación interanual por sector</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Encabezados de la tabla */}
        <div className="flex justify-between items-center p-2 border-b border-indec-gray-medium/50 mb-2">
          <span className="text-indec-blue-dark font-medium text-sm">Actividad</span>
          <span className="text-indec-blue-dark font-medium text-sm mr-3">Var. i/a</span>
        </div>

        {sectorLoading ? (
          <div className="space-y-3">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="h-12 bg-indec-gray-light/50 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : sectorError ? (
          <div className="p-4 text-center text-indec-red">
            Error al cargar datos sectoriales
          </div>
        ) : (
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {sectorData?.map((sector, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-3 hover:bg-indec-gray-light rounded-md transition-colors border border-indec-gray-medium/30"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-1.5 h-8 rounded-sm ${
                    sector.year_over_year_change > 0 ? 'bg-indec-green' : 'bg-indec-red'
                  }`}></div>
                  <span className="text-indec-gray-dark font-medium truncate">{sector.sector_name}</span>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <span className={`font-mono font-medium ${
                    sector.year_over_year_change > 0 ? 'text-indec-green' : 'text-indec-red'
                  }`}>
                    {`${sector.year_over_year_change > 0 ? '+' : ''}${sector.year_over_year_change.toFixed(1).replace('.', ',')}%`}
                  </span>
                  {sector.year_over_year_change > 0 ? (
                    <ArrowUp className="h-4 w-4 text-indec-green" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-indec-red" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SectorActivityList;