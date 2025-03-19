'use client';

import React from 'react';
import HeroSection from '@/components/HeroSection';
import DollarRatesCard from '@/components/DollarRatesCard';
import EnhancedDollarChart from '@/components/EnhancedDollarChart';

export default function CotizacionesPage() {
  return (
    <div className="relative min-h-screen">
      <HeroSection 
        title="Cotizaciones de Dólar" 
        subtitle="Seguimiento de los principales tipos de cambio en Argentina"
      />

             
         {/* Patrón de puntos sutiles */}
         <div 
          className="absolute inset-0 opacity-[0.85] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        {/* Sección: Cotizaciones actuales */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Cotizaciones actuales</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <DollarRatesCard 
              title="Dólares Financieros"
              description="Cotizaciones actualizadas de dólares financieros"
              showTypes={['MEP', 'CCL', 'CRYPTO']}
              className="flex flex-col justify-between"
            />
            
            <DollarRatesCard 
              title="Dólares de Referencia"
              description="Cotizaciones actualizadas de dólares de referencia"
              showTypes={['BLUE', 'OFICIAL', 'MAYORISTA', 'TARJETA']}
            />
          </div>
        </div>
        
        {/* Sección: Análisis histórico con gráfico interactivo */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Análisis histórico</h2>
          <EnhancedDollarChart 
            title="Evolución de cotizaciones"
            description="Selecciona el rango de tiempo y los tipos de dólar para visualizar"
            height={450}
            darkMode={false}
          />
        </div>
        
        {/* Sección: Información adicional */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-indec-blue-dark mb-6">Información sobre los tipos de dólar</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-indec-blue-dark mb-3">Dólares Financieros</h3>
              <ul className="space-y-4">
                <li>
                  <h4 className="font-medium">Dólar MEP (Bolsa)</h4>
                  <p className="text-indec-gray-dark text-sm mt-1">Es el que se obtiene mediante la compra-venta de bonos o acciones que cotizan tanto en pesos como en dólares, permitiendo adquirir dólares de forma legal a través del mercado bursátil.</p>
                </li>
                <li>
                  <h4 className="font-medium">Contado con Liquidación (CCL)</h4>
                  <p className="text-indec-gray-dark text-sm mt-1">Similar al MEP, pero permite transferir dólares al exterior. Se obtiene mediante la compra de activos en pesos que también cotizan en mercados internacionales.</p>
                </li>
                <li>
                  <h4 className="font-medium">Dólar Cripto</h4>
                  <p className="text-indec-gray-dark text-sm mt-1">Cotización implícita que surge de la compra-venta de criptomonedas estables (stablecoins) como USDT o DAI a través de exchanges o plataformas P2P.</p>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-indec-blue-dark mb-3">Dólares de Referencia</h3>
              <ul className="space-y-4">
                <li>
                  <h4 className="font-medium">Dólar Oficial</h4>
                  <p className="text-indec-gray-dark text-sm mt-1">Cotización regulada por el Banco Central de la República Argentina (BCRA) para operaciones en bancos y casas de cambio oficiales.</p>
                </li>
                <li>
                  <h4 className="font-medium">Dólar Blue</h4>
                  <p className="text-indec-gray-dark text-sm mt-1">Cotización que surge del mercado informal o paralelo, no regulado oficialmente pero ampliamente utilizado como referencia.</p>
                </li>
                <li>
                  <h4 className="font-medium">Dólar Mayorista</h4>
                  <p className="text-indec-gray-dark text-sm mt-1">Utilizado principalmente para operaciones de comercio exterior y entre entidades financieras. Es la referencia para importaciones y exportaciones.</p>
                </li>
                <li>
                  <h4 className="font-medium">Dólar Tarjeta</h4>
                  <p className="text-indec-gray-dark text-sm mt-1">Cotización aplicada a las compras realizadas en el exterior con tarjetas de crédito o débito, que incluye impuestos adicionales como el PAIS y percepciones a cuenta de Ganancias/Bienes Personales.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-indec-gray-dark text-center mt-8">
          <p>Fuente: API Argentina Datos</p>
          <p className="mt-1">Las cotizaciones se actualizan de forma automática durante los días hábiles</p>
        </div>
      </div>
    </div>
  );
}