// src/lib/metadata.ts
import { Metadata } from "next";

// Base URL for canonical links and images
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://argenstats.com";

// Common metadata that applies to all pages
export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ArgenStats - Indicadores Económicos de Argentina",
    template: "%s | ArgenStats",
  },
  description: "Visualiza y accede a indicadores económicos oficiales de Argentina a través de una interfaz moderna y una API potente.",
  authors: [{ name: "ArgenStats" }],
  creator: "ArgenStats",
  publisher: "ArgenStats",
  robots: "index, follow",

  manifest: "/site.webmanifest",
  keywords: ["indicadores económicos", "argentina", "INDEC", "IPC", "EMAE", "inflación", "dólar", "estadísticas", "economía"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: BASE_URL,
    siteName: "ArgenStats",
    title: "ArgenStats - Indicadores Económicos de Argentina",
    description: "Visualiza y accede a indicadores económicos oficiales de Argentina a través de una interfaz moderna y una API potente.",
    images: [
      {
        url: `${BASE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "ArgenStats - Indicadores Económicos de Argentina",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArgenStats - Indicadores Económicos de Argentina",
    description: "Visualiza y accede a indicadores económicos oficiales de Argentina a través de una interfaz moderna y una API potente.",
    images: [`${BASE_URL}/images/twitter-image.jpg`],
    creator: "@argenstats",
  },
  icons: {
    icon: [
        // usar el favicon.ico
      { url: "/favicon.ico", sizes: "any" }, 
      { url: "/favicon.ico", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.ico" },
    ],
    shortcut: ["/favicon.ico"],
  },

  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
  },
  verification: {
    google: process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION
  },
};

// Homepage metadata
export const homeMetadata: Metadata = {
  title: "ArgenStats - Datos económicos en tiempo real",
  description: "Potencia la visualización de indicadores económicos con datos actualizados. Mejora tu toma de decisiones con información relevante del INDEC a través de una interfaz moderna y una API potente.",
  openGraph: {
    title: "ArgenStats - Datos económicos en tiempo real",
    description: "Potencia la visualización de indicadores económicos con datos actualizados. Mejora tu toma de decisiones con información relevante del INDEC a través de una interfaz moderna y una API potente.",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/images/home-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "ArgenStats - Datos económicos en tiempo real",
      },
    ],
  },
  twitter: {
    title: "ArgenStats - Datos económicos en tiempo real",
    description: "Potencia la visualización de indicadores económicos con datos actualizados. Mejora tu toma de decisiones con información relevante del INDEC a través de una interfaz moderna y una API potente.",
  },
};

// EMAE page metadata
export const emaeMetadata: Metadata = {
  title: "Estimador Mensual de Actividad Económica (EMAE)",
  description: "Seguimiento de la evolución de la actividad económica a nivel nacional con datos oficiales del INDEC. Visualiza tendencias por sector y análisis históricos.",
  keywords: ["EMAE", "actividad económica", "argentina", "INDEC", "PBI", "sectores económicos", "tendencias económicas"],
  openGraph: {
    title: "Estimador Mensual de Actividad Económica (EMAE) | ArgenStats",
    description: "Seguimiento de la evolución de la actividad económica a nivel nacional con datos oficiales del INDEC. Visualiza tendencias por sector y análisis históricos.",
    url: `${BASE_URL}/indicadores/emae`,
    images: [
      {
        url: `${BASE_URL}/images/emae-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Estimador Mensual de Actividad Económica (EMAE)",
      },
    ],
  },
  twitter: {
    title: "Estimador Mensual de Actividad Económica (EMAE) | ArgenStats",
    description: "Seguimiento de la evolución de la actividad económica a nivel nacional con datos oficiales del INDEC. Visualiza tendencias por sector y análisis históricos.",
  },
};

// IPC page metadata
export const ipcMetadata: Metadata = {
  title: "Índice de Precios al Consumidor (IPC)",
  description: "Seguimiento de la evolución de precios por regiones y rubros con datos oficiales del INDEC. Visualiza tendencias inflacionarias y análisis históricos.",
  keywords: ["IPC", "inflación", "precios", "argentina", "INDEC", "índice de precios", "canasta básica", "costo de vida"],
  openGraph: {
    title: "Índice de Precios al Consumidor (IPC) | ArgenStats",
    description: "Seguimiento de la evolución de precios por regiones y rubros con datos oficiales del INDEC. Visualiza tendencias inflacionarias y análisis históricos.",
    url: `${BASE_URL}/indicadores/ipc`,
    images: [
      {
        url: `${BASE_URL}/images/ipc-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Índice de Precios al Consumidor (IPC)",
      },
    ],
  },
  twitter: {
    title: "Índice de Precios al Consumidor (IPC) | ArgenStats",
    description: "Seguimiento de la evolución de precios por regiones y rubros con datos oficiales del INDEC. Visualiza tendencias inflacionarias y análisis históricos.",
  },
};

// Cotizaciones (Dollar) page metadata
export const dollarMetadata: Metadata = {
  title: "Cotizaciones de Dólar en Argentina",
  description: "Seguimiento de los principales tipos de cambio en Argentina, actualizado en tiempo real. Visualiza tendencias y análisis históricos del dólar blue, oficial, CCL, MEP, y más.",
  keywords: ["dólar", "cotizaciones", "argentina", "dólar blue", "dólar oficial", "CCL", "MEP", "tipo de cambio", "divisas"],
  openGraph: {
    title: "Cotizaciones de Dólar en Argentina | ArgenStats",
    description: "Seguimiento de los principales tipos de cambio en Argentina, actualizado en tiempo real. Visualiza tendencias y análisis históricos del dólar blue, oficial, CCL, MEP, y más.",
    url: `${BASE_URL}/dolar`,
    images: [
      {
        url: `${BASE_URL}/images/dollar-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Cotizaciones de Dólar en Argentina",
      },
    ],
  },
  twitter: {
    title: "Cotizaciones de Dólar en Argentina | ArgenStats",
    description: "Seguimiento de los principales tipos de cambio en Argentina, actualizado en tiempo real. Visualiza tendencias y análisis históricos del dólar blue, oficial, CCL, MEP, y más.",
  },
};

// Calendario page metadata
export const calendarMetadata: Metadata = {
  title: "Calendario Económico INDEC",
  description: "Mantente al día con los principales indicadores y publicaciones económicas. Calendario de publicaciones oficiales del INDEC actualizado mensualmente.",
  keywords: ["calendario económico", "argentina", "INDEC", "publicaciones económicas", "fechas", "eventos económicos"],
  openGraph: {
    title: "Calendario Económico INDEC | ArgenStats",
    description: "Mantente al día con los principales indicadores y publicaciones económicas. Calendario de publicaciones oficiales del INDEC actualizado mensualmente.",
    url: `${BASE_URL}/calendario`,
    images: [
      {
        url: `${BASE_URL}/images/calendar-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Calendario Económico INDEC",
      },
    ],
  },
  twitter: {
    title: "Calendario Económico INDEC | ArgenStats",
    description: "Mantente al día con los principales indicadores y publicaciones económicas. Calendario de publicaciones oficiales del INDEC actualizado mensualmente.",
  },
};

// API Docs page metadata
export const apiDocsMetadata: Metadata = {
  title: "Documentación de API",
  description: "Guía completa para utilizar nuestras APIs de datos económicos y estadísticos. Accede a endpoints bien documentados con filtrado flexible y múltiples formatos de salida.",
  keywords: ["API", "documentación", "argentina", "INDEC", "datos económicos", "indicadores", "desarrollo", "endpoints", "integración"],
  openGraph: {
    title: "Documentación de API | ArgenStats",
    description: "Guía completa para utilizar nuestras APIs de datos económicos y estadísticos. Accede a endpoints bien documentados con filtrado flexible y múltiples formatos de salida.",
    url: `${BASE_URL}/documentacion`,
    images: [
      {
        url: `${BASE_URL}/images/api-docs-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Documentación de API ArgenStats",
      },
    ],
  },
  twitter: {
    title: "Documentación de API | ArgenStats",
    description: "Guía completa para utilizar nuestras APIs de datos económicos y estadísticos. Accede a endpoints bien documentados con filtrado flexible y múltiples formatos de salida.",
  },
};

// Contact page metadata
export const contactMetadata: Metadata = {
  title: "Contacto",
  description: "Envíanos tus comentarios, sugerencias o consultas. Estamos aquí para ayudarte con cualquier duda sobre ArgenStats o nuestras APIs.",
  keywords: ["contacto", "argentina", "soporte", "ayuda", "consultas", "feedback"],
  openGraph: {
    title: "Contacto | ArgenStats",
    description: "Envíanos tus comentarios, sugerencias o consultas. Estamos aquí para ayudarte con cualquier duda sobre ArgenStats o nuestras APIs.",
    url: `${BASE_URL}/contacto`,
    images: [
      {
        url: `${BASE_URL}/images/contact-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Contacto ArgenStats",
      },
    ],
  },
  twitter: {
    title: "Contacto | ArgenStats",
    description: "Envíanos tus comentarios, sugerencias o consultas. Estamos aquí para ayudarte con cualquier duda sobre ArgenStats o nuestras APIs.",
  },
};



// Riesgo País page metadata
export const riesgoPaisMetadata: Metadata = {
  title: "Riesgo País Argentina",
  description: "Seguimiento en tiempo real del indicador de riesgo soberano argentino. Análisis histórico, niveles de riesgo y factores que influyen en la percepción del mercado.",
  keywords: ["riesgo país", "argentina", "bonos soberanos", "spread", "default", "mercados financieros", "deuda externa", "indicador económico"],
  openGraph: {
    title: "Riesgo País Argentina | ArgenStats",
    description: "Seguimiento en tiempo real del indicador de riesgo soberano argentino. Análisis histórico, niveles de riesgo y factores que influyen en la percepción del mercado.",
    url: `${BASE_URL}/indicadores/riesgo-pais`,
    images: [
      {
        url: `${BASE_URL}/images/riesgo-pais-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Riesgo País Argentina",
      },
    ],
  },
  twitter: {
    title: "Riesgo País Argentina | ArgenStats",
    description: "Seguimiento en tiempo real del indicador de riesgo soberano argentino. Análisis histórico, niveles de riesgo y factores que influyen en la percepción del mercado.",
  },
};

// Labor Market page metadata
export const laborMarketMetadata: Metadata = {
  title: "Índice de Empleo y Mercado Laboral",
  description: "Seguimiento del mercado laboral argentino con datos oficiales del INDEC. Tasas de empleo, desempleo, actividad y análisis por regiones y sectores.",
  keywords: ["empleo", "mercado laboral", "argentina", "INDEC", "desempleo", "tasa de actividad", "trabajo", "estadísticas laborales"],
  openGraph: {
    title: "Índice de Empleo y Mercado Laboral | ArgenStats",
    description: "Seguimiento del mercado laboral argentino con datos oficiales del INDEC. Tasas de empleo, desempleo, actividad y análisis por regiones y sectores.",
    url: `${BASE_URL}/indicadores/empleo`,
    images: [
      {
        url: `${BASE_URL}/images/labor-market-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Índice de Empleo y Mercado Laboral",
      },
    ],
  },
  twitter: {
    title: "Índice de Empleo y Mercado Laboral | ArgenStats",
    description: "Seguimiento del mercado laboral argentino con datos oficiales del INDEC. Tasas de empleo, desempleo, actividad y análisis por regiones y sectores.",
  },
};




export const empleoMetadata: Metadata = {
  title: "Indicadores de Empleo y Mercado Laboral",
  description: "Seguimiento completo del mercado laboral argentino con datos oficiales del INDEC. Tasas de empleo, desempleo y actividad actualizadas trimestralmente por regiones y segmentos demográficos.",
  keywords: [
    "empleo argentina", 
    "desempleo argentina", 
    "mercado laboral argentino", 
    "tasa de desempleo", 
    "tasa de empleo", 
    "tasa de actividad", 
    "INDEC empleo", 
    "EPH encuesta permanente hogares", 
    "estadísticas laborales", 
    "desempleo por regiones", 
    "empleo juvenil argentina", 
    "indicadores económicos", 
    "datos laborales oficiales"
  ],
  openGraph: {
    title: "Indicadores de Empleo y Mercado Laboral | EconData",
    description: "Seguimiento completo del mercado laboral argentino con datos oficiales del INDEC. Tasas de empleo, desempleo y actividad actualizadas trimestralmente por regiones y segmentos demográficos.",
    url: `${BASE_URL}/indicadores/empleo`,
    images: [
      {
        url: `${BASE_URL}/images/empleo-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Indicadores de Empleo y Mercado Laboral Argentina",
      },
    ],
  },
  twitter: {
    title: "Indicadores de Empleo y Mercado Laboral | EconData",
    description: "Seguimiento completo del mercado laboral argentino con datos oficiales del INDEC. Tasas de empleo, desempleo y actividad actualizadas trimestralmente.",
  },
};