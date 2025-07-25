import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pobreza e Indigencia en Argentina | Indicadores INDEC - ArgenStats',
  description: 'Datos actualizados de pobreza e indigencia en Argentina. Estadísticas oficiales del INDEC por regiones, evolución histórica y análisis de tendencias socioeconómicas.',
  keywords: [
    'pobreza argentina',
    'indigencia argentina', 
    'estadísticas pobreza INDEC',
    'pobreza por regiones argentina',
    'canasta básica argentina',
    'línea de pobreza',
    'indicadores sociales argentina',
    'evolución pobreza argentina',
    'datos oficiales pobreza',
    'EPH argentina'
  ].join(', '),
  openGraph: {
    title: 'Pobreza e Indigencia en Argentina | Datos INDEC',
    description: 'Estadísticas oficiales de pobreza e indigencia en Argentina. Datos actualizados, análisis por regiones y evolución histórica.',
    type: 'website',
    url: 'https://argenstats.com/indicadores/pobreza',
    images: [
      {
        url: '/api/og?title=Pobreza%20e%20Indigencia%20Argentina&subtitle=Estadísticas%20oficiales%20INDEC',
        width: 1200,
        height: 630,
        alt: 'Estadísticas de Pobreza e Indigencia en Argentina'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pobreza e Indigencia en Argentina | Datos INDEC',
    description: 'Estadísticas oficiales de pobreza e indigencia en Argentina. Datos actualizados y análisis por regiones.',
    images: ['/api/og?title=Pobreza%20e%20Indigencia%20Argentina&subtitle=Estadísticas%20oficiales%20INDEC']
  },
  alternates: {
    canonical: 'https://argenstats.com/indicadores/pobreza'
  },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  }
};

export default function PovertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}