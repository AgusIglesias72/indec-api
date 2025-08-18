// src/app/dolar/components/InteractiveFeatures.tsx (Client Component)
'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface InteractiveFeaturesProps {
  onRefresh?: () => void;
}

export default function InteractiveFeatures({ onRefresh }: InteractiveFeaturesProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      if (onRefresh) {
        onRefresh();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleManualRefresh}
        disabled={isRefreshing}
        className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        title="Actualizar cotizaciones"
      >
        <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}