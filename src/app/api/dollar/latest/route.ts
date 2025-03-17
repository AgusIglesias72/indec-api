// src/app/api/dollar/latest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { DollarType } from '@/types/dollar';

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Unable to initialize Supabase client. Missing environment variables: ${
      !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : ''
    }${!supabaseKey ? 'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY' : ''}`
  );
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Obtener parámetro de tipo de dólar (opcional)
    const dollarTypeParam = searchParams.get('type')?.toUpperCase() as DollarType | undefined;
    
    // Obtener las últimas cotizaciones
    let latestRates;
    
    if (dollarTypeParam) {
      // Si se especifica un tipo, obtener solo ese tipo
      const { data, error } = await supabase
        .from('dollar_rates')
        .select('*')
        .eq('dollar_type', dollarTypeParam)
        .order('date', { ascending: false })
        .limit(1);
        
      if (error) {
        throw new Error(`Error fetching latest dollar rate: ${error.message}`);
      }
      
      latestRates = data;
    } else {
      // Si no se especifica tipo, obtener la última cotización de cada tipo
      // Usamos una consulta más compleja con distinct para obtener la última fecha
      const { data: latestDateData, error: latestDateError } = await supabase
        .from('dollar_rates')
        .select('date')
        .order('date', { ascending: false })
        .limit(1);
        
      if (latestDateError) {
        throw new Error(`Error fetching latest date: ${latestDateError.message}`);
      }
      
      if (!latestDateData || latestDateData.length === 0) {
        return NextResponse.json(
          { error: 'No dollar rates available' },
          { status: 404 }
        );
      }
      
      const latestDate = latestDateData[0].date;
      
      // Obtener todas las cotizaciones de la última fecha
      const { data, error } = await supabase
        .from('dollar_rates')
        .select('*')
        .eq('date', latestDate)
        .order('dollar_type');
        
      if (error) {
        throw new Error(`Error fetching latest dollar rates: ${error.message}`);
      }
      
      latestRates = data;
    }
    
    if (!latestRates || latestRates.length === 0) {
      return NextResponse.json(
        { error: 'No data found for the specified criteria' },
        { status: 404 }
      );
    }
    
    // Transformar datos para la respuesta
    const transformedData = latestRates.map(item => ({
      date: item.date,
      dollar_type: item.dollar_type,
      buy_price: Number(item.buy_price),
      sell_price: Number(item.sell_price),
      spread: Number(((item.sell_price - item.buy_price) / item.buy_price * 100).toFixed(2)), // Diferencia porcentual entre compra y venta
      last_updated: item.created_at
    }));
    
    // Configurar caché para 5 minutos
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=900' // 5 minutos
    });
    
    // Responder con un solo objeto si se solicitó un tipo específico, o con un array si no
    if (dollarTypeParam && transformedData.length === 1) {
      return NextResponse.json(transformedData[0], { headers });
    } else {
      return NextResponse.json({
        data: transformedData,
        metadata: {
          count: transformedData.length,
          last_updated: new Date().toISOString(),
          dollar_type: dollarTypeParam || 'ALL'
        }
      }, { headers });
    }
    
  } catch (error) {
    console.error('Error in latest dollar rates endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Revalidación programada cada 5 minutos
export const revalidate = 300; // 5 minutos