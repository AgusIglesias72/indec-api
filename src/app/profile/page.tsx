// src/app/profile/page.tsx
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
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-gray-900">{user.fullName || 'Sin nombre'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{user.emailAddresses[0].emailAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID de Usuario</label>
                  <p className="text-gray-900 font-mono text-sm">{user.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de registro</label>
                  <p className="text-gray-900">{new Date(user.createdAt!).toLocaleDateString('es-AR')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Key
                </CardTitle>
                <CardDescription>
                  Usa esta clave para acceder a nuestra API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiKey ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded-md text-sm font-mono">
                      {apiKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyApiKey}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No tienes una API Key generada</p>
                )}
                <Button
                  onClick={generateApiKey}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  {apiKey ? 'Regenerar API Key' : 'Generar API Key'}
                </Button>
                <p className="text-xs text-gray-500">
                  ⚠️ Regenerar tu API Key invalidará la anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="mb-4">Plan Free</Badge>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-500">Requests diarios:</span>
                    <span className="font-medium">100</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Favoritos:</span>
                    <span className="font-medium">10</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Alertas:</span>
                    <span className="font-medium">5</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Star className="h-4 w-4 mr-2" />
                  Mis Favoritos
                  <Badge variant="secondary" className="ml-auto">Próximamente</Badge>
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Bell className="h-4 w-4 mr-2" />
                  Mis Alertas
                  <Badge variant="secondary" className="ml-auto">Próximamente</Badge>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}