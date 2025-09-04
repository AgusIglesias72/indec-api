'use client';

import { useUser } from '@clerk/nextjs';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Users, TrendingUp, AlertCircle, CheckCircle2, Target, Award, Zap, Star, Gamepad2, Sparkles, Timer, FileText, Shield } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import Leaderboard from '@/components/events/Leaderboard';
import PredictionsTable from '@/components/events/PredictionsTable';

interface Event {
  id: string;
  slug: string;
  name: string;
  description: string;
  event_date: string;
  submission_deadline: string;
  prize_amount: number;
  prize_currency: string;
  status: 'upcoming' | 'active' | 'closed' | 'finished';
}

interface Prediction {
  id: string;
  event_id: string;
  user_id: string;
  user_email: string;
  ipc_general: number;
  ipc_bienes: number;
  ipc_servicios: number;
  ipc_alimentos_bebidas: number;
  score?: number;
  rank?: number;
  created_at: string;
}

interface Stats {
  participant_count: number;
  avg_ipc_general: number;
  avg_ipc_bienes: number;
  avg_ipc_servicios: number;
  avg_ipc_alimentos_bebidas: number;
}

interface EventResult {
  ipc_general: number;
  ipc_bienes: number;
  ipc_servicios: number;
  ipc_alimentos_bebidas: number;
}

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [userPrediction, setUserPrediction] = useState<Prediction | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [eventResult, setEventResult] = useState<EventResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progressScore, setProgressScore] = useState(0);
  const [completedFields, setCompletedFields] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const [formData, setFormData] = useState({
    ipc_general: '',
    ipc_bienes: '',
    ipc_servicios: '',
    ipc_alimentos_bebidas: ''
  });

  // Get actual user from Clerk
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (params.slug && isLoaded) {
      fetchEventData();
    }
  }, [params.slug, isLoaded, user]);

  useEffect(() => {
    if (event?.submission_deadline) {
      const timer = setInterval(() => {
        const now = new Date();
        const deadline = new Date(event.submission_deadline);
        const diff = differenceInSeconds(deadline, now);
        
        if (diff <= 0) {
          setTimeLeft('🔒 Cerrado');
          clearInterval(timer);
        } else {
          const days = Math.floor(diff / 86400);
          const hours = Math.floor((diff % 86400) / 3600);
          const minutes = Math.floor((diff % 3600) / 60);
          const seconds = diff % 60;
          
          if (days > 0) {
            setTimeLeft(`⏰ ${days}d ${hours}h ${minutes}m`);
          } else if (hours > 0) {
            setTimeLeft(`⏰ ${hours}h ${minutes}m ${seconds}s`);
          } else {
            setTimeLeft(`⚡ ${minutes}m ${seconds}s`);
          }
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [event]);

  // Calculate progress based on filled fields
  useEffect(() => {
    const fields = Object.values(formData);
    const filled = fields.filter(field => field !== '').length;
    setCompletedFields(filled);
    setProgressScore((filled / 4) * 100);
  }, [formData]);

  async function fetchEventData() {
    try {
      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Check for existing prediction from database if user is logged in
      if (user) {
        const { data: existingPrediction } = await supabase
          .from('event_predictions')
          .select('*')
          .eq('event_id', eventData.id)
          .eq('user_id', user.id)
          .single();
        
        if (existingPrediction) {
          setUserPrediction(existingPrediction);
        }
      }

      // Fetch event results if available
      const { data: resultData } = await supabase
        .from('event_results')
        .select('ipc_general, ipc_bienes, ipc_servicios, ipc_alimentos_bebidas')
        .eq('event_id', eventData.id)
        .single();
      
      setEventResult(resultData);

      // Fetch stats using the event data we just fetched
      await fetchStatsForEvent(eventData.id);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStatsForEvent(eventId: string) {
    if (!eventId) return;
    
    try {
      const { data: predictions, error } = await supabase
        .from('event_predictions')
        .select('ipc_general, ipc_bienes, ipc_servicios, ipc_alimentos_bebidas')
        .eq('event_id', eventId);
      
      if (error) {
        console.error('Error fetching stats:', error);
        return; // Keep previous stats on error
      }
      console.log(predictions)
      if (predictions && predictions.length > 0) {
        setStats({
          participant_count: predictions.length + 50, // Add 50 fictional participants
          avg_ipc_general: predictions.reduce((sum, p) => sum + Number(p.ipc_general), 0) / predictions.length,
          avg_ipc_bienes: predictions.reduce((sum, p) => sum + Number(p.ipc_bienes), 0) / predictions.length,
          avg_ipc_servicios: predictions.reduce((sum, p) => sum + Number(p.ipc_servicios), 0) / predictions.length,
          avg_ipc_alimentos_bebidas: predictions.reduce((sum, p) => sum + Number(p.ipc_alimentos_bebidas), 0) / predictions.length
        });
      } else {
        setStats({
          participant_count: 50, // Base fictional participants
          avg_ipc_general: 0,
          avg_ipc_bienes: 0,
          avg_ipc_servicios: 0,
          avg_ipc_alimentos_bebidas: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  // Helper function to standardize decimal input (replace comma with dot)
  function standardizeDecimal(value: string): number {
    const standardized = value.replace(',', '.');
    const parsed = parseFloat(standardized);
    
    // Validate that the result is a valid number
    if (isNaN(parsed)) {
      throw new Error(`Invalid number format: ${value}`);
    }
    
    return parsed;
  }

  // Helper function to generate a proper UUID v4
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    setSubmitting(true);
    try {
      // Check if user is logged in
      if (!user) {
        toast.error('🔐 Debes iniciar sesión para participar', {
          duration: 4000,
        });
        return;
      }

      const prediction = {
        id: generateUUID(),
        event_id: event?.id as string,
        user_id: user.id,
        user_email: user.primaryEmailAddress?.emailAddress || 'unknown',
        ipc_general: standardizeDecimal(formData.ipc_general),
        ipc_bienes: standardizeDecimal(formData.ipc_bienes),
        ipc_servicios: standardizeDecimal(formData.ipc_servicios),
        ipc_alimentos_bebidas: standardizeDecimal(formData.ipc_alimentos_bebidas),
        created_at: new Date().toISOString()
      };

      // Save to Supabase
      const { error } = await supabase
        .from('event_predictions')
        .insert(prediction);

      if (error) throw error;

      
      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);

      toast.success('🎉 ¡Predicción registrada exitosamente!', {
        description: '¡Tu predicción ha sido guardada! ¡Buena suerte!',
        duration: 5000,
      });
      
      setUserPrediction(prediction);
      
      // Cambiar el formulario para mostrar valores ingresados en modo solo lectura
      setFormData({
        ipc_general: prediction.ipc_general.toString(),
        ipc_bienes: prediction.ipc_bienes.toString(),
        ipc_servicios: prediction.ipc_servicios.toString(),
        ipc_alimentos_bebidas: prediction.ipc_alimentos_bebidas.toString()
      });
      
      await fetchEventData();
    } catch (error: any) {
      console.error('Error:', error);
      if (error.code === '23505') {
        toast.error('Ya registraste tu predicción para este evento');
      } else if (error.code === '22P02') {
        toast.error('Error en el formato de los datos. Intenta nuevamente.');
      } else if (error.message?.includes('invalid input syntax')) {
        toast.error('Error en el formato de los datos. Verifica tus números.');
      } else {
        toast.error('Error al registrar la predicción. Intenta nuevamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function getFieldIcon(fieldName: string) {
    const icons = {
      ipc_general: '🏛️',
      ipc_bienes: '📦',
      ipc_servicios: '🔧',
      ipc_alimentos_bebidas: '🍽️'
    };
    return icons[fieldName as keyof typeof icons] || '📊';
  }

  function getFieldStatus(value: string) {
    if (!value) return '⚪';
    return '✅';
  }

  if (loading || !isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-blue-600">⚡ Cargando tu desafío...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>🔍 Evento no encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isDeadlinePassed = new Date(event.submission_deadline) < new Date();

  return (
    <>
      {/* JSON-LD Structured Data */}
      {event && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              "name": event.name,
              "description": event.description,
              "startDate": event.event_date,
              "endDate": event.submission_deadline,
              "eventStatus": event.status === 'active' ? 'https://schema.org/EventScheduled' : 
                           event.status === 'finished' ? 'https://schema.org/EventCancelled' : 
                           'https://schema.org/EventScheduled',
              "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
              "location": {
                "@type": "VirtualLocation",
                "url": `https://argenstats.com/eventos/${event.slug}`
              },
              "organizer": {
                "@type": "Organization",
                "name": "ArgenStats",
                "url": "https://argenstats.com"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "validFrom": new Date().toISOString(),
                "validThrough": event.submission_deadline
              },
              "isAccessibleForFree": true,
              "url": `https://argenstats.com/eventos/${event.slug}`,
              "image": `https://argenstats.com/og-evento-${event.slug}.jpg`,
              "performer": {
                "@type": "Organization",
                "name": "INDEC",
                "url": "https://www.indec.gob.ar"
              }
            })
          }}
        />
      )}
      <div className="container mx-auto px-4 py-8 relative">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-8xl animate-bounce">🎉</div>
          <div className="absolute text-6xl animate-ping">✨</div>
          <div className="absolute text-4xl animate-pulse">🏆</div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Event Header */}
        <div className="mb-8 relative overflow-hidden rounded-xl bg-white border-2 border-gray-200 p-8">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Trophy className="h-8 w-8 text-blue-600" />
                {event.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge className={`${event.status === 'active' ? 'bg-green-600' : 'bg-gray-600'} text-white text-base px-4 py-2`}>
                  {event.status === 'active' ? 'Activo' : 'Cerrado'}
                </Badge>
              </div>
            </div>
            <p className="text-lg text-gray-600 mb-6">{event.description}</p>
            
            {/* Progress Indicator for Completion */}
            {!userPrediction && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progreso de predicción</span>
                  <span className="text-sm font-medium text-gray-700">{completedFields}/4 campos completados</span>
                </div>
                <Progress value={progressScore} className="h-3" />
                <p className="text-sm mt-2 text-gray-600">
                  {progressScore === 100 ? 'Listo para enviar predicción' : 
                   progressScore > 50 ? 'Casi completo' : 
                   progressScore > 0 ? 'En progreso' : 'Complete sus predicciones para continuar'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Event Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-blue-100 rounded-full">
                  <Timer className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Tiempo restante</p>
                  <p className="text-base md:text-xl font-bold text-blue-600">{timeLeft || '⏳ Calculando...'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-green-100 rounded-full">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Participantes</p>
                  <p className="text-base md:text-xl font-bold text-green-600">{stats?.participant_count || 50}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-yellow-200 hover:border-yellow-400 transition-colors">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-yellow-100 rounded-full">
                  <Trophy className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Premio</p>
                  <p className="text-base md:text-xl font-bold text-yellow-600">{event.prize_currency} {event.prize_amount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-purple-100 rounded-full">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Fecha del evento</p>
                  <p className="text-base md:text-xl font-bold text-purple-600">
                    {format(new Date(event.event_date), 'dd MMM', { locale: es })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Description */}
        <div className="mb-12 max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">¿Cómo funciona el evento?</h2>
              </div>
              
              <div className="prose prose-lg mx-auto text-gray-700">
                <p className="mb-4 leading-relaxed">
                  Participar es muy sencillo: solo necesitas predecir los valores del Índice de Precios al Consumidor (IPC) 
                  para agosto 2025 en sus cuatro categorías principales. El INDEC publicará los datos oficiales el 
                  <span className="font-semibold text-blue-700"> 10 de septiembre</span>, y quien más se acerque a los 
                  valores reales ganará el premio de <span className="font-bold text-green-700">USD 100</span>.
                </p>
                
                <p className="leading-relaxed">
                  El sistema de puntuación es completamente transparente: calculamos la desviación absoluta entre 
                  tus predicciones y los valores oficiales. <span className="font-semibold">Menor desviación = mejor puntuación</span>. 
                  Solo tienes que completar los cuatro campos con tus predicciones y enviar tu participación antes del 
                  <span className="font-semibold text-red-700"> 9 de septiembre a las 16hs</span>. ¡Es así de simple!
                </p>
              </div>
              
              <div className="flex justify-center mt-6">
                <div className="bg-white rounded-lg px-6 py-3 border-2 border-blue-200 shadow-sm">
                  <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Una predicción por usuario • Resultados 100% transparentes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Content */}
        <Tabs defaultValue={eventResult ? "results" : userPrediction ? "predictions" : "predict"} className="w-full">
          <TabsList className={`grid w-full ${eventResult ? 'grid-cols-3' : 'grid-cols-2'} h-16 p-2 bg-gray-100 rounded-lg`}>
            <TabsTrigger value="predict" className="text-base py-3 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200">
              Mi Predicción
            </TabsTrigger>
            <TabsTrigger value="predictions" className="text-base py-3 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200">
              Todas las Predicciones
            </TabsTrigger>
            {eventResult && <TabsTrigger value="results" className="text-base py-3 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200">Resultados</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="predict">
            {userPrediction ? (
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="bg-green-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <CheckCircle2 className="h-6 w-6" />
                    Predicción Registrada Exitosamente
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    Enviada el {format(new Date(userPrediction.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Alert className="mb-6 border-2 border-green-300 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-lg text-green-800">
                      Tu predicción ha sido guardada correctamente. Los valores no pueden ser modificados.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                          🏛️ IPC General (%)
                        </Label>
                        <Input
                          type="number"
                          value={userPrediction.ipc_general}
                          className="text-lg p-4 border-2 bg-gray-100 cursor-not-allowed font-bold text-blue-600"
                          disabled
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                          📦 Bienes (%)
                        </Label>
                        <Input
                          type="number"
                          value={userPrediction.ipc_bienes}
                          className="text-lg p-4 border-2 bg-gray-100 cursor-not-allowed font-bold text-green-600"
                          disabled
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                          🔧 Servicios (%)
                        </Label>
                        <Input
                          type="number"
                          value={userPrediction.ipc_servicios}
                          className="text-lg p-4 border-2 bg-gray-100 cursor-not-allowed font-bold text-purple-600"
                          disabled
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                          🍽️ Alimentos y Bebidas (%)
                        </Label>
                        <Input
                          type="number"
                          value={userPrediction.ipc_alimentos_bebidas}
                          className="text-lg p-4 border-2 bg-gray-100 cursor-not-allowed font-bold text-orange-600"
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-center shadow-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                      <p className="text-white font-bold text-lg">¡Ya estás participando!</p>
                    </div>
                    <p className="text-white opacity-90">Los resultados se publicarán el 10 de septiembre</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-blue-200">
                <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Target className="h-6 w-6" />
                    Realizar Predicción
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Ingresa tus predicciones para el IPC de {format(new Date(event.event_date), 'MMMM yyyy', { locale: es })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {isDeadlinePassed ? (
                    <Alert className="border-2 border-red-300 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-lg">
                        El período de predicciones ha cerrado
                      </AlertDescription>
                    </Alert>
                  ) : !user ? (
                    <Alert className="border-2 border-yellow-300 bg-yellow-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-lg">
                        Debe <Link href={`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`} className="text-blue-600 underline font-semibold">iniciar sesión</Link> para participar en el evento
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="ipc_general" className="text-lg font-semibold flex items-center gap-2">
                            {getFieldIcon('ipc_general')} IPC General (%)
                            <span className="text-2xl">{getFieldStatus(formData.ipc_general)}</span>
                          </Label>
                          <Input
                            id="ipc_general"
                            type="number"
                            step="0.1"
                            min="-99.9"
                            max="99.9"
                            placeholder="Ej: 3.5"
                            value={formData.ipc_general}
                            onChange={(e) => setFormData({...formData, ipc_general: e.target.value})}
                            className="text-lg p-4 border-2 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ipc_bienes" className="text-lg font-semibold flex items-center gap-2">
                            {getFieldIcon('ipc_bienes')} Bienes (%)
                            <span className="text-2xl">{getFieldStatus(formData.ipc_bienes)}</span>
                          </Label>
                          <Input
                            id="ipc_bienes"
                            type="number"
                            step="0.1"
                            min="-99.9"
                            max="99.9"
                            placeholder="Ej: 4.2"
                            value={formData.ipc_bienes}
                            onChange={(e) => setFormData({...formData, ipc_bienes: e.target.value})}
                            className="text-lg p-4 border-2 focus:border-green-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ipc_servicios" className="text-lg font-semibold flex items-center gap-2">
                            {getFieldIcon('ipc_servicios')} Servicios (%)
                            <span className="text-2xl">{getFieldStatus(formData.ipc_servicios)}</span>
                          </Label>
                          <Input
                            id="ipc_servicios"
                            type="number"
                            step="0.1"
                            min="-99.9"
                            max="99.9"
                            placeholder="Ej: 2.8"
                            value={formData.ipc_servicios}
                            onChange={(e) => setFormData({...formData, ipc_servicios: e.target.value})}
                            className="text-lg p-4 border-2 focus:border-purple-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ipc_alimentos_bebidas" className="text-lg font-semibold flex items-center gap-2">
                            {getFieldIcon('ipc_alimentos_bebidas')} Alimentos y Bebidas (%)
                            <span className="text-2xl">{getFieldStatus(formData.ipc_alimentos_bebidas)}</span>
                          </Label>
                          <Input
                            id="ipc_alimentos_bebidas"
                            type="number"
                            step="0.1"
                            min="-99.9"
                            max="99.9"
                            placeholder="Ej: 3.9"
                            value={formData.ipc_alimentos_bebidas}
                            onChange={(e) => setFormData({...formData, ipc_alimentos_bebidas: e.target.value})}
                            className="text-lg p-4 border-2 focus:border-orange-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <Alert className="border-2 border-yellow-300 bg-yellow-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-lg">
                          Una vez enviada, no podrá modificar su predicción
                        </AlertDescription>
                      </Alert>
                      
                      <Button 
                        type="submit" 
                        className={`w-full text-xl py-6 ${progressScore === 100 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-white'} transition-all duration-300`}
                        disabled={submitting || progressScore < 100}
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                            Enviando predicción...
                          </span>
                        ) : progressScore === 100 ? (
                          <span className="flex items-center gap-2">
                            <Trophy className="h-6 w-6" />
                            Enviar predicción
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Complete todos los campos ({completedFields}/4)
                          </span>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="predictions">
            <PredictionsTable 
              eventId={event?.id} 
              showUserPrediction={!!userPrediction}
              userPredictionId={userPrediction?.id}
            />
          </TabsContent>
          
          {eventResult && (
            <TabsContent value="results">
              <Leaderboard eventId={event?.id as string} eventResults={eventResult} />
            </TabsContent>
          )}
        </Tabs>
      </div>
      </div>
    </>
  );
}