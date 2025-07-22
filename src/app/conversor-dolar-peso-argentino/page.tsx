import { Metadata } from 'next';
import DollarConverterLanding from './DollarConverterLanding';

export const metadata: Metadata = {
  title: 'Conversor de Dólar a Peso Argentino Hoy | Calculadora USD ARS en Tiempo Real',
  description: 'Conversor de dólar a peso argentino actualizado. Calculá cuánto valen tus dólares hoy con cotización dólar blue, oficial, MEP, CCL, crypto y tarjeta. Conversor USD ARS gratis.',
  keywords: 'conversor dolar peso argentino, calculadora dolar peso argentino, dolar a peso argentino hoy, conversor usd ars, cuanto vale el dolar hoy, cotizacion dolar blue hoy, dolar oficial hoy, conversor divisas argentina, cambio dolar peso argentino',
  alternates: {
    canonical: 'https://datosdolar.com/conversor-dolar-peso-argentino'
  },
  openGraph: {
    title: 'Conversor de Dólar a Peso Argentino | Cotización en Tiempo Real',
    description: 'Calculá el valor de tus dólares en pesos argentinos. Conversor con cotización dólar blue, oficial, MEP y más actualizado al instante.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'Datos Dólar',
    images: [
      {
        url: '/og-conversor-dolar.png',
        width: 1200,
        height: 630,
        alt: 'Conversor de Dólar a Peso Argentino'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor USD ARS | Dólar a Peso Argentino Hoy',
    description: 'Convertí dólares a pesos argentinos con las últimas cotizaciones. Blue, oficial, MEP, CCL y más.',
    images: ['/og-conversor-dolar.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export default function ConversorDolarPage() {
  return <DollarConverterLanding />;
}