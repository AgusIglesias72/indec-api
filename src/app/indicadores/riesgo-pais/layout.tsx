// src/app/riesgo-pais/layout.tsx
import { Metadata } from 'next';
import { riesgoPaisMetadata } from '@/lib/metadata';
import { createIndicatorPageSchema, createBreadcrumbSchema } from '@/lib/structured-data-helpers';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = riesgoPaisMetadata;

export default function RiskCountryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbs = [
    { name: "Inicio", url: "https://argenstats.com" },
    { name: "Indicadores", url: "https://argenstats.com/indicadores" },
    { name: "Riesgo País", url: "https://argenstats.com/indicadores/riesgo-pais" }
  ];

  const riesgoSchema = createIndicatorPageSchema(
    "Riesgo País (EMBI+)",
    "Índice que mide el riesgo crediticio de Argentina según bonos soberanos en mercados internacionales",
    "https://argenstats.com/indicadores/riesgo-pais",
    new Date().toISOString()
  );

  return (
    <>
      <StructuredData data={riesgoSchema} />
      <StructuredData data={createBreadcrumbSchema(breadcrumbs)} />
      {children}
    </>
  );
}