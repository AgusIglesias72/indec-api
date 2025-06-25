// src/app/emae/layout.tsx
import { Metadata } from 'next';
import { emaeMetadata } from '@/lib/metadata';

export const metadata: Metadata = emaeMetadata;

export default function EMAELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}