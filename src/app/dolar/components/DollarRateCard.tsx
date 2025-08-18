// src/app/dolar/components/DollarRateCard.tsx (Server Component)
import { DollarSign, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface DollarRateCardProps {
  title: string;
  data: {
    buy_price?: number;
    sell_price: number;
    sell_variation?: number;
    minutes_ago?: number;
  } | null;
}

function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return "N/A";
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatTimeAgo(minutes: number): string {
  if (minutes < 1) return 'Hace menos de 1 minuto';
  if (minutes === 1) return 'Hace 1 minuto';
  if (minutes < 60) return `Hace ${minutes} minutos`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'Hace 1 hora';
  if (hours < 24) return `Hace ${hours} horas`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;

  return 'Hace más de una semana';
}

function getVariationIcon(variation: number) {
  if (variation > 0) return <ArrowUpRight className="h-4 w-4" />;
  if (variation < 0) return <ArrowDownRight className="h-4 w-4" />;
  return null;
}

function getVariationColor(variation: number) {
  if (variation > 0) return "text-red-600";
  if (variation < 0) return "text-green-600";
  return "text-gray-600";
}

export default function DollarRateCard({ title, data }: DollarRateCardProps) {
  if (!data) {
    return (
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-400 rounded-2xl blur opacity-25"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-lg min-h-[320px] flex flex-col">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[320px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
              ${formatCurrency(data.sell_price)}
            </div>
            <div className="text-sm text-gray-500">venta</div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <div className="text-sm text-gray-600 space-y-2 flex-grow">
          {data.buy_price !== undefined && data.buy_price !== null && (
            <div className="flex justify-between">
              <span>Compra:</span>
              <span className="font-medium">${formatCurrency(data.buy_price)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Venta:</span>
            <span className="font-medium">${formatCurrency(data.sell_price)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Variación:</span>
            <span className={`font-medium flex items-center ${getVariationColor(data.sell_variation || 0)}`}>
              {getVariationIcon(data.sell_variation || 0)}
              {Math.abs(data.sell_variation || 0).toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-green-100">
          <div className="flex items-center text-xs text-green-700">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <Clock className="h-3 w-3 mr-1" />
            {formatTimeAgo(data.minutes_ago || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}