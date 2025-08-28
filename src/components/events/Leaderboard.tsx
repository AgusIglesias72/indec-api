'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface LeaderboardEntry {
  id: string;
  user_email: string;
  ipc_general: number;
  ipc_bienes: number;
  ipc_servicios: number;
  ipc_alimentos_bebidas: number;
  score: number;
  rank: number;
  created_at: string;
}

interface EventResult {
  ipc_general: number;
  ipc_bienes: number;
  ipc_servicios: number;
  ipc_alimentos_bebidas: number;
}

interface LeaderboardProps {
  eventId: string;
  eventResults?: EventResult;
}

export default function Leaderboard({ eventId, eventResults }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchLeaderboard();
    }
  }, [eventId]);

  async function fetchLeaderboard() {
    try {
      const { data, error } = await supabase
        .from('event_predictions')
        .select('*')
        .eq('event_id', eventId)
        .not('score', 'is', null)
        .order('rank', { ascending: true });

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function getRankIcon(rank: number) {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  }

  function getRankBadge(rank: number) {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">🏆 Ganador</Badge>;
      case 2:
        return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 2do Lugar</Badge>;
      case 3:
        return <Badge className="bg-amber-600 hover:bg-amber-700">🥉 3er Lugar</Badge>;
      default:
        return null;
    }
  }

  function maskEmail(email: string) {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tabla de Posiciones
          </CardTitle>
          <CardDescription>Los resultados se mostrarán una vez que se publiquen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Los resultados aún no están disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Official Results */}
      {eventResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Resultados Oficiales
            </CardTitle>
            <CardDescription>Valores reales publicados por INDEC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">IPC General</p>
                <p className="text-2xl font-bold text-blue-600">{eventResults.ipc_general}%</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Bienes</p>
                <p className="text-2xl font-bold text-green-600">{eventResults.ipc_bienes}%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Servicios</p>
                <p className="text-2xl font-bold text-purple-600">{eventResults.ipc_servicios}%</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Alimentos y Bebidas</p>
                <p className="text-2xl font-bold text-orange-600">{eventResults.ipc_alimentos_bebidas}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Tabla de Posiciones Final
          </CardTitle>
          <CardDescription>
            Clasificación ordenada por precisión (menor error = mejor posición)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  entry.rank === 1 ? 'border-yellow-200 bg-yellow-50' :
                  entry.rank === 2 ? 'border-gray-200 bg-gray-50' :
                  entry.rank === 3 ? 'border-amber-200 bg-amber-50' :
                  'border-gray-100 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{maskEmail(entry.user_email)}</p>
                      {getRankBadge(entry.rank)}
                    </div>
                    <div className="text-sm text-gray-600 grid grid-cols-4 gap-3">
                      <span>General: {entry.ipc_general}%</span>
                      <span>Bienes: {entry.ipc_bienes}%</span>
                      <span>Servicios: {entry.ipc_servicios}%</span>
                      <span>Alimentos: {entry.ipc_alimentos_bebidas}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Error promedio</p>
                  <p className={`text-lg font-bold ${
                    entry.rank === 1 ? 'text-yellow-600' :
                    entry.rank === 2 ? 'text-gray-600' :
                    entry.rank === 3 ? 'text-amber-600' :
                    'text-gray-700'
                  }`}>
                    {entry.score.toFixed(3)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {leaderboard.length > 10 && (
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Mostrando top {Math.min(10, leaderboard.length)} de {leaderboard.length} participantes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}