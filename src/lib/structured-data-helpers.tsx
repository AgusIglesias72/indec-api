// lib/structured-data-helpers.tsx
import StructuredData from '@/components/StructuredData';

// Helper function to add structured data to any page
export function addStructuredDataToPage(schemas: object[]) {
  return (
    <>
      {schemas.map((schema, index) => (
        <StructuredData key={index} data={schema} />
      ))}
    </>
  );
}

// Specific schemas for each page type
export const createIndicatorPageSchema = (
  indicatorName: string,
  description: string,
  url: string,
  lastModified: string
) => ({
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": `${indicatorName} - Argentina`,
  "description": description,
  "url": url,
  "dateModified": lastModified,
  "creator": {
    "@type": "Organization",
    "name": "INDEC",
    "url": "https://www.indec.gob.ar"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ArgenStats",
    "url": "https://argenstats.com"
  },
  "spatialCoverage": {
    "@type": "Place",
    "name": "Argentina"
  },
  "keywords": ["indicadores económicos", "argentina", "INDEC", indicatorName.toLowerCase()],
  "license": "https://creativecommons.org/licenses/by/4.0/"
});

export const createBreadcrumbSchema = (breadcrumbs: {name: string, url: string}[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const createAPIDocumentationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ArgenStats API",
  "description": "API para acceder a indicadores económicos oficiales de Argentina",
  "url": "https://argenstats.com/documentacion",
  "applicationCategory": "WebApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ArgenStats"
  }
});

export const createContactPageSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contacto - ArgenStats",
  "description": "Ponte en contacto con el equipo de ArgenStats",
  "url": "https://argenstats.com/contacto",
  "mainEntity": {
    "@type": "Organization",
    "name": "ArgenStats",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Spanish"
    }
  }
});

export const createDollarPageSchema = (latestRates?: any) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Cotizaciones de Dólar en Argentina",
  "description": "Cotizaciones actualizadas de todos los tipos de dólar en Argentina",
  "url": "https://argenstats.com/dolar",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Tipos de Dólar",
    "description": "Lista de cotizaciones de dólar disponibles",
    "itemListElement": [
      {
        "@type": "FinancialProduct",
        "name": "Dólar Blue",
        "description": "Cotización del mercado paralelo"
      },
      {
        "@type": "FinancialProduct", 
        "name": "Dólar Oficial",
        "description": "Cotización oficial del BCRA"
      },
      {
        "@type": "FinancialProduct",
        "name": "Dólar MEP",
        "description": "Mercado Electrónico de Pagos"
      },
      {
        "@type": "FinancialProduct",
        "name": "Contado con Liquidación",
        "description": "CCL para transferencias al exterior"
      }
    ]
  }
});

export const createFAQSchema = (faqs: {question: string, answer: string}[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const createTimeSeriesSchema = (indicatorName: string, data: any[], description: string) => ({
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": `${indicatorName} - Serie Temporal`,
  "description": description,
  "variableMeasured": indicatorName,
  "temporalCoverage": data.length > 0 ? `${data[0].date}/${data[data.length - 1].date}` : undefined,
  "distribution": {
    "@type": "DataDownload",
    "encodingFormat": "application/json",
    "contentUrl": "https://argenstats.com/api"
  }
});