'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Clock, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';

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
            participant_count: count || 0
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

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'closed':
        return 'bg-yellow-500';
      case 'finished':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'upcoming':
        return 'Próximamente';
      case 'closed':
        return 'Cerrado';
      case 'finished':
        return 'Finalizado';
      default:
        return status;
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Eventos de Predicción
        </h1>
        <p className="text-gray-600">
          Participa en nuestros eventos de predicción económica y gana premios
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl">{event.name}</CardTitle>
                <Badge className={getStatusColor(event.status)}>
                  {getStatusText(event.status)}
                </Badge>
              </div>
              <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Fecha del evento: {format(new Date(event.event_date), 'dd MMMM yyyy', { locale: es })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Cierre: {format(new Date(event.submission_deadline), "dd MMM 'a las' HH:mm", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{event.participant_count} participantes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-bold">{event.prize_currency} {event.prize_amount} en premios</span>
                </div>
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => router.push(`/eventos/${event.id}`)}
                disabled={event.status === 'finished'}
              >
                {event.status === 'active' ? 'Participar' : 
                 event.status === 'closed' ? 'Ver resultados' :
                 event.status === 'finished' ? 'Ver histórico' :
                 'Próximamente'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No hay eventos disponibles</h2>
          <p className="text-gray-500">Vuelve pronto para participar en nuestros próximos eventos</p>
        </div>
      )}
    </div>
  );
}