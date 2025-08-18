// src/app/indicadores/ipc/components/IPCMetricsGrid.tsx (Server Component)
import { TrendingUp } from 'lucide-react';
import MetricCard from '@/components/server/MetricCard';

interface IPCMetricsGridProps {
  data: {
    monthly_pct_change?: number;
    yearly_pct_change?: number;
    accumulated_pct_change?: number;
    date?: string;
  } | null;
}

function formatPercentage(value: number | undefined): string {
  if (value === undefined || value === null) return "N/A";
  return `${value.toFixed(1)}%`;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  return `${month} ${year}`;
}

export default function IPCMetricsGrid({ data }: IPCMetricsGridProps) {
  const items = [
    {
      label: "Interanual",
      value: formatPercentage(data?.yearly_pct_change),
      trend: 'up' as const
    },
    {
      label: "Acumulada", 
      value: formatPercentage(data?.accumulated_pct_change),
      trend: 'up' as const
    }
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-10 mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Main IPC Card */}
        <div className="sm:col-span-2 lg:col-span-1">
          <MetricCard
            title="Inflación (IPC)"
            mainValue={formatPercentage(data?.monthly_pct_change)}
            mainLabel="mensual"
            items={items}
            icon={TrendingUp}
            colorScheme="purple"
            isLoading={!data}
          />
        </div>

        {/* Latest Data Info */}
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Último período</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Período:</span>
                <span className="font-semibold text-gray-900">{formatDate(data?.date)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Variación mensual:</span>
                <span className="font-semibold text-purple-700">
                  {formatPercentage(data?.monthly_pct_change)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Variación interanual:</span>
                <span className="font-semibold text-purple-700">
                  {formatPercentage(data?.yearly_pct_change)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Acumulada en el año:</span>
                <span className="font-semibold text-purple-700">
                  {formatPercentage(data?.accumulated_pct_change)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-100">
              <div className="flex items-center text-xs text-purple-700">
                <div className="h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></div>
                Fuente: INDEC
              </div>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg h-full flex flex-col justify-center">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm mb-3">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                Actualizado
              </div>
              <p className="text-purple-800 text-sm">
                Datos oficiales del INDEC actualizados automáticamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}