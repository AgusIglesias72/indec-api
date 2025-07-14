
// 2. CREAR /src/app/indicadores/empleo/layout.tsx
import { Metadata } from 'next';
import { empleoMetadata } from '@/lib/metadata';

export const metadata: Metadata = empleoMetadata;

export default function EmpleoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}