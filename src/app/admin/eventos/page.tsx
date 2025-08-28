'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Trophy, Users, Calculator, Download, Upload, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'agusiglesias72@gmail.com';

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  submission_deadline: string;
  prize_amount: number;
  prize_currency: string;
  status: 'upcoming' | 'active' | 'closed' | 'finished';
  created_at: string;
}

interface EventResult {
  id: string;
  event_id: string;
  ipc_general: number;
  ipc_bienes: number;
  ipc_servicios: number;
  ipc_alimentos_bebidas: number;
  published_at: string;
  created_by: string;
}

interface Prediction {
  id: string;
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

export default function AdminEventsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [eventResults, setEventResults] = useState<EventResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [calculatingScores, setCalculatingScores] = useState(false);
  
  const [resultForm, setResultForm] = useState({
    ipc_general: '',
    ipc_bienes: '',
    ipc_servicios: '',
    ipc_alimentos_bebidas: ''
  });

  const [newEventForm, setNewEventForm] = useState({
    name: '',
    description: '',
    event_date: '',
    submission_deadline: '',
    prize_amount: '',
    prize_currency: 'USD'
  });

  useEffect(() => {
    // Check if user is admin
    if (user?.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
      router.push('/');
      return;
    }
    
    fetchEvents();
  }, [user, router]);

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      
      if (data && data.length > 0) {
        await selectEvent(data[0]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  }

  async function selectEvent(event: Event) {
    setSelectedEvent(event);
    
    // Fetch predictions for this event
    const { data: predictionsData } = await supabase
      .from('event_predictions')
      .select('*')
      .eq('event_id', event.id)
      .order('score', { ascending: false, nullsFirst: false });
    
    setPredictions(predictionsData || []);
    
    // Fetch results if they exist
    const { data: resultData } = await supabase
      .from('event_results')
      .select('*')
      .eq('event_id', event.id)
      .single();
    
    setEventResults(resultData);
  }

  async function createEvent() {
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          name: newEventForm.name,
          description: newEventForm.description,
          event_date: newEventForm.event_date,
          submission_deadline: newEventForm.submission_deadline,
          prize_amount: parseFloat(newEventForm.prize_amount),
          prize_currency: newEventForm.prize_currency,
          status: 'active'
        });

      if (error) throw error;
      
      toast.success('Evento creado exitosamente');
      fetchEvents();
      
      // Reset form
      setNewEventForm({
        name: '',
        description: '',
        event_date: '',
        submission_deadline: '',
        prize_amount: '',
        prize_currency: 'USD'
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Error al crear evento');
    }
  }

  async function submitResults() {
    if (!selectedEvent) return;
    
    try {
      // Insert results
      const { error: resultError } = await supabase
        .from('event_results')
        .insert({
          event_id: selectedEvent.id,
          ipc_general: parseFloat(resultForm.ipc_general),
          ipc_bienes: parseFloat(resultForm.ipc_bienes),
          ipc_servicios: parseFloat(resultForm.ipc_servicios),
          ipc_alimentos_bebidas: parseFloat(resultForm.ipc_alimentos_bebidas),
          created_by: user?.primaryEmailAddress?.emailAddress || ''
        });

      if (resultError) throw resultError;
      
      // Update event status
      const { error: updateError } = await supabase
        .from('events')
        .update({ status: 'closed' })
        .eq('id', selectedEvent.id);

      if (updateError) throw updateError;
      
      toast.success('Resultados publicados exitosamente');
      setResultDialogOpen(false);
      
      // Calculate scores
      await calculateScores();
      
      // Refresh data
      await selectEvent(selectedEvent);
    } catch (error) {
      console.error('Error submitting results:', error);
      toast.error('Error al publicar resultados');
    }
  }

  async function calculateScores() {
    if (!selectedEvent || !eventResults) return;
    
    setCalculatingScores(true);
    try {
      // Fetch all predictions
      const { data: predictions } = await supabase
        .from('event_predictions')
        .select('*')
        .eq('event_id', selectedEvent.id);

      if (!predictions || predictions.length === 0) return;

      // Calculate scores for each prediction
      const scoresWithIds = predictions.map(prediction => {
        const generalDiff = Math.abs(prediction.ipc_general - eventResults.ipc_general);
        const bienesDiff = Math.abs(prediction.ipc_bienes - eventResults.ipc_bienes);
        const serviciosDiff = Math.abs(prediction.ipc_servicios - eventResults.ipc_servicios);
        const alimentosDiff = Math.abs(prediction.ipc_alimentos_bebidas - eventResults.ipc_alimentos_bebidas);
        
        // Weighted average (you can adjust weights as needed)
        const score = (generalDiff * 0.4 + bienesDiff * 0.2 + serviciosDiff * 0.2 + alimentosDiff * 0.2);
        
        return { 
          id: prediction.id, 
          score,
          user_id: prediction.user_id,
          user_email: prediction.user_email
        };
      });

      // Sort by score (lower is better)
      scoresWithIds.sort((a, b) => a.score - b.score);
      
      // Update scores and ranks
      for (let i = 0; i < scoresWithIds.length; i++) {
        const rank = i + 1;
        await supabase
          .from('event_predictions')
          .update({ 
            score: scoresWithIds[i].score,
            rank: rank
          })
          .eq('id', scoresWithIds[i].id);
        
        // Save winners (top 3 or tied for first)
        if (rank <= 3 || scoresWithIds[i].score === scoresWithIds[0].score) {
          const prizeShare = rank === 1 ? 
            (scoresWithIds.filter(s => s.score === scoresWithIds[0].score).length > 1 ?
              selectedEvent.prize_amount / scoresWithIds.filter(s => s.score === scoresWithIds[0].score).length :
              selectedEvent.prize_amount) :
            0;
          
          await supabase
            .from('event_winners')
            .insert({
              event_id: selectedEvent.id,
              user_id: scoresWithIds[i].user_id,
              user_email: scoresWithIds[i].user_email,
              rank: rank,
              score: scoresWithIds[i].score,
              prize_amount: prizeShare
            });
        }
      }
      
      // Update event status to finished
      await supabase
        .from('events')
        .update({ status: 'finished' })
        .eq('id', selectedEvent.id);
      
      toast.success('Puntajes calculados exitosamente');
      await selectEvent(selectedEvent);
    } catch (error) {
      console.error('Error calculating scores:', error);
      toast.error('Error al calcular puntajes');
    } finally {
      setCalculatingScores(false);
    }
  }

  async function exportPredictions() {
    if (!selectedEvent) return;
    
    const csv = [
      ['Email', 'IPC General', 'Bienes', 'Servicios', 'Alimentos y Bebidas', 'Puntaje', 'Posición'],
      ...predictions.map(p => [
        p.user_email,
        p.ipc_general,
        p.ipc_bienes,
        p.ipc_servicios,
        p.ipc_alimentos_bebidas,
        p.score || '-',
        p.rank || '-'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predicciones_${selectedEvent.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (!user || user.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta página
          </AlertDescription>
        </Alert>
      </div>
    );
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
          <Shield className="h-8 w-8 text-blue-500" />
          Administración de Eventos
        </h1>
        <p className="text-gray-600">Panel de control para gestionar eventos de predicción</p>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="predictions">Predicciones</TabsTrigger>
          <TabsTrigger value="new-event">Nuevo Evento</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Eventos</CardTitle>
              <CardDescription>Todos los eventos creados en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Evento</TableHead>
                    <TableHead>Cierre</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>
                        <Badge className={
                          event.status === 'active' ? 'bg-green-500' :
                          event.status === 'closed' ? 'bg-yellow-500' :
                          event.status === 'finished' ? 'bg-gray-500' :
                          'bg-blue-500'
                        }>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(event.event_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(event.submission_deadline), 'dd/MM HH:mm')}
                      </TableCell>
                      <TableCell>
                        {predictions.filter(p => p.id === event.id).length}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => selectEvent(event)}
                          variant={selectedEvent?.id === event.id ? 'default' : 'outline'}
                        >
                          Seleccionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          {selectedEvent ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Predicciones: {selectedEvent.name}</CardTitle>
                    <CardDescription>
                      {predictions.length} predicciones registradas
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!eventResults && selectedEvent.status === 'active' && (
                      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="default">
                            <Upload className="h-4 w-4 mr-2" />
                            Ingresar Resultados
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ingresar Resultados Oficiales</DialogTitle>
                            <DialogDescription>
                              Ingresa los valores oficiales del IPC para {selectedEvent.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="result_ipc_general">IPC General (%)</Label>
                                <Input
                                  id="result_ipc_general"
                                  type="number"
                                  step="0.1"
                                  value={resultForm.ipc_general}
                                  onChange={(e) => setResultForm({...resultForm, ipc_general: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="result_ipc_bienes">Bienes (%)</Label>
                                <Input
                                  id="result_ipc_bienes"
                                  type="number"
                                  step="0.1"
                                  value={resultForm.ipc_bienes}
                                  onChange={(e) => setResultForm({...resultForm, ipc_bienes: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="result_ipc_servicios">Servicios (%)</Label>
                                <Input
                                  id="result_ipc_servicios"
                                  type="number"
                                  step="0.1"
                                  value={resultForm.ipc_servicios}
                                  onChange={(e) => setResultForm({...resultForm, ipc_servicios: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="result_ipc_alimentos">Alimentos y Bebidas (%)</Label>
                                <Input
                                  id="result_ipc_alimentos"
                                  type="number"
                                  step="0.1"
                                  value={resultForm.ipc_alimentos_bebidas}
                                  onChange={(e) => setResultForm({...resultForm, ipc_alimentos_bebidas: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={submitResults}>Publicar Resultados</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {eventResults && !predictions[0]?.score && (
                      <Button onClick={calculateScores} disabled={calculatingScores}>
                        <Calculator className="h-4 w-4 mr-2" />
                        {calculatingScores ? 'Calculando...' : 'Calcular Puntajes'}
                      </Button>
                    )}
                    
                    <Button variant="outline" onClick={exportPredictions}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {eventResults && (
                  <Alert className="mb-4">
                    <Trophy className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Resultados Oficiales:</strong> IPC General: {eventResults.ipc_general}% | 
                      Bienes: {eventResults.ipc_bienes}% | Servicios: {eventResults.ipc_servicios}% | 
                      Alimentos: {eventResults.ipc_alimentos_bebidas}%
                    </AlertDescription>
                  </Alert>
                )}
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pos.</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>IPC General</TableHead>
                      <TableHead>Bienes</TableHead>
                      <TableHead>Servicios</TableHead>
                      <TableHead>Alimentos</TableHead>
                      <TableHead>Puntaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictions.map((prediction, index) => (
                      <TableRow key={prediction.id}>
                        <TableCell>
                          {prediction.rank || index + 1}
                          {prediction.rank === 1 && '🏆'}
                          {prediction.rank === 2 && '🥈'}
                          {prediction.rank === 3 && '🥉'}
                        </TableCell>
                        <TableCell>{prediction.user_email}</TableCell>
                        <TableCell>{prediction.ipc_general}%</TableCell>
                        <TableCell>{prediction.ipc_bienes}%</TableCell>
                        <TableCell>{prediction.ipc_servicios}%</TableCell>
                        <TableCell>{prediction.ipc_alimentos_bebidas}%</TableCell>
                        <TableCell>
                          {prediction.score ? prediction.score.toFixed(4) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Selecciona un evento para ver sus predicciones
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="new-event">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Evento</CardTitle>
              <CardDescription>
                Configura un nuevo evento de predicción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); createEvent(); }} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Evento</Label>
                  <Input
                    id="name"
                    placeholder="Ej: IPC Septiembre 2025"
                    value={newEventForm.name}
                    onChange={(e) => setNewEventForm({...newEventForm, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    placeholder="Ej: Predice los valores del IPC de septiembre 2025"
                    value={newEventForm.description}
                    onChange={(e) => setNewEventForm({...newEventForm, description: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_date">Fecha del Evento</Label>
                    <Input
                      id="event_date"
                      type="datetime-local"
                      value={newEventForm.event_date}
                      onChange={(e) => setNewEventForm({...newEventForm, event_date: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="submission_deadline">Fecha límite de predicciones</Label>
                    <Input
                      id="submission_deadline"
                      type="datetime-local"
                      value={newEventForm.submission_deadline}
                      onChange={(e) => setNewEventForm({...newEventForm, submission_deadline: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prize_amount">Monto del Premio</Label>
                    <Input
                      id="prize_amount"
                      type="number"
                      step="0.01"
                      placeholder="100"
                      value={newEventForm.prize_amount}
                      onChange={(e) => setNewEventForm({...newEventForm, prize_amount: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prize_currency">Moneda</Label>
                    <Select
                      value={newEventForm.prize_currency}
                      onValueChange={(value) => setNewEventForm({...newEventForm, prize_currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="ARS">ARS</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Crear Evento
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}