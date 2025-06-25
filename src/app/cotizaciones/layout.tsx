// src/app/cotizaciones/layout.tsx
import { Metadata } from 'next';
import { dollarMetadata } from '@/lib/metadata';

export const metadata: Metadata = dollarMetadata;

export default function CotizacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}