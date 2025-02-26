import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { importHistoricalDataFromCSV } from '@/app/services/indec/fetcher';
import { desestacionalizar } from '@/app/services/analysis/seasonal';
import { ApiError } from '../../../types';
import { Database } from '../../../types/supabase';

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Endpoint para importar datos históricos
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || 
        authHeader.split(' ')[1] !== process.env.API_SECRET_KEY) {
      return NextResponse.json<ApiError>(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener datos del formulario
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const indicator = formData.get('indicator') as string | null;
    
    if (!file || !indicator) {
      return NextResponse.json<ApiError>(
        { error: 'Falta archivo o indicador' },
        { status: 400 }
      );
    }
    
    // Leer contenido del archivo
    const fileContent = await file.text();
    
    // Procesar datos del CSV
    const parsedData = await importHistoricalDataFromCSV(fileContent, indicator);
    
    if (!parsedData || parsedData.length === 0) {
      return NextResponse.json<ApiError>(
        { error: 'No se pudieron procesar datos del archivo' },
        { status: 400 }
      );
    }
    
    // Insertar datos según el indicador
    let result;
    switch (indicator.toLowerCase()) {
      case 'emae':
        result = await supabase
          .from('emae')
          .upsert(parsedData as Database['public']['Tables']['emae']['Insert'][], { onConflict: 'date' })
          .select();
        break;
      case 'emae_by_activity':
        result = await supabase
          .from('emae_by_activty')
          .upsert(parsedData as Database['public']['Tables']['emae_by_activty']['Insert'][], { onConflict: 'id' })
          .select();
        break;
      default:
        return NextResponse.json<ApiError>(
          { error: 'Indicador no soportado' },
          { status: 400 }
        );
    }
    
    if (result.error) {
      return NextResponse.json<ApiError>(
        { error: `Error al importar datos: ${result.error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Se importaron ${result.data?.length || 0} registros correctamente`,
      count: result.data?.length || 0
    });
  } catch (error) {
    console.error('Error al importar datos históricos:', error);
    return NextResponse.json<ApiError>(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}