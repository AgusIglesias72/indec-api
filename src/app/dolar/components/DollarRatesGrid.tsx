// src/app/dolar/components/DollarRatesGrid.tsx (Server Component)
import DollarRateCard from './DollarRateCard';

interface DollarRatesGridProps {
  rates: Record<string, any>;
}

const dollarTypesConfig = [
  { type: 'OFICIAL', name: 'Dólar Oficial' },
  { type: 'BLUE', name: 'Dólar Blue' },
  { type: 'MEP', name: 'Dólar MEP' },
  { type: 'CCL', name: 'Contado con Liqui' },
  { type: 'MAYORISTA', name: 'Dólar Mayorista' },
  { type: 'CRYPTO', name: 'Dólar Cripto' },
  { type: 'TARJETA', name: 'Dólar Tarjeta' }
];

export default function DollarRatesGrid({ rates }: DollarRatesGridProps) {
  return (
    <div className="container mx-auto px-4 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-12">
        {dollarTypesConfig.map((dollarType) => (
          <DollarRateCard
            key={dollarType.type}
            title={dollarType.name}
            data={rates[dollarType.type] || null}
          />
        ))}
      </div>
      
      {/* Status indicator */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          Datos actualizados en tiempo real
        </div>
      </div>
    </div>
  );
}