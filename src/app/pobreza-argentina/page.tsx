import { Metadata } from 'next';
import PovertyLanding from './PovertyLanding';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Pobreza e Indigencia en Argentina - Estadísticas INDEC Actualizadas | ArgenStats',
  description: 'Datos oficiales de pobreza e indigencia en Argentina según INDEC. Estadísticas por regiones, evolución histórica desde 2016 y análisis detallado de indicadores sociales con gráficos interactivos.',
  keywords: [
    'pobreza argentina',
    'indigencia argentina',
    'estadísticas pobreza INDEC',
    'línea de pobreza argentina',
    'canasta básica total argentina',
    'canasta básica alimentaria',
    'pobreza por regiones argentina',
    'datos oficiales pobreza INDEC',
    'EPH argentina encuesta permanente hogares',
    'situación social argentina',
    'indicadores sociales argentina',
    'pobreza histórica argentina evolución',
    'medición pobreza argentina metodología',
    'INDEC instituto nacional estadística',
    'aglomerados urbanos argentina 31',
    'dashboard pobreza argentina',
    'API pobreza argentina datos',
    'análisis pobreza argentina interactivo',
    'tendencias pobreza argentina',
    'comparación regional pobreza argentina'
  ].join(', '),
  openGraph: {
    title: 'Pobreza e Indigencia en Argentina | Estadísticas Oficiales INDEC',
    description: 'Dashboard completo con datos actualizados de pobreza e indigencia en Argentina. Análisis por regiones, evolución histórica y tendencias socioeconómicas oficiales del INDEC con gráficos interactivos.',
    type: 'website',
    url: 'https://argenstats.com/pobreza-argentina',
    siteName: 'ArgenStats',
    images: [
      {
        url: '/api/og?title=Pobreza%20e%20Indigencia%20Argentina&subtitle=Dashboard%20Interactivo%20INDEC',
        width: 1200,
        height: 630,
        alt: 'Dashboard de Pobreza e Indigencia en Argentina - Estadísticas INDEC'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pobreza e Indigencia Argentina | Dashboard INDEC',
    description: 'Estadísticas oficiales de pobreza e indigencia en Argentina. Dashboard interactivo con datos actualizados del INDEC por regiones y evolución histórica.',
    images: ['/api/og?title=Pobreza%20e%20Indigencia%20Argentina&subtitle=Dashboard%20Interactivo%20INDEC']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  alternates: {
    canonical: 'https://argenstats.com/pobreza-argentina'
  },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  }
};

// Structured Data Schemas
const PovertyWebsiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Pobreza Argentina - ArgenStats",
  "description": "Estadísticas oficiales de pobreza e indigencia en Argentina basadas en datos del INDEC",
  "url": "https://argenstats.com/pobreza-argentina",
  "publisher": {
    "@type": "Organization",
    "name": "ArgenStats",
    "logo": {
      "@type": "ImageObject",
      "url": "https://argenstats.com/logo.png"
    }
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://argenstats.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const PovertyDatasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Estadísticas de Pobreza e Indigencia Argentina",
  "description": "Datos oficiales de pobreza e indigencia en los 31 aglomerados urbanos de Argentina, publicados semestralmente por el INDEC",
  "url": "https://argenstats.com/pobreza-argentina",
  "keywords": ["pobreza", "indigencia", "argentina", "INDEC", "estadísticas sociales"],
  "creator": {
    "@type": "Organization",
    "name": "INDEC - Instituto Nacional de Estadística y Censos",
    "url": "https://www.indec.gob.ar"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ArgenStats"
  },
  "temporalCoverage": "2016/..",
  "spatialCoverage": {
    "@type": "Place",
    "name": "Argentina",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -34.6118,
      "longitude": -58.3960
    }
  },
  "distribution": {
    "@type": "DataDownload",
    "encodingFormat": "application/json",
    "contentUrl": "https://argenstats.com/api/poverty"
  }
};

const PovertyFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es la línea de pobreza en Argentina?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Se considera pobre a una persona cuando el ingreso del hogar donde reside no alcanza para adquirir la Canasta Básica Total (CBT), que incluye alimentos y servicios básicos como vestimenta, transporte, educación, salud y vivienda."
      }
    },
    {
      "@type": "Question", 
      "name": "¿Cómo se mide la indigencia en Argentina?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Se considera indigente a una persona cuando el ingreso del hogar no alcanza para adquirir la Canasta Básica Alimentaria (CBA), que cubre las necesidades nutricionales mínimas de energía y proteínas."
      }
    },
    {
      "@type": "Question",
      "name": "¿Con qué frecuencia se publican los datos de pobreza?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los datos de pobreza e indigencia se publican semestralmente (primer y segundo semestre) basados en la Encuesta Permanente de Hogares (EPH) del INDEC."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué aglomerados incluye la medición de pobreza?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La medición abarca los 31 aglomerados urbanos más importantes de Argentina, representando aproximadamente el 62% de la población total del país."
      }
    }
  ]
};

const BreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://argenstats.com"
    },
    {
      "@type": "ListItem", 
      "position": 2,
      "name": "Pobreza Argentina",
      "item": "https://argenstats.com/pobreza-argentina"
    }
  ]
};

export default function PovertyPage() {
  return (
    <>
      {/* Enhanced structured data for poverty statistics */}
      <StructuredData data={PovertyWebsiteSchema} id="poverty-website" />
      <StructuredData data={PovertyDatasetSchema} id="poverty-dataset" />
      <StructuredData data={PovertyFAQSchema} id="poverty-faq" />
      <StructuredData data={BreadcrumbSchema} id="poverty-breadcrumb" />
      
      <PovertyLanding />
    </>
  );
}