import HeaderHero from "@/components/landing/HeaderHero"
import Stats from "@/components/landing/Stats"
import Indicators from "@/components/landing/Indicators"
import CtaFooter from "@/components/landing/CTAFooter"
import EnhancedFeaturesSection from "@/components/landing/DashboardFeatures"
import EnhancedApiSection from "@/components/landing/ApiSection"
import Features from "@/components/landing/Features"

export default function HomePage() {
  return (
    <div className="relative">
      {/* Main background pattern for the entire page */}
      <div 
          className="absolute inset-0 opacity-[0.85] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>
      
      <HeaderHero />
      <EnhancedFeaturesSection />
      <EnhancedApiSection />
      <Stats />
      <Indicators />
      <CtaFooter />
    </div>
  )
}