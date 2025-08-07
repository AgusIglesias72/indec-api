// components/StructuredData.tsx
import Script from 'next/script';

interface StructuredDataProps {
  data: object;
  id?: string;
  strategy?: 'afterInteractive' | 'beforeInteractive' | 'lazyOnload';
}

export default function StructuredData({ data, id, strategy = 'afterInteractive' }: StructuredDataProps) {
  return (
    <Script
      id={id || 'structured-data'}
      type="application/ld+json"
      strategy={strategy}
      dangerouslySetInnerHTML={{ 
        __html: JSON.stringify(data, null, 0) 
      }}
    />
  );
}

// Critical structured data component for homepage
export function CriticalStructuredData({ schemas }: { schemas: object[] }) {
  return (
    <>
      {schemas.map((schema, index) => (
        <StructuredData 
          key={index}
          data={schema}
          id={`critical-schema-${index}`}
          strategy="beforeInteractive"
        />
      ))}
    </>
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

// Enhanced Country Risk schema with real-time features
export const CountryRiskSchema = (currentValue?: number, lastUpdate?: string, changePercent?: number) => ({
  "@context": "https://schema.org",
  "@type": ["Dataset", "FinancialProduct"],
  "name": "Riesgo País Argentina - EMBI+ en Tiempo Real",
  "description": "Seguimiento en tiempo real del indicador de riesgo soberano argentino con análisis intradía cada 30 minutos. Incluye visualizaciones de 1 día, 7 días y análisis histórico completo.",
  "url": "https://argenstats.com/indicadores/riesgo-pais",
  "keywords": "riesgo país, argentina, EMBI, bonos soberanos, análisis intradía, tiempo real",
  "dateModified": lastUpdate || new Date().toISOString(),
  "temporalCoverage": "2016/P8Y",
  "variableMeasured": [
    {
      "@type": "PropertyValue",
      "name": "Riesgo País (puntos básicos)",
      "value": currentValue,
      "unitText": "puntos básicos"
    },
    {
      "@type": "PropertyValue", 
      "name": "Variación porcentual",
      "value": changePercent,
      "unitText": "porcentaje"
    }
  ],
  "updateFrequency": "PT30M",
  "creator": {
    "@type": "Organization",
    "name": "Mercados Financieros Internacionales"
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
  "mainEntity": {
    "@type": "WebApplication",
    "name": "Dashboard Riesgo País Tiempo Real",
    "description": "Herramienta interactiva para monitorear el riesgo país argentino con datos cada 30 minutos",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript"
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

// Dollar Converter Web Application Schema
export const DollarConverterWebAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Conversor de Dólar a Peso Argentino",
  "description": "Calculadora de dólar a peso argentino con cotizaciones en tiempo real. Convierte USD a ARS con todos los tipos de cambio: blue, oficial, MEP, CCL.",
  "url": "https://argenstats.com/conversor-dolar-peso-argentino",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web Browser",
  "browserRequirements": "Requires HTML5 support",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "category": "Free"
  },
  "featureList": [
    "Conversión USD a ARS en tiempo real",
    "Múltiples tipos de cambio (Blue, Oficial, MEP, CCL, Crypto, Tarjeta)",
    "Cotizaciones históricas",
    "Interfaz responsive",
    "Actualizaciones automáticas cada minuto"
  ],
  "provider": {
    "@type": "Organization",
    "name": "ArgenStats",
    "url": "https://argenstats.com"
  },
  "author": {
    "@type": "Organization", 
    "name": "ArgenStats"
  },
  "potentialAction": {
    "@type": "UseAction",
    "target": "https://argenstats.com/conversor-dolar-peso-argentino",
    "object": {
      "@type": "Thing",
      "name": "Conversor de Divisas"
    }
  }
};

// FAQ Schema for Dollar Converter
export const DollarConverterFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto vale el dólar hoy en Argentina?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El valor del dólar varía según el tipo de cambio. En nuestro conversor podés ver todas las cotizaciones actualizadas, incluyendo dólar blue, oficial, MEP, CCL y más."
      }
    },
    {
      "@type": "Question", 
      "name": "¿Cómo calcular dólares a pesos argentinos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Simplemente ingresá el monto en USD en nuestro conversor, seleccioná el tipo de cambio deseado y obtendrás instantáneamente el equivalente en pesos argentinos."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuál es la diferencia entre dólar blue y oficial?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El dólar oficial es el tipo de cambio establecido por el Banco Central, mientras que el dólar blue es la cotización del mercado informal o paralelo, generalmente más alta."
      }
    },
    {
      "@type": "Question",
      "name": "¿Con qué frecuencia se actualizan las cotizaciones?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Las cotizaciones se actualizan automáticamente cada minuto, garantizando que siempre tengas el tipo de cambio más reciente para tu conversión."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué tipos de dólar puedo convertir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Podés convertir con los siguientes tipos de cambio: Dólar Blue, Oficial, MEP (Mercado Electrónico de Pagos), CCL (Contado con Liquidación), Crypto, Mayorista y Tarjeta."
      }
    }
  ]
};

// Inflation Calculator WebApp Schema
export const InflationCalculatorWebAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Calculadora de Inflación Argentina",
  "description": "Calculadora de inflación argentina con índice CER del BCRA. Calculá cuánto valen hoy tus pesos del pasado y el poder adquisitivo desde 2002.",
  "url": "https://argenstats.com/calculadora-inflacion",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web Browser",
  "browserRequirements": "Requires HTML5 support",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "category": "Free"
  },
  "featureList": [
    "Cálculo de inflación con índice CER oficial",
    "Datos del BCRA desde febrero 2002",
    "Cálculo bidireccional de poder adquisitivo",
    "Interfaz responsive",
    "Actualización diaria de datos"
  ],
  "provider": {
    "@type": "Organization",
    "name": "ArgenStats",
    "url": "https://argenstats.com"
  }
};

// FAQ Schema for Inflation Calculator
export const InflationCalculatorFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto valen hoy $1000 de 2010?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Usando nuestra calculadora podés ver exactamente cuánto valen $1000 de 2010 en pesos actuales. La respuesta varía según la fecha específica y la evolución de la inflación medida por el índice CER."
      }
    },
    {
      "@type": "Question", 
      "name": "¿Cómo se calcula la inflación acumulada?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La inflación acumulada se calcula comparando el índice CER entre dos fechas. Nuestra calculadora hace este cálculo automáticamente mostrando tanto el valor equivalente como el porcentaje de inflación del período."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es el índice CER?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El CER (Coeficiente de Estabilización de Referencia) es un índice que refleja la evolución del IPC publicado por el BCRA. Se usa para ajustar contratos y medir el poder adquisitivo desde febrero de 2002."
      }
    },
    {
      "@type": "Question",
      "name": "¿Desde cuándo están disponibles los datos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los datos del índice CER están disponibles desde el 2 de febrero de 2002, fecha de implementación de este coeficiente por parte del Banco Central de la República Argentina."
      }
    },
    {
      "@type": "Question",
      "name": "¿Con qué frecuencia se actualizan los datos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los datos del CER se actualizan diariamente siguiendo las publicaciones oficiales del Banco Central, reflejando la evolución del Índice de Precios al Consumidor."
      }
    }
  ]
};

// Breadcrumb Schema Generator
export const BreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});