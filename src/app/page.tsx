import dynamic from "next/dynamic"

// Importación del HeaderHero simplificado
import HeaderHero from "@/components/landing/HeaderHero"
import Stats from "@/components/landing/Stats"
import Indicators from "@/components/landing/Indicators"
import CtaFooter from "@/components/landing/CTAFooter"
import Features from "@/components/landing/Features"
import ApiSection from "@/components/landing/ApiSection"

export default function HomePage() {
  return (
    <>
      <HeaderHero />
      <Features />
      <Stats />
      <Indicators />
      <ApiSection />
      <CtaFooter />
    </>
  )
}