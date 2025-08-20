import ModernIPCPageClient from './IPCPageClient'

// Revalidar cada 60 segundos para datos de IPC
export const revalidate = 60

export default function IPCPage() {
  return <ModernIPCPageClient />
}