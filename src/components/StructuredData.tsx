// components/StructuredData.tsx
interface StructuredDataProps {
  data: object;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Specific schemas for your site
export const OrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ArgenStats",
  "url": "https://argenstats.com",
  "logo": "https://argenstats.com/argenstats.svg",
  "description": "Plataforma de indicadores económicos oficiales de Argentina con API moderna",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "url": "https://argenstats.com/contacto"
  },
  "sameAs": [
    "https://twitter.com/argenstats"
  ]
};

export const WebsiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ArgenStats",
  "url": "https://argenstats.com",
  "description": "Indicadores económicos oficiales de Argentina",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://argenstats.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const DatasetSchema = (indicatorType: string, description: string, lastModified: string) => ({
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": `${indicatorType} Argentina`,
  "description": description,
  "url": `https://argenstats.com/indicadores/${indicatorType.toLowerCase()}`,
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
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "spatialCoverage": {
    "@type": "Place",
    "name": "Argentina"
  }
});

export const FinancialProductSchema = (dollarType: string, buyPrice?: number, sellPrice?: number, lastUpdate?: string) => ({
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": `Cotización ${dollarType}`,
  "description": `Tipo de cambio ${dollarType} en Argentina`,
  "url": `https://argenstats.com/dolar`,
  "provider": {
    "@type": "Organization",
    "name": "ArgenStats"
  },
  "offers": buyPrice && sellPrice ? {
    "@type": "Offer",
    "price": sellPrice,
    "priceCurrency": "ARS",
    "availability": "https://schema.org/InStock",
    "validFrom": lastUpdate
  } : undefined
});