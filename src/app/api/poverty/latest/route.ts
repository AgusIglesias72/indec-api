// src/app/api/poverty/latest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Obtiene los últimos datos de pobreza disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    
    if (region) {
      // Datos específicos de una región - buscar en la tabla principal
      const { data, error } = await supabase
        .from('poverty_data')
        .select('*')
        .eq('region', region)
        .order('date', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        return NextResponse.json({ error: 'Región no encontrada' }, { status: 404 });
      }
      
      return NextResponse.json({
        data,
        metadata: {
          region,
          last_updated: data.date,
          period: data.period
        }
      });
    } else {
      // Datos nacionales más recientes
      const { data: nationalData, error: nationalError } = await supabase
        .from('poverty_data')
        .select('*')
        .eq('region', 'Total 31 aglomerados')
        .order('date', { ascending: false })
        .limit(1)
        .single();
        
      const { data: regionalData, error: regionalError } = await supabase
        .from('poverty_data')
        .select('*')
        .neq('region', 'Total 31 aglomerados')
        .order('date', { ascending: false })
        .limit(10);
        
      if (nationalError) {
        return NextResponse.json({ error: 'No hay datos disponibles' }, { status: 404 });
      }
      
      return NextResponse.json({
        data: {
          national: nationalData,
          regional: regionalData || []
        },
        metadata: {
          last_updated: nationalData.date,
          period: nationalData.period,
          regions_count: regionalData?.length || 0
        }
      });
    }
  } catch (error) {
    console.error('Error in poverty latest API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}