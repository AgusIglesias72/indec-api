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
import { Trophy, Clock, Users, TrendingUp, AlertCircle, CheckCircle2, Target, Award, Zap, Star, Gamepad2, Sparkles, Timer } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import Leaderboard from '@/components/events/Leaderboard';

interface Event {
  id: string;
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
    if (params.id && isLoaded) {
      fetchEventData();
      const interval = setInterval(fetchStats, 5000); // Update stats every 5 seconds
      return () => clearInterval(interval);
    }
  }, [params.id, isLoaded, user]);

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
        .eq('id', params.id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Check for existing prediction from database if user is logged in
      if (user) {
        const { data: existingPrediction } = await supabase
          .from('event_predictions')
          .select('*')
          .eq('event_id', params.id)
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
        .eq('event_id', params.id)
        .single();
      
      setEventResult(resultData);

      // Fetch stats
      await fetchStats();
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const { data: predictions } = await supabase
        .from('event_predictions')
        .select('ipc_general, ipc_bienes, ipc_servicios, ipc_alimentos_bebidas')
        .eq('event_id', params.id);

      if (predictions && predictions.length > 0) {
        setStats({
          participant_count: predictions.length,
          avg_ipc_general: predictions.reduce((sum, p) => sum + Number(p.ipc_general), 0) / predictions.length,
          avg_ipc_bienes: predictions.reduce((sum, p) => sum + Number(p.ipc_bienes), 0) / predictions.length,
          avg_ipc_servicios: predictions.reduce((sum, p) => sum + Number(p.ipc_servicios), 0) / predictions.length,
          avg_ipc_alimentos_bebidas: predictions.reduce((sum, p) => sum + Number(p.ipc_alimentos_bebidas), 0) / predictions.length
        });
      } else {
        setStats({
          participant_count: 0,
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
        id: Math.random().toString(36).substr(2, 9),
        event_id: params.id as string,
        user_id: user.id,
        user_email: user.primaryEmailAddress?.emailAddress || 'unknown',
        ipc_general: parseFloat(formData.ipc_general),
        ipc_bienes: parseFloat(formData.ipc_bienes),
        ipc_servicios: parseFloat(formData.ipc_servicios),
        ipc_alimentos_bebidas: parseFloat(formData.ipc_alimentos_bebidas),
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

      toast.success('🎉 ¡Predicción registrada! ¡Buena suerte!', {
        duration: 4000,
      });
      
      setUserPrediction(prediction);
      await fetchEventData();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Ya registraste tu predicción para este evento');
      } else {
        toast.error('Error al registrar la predicción');
        console.error('Error:', error);
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
    const num = parseFloat(value);
    if (num < 0 || num > 20) return '⚠️';
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
        {/* Gamified Header */}
        <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-5xl font-bold flex items-center gap-3">
                <Gamepad2 className="h-10 w-10 animate-pulse" />
                {event.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 hover:bg-green-600 text-lg px-4 py-2 animate-bounce">
                  <Zap className="h-4 w-4 mr-2" />
                  {event.status === 'active' ? 'EN VIVO' : 'CERRADO'}
                </Badge>
              </div>
            </div>
            <p className="text-xl opacity-90 mb-6">{event.description}</p>
            
            {/* Progress Indicator for Completion */}
            {!userPrediction && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">🎯 Progreso de tu predicción</span>
                  <span className="text-sm font-medium">{completedFields}/4 campos</span>
                </div>
                <Progress value={progressScore} className="h-3" />
                <p className="text-sm mt-2 opacity-75">
                  {progressScore === 100 ? '🚀 ¡Listo para enviar!' : 
                   progressScore > 50 ? '⚡ ¡Casi terminas!' : 
                   progressScore > 0 ? '👍 ¡Buen comienzo!' : '📝 Completa tus predicciones'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gaming Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Timer className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Tiempo restante</p>
                  <p className="text-xl font-bold text-blue-600">{timeLeft || '⏳ Calculando...'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">👥 Jugadores</p>
                  <p className="text-xl font-bold text-green-600">{stats?.participant_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-yellow-200 hover:border-yellow-400 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">🏆 Premio</p>
                  <p className="text-xl font-bold text-yellow-600">{event.prize_currency} {event.prize_amount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">📅 Fecha</p>
                  <p className="text-xl font-bold text-purple-600">
                    {format(new Date(event.event_date), 'dd MMM', { locale: es })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Gaming Content */}
        <Tabs defaultValue={eventResult ? "results" : userPrediction ? "stats" : "predict"} className="w-full">
          <TabsList className={`grid w-full ${eventResult ? 'grid-cols-3' : 'grid-cols-2'} h-14`}>
            <TabsTrigger value="predict" className="text-lg">
              🎮 Mi Predicción
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-lg">
              📊 Estadísticas
            </TabsTrigger>
            {eventResult && <TabsTrigger value="results" className="text-lg">🏆 Resultados</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="predict">
            {userPrediction ? (
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="bg-green-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <CheckCircle2 className="h-6 w-6" />
                    🎉 ¡Predicción Registrada!
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    ✨ Enviada el {format(new Date(userPrediction.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🏛️</span>
                        <p className="text-sm text-gray-600 font-semibold">IPC General</p>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{userPrediction.ipc_general}%</p>
                    </div>
                    <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📦</span>
                        <p className="text-sm text-gray-600 font-semibold">Bienes</p>
                      </div>
                      <p className="text-3xl font-bold text-green-600">{userPrediction.ipc_bienes}%</p>
                    </div>
                    <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🔧</span>
                        <p className="text-sm text-gray-600 font-semibold">Servicios</p>
                      </div>
                      <p className="text-3xl font-bold text-purple-600">{userPrediction.ipc_servicios}%</p>
                    </div>
                    <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🍽️</span>
                        <p className="text-sm text-gray-600 font-semibold">Alimentos y Bebidas</p>
                      </div>
                      <p className="text-3xl font-bold text-orange-600">{userPrediction.ipc_alimentos_bebidas}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="h-6 w-6 text-white" />
                      <p className="text-white font-bold text-lg">¡Predicción completada!</p>
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-white opacity-90">Ahora espera los resultados oficiales para ver tu puntuación</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="h-6 w-6" />
                    🎯 Realiza tu Predicción
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
                        🔒 El período de predicciones ha cerrado
                      </AlertDescription>
                    </Alert>
                  ) : !user ? (
                    <Alert className="border-2 border-yellow-300 bg-yellow-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-lg">
                        🔐 Debes <Link href="/sign-in" className="text-blue-600 underline font-semibold">iniciar sesión</Link> para participar en el evento
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
                            min="0"
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
                            min="0"
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
                            min="0"
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
                            min="0"
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
                          ⚠️ Una vez enviada, no podrás modificar tu predicción
                        </AlertDescription>
                      </Alert>
                      
                      <Button 
                        type="submit" 
                        className={`w-full text-xl py-6 ${progressScore === 100 ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' : 'bg-gray-400'} transition-all duration-300`}
                        disabled={submitting || progressScore < 100}
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                            🚀 Enviando predicción...
                          </span>
                        ) : progressScore === 100 ? (
                          <span className="flex items-center gap-2">
                            <Trophy className="h-6 w-6" />
                            🎯 ¡Enviar mi predicción!
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            📝 Completa todos los campos ({completedFields}/4)
                          </span>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="stats">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <TrendingUp className="h-6 w-6" />
                  📊 Estadísticas en Tiempo Real
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Promedios de todas las predicciones realizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {stats && stats.participant_count > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-500">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">🏛️</span>
                          <p className="text-sm text-gray-600 font-semibold">IPC General (promedio)</p>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">
                          {stats.avg_ipc_general.toFixed(2)}%
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-l-4 border-green-500">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">📦</span>
                          <p className="text-sm text-gray-600 font-semibold">Bienes (promedio)</p>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                          {stats.avg_ipc_bienes.toFixed(2)}%
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-l-4 border-purple-500">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">🔧</span>
                          <p className="text-sm text-gray-600 font-semibold">Servicios (promedio)</p>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">
                          {stats.avg_ipc_servicios.toFixed(2)}%
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-l-4 border-orange-500">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">🍽️</span>
                          <p className="text-sm text-gray-600 font-semibold">Alimentos y Bebidas (promedio)</p>
                        </div>
                        <p className="text-3xl font-bold text-orange-600">
                          {stats.avg_ipc_alimentos_bebidas.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center p-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Users className="h-8 w-8 text-blue-500" />
                        <p className="text-xl text-gray-600 font-semibold">Total de jugadores activos</p>
                      </div>
                      <p className="text-5xl font-bold text-blue-600">{stats.participant_count}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-2xl text-gray-500 font-semibold">🎮 ¡Sé el primer jugador!</p>
                      <p className="text-lg text-gray-400 mt-2">Aún no hay predicciones registradas</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-dashed border-blue-300">
                      <p className="text-blue-600 font-semibold">💡 ¡Participa ahora y lidera la tabla!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {eventResult && (
            <TabsContent value="results">
              <Leaderboard eventId={params.id as string} eventResults={eventResult} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}