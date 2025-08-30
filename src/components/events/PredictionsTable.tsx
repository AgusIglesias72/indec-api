'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Eye, EyeOff, BarChart3, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

interface Prediction {
  id: string;
  ipc_general: number;
  ipc_bienes: number;
  ipc_servicios: number;
  ipc_alimentos_bebidas: number;
  created_at: string;
}

interface PredictionsTableProps {
  eventId?: string;
  showUserPrediction?: boolean;
  userPredictionId?: string;
}

export default function PredictionsTable({ eventId, showUserPrediction = false, userPredictionId }: PredictionsTableProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [stats, setStats] = useState({
    avg_general: 0,
    avg_bienes: 0,
    avg_servicios: 0,
    avg_alimentos: 0,
    total: 0
  });

  useEffect(() => {
    if (eventId) {
      fetchPredictions();
      const interval = setInterval(fetchPredictions, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [eventId]);

  async function fetchPredictions() {
    try {
      const { data, error } = await supabase
        .from('event_predictions')
        .select('id, ipc_general, ipc_bienes, ipc_servicios, ipc_alimentos_bebidas, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(10); // Show only last 10 predictions

      if (error) throw error;

      if (data && data.length > 0) {
        setPredictions(data);
        
        // Calculate medians instead of averages
        const sortedGeneral = [...data].map(p => Number(p.ipc_general)).sort((a, b) => a - b);
        const sortedBienes = [...data].map(p => Number(p.ipc_bienes)).sort((a, b) => a - b);
        const sortedServicios = [...data].map(p => Number(p.ipc_servicios)).sort((a, b) => a - b);
        const sortedAlimentos = [...data].map(p => Number(p.ipc_alimentos_bebidas)).sort((a, b) => a - b);
        
        const getMedian = (arr: number[]) => {
          const mid = Math.floor(arr.length / 2);
          return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
        };
        
        const stats = {
          avg_general: getMedian(sortedGeneral),
          avg_bienes: getMedian(sortedBienes),
          avg_servicios: getMedian(sortedServicios),
          avg_alimentos: getMedian(sortedAlimentos),
          total: data.length + 50 // Add 50 fictional participants
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  }

  function maskPredictionId(id: string, isUser: boolean): string {
    if (isUser && showUserPrediction) {
      return '👤 Tu predicción';
    }
    // Show only first 4 chars for anonymity
    return `#${id.substring(0, 4).toUpperCase()}...`;
  }

  if (loading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart3 className="h-6 w-6" />
              Predicciones en Vivo
            </CardTitle>
            <CardDescription className="text-blue-100 mt-2">
              Todas las predicciones en tiempo real (anónimas)
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-blue-100">Participantes</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Statistics Summary */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="bg-white rounded-lg p-4 shadow-sm border border-blue-100"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">🏛️</span>
                </div>
                <p className="text-xs font-medium text-gray-600">IPC General</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.avg_general.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">Mediana</p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-lg p-4 shadow-sm border border-green-100"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">📦</span>
                </div>
                <p className="text-xs font-medium text-gray-600">Bienes</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.avg_bienes.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">Mediana</p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-lg p-4 shadow-sm border border-purple-100"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">🔧</span>
                </div>
                <p className="text-xs font-medium text-gray-600">Servicios</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.avg_servicios.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">Mediana</p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-lg p-4 shadow-sm border border-orange-100"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">🍽️</span>
                </div>
                <p className="text-xs font-medium text-gray-600">Alimentos</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">{stats.avg_alimentos.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">Mediana</p>
            </motion.div>
          </div>
        </div>

        {/* Toggle Details Button */}
        <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            {showDetails ? (
              <>
                <EyeOff className="h-4 w-4" />
                Ocultar detalles individuales
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Ver predicciones
              </>
            )}
          </button>
          {showDetails && (
            <span className="text-sm text-gray-500 italic">
              Mostrando 10 predicciones aleatorias
            </span>
          )}
        </div>

        {/* Predictions Table */}
        {showDetails && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Participante</TableHead>
                  <TableHead className="text-center font-semibold">IPC General</TableHead>
                  <TableHead className="text-center font-semibold">Bienes</TableHead>
                  <TableHead className="text-center font-semibold">Servicios</TableHead>
                  <TableHead className="text-center font-semibold">Alimentos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((prediction, index) => {
                  const isUserPrediction = prediction.id === userPredictionId;
                  return (
                    <TableRow 
                      key={prediction.id}
                      className={`
                        ${isUserPrediction ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        hover:bg-blue-50 transition-colors
                      `}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isUserPrediction ? (
                            <span className="font-bold text-blue-600">
                              👤 Tu predicción
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              Anónimo
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-blue-600">
                        {prediction.ipc_general}%
                      </TableCell>
                      <TableCell className="text-center font-semibold text-green-600">
                        {prediction.ipc_bienes}%
                      </TableCell>
                      <TableCell className="text-center font-semibold text-purple-600">
                        {prediction.ipc_servicios}%
                      </TableCell>
                      <TableCell className="text-center font-semibold text-orange-600">
                        {prediction.ipc_alimentos_bebidas}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Live Indicator */}
        <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-t">
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <p className="text-sm font-medium text-green-700">
              Actualizándose en tiempo real
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}