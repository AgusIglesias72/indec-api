// src/app/riesgo-pais/layout.tsx
import { Metadata } from 'next';
import { riesgoPaisMetadata } from '@/lib/metadata';

export const metadata: Metadata = riesgoPaisMetadata;

export default function RiskCountryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}