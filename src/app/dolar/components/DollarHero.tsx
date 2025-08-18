// src/app/dolar/components/DollarHero.tsx (Server Component)
import { DollarSign } from 'lucide-react';

interface DollarHeroProps {
  title: string;
  subtitle: string;
}

export default function DollarHero({ title, subtitle }: DollarHeroProps) {
  return (
    <div className="relative bg-gradient-to-br from-green-50 to-green-100 py-16 mb-8">
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </div>
  );
}