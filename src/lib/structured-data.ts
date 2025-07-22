// src/lib/structured-data.ts
import { WithContext, Organization, WebSite, BreadcrumbList, SoftwareApplication } from 'schema-dts';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://argenstats.com";

// Organization structured data
export const organizationStructuredData: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ArgenStats",
  "alternateName": "ArgenStats",
  "url": BASE_URL,
  "logo": `${BASE_URL}/images/logo.png`,
  "description": "Plataforma de datos económicos de Argentina con indicadores del INDEC en tiempo real",
  "foundingDate": "2024",
  "founders": [
    {
      "@type": "Person",
      "name": "ArgenStats Team"
    }
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+54-11-0000-0000",
    "contactType": "customer service",
    "availableLanguage": ["Spanish", "English"]
  },
  "sameAs": [
    "https://twitter.com/argenstats",
    "https://github.com/argenstats"
  ],
  "knowsAbout": [
    "Indicadores Económicos",
    "INDEC",
    "Inflación Argentina", 
    "Dólar Blue",
    "EMAE",
    "IPC",
    "Riesgo País"
  ]
};

// Website structured data
export const websiteStructuredData: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ArgenStats",
  "url": BASE_URL,
  "description": "Datos económicos de Argentina en tiempo real",
  "publisher": {
    "@type": "Organization",
    "name": "ArgenStats"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

// Dollar Converter Software Application
export const dollarConverterStructuredData: WithContext<SoftwareApplication> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Conversor de Dólar a Peso Argentino",
  "description": "Calculadora en tiempo real para convertir dólares estadounidenses a pesos argentinos con múltiples tipos de cambio",
  "url": `${BASE_URL}/conversor-dolar-peso-argentino`,
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ArgenStats",
    "url": BASE_URL
  },
  "featureList": [
    "Conversión USD a ARS en tiempo real",
    "Múltiples tipos de cambio (Blue, Oficial, MEP, CCL)",
    "Datos históricos",
    "Interfaz responsive",
    "Cálculo bidireccional"
  ],
  "screenshot": `${BASE_URL}/images/conversor-screenshot.jpg`,
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  }
};

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(items: Array<{name: string, url: string}>): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// Economic Indicator Dataset structured data
export function generateEconomicDataStructuredData(indicator: {
  name: string;
  description: string;
  value: number;
  date: string;
  unit?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": indicator.name,
    "description": indicator.description,
    "url": indicator.url,
    "keywords": [indicator.name, "Argentina", "INDEC", "Indicador Económico"],
    "creator": {
      "@type": "Organization",
      "name": "INDEC",
      "url": "https://www.indec.gob.ar"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "ArgenStats",
      "url": BASE_URL
    },
    "dateModified": indicator.date,
    "datePublished": indicator.date,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "distribution": [
      {
        "@type": "DataDownload",
        "encodingFormat": "application/json",
        "contentUrl": `${BASE_URL}/api/${indicator.url}`
      }
    ],
    "variableMeasured": {
      "@type": "PropertyValue",
      "name": indicator.name,
      "value": indicator.value,
      "unitText": indicator.unit || "index"
    }
  };
}

// FAQ structured data for common questions
export const dollarConverterFAQStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cómo funciona el conversor de dólar a peso argentino?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nuestro conversor utiliza cotizaciones en tiempo real de múltiples fuentes para convertir dólares estadounidenses a pesos argentinos. Incluye dólar blue, oficial, MEP, CCL y otros tipos de cambio actualizados constantemente."
      }
    },
    {
      "@type": "Question", 
      "name": "¿Qué tipos de dólar puedo convertir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Puedes convertir usando dólar oficial, blue, MEP (Mercado Electrónico de Pagos), CCL (Contado con Liquidación), crypto, mayorista y tarjeta. Cada uno refleja diferentes mercados y regulaciones."
      }
    },
    {
      "@type": "Question",
      "name": "¿Con qué frecuencia se actualizan las cotizaciones?",
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": "Las cotizaciones se actualizan en tiempo real durante las horas de mercado, utilizando datos de fuentes oficiales como el BCRA y mercados financieros locales."
      }
    },
    {
      "@type": "Question",
      "name": "¿Puedo ver cotizaciones históricas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, el conversor incluye un selector de fechas que te permite consultar cotizaciones históricas para análisis y comparación de períodos anteriores."
      }
    }
  ]
};