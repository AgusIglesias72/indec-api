// src/app/layout.tsx - Optimized for performance
import type { Metadata } from "next";
import { JetBrains_Mono, Righteous, Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import AppWrapper from "@/lib/AppWrapper";
import NavBar from "@/components/landing/Navbar";
import { defaultMetadata } from "@/lib/metadata";
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/next"
import StructuredData, { OrganizationSchema, WebsiteSchema } from "@/components/StructuredData"
import ClarityScript from "@/components/ClarityScript"

// Lazy load footer to improve initial page load
const Footer = dynamic(() => import("@/components/landing/CTAFooter"), {
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse" />
  )
});


export const metadata: Metadata = defaultMetadata;


// Mantener JetBrains_Mono para código
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

// Import Righteous font (solo para títulos)
const righteous = Righteous({
  weight: '400', // Righteous only comes in regular 400 weight
  subsets: ["latin"],
  display: "swap",
  variable: "--font-righteous",
});

// Import Inter font (fuente principal)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ['300', '400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} ${righteous.variable}`} suppressHydrationWarning>
      <head>
        {/* Remove unused preconnects as suggested by PageSpeed */}
        <link rel="dns-prefetch" href="https://argenstats.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-analytics.com" />
        
        {/* Structured data for SEO */}
        <StructuredData data={OrganizationSchema} />
        <StructuredData data={WebsiteSchema} />
        
        
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
        <ClarityScript />
      </body>
    </html>
  );
}