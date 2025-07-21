// src/app/ipc/layout.tsx
import { Metadata } from 'next';
import { ipcMetadata } from '@/lib/metadata';
import { createIndicatorPageSchema, createBreadcrumbSchema } from '@/lib/structured-data-helpers';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = ipcMetadata;

export default function IPCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbs = [
    { name: "Inicio", url: "https://argenstats.com" },
    { name: "Indicadores", url: "https://argenstats.com/indicadores" },
    { name: "IPC", url: "https://argenstats.com/indicadores/ipc" }
  ];

  const ipcSchema = createIndicatorPageSchema(
    "Índice de Precios al Consumidor (IPC)",
    "Mide la evolución de los precios de los bienes y servicios que consumen los hogares en Argentina",
    "https://argenstats.com/indicadores/ipc",
    new Date().toISOString()
  );

  return (
    <>
      <StructuredData data={ipcSchema} />
      <StructuredData data={createBreadcrumbSchema(breadcrumbs)} />
      {children}
    </>
  );
}