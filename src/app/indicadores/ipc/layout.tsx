// src/app/ipc/layout.tsx
import { Metadata } from 'next';
import { ipcMetadata } from '@/lib/metadata';

export const metadata: Metadata = ipcMetadata;

export default function IPCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}