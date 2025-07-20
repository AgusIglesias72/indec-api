// src/app/dolar/layout.tsx
import { Metadata } from 'next';
import { dollarMetadata } from '@/lib/metadata';
import { createDollarPageSchema, createBreadcrumbSchema } from '@/lib/structured-data-helpers';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = dollarMetadata;

export default function CotizacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbs = [
    { name: "Inicio", url: "https://argenstats.com" },
    { name: "Cotizaciones", url: "https://argenstats.com/dolar" }
  ];

  return (
    <>
      <StructuredData data={createDollarPageSchema()} />
      <StructuredData data={createBreadcrumbSchema(breadcrumbs)} />
      {children}
    </>
  );
}