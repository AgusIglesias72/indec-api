"use client"

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Key, RefreshCw, Star, Bell, Settings } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      fetchApiKey()
    }
  }, [isLoaded, user])

  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api/user/api-key')
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
      }
    } catch (error) {
      console.error('Error fetching API key:', error)
    }
  }

  const generateApiKey = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/api-key', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        toast.success('Nueva API Key generada')
      } else {
        toast.error('Error al generar API Key')
      }
    } catch (error) {
      console.error('Error generating API key:', error)
      toast.error('Error al generar API Key')
    } finally {
      setLoading(false)
    }
  }

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      toast.success('API Key copiada al portapapeles')
    }
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">No autorizado</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu cuenta y configuraciones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-gray-900">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user.emailAddresses[0]?.emailAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Activo
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* API Key Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Key
                </CardTitle>
                <CardDescription>
                  Tu clave personal para acceder a nuestra API de forma gratuita
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiKey ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-100 p-2 rounded text-sm font-mono break-all">
                        {apiKey}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyApiKey}
                        className="flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={generateApiKey}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Regenerar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">No tienes una API Key generada</p>
                    <Button
                      onClick={generateApiKey}
                      disabled={loading}
                      className="bg-indec-blue hover:bg-indec-blue-dark"
                    >
                      {loading ? 'Generando...' : 'Generar API Key'}
                    </Button>
                  </div>
                )}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Tu API Key es personal y no debe compartirse</p>
                  <p>• Incluye el header: Authorization: Bearer tu_api_key</p>
                  <p>• Acceso gratuito a todos los endpoints</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Favoritos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Próximamente podrás guardar tus indicadores favoritos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Configurar alertas personalizadas para indicadores</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}