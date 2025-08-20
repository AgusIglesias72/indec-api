import ModernEMAEPageClient from './EMAEPageClient'

// Revalidar cada 60 segundos para datos de EMAE
export const revalidate = 60

export default function EMAEPage() {
  return <ModernEMAEPageClient />
}