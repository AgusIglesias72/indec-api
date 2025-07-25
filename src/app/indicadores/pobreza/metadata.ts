import { Metadata } from 'next';

export const povertyIndicatorsMetadata: Metadata = {
  title: 'Indicadores de Pobreza e Indigencia Argentina - Dashboard Interactivo INDEC | ArgenStats',
  description: 'Dashboard completo de indicadores de pobreza e indigencia en Argentina. Gráficos interactivos, análisis histórico desde 2016, comparación por regiones y datos oficiales del INDEC actualizados semestralmente.',
  keywords: [
    'indicadores pobreza argentina',
    'dashboard pobreza argentina',
    'gráficos pobreza argentina interactivos',
    'análisis pobreza argentina INDEC',
    'estadísticas pobreza por regiones',
    'evolución pobreza argentina histórica',
    'indigencia argentina indicadores',
    'comparación regional pobreza argentina',
    'INDEC pobreza datos oficiales',
    'CBT canasta básica total',
    'CBA canasta básica alimentaria',
    'EPH encuesta permanente hogares',
    'línea de pobreza argentina',
    'línea de indigencia argentina',
    'aglomerados urbanos pobreza',
    'medición pobreza argentina metodología',
    'tendencias pobreza argentina',
    'visualización datos pobreza',
    'dashboard social argentina',
    'pobreza argentina tiempo real'
  ].join(', '),
  openGraph: {
    title: 'Dashboard de Pobreza e Indigencia Argentina | Indicadores INDEC',
    description: 'Herramientas interactivas para analizar la evolución de la pobreza e indigencia en Argentina. Gráficos, tablas comparativas y datos oficiales del INDEC con análisis por regiones desde 2016.',
    type: 'website',
    url: 'https://argenstats.com/indicadores/pobreza',
    siteName: 'ArgenStats',
    images: [
      {
        url: '/api/og?title=Dashboard%20Pobreza%20Argentina&subtitle=Indicadores%20Interactivos%20INDEC',
        width: 1200,
        height: 630,
        alt: 'Dashboard Interactivo de Pobreza e Indigencia Argentina - INDEC'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard Pobreza Argentina | Indicadores INDEC Interactivos',
    description: 'Analiza la evolución de la pobreza e indigencia en Argentina con gráficos interactivos y datos oficiales del INDEC. Comparación por regiones y análisis histórico.',
    images: ['/api/og?title=Dashboard%20Pobreza%20Argentina&subtitle=Indicadores%20Interactivos%20INDEC']
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
    canonical: 'https://argenstats.com/indicadores/pobreza'
  },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  }
};

// Structured Data Schemas
export const PovertyIndicatorsWebAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Dashboard de Pobreza e Indigencia Argentina",
  "description": "Aplicación web interactiva para analizar estadísticas de pobreza e indigencia en Argentina con datos oficiales del INDEC",
  "url": "https://argenstats.com/indicadores/pobreza",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "ArgenStats"
  },
  "featureList": [
    "Gráficos interactivos de pobreza e indigencia",
    "Análisis histórico desde 2016",
    "Comparación por regiones y aglomerados",
    "Datos oficiales INDEC actualizados",
    "Visualización de tendencias",
    "Filtros por período y región"
  ]
};

export const PovertyIndicatorsDatasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Indicadores de Pobreza e Indigencia Argentina - Dashboard Interactivo",
  "description": "Dataset interactivo con estadísticas históricas de pobreza e indigencia en los 31 aglomerados urbanos de Argentina, visualizado mediante gráficos y tablas comparativas",
  "url": "https://argenstats.com/indicadores/pobreza",
  "keywords": ["pobreza", "indigencia", "argentina", "INDEC", "dashboard", "indicadores sociales", "análisis regional"],
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
    "name": "Argentina - 31 Aglomerados Urbanos",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -34.6118,
      "longitude": -58.3960
    }
  },
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://argenstats.com/api/poverty/series"
    },
    {
      "@type": "DataDownload", 
      "encodingFormat": "text/csv",
      "contentUrl": "https://argenstats.com/api/poverty/export"
    }
  ],
  "measurementTechnique": "Encuesta Permanente de Hogares (EPH)",
  "variableMeasured": [
    "Pobreza en personas",
    "Pobreza en hogares", 
    "Indigencia en personas",
    "Indigencia en hogares"
  ]
};

export const PovertyIndicatorsFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cómo funciona el dashboard de pobreza de ArgenStats?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nuestro dashboard permite analizar la evolución de la pobreza e indigencia en Argentina mediante gráficos interactivos, tablas comparativas por regiones y filtros por período. Los datos provienen directamente del INDEC y se actualizan semestralmente."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué regiones puedo comparar en el dashboard?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Puedes comparar los 31 aglomerados urbanos más importantes de Argentina, incluyendo Gran Buenos Aires, Córdoba, Rosario, Mendoza, Tucumán y otros centros urbanos principales que representan el 62% de la población."
      }
    },
    {
      "@type": "Question",
      "name": "¿Desde qué año están disponibles los datos históricos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los datos históricos de pobreza e indigencia están disponibles desde 2016, permitiendo un análisis completo de la evolución de estos indicadores sociales a lo largo del tiempo."
      }
    },
    {
      "@type": "Question",
      "name": "¿Con qué frecuencia se actualizan los gráficos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los gráficos e indicadores se actualizan automáticamente cada vez que el INDEC publica nuevos datos, lo que ocurre semestralmente (primer y segundo semestre de cada año)."
      }
    },
    {
      "@type": "Question",
      "name": "¿Puedo descargar los datos del dashboard?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, ofrecemos funcionalidades de descarga de datos en formato CSV y acceso via API REST para desarrolladores que quieran integrar esta información en sus propias aplicaciones."
      }
    }
  ]
};

export const PovertyIndicatorsBreadcrumbSchema = {
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
      "name": "Indicadores",
      "item": "https://argenstats.com/indicadores"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Pobreza",
      "item": "https://argenstats.com/indicadores/pobreza"
    }
  ]
};