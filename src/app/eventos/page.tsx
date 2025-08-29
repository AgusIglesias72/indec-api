'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Clock, Users, DollarSign, TrendingUp, Target, Sparkles, Timer, Mail, Share2, FileText, Shield, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  submission_deadline: string;
  prize_amount: number;
  prize_currency: string;
  status: 'upcoming' | 'active' | 'closed' | 'finished';
  participant_count?: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('submission_deadline', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch participant count for each event
      const eventsWithCounts = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from('event_predictions')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', event.id);
          
          return {
            ...event,
            participant_count: (count || 0) + 27 // Agregar 27 participantes ficticios
          };
        })
      );

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusConfig(status: string) {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-600 text-white',
          icon: <Sparkles className="h-3 w-3" />,
          text: 'Activo',
          pulse: true
        };
      case 'upcoming':
        return {
          color: 'bg-blue-600 text-white',
          icon: <Timer className="h-3 w-3" />,
          text: 'Próximamente',
          pulse: false
        };
      case 'closed':
        return {
          color: 'bg-yellow-600 text-white',
          icon: <Clock className="h-3 w-3" />,
          text: 'Cerrado',
          pulse: false
        };
      case 'finished':
        return {
          color: 'bg-gray-600 text-white',
          icon: <Trophy className="h-3 w-3" />,
          text: 'Finalizado',
          pulse: false
        };
      default:
        return {
          color: 'bg-gray-500 text-white',
          icon: <Clock className="h-3 w-3" />,
          text: status,
          pulse: false
        };
    }
  }

  function getCardGradient(status: string) {
    switch (status) {
      case 'active':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'upcoming':
        return 'from-blue-50 to-indigo-50 border-blue-200';
      case 'closed':
        return 'from-yellow-50 to-orange-50 border-yellow-200';
      case 'finished':
        return 'from-gray-50 to-slate-50 border-gray-200';
      default:
        return 'from-gray-50 to-slate-50 border-gray-200';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <p className="text-lg font-medium text-gray-700">Cargando eventos...</p>
              <p className="text-sm text-gray-500">Preparando las mejores predicciones económicas</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      {events.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Eventos de Predicción Económica",
              "description": "Lista de eventos de predicción del IPC argentino con premios en efectivo",
              "url": "https://argenstats.com/eventos",
              "numberOfItems": events.length,
              "itemListElement": events.map((event, index) => ({
                "@type": "Event",
                "position": index + 1,
                "name": event.name,
                "description": event.description,
                "startDate": event.event_date,
                "endDate": event.submission_deadline,
                "url": `https://argenstats.com/eventos/${event.id}`,
                "eventStatus": event.status === 'active' ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventScheduled',
                "location": {
                  "@type": "VirtualLocation",
                  "url": `https://argenstats.com/eventos/${event.id}`
                },
                "organizer": {
                  "@type": "Organization",
                  "name": "ArgenStats",
                  "url": "https://argenstats.com"
                },
                "isAccessibleForFree": true
              }))
            })
          }}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-80"
            />
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Eventos de Predicción
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Participa en nuestros eventos de predicción económica, demuestra tu expertise y 
            <span className="font-semibold text-green-600"> gana premios increíbles</span>
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex justify-center gap-8 mt-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <p className="text-base font-semibold text-gray-700">Predicciones</p>
              <p className="text-sm text-gray-500">Precisas</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <p className="text-base font-semibold text-gray-700">Precisión</p>
              <p className="text-sm text-gray-500">Exacta</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <p className="text-base font-semibold text-gray-700">Premios</p>
              <p className="text-sm text-gray-500">Reales</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Events Grid */}
        <div className={`grid gap-8 ${events.length === 1 ? 'justify-center' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
          {events.map((event, index) => {
            const statusConfig = getStatusConfig(event.status);
            const cardGradient = getCardGradient(event.status);
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="w-full"
              >
                <Card className={`relative overflow-hidden bg-gradient-to-br ${cardGradient} border-2 hover:shadow-2xl transition-all duration-300 cursor-pointer`}>
                  {/* Status Badge */}
                  <div className="absolute top-6 right-6 z-10">
                    <Badge className={`${statusConfig.color} px-4 py-2 font-semibold text-sm shadow-lg ${statusConfig.pulse ? 'animate-pulse' : ''}`}>
                      <span className="flex items-center gap-2">
                        {statusConfig.icon}
                        {statusConfig.text}
                      </span>
                    </Badge>
                  </div>

                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-bl from-white to-transparent rounded-full transform rotate-45 scale-150" />
                  </div>

                  <div className="flex flex-col xl:flex-row">
                    {/* Left Column - Main Content */}
                    <div className="flex-1 p-8 xl:pr-6">
                      <CardHeader className="p-0 pb-6">
                        <CardTitle className="text-3xl xl:text-4xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 pr-20 mb-3">
                          {event.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-lg leading-relaxed">
                          {event.description}
                        </CardDescription>
                      </CardHeader>

                      {/* Event Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha del evento</p>
                            <p className="text-sm font-semibold text-gray-800">{format(new Date(event.event_date), 'dd MMMM yyyy', { locale: es })}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cierre</p>
                            <p className="text-sm font-semibold text-gray-800">{format(new Date(event.submission_deadline), "dd MMM 'a las' HH:mm", { locale: es })}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participantes</p>
                              <p className="text-xl font-bold text-green-600">{event.participant_count}</p>
                            </div>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                              className="w-2 h-2 bg-green-400 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Prize & Actions */}
                    <div className="xl:w-80 p-8 xl:pl-6 border-t xl:border-t-0 xl:border-l border-gray-200">
                      {/* Prize Section */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-bold text-yellow-800 text-lg">Premio del Ganador</span>
                        </div>
                        <p className="text-4xl font-black text-yellow-700 mb-2">
                          {event.prize_currency} {event.prize_amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-yellow-600">Para la predicción más precisa</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button 
                          className={`w-full py-4 font-semibold text-lg transition-all duration-200 ${
                            event.status === 'active' 
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg' 
                              : event.status === 'upcoming'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                              : 'bg-gray-500 hover:bg-gray-600 text-white'
                          }`}
                          onClick={() => router.push(`/eventos/${event.id}`)}
                          disabled={event.status === 'finished'}
                        >
                          {event.status === 'active' ? '🎯 Participar Ahora' : 
                           event.status === 'closed' ? '📊 Ver Resultados' :
                           event.status === 'finished' ? '📋 Ver Histórico' :
                           '⏰ Próximamente'}
                        </Button>

                        <Button 
                          variant="outline"
                          className="w-full py-4 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: `${event.name} - ArgenStats`,
                                text: `¡Participa en el evento de predicción "${event.name}" y gana ${event.prize_currency} ${event.prize_amount}!`,
                                url: `${window.location.origin}/eventos/${event.id}`
                              });
                            } else {
                              navigator.clipboard.writeText(`${window.location.origin}/eventos/${event.id}`);
                              // Aquí podrías mostrar un toast de confirmación
                            }
                          }}
                        >
                          <Share2 className="h-5 w-5 mr-2" />
                          Compartir Evento
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Newsletter Subscription Section */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 max-w-6xl mx-auto"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-bl from-purple-400 to-transparent rounded-full transform rotate-45 scale-150" />
              </div>
              
              <CardContent className="p-8 sm:p-12">
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Mail className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <Badge className="bg-purple-600 text-white px-4 py-2 font-semibold mb-4">
                    ¿Te quedaste con ganas de participar?
                  </Badge>
                  
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                    No te pierdas nada de ArgenStats
                  </h3>
                  
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Suscríbete al Newsletter y síguenos en <span className="font-semibold text-blue-600">X</span> para estar al tanto de todos nuestros eventos y predicciones económicas
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input 
                        type="email" 
                        placeholder="Tu email para el newsletter"
                        className="h-12 px-4 text-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                      />
                    </div>
                    <Button className="h-12 px-6 sm:px-8 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                      <Mail className="h-5 w-5 mr-2" />
                      Suscribirme
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-purple-200">
                  <span className="text-gray-600 font-medium">Síguenos en:</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-blue-400 text-blue-600 hover:bg-blue-50 hover:border-blue-500 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.795 10.533 20.68 2h-3.073l-5.255 6.517L7.69 2H1l7.806 10.91L1.47 22h3.074l5.705-7.07L15.31 22H22l-8.205-11.467Zm-2.38 2.95L9.97 11.464 4.36 3.627h2.31l4.528 6.317 1.443 2.02 6.018 8.409h-2.31l-4.934-6.89Z"/>
                    </svg>
                    @ArgenStats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Professional Information Section */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Términos y Condiciones */}
              <Card className="bg-white border-2 border-gray-100 hover:border-gray-200 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    Términos y Condiciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Elegibilidad:</strong> Abierto a todos los usuarios registrados mayores de 18 años.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Una predicción por usuario:</strong> Solo se permite una predicción por evento.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Cierre de inscripciones:</strong> Las predicciones deben enviarse antes de la fecha límite.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Datos oficiales:</strong> Los resultados se basan únicamente en datos del INDEC.</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        Al participar, aceptas estos términos y las decisiones del comité organizador como finales.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reglas de Evaluación */}
              <Card className="bg-white border-2 border-gray-100 hover:border-gray-200 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    Criterios de Evaluación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Precisión total:</strong> Se evalúa la precisión combinada de todas las categorías del IPC.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Algoritmo de scoring:</strong> Se calcula la desviación absoluta respecto a los valores oficiales.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Ganador único:</strong> La predicción con menor desviación total obtiene el primer lugar.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Empates:</strong> En caso de empate, se considerará la fecha de envío más temprana.</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800 text-xs">Transparencia Total</span>
                      </div>
                      <p className="text-xs text-green-700">
                        Todos los cálculos son públicos y verificables. Los resultados se publican automáticamente.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información Adicional */}
            <Card className="mt-8 bg-gradient-to-r from-slate-50 to-gray-50 border-2 border-slate-200">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Seguridad */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">100% Seguro</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Plataforma segura con datos encriptados. Tu información personal está protegida.
                    </p>
                  </div>

                  {/* Transparencia */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Transparente</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Todos los procesos son auditables. Resultados basados en datos oficiales del INDEC.
                    </p>
                  </div>

                  {/* Soporte */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Soporte 24/7</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      ¿Dudas sobre el evento? Contactanos y te ayudamos en cualquier momento.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Descargo de Responsabilidad</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Este es un evento de entretenimiento y análisis económico. ArgenStats no brinda asesoramiento financiero. 
                          Las predicciones son opiniones personales y no deben utilizarse como base para decisiones de inversión. 
                          Los participantes son responsables de verificar su elegibilidad legal para recibir premios según su jurisdicción.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Evento organizado por <span className="font-semibold text-gray-700">ArgenStats</span> • 
                    Datos oficiales del <span className="font-semibold text-gray-700">INDEC</span> • 
                    Última actualización: {new Date().toLocaleDateString('es-AR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {events.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="h-12 w-12 text-blue-400" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-700 mb-4">¡Próximamente eventos emocionantes!</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed mb-8">
              Estamos preparando increíbles eventos de predicción económica. 
              <span className="font-semibold text-blue-600"> No te los pierdas</span>
            </p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600">Predicciones<br/>Precisas</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600">Premios<br/>Increíbles</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600">Comunidad<br/>Activa</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      </div>
    </>
  );
}