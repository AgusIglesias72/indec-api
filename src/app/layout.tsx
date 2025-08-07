// src/app/layout.tsx - Optimized for performance
import type { Metadata } from "next";
import { JetBrains_Mono, Righteous } from "next/font/google";
import localFont from "next/font/local";
import dynamic from "next/dynamic";
import "./globals.css";
import AppWrapper from "@/lib/AppWrapper";
import NavBar from "@/components/landing/Navbar";
import { defaultMetadata } from "@/lib/metadata";
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/next"
import StructuredData, { OrganizationSchema, WebsiteSchema } from "@/components/StructuredData"

// Lazy load footer to improve initial page load
const Footer = dynamic(() => import("@/components/landing/CTAFooter"), {
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse" />
  )
});

// Optimized font loading - load only essential weights first
const clearSans = localFont({
  src: [
    {
      path: '../fonts/ClearSans-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/ClearSans-Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/ClearSans-Bold.woff',
      weight: '700',
      style: 'normal',
    },
    // Additional weights loaded on-demand
    {
      path: '../fonts/ClearSans-Light.woff',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-clear-sans',
  display: 'swap',
  preload: true, // Preload critical font weights
});

export const metadata: Metadata = defaultMetadata;


// Mantener JetBrains_Mono para código
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

// Import Righteous font
const righteous = Righteous({
  weight: '400', // Righteous only comes in regular 400 weight
  subsets: ["latin"],
  display: "swap",
  variable: "--font-righteous",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${clearSans.variable} ${jetbrainsMono.variable} ${righteous.variable}`} suppressHydrationWarning>
      <head>
        {/* Remove unused preconnects as suggested by PageSpeed */}
        <link rel="dns-prefetch" href="https://argenstats.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-analytics.com" />
        
        {/* Structured data for SEO */}
        <StructuredData data={OrganizationSchema} />
        <StructuredData data={WebsiteSchema} />
        
        {/* Critical CSS hint */}
        <link rel="preload" href="/fonts/ClearSans-Regular.woff" as="font" type="font/woff" crossOrigin="" />
        <link rel="preload" href="/fonts/ClearSans-Bold.woff" as="font" type="font/woff" crossOrigin="" />
        
        {/* Performance hints */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        
        {/* Resource hints for better performance */}
        <link rel="prefetch" href="/api/stats" />
        <link rel="preconnect" href="https://api.argenstats.com" />
      </head>
      <body suppressHydrationWarning>
        <AppWrapper>
          <NavBar />
          {children}
          <Footer />
        </AppWrapper>
        <GoogleAnalytics gaId="G-WFK681BVSD" />
        <Analytics />

      </body>
    </html>
  );
}