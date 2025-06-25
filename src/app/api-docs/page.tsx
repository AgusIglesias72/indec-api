'use client';

import { useState } from 'react';
import { apiGroups } from '@/data/api-endpoints';
import PageHeader from '@/components/APIDocs/PageHeader';
import ApiGeneralInfo from '@/components/APIDocs/ApiGeneralInfo';
import ApiTabs from '@/components/APIDocs/ApiTabs';
import { Metadata } from 'next';
import { apiDocsMetadata } from '@/lib/metadata';

export const metadata: Metadata = apiDocsMetadata;

export default function ApiDocsPage() {
  const [baseUrl, setBaseUrl] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.econovista.gov.ar/v1');

  return (
    <div className="relative">
       <div 
          className="absolute inset-0 opacity-[0.85] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      
      <PageHeader 
        title="Documentación de API" 
        description="Guía completa para utilizar nuestras APIs de datos económicos y estadísticos"
      />
       
      
      <ApiGeneralInfo baseUrl={baseUrl} />
      
      <ApiTabs 
        baseUrl={baseUrl} 
        apiGroups={apiGroups} 
        defaultTab="calendar"
      />
    </div>
    </div>
  );
}