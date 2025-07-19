// src/app/layout.tsx
import type { Metadata } from "next";
import { JetBrains_Mono, Righteous } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import AppWrapper from "@/lib/AppWrapper";
import NavBar from "@/components/landing/Navbar";
import Footer from "@/components/landing/CTAFooter";
import { defaultMetadata } from "@/lib/metadata";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from "@vercel/analytics/next"

const clearSans = localFont({
  src: [
    {
      path: '../fonts/ClearSans-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/ClearSans-Italic.woff',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/ClearSans-Light.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/ClearSans-Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/ClearSans-MediumItalic.woff',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../fonts/ClearSans-Bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/ClearSans-BoldItalic.woff',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../fonts/ClearSans-Thin.woff',
      weight: '100',
      style: 'normal',
    },
  ],
  variable: '--font-clear-sans',
  display: 'swap',
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
    <html lang="es" className={`${clearSans.variable} ${jetbrainsMono.variable} ${righteous.variable}`}>
      <body>
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