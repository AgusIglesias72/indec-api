import RiesgoPaisPageClient from './RiskCountryPageClient'

// Revalidar cada 60 segundos para datos de Riesgo País
export const revalidate = 60

export default function RiskCountryPage() {
  return <RiesgoPaisPageClient />
}