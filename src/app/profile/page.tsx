// src/app/profile/page.tsx
"use client"

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Copy, 
  Key, 
  RefreshCw, 
  Star, 
  Mail, 
  Calendar, 
  Shield, 
  User, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Code, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ExternalLink,
  LayoutDashboard,
  Calculator,
  Wrench,
  Trophy
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

// Skeleton components para loading
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="bg-gradient-to-r from-indec-blue to-indec-blue-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="h-32 w-32 bg-white/20 rounded-full animate-pulse"></div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="h-10 bg-white/20 rounded animate-pulse w-64 mx-auto md:mx-0"></div>
            <div className="h-6 bg-white/20 rounded animate-pulse w-48 mx-auto md:mx-0"></div>
            <div className="h-8 bg-white/20 rounded animate-pulse w-32 mx-auto md:mx-0"></div>
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Tipos de contacto
const contactTypes = [
  {
    id: 'general',
    label: 'Consulta General',
    icon: MessageSquare,
    description: 'Preguntas generales sobre ArgenStats',
  },
  {
    id: 'api',
    label: 'API / Integración',
    icon: Code,
    description: 'Dudas técnicas sobre nuestra API',
  },
  {
    id: 'bug',
    label: 'Reportar Bug',
    icon: Bug,
    description: 'Encontraste un error o problema',
  },
  {
    id: 'feature',
    label: 'Solicitar Feature',
    icon: Lightbulb,
    description: 'Ideas para nuevas funcionalidades',
  }
]

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  contact_type: string
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Contact form state
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    contact_type: 'general'
  })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactStatus, setContactStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [contactMessage, setContactMessage] = useState('')

  useEffect(() => {
    setMounted(true)
    if (isLoaded && user) {
      fetchApiKey()
      // Pre-rellenar el formulario de contacto con datos del usuario
      setContactForm(prev => ({
        ...prev,
        name: user.fullName || '',
        email: user.emailAddresses[0]?.emailAddress || ''
      }))
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!contactForm.message.trim() || contactForm.message.length < 10) {
      toast.error('El mensaje debe tener al menos 10 caracteres')
      return
    }

    setContactLoading(true)
    setContactStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      })

      const result = await response.json()

      if (result.success) {
        setContactStatus('success')
        setContactMessage('¡Gracias por tu mensaje! Te responderemos pronto.')
        
        // Limpiar formulario (mantener nombre y email)
        setContactForm(prev => ({
          ...prev,
          subject: '',
          message: '',
          contact_type: 'general'
        }))
      } else {
        setContactStatus('error')
        setContactMessage(result.error || 'Error al enviar el mensaje')
      }
    } catch (error) {
      setContactStatus('error')
      setContactMessage('Error de conexión. Inténtalo nuevamente.')
    } finally {
      setContactLoading(false)
    }
  }

  // Para evitar problemas de hidratación, mostrar skeleton hasta que esté montado
  if (!mounted || !isLoaded) {
    return <ProfileSkeleton />
  }

  // Si no hay usuario, redirigir
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
            <p className="text-gray-600 mb-6">Necesitas iniciar sesión para ver tu perfil</p>
            <Button asChild className="w-full">
              <Link href="/sign-in">Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indec-blue to-indec-blue-dark text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <Avatar className="h-32 w-32 ring-4 ring-white/20">
                <AvatarImage src={user?.imageUrl || undefined} alt={user?.fullName || ""} />
                <AvatarFallback className="bg-white/20 text-white text-4xl font-bold">
                  {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{user?.fullName || 'Usuario'}</h1>
              <p className="text-indec-blue-light flex items-center gap-2 justify-center md:justify-start">
                <Mail className="h-4 w-4" />
                {user?.emailAddresses[0]?.emailAddress}
              </p>
              <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
                <Badge className="bg-white/20 text-white border-white/40 hover:bg-white/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Acceso Ilimitado
                </Badge>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Activo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">API Key</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Contacto</span>
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <TabsContent value="account" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Tu información de perfil y datos de cuenta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                        <input 
                          type="text" 
                          value={user.fullName || ''} 
                          className="w-full px-3 py-2 border rounded-lg bg-gray-50" 
                          disabled 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input 
                          type="email" 
                          value={user.emailAddresses[0]?.emailAddress} 
                          className="w-full px-3 py-2 border rounded-lg bg-gray-50" 
                          disabled 
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Miembro desde</span>
                          <span className="font-medium">{new Date(user.createdAt!).toLocaleDateString('es-AR')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Favoritos Section (Placeholder) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Indicadores Favoritos
                    </CardTitle>
                    <CardDescription>Guarda tus indicadores más consultados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Aún no tienes favoritos</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Esta función estará disponible muy pronto. Podrás guardar tus indicadores más consultados para acceso rápido.
                      </p>
                      <Badge variant="secondary">Próximamente</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Dashboard Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard Personalizado
                    </CardTitle>
                    <CardDescription>Panel de control con tus indicadores favoritos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <LayoutDashboard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Dashboard en desarrollo</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Tendrás un panel personalizado con gráficos y análisis de tus indicadores favoritos.
                      </p>
                      <Badge variant="secondary">Próximamente</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Newsletter Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Newsletter ArgenStats
                    </CardTitle>
                    <CardDescription>Recibe análisis y actualizaciones semanales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Suscripción al newsletter</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Recibe resúmenes semanales con los principales indicadores económicos y análisis de tendencias.
                      </p>
                      <Badge variant="secondary">Próximamente</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Eventos Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      Eventos de Predicción
                    </CardTitle>
                    <CardDescription>Participa en nuestros eventos y gana premios</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Evento Activo */}
                    <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <Link href="/eventos" className="flex items-center gap-3 group">
                        <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-green-900 group-hover:text-green-700 transition-colors">
                              IPC Agosto 2025
                            </h4>
                            <Badge className="bg-green-600 text-white text-xs px-2 py-1">ACTIVO</Badge>
                          </div>
                          <p className="text-sm text-green-700 mb-2">
                            Predice los valores del IPC de agosto 2025 y gana US$ 100
                          </p>
                          <div className="flex items-center gap-4 text-xs text-green-600">
                            <span>🎯 27 participantes</span>
                            <span>⏰ Cierra: 09 sep</span>
                            <span>💰 USD 100</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <ExternalLink className="h-4 w-4 text-green-500 group-hover:text-green-700 transition-colors" />
                          <span className="text-xs text-green-600 font-medium">Participar</span>
                        </div>
                      </Link>
                    </div>

                    {/* Próximos Eventos */}
                    <div className="border rounded-lg p-4 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center relative">
                          <Trophy className="h-6 w-6 text-gray-400" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">+</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-700">
                            Más Eventos Próximamente
                          </h4>
                          <p className="text-sm text-gray-500 mb-2">
                            Estamos preparando más eventos de predicción económica
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Newsletter</Badge>
                            <span className="text-xs text-gray-500">para estar al día</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <Button variant="outline" asChild className="w-full border-2 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300">
                        <Link href="/eventos" className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          Ver Todos los Eventos
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Herramientas Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Herramientas
                    </CardTitle>
                    <CardDescription>Utilidades y calculadoras económicas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Conversor USD/ARS */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <Link href="/conversor-dolar-peso-argentino" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 bg-indec-blue/10 rounded-lg flex items-center justify-center">
                          <Calculator className="h-5 w-5 text-indec-blue" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 group-hover:text-indec-blue transition-colors">
                            Conversor USD/ARS
                          </h4>
                          <p className="text-sm text-gray-600">
                            Convierte entre dólares y pesos argentinos con cotizaciones en tiempo real
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-indec-blue transition-colors" />
                      </Link>
                    </div>

                    {/* Calculadora de Inflación */}
                    <div className="border rounded-lg p-4 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center relative">
                          <Calculator className="h-5 w-5 text-gray-400" />
                          <AlertCircle className="h-3 w-3 text-amber-500 absolute -top-1 -right-1" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-600">
                            Calculadora de Inflación
                          </h4>
                          <p className="text-sm text-gray-500">
                            Calcula el poder adquisitivo a lo largo del tiempo usando datos del IPC
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Próximamente</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>API Key de Acceso</CardTitle>
                    <CardDescription>
                      Tu clave personal para acceso ilimitado a nuestra API desde herramientas externas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {apiKey ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <label className="text-sm font-medium text-gray-700 block mb-2">Tu API Key</label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white px-4 py-3 rounded-md text-sm font-mono border border-gray-300 break-all">
                              {apiKey}
                            </code>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={copyApiKey}
                              className="hover:bg-indec-blue hover:text-white hover:border-indec-blue flex-shrink-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-green-900">¡Sin límites de uso!</p>
                              <p className="text-sm text-green-700 mt-1">
                                Puedes hacer todas las requests que necesites. Solo llevamos un seguimiento para estadísticas internas.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-amber-900">Importante</p>
                              <p className="text-sm text-amber-700 mt-1">
                                Regenerar tu API Key invalidará la anterior inmediatamente. Actualiza tus aplicaciones antes de regenerar.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No tienes una API Key generada</p>
                        <p className="text-sm text-gray-500 mb-6">Genera una clave para empezar a usar nuestra API desde herramientas externas</p>
                      </div>
                    )}
                    
                    <Button
                      onClick={generateApiKey}
                      disabled={loading}
                      className="w-full bg-indec-blue hover:bg-indec-blue-dark"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="h-4 w-4 mr-2" />
                      )}
                      {apiKey ? 'Regenerar API Key' : 'Generar API Key'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cómo usar tu API Key</CardTitle>
                    <CardDescription>Ejemplos rápidos para empezar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Usando curl:</h4>
                      <code className="block bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                        curl -H &quot;x-api-key: {apiKey || 'tu-api-key'}&quot; \<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;https://argenstats.com/api/dollar
                      </code>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">JavaScript/Fetch:</h4>
                      <code className="block bg-gray-900 text-blue-400 p-3 rounded text-sm overflow-x-auto">
                        fetch(&apos;https://argenstats.com/api/dollar&apos;, {`{`}<br />
                        &nbsp;&nbsp;headers: {`{`} &apos;x-api-key&apos;: &apos;{apiKey || 'tu-api-key'}&apos; {`}`}<br />
                        {`}`})
                      </code>
                    </div>
                    <div className="pt-4 border-t">
                      <Button variant="outline" asChild className="w-full">
                        <a href="/documentacion" target="_blank" className="flex items-center gap-2">
                          Ver Documentación Completa
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Contactanos</CardTitle>
                    <CardDescription>
                      ¿Tienes preguntas, sugerencias o encontraste un problema? Nos encanta escuchar de nuestros usuarios.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      {/* Tipo de Consulta */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Tipo de Consulta
                        </Label>
                        <RadioGroup
                          value={contactForm.contact_type}
                          onValueChange={(value) => setContactForm(prev => ({ ...prev, contact_type: value }))}
                          className="grid grid-cols-2 gap-3"
                        >
                          {contactTypes.map((type) => {
                            const IconComponent = type.icon;
                            return (
                              <div key={type.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={type.id} id={type.id} />
                                <Label 
                                  htmlFor={type.id} 
                                  className="flex items-center gap-2 cursor-pointer text-sm"
                                >
                                  <IconComponent className="w-4 h-4 text-indec-blue" />
                                  {type.label}
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </div>

                      {/* Asunto */}
                      <div className="space-y-2">
                        <Label htmlFor="subject">Asunto (opcional)</Label>
                        <Input
                          id="subject"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Resumen breve de tu consulta"
                        />
                      </div>

                      {/* Mensaje */}
                      <div className="space-y-2">
                        <Label htmlFor="message">Mensaje *</Label>
                        <Textarea
                          id="message"
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Describe tu consulta en detalle. Mientras más información nos des, mejor podremos ayudarte."
                          rows={5}
                          required
                        />
                      </div>

                      {/* Status Message */}
                      {contactStatus !== 'idle' && (
                        <Alert className={contactStatus === 'success' ? 'border-green-500' : 'border-red-500'}>
                          {contactStatus === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <AlertDescription className={contactStatus === 'success' ? 'text-green-700' : 'text-red-700'}>
                            {contactMessage}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        disabled={contactLoading}
                        className="w-full bg-indec-blue hover:bg-indec-blue-dark"
                      >
                        {contactLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Mensaje
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-gray-500">
                        Te responderemos dentro de las próximas 12 horas al email: {user.emailAddresses[0]?.emailAddress}
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Acceso Completo</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Tienes acceso ilimitado a toda nuestra API. Sin restricciones, sin límites.
                    </p>
                    <Badge className="bg-green-600 text-white">
                      API Ilimitada
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enlaces Útiles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/eventos" target="_blank">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-600" />
                      Eventos de Predicción
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/documentacion" target="_blank">
                      <Code className="h-4 w-4 mr-2" />
                      Documentación API
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/dolar" target="_blank">
                      <Star className="h-4 w-4 mr-2" />
                      Dólar en Tiempo Real
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/indicadores/ipc" target="_blank">
                      <Star className="h-4 w-4 mr-2" />
                      Inflación (IPC)
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}