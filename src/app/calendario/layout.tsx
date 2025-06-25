// src/app/calendario/layout.tsx
import { Metadata } from 'next';
import { calendarMetadata } from '@/lib/metadata';

export const metadata: Metadata = calendarMetadata;

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}