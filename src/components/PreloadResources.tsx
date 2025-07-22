// src/components/PreloadResources.tsx
import Head from 'next/head';

interface PreloadResourcesProps {
  resources?: Array<{
    href: string;
    as: 'script' | 'style' | 'font' | 'image' | 'fetch';
    type?: string;
    crossorigin?: '' | 'anonymous' | 'use-credentials';
  }>;
}

export default function PreloadResources({ resources = [] }: PreloadResourcesProps) {
  // Default critical resources to preload
  const defaultResources = [
    // Preload critical API endpoints
    {
      href: '/api/ipc?type=latest',
      as: 'fetch' as const,
      type: 'application/json'
    },
    {
      href: '/api/dollar?type=latest&dollar_type=OFICIAL',
      as: 'fetch' as const,
      type: 'application/json'
    },
    {
      href: '/api/riesgo-pais?type=latest&order=desc&auto_paginate=true',
      as: 'fetch' as const,
      type: 'application/json'
    },
    // Preload critical fonts (if using custom fonts)
    // {
    //   href: '/fonts/ClearSans-Regular.woff2',
    //   as: 'font' as const,
    //   type: 'font/woff2',
    //   crossorigin: 'anonymous' as const
    // }
  ];

  const allResources = [...defaultResources, ...resources];

  return (
    <Head>
      {allResources.map((resource, index) => (
        <link
          key={index}
          rel="preload"
          href={resource.href}
          as={resource.as}
          type={resource.type}
          crossOrigin={resource.crossorigin}
        />
      ))}
      
      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
      {/* Preconnect for critical external resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Head>
  );
}

// Specific preload configurations for different pages
export const homePagePreloads = [
  {
    href: '/api/emae/latest',
    as: 'fetch' as const,
    type: 'application/json'
  },
  {
    href: '/api/labor-market?view=latest&data_type=national&limit=1',
    as: 'fetch' as const,
    type: 'application/json'
  }
];

export const dollarPagePreloads = [
  {
    href: '/api/dollar?type=latest&include_variations=true',
    as: 'fetch' as const,
    type: 'application/json'
  }
];