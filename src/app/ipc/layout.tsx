import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Índice de Precios al Consumidor (IPC) - Argentina | ArgenStats',
  description: 'Seguimiento completo del IPC argentino en tiempo real. Datos oficiales del INDEC, variaciones mensuales, interanuales y análisis por rubros y categorías.',
  keywords: [
    'IPC Argentina',
    'inflación argentina',
    'precios consumidor',
    'INDEC',
    'variación mensual',
    'análisis inflacionario',
    'rubros IPC',
    'estadísticas económicas'
  ],
  openGraph: {
    title: 'IPC Argentina - Índice de Precios al Consumidor | ArgenStats',
    description: 'Datos oficiales del IPC argentino actualizados mensualmente. Análisis completo de la evolución de precios por rubros y categorías.',
    url: 'https://argenstats.com/ipc',
    siteName: 'ArgenStats',
    images: [
      {
        url: 'https://argenstats.com/images/og-ipc.jpg',
        width: 1200,
        height: 630,
        alt: 'IPC Argentina - ArgenStats',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPC Argentina - Índice de Precios al Consumidor | ArgenStats',
    description: 'Datos oficiales del IPC argentino. Análisis completo de inflación por rubros y categorías.',
    images: ['https://argenstats.com/images/twitter-ipc.jpg'],
  },
  alternates: {
    canonical: 'https://argenstats.com/ipc',
  },
}

export default function IPCLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}