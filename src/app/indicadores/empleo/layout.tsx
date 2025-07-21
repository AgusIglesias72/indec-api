
// src/app/indicadores/empleo/layout.tsx
import { Metadata } from 'next';
import { empleoMetadata } from '@/lib/metadata';
import { createIndicatorPageSchema, createBreadcrumbSchema } from '@/lib/structured-data-helpers';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = empleoMetadata;

export default function EmpleoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbs = [
    { name: "Inicio", url: "https://argenstats.com" },
    { name: "Indicadores", url: "https://argenstats.com/indicadores" },
    { name: "Empleo", url: "https://argenstats.com/indicadores/empleo" }
  ];

  const empleoSchema = createIndicatorPageSchema(
    "Mercado de Trabajo",
    "Estadísticas de empleo, desempleo y actividad económica por región y demografía en Argentina",
    "https://argenstats.com/indicadores/empleo",
    new Date().toISOString()
  );

  return (
    <>
      <StructuredData data={empleoSchema} />
      <StructuredData data={createBreadcrumbSchema(breadcrumbs)} />
      {children}
    </>
  );
}