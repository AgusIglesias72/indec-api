import HeaderHero from "@/components/landing/HeaderHero"
import Features from "@/components/landing/Features"
import Stats from "@/components/landing/Stats"
import Indicators from "@/components/landing/Indicators"
import ApiSection from "@/components/landing/ApiSection"
import CtaFooter from "@/components/landing/CTAFooter"

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