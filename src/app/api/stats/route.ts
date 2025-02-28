// src/app/api/stats/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // En un entorno real, estas estadísticas vendrían de la base de datos o algún sistema de monitoreo
  // Para demostración, usamos valores estáticos
  const stats = {
    dataPoints: 10500000, // Total de puntos de datos procesados
    apiUptime: 99.5, // Uptime de la API en porcentaje
    indicatorsCount: 11, // Número de indicadores disponibles
    updateTime: 5 // Tiempo de actualización en minutos
  };
  
  return NextResponse.json(stats);
}