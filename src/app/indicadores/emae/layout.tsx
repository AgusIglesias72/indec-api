// src/app/emae/layout.tsx
import { Metadata } from 'next';
import { emaeMetadata } from '@/lib/metadata';
import { createIndicatorPageSchema, createBreadcrumbSchema } from '@/lib/structured-data-helpers';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = emaeMetadata;

export default function EMAELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbs = [
    { name: "Inicio", url: "https://argenstats.com" },
    { name: "Indicadores", url: "https://argenstats.com/indicadores" },
    { name: "EMAE", url: "https://argenstats.com/indicadores/emae" }
  ];

  const emaeSchema = createIndicatorPageSchema(
    "Estimador Mensual de Actividad Económica (EMAE)",
    "Indicador que refleja la evolución mensual del nivel de actividad de los sectores productivos de la economía argentina",
    "https://argenstats.com/indicadores/emae",
    new Date().toISOString()
  );

  return (
    <>
      <StructuredData data={emaeSchema} />
      <StructuredData data={createBreadcrumbSchema(breadcrumbs)} />
      {children}
    </>
  );
}