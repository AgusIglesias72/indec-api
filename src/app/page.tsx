import HeaderHero from "@/components/landing/HeaderHero"
import Stats from "@/components/landing/Stats"
import Indicators from "@/components/landing/Indicators"
import CtaFooter from "@/components/landing/CTAFooter"
import Features from "@/components/landing/Features"
import ApiSection from "@/components/landing/ApiSection"
import DashboardSection from "@/components/landing/DashboardSection"

export default function HomePage() {
  return (
    <>
      <HeaderHero />
      <DashboardSection />
      <Features />
      <Stats />
      <Indicators />
      <ApiSection />
      <CtaFooter />
    </>
  )
}