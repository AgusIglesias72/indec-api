// src/app/documentacion/layout.tsx
import { Metadata } from 'next';
import { apiDocsMetadata } from '@/lib/metadata';

export const metadata: Metadata = apiDocsMetadata;

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}