// src/app/api/admin/backfill-bcra/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchCERData, fetchUVAData } from '@/services/bcra-fetcher';
import { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutos máximo

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Endpoint administrativo para backfill completo de datos históricos BCRA
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación administrativa
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_SYNC_KEY;
    
    if (!authHeader || authHeader.split(' ')[1] !== adminKey) {
      console.error('Intento de acceso no autorizado al backfill BCRA');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    console.info('🚀 Iniciando backfill completo de datos históricos BCRA');
    const startTime = new Date().toISOString();
    
    // 1. Backfill CER histórico
    console.info('📊 Iniciando backfill de datos históricos CER...');
    let cerResult;
    try {
      const cerData = await fetchCERData(true); // true = obtener todos los datos históricos
      
      if (cerData && cerData.length > 0) {
        const { data, error } = await supabase
          .from('cer')
          .upsert(cerData, { 
            onConflict: 'date',
            ignoreDuplicates: false 
          })
          .select();
        
        if (error) {
          throw new Error(`Error al insertar CER: ${error.message}`);
        }
        
        cerResult = {
          status: 'success',
          count: data?.length || 0,
          message: `Se procesaron ${cerData.length} registros históricos de CER`
        };
        console.info(`✅ CER backfill completado: ${data?.length || 0} registros`);
      } else {
        cerResult = {
          status: 'warning',
          count: 0,
          message: 'No se obtuvieron datos históricos de CER'
        };
      }
    } catch (error) {
      console.error('❌ Error en backfill de CER:', error);
      cerResult = {
        status: 'error',
        count: 0,
        message: `Error: ${(error as Error).message}`
      };
    }
    
    // 2. Backfill UVA histórico
    console.info('📊 Iniciando backfill de datos históricos UVA...');
    let uvaResult;
    try {
      const uvaData = await fetchUVAData(true); // true = obtener todos los datos históricos
      
      if (uvaData && uvaData.length > 0) {
        const { data, error } = await supabase
          .from('uva')
          .upsert(uvaData, { 
            onConflict: 'date',
            ignoreDuplicates: false 
          })
          .select();
        
        if (error) {
          throw new Error(`Error al insertar UVA: ${error.message}`);
        }
        
        uvaResult = {
          status: 'success',
          count: data?.length || 0,
          message: `Se procesaron ${uvaData.length} registros históricos de UVA`
        };
        console.info(`✅ UVA backfill completado: ${data?.length || 0} registros`);
      } else {
        uvaResult = {
          status: 'warning',
          count: 0,
          message: 'No se obtuvieron datos históricos de UVA'
        };
      }
    } catch (error) {
      console.error('❌ Error en backfill de UVA:', error);
      uvaResult = {
        status: 'error',
        count: 0,
        message: `Error: ${(error as Error).message}`
      };
    }
    
    const endTime = new Date().toISOString();
    const results = {
      startTime,
      endTime,
      cer: cerResult,
      uva: uvaResult,
      totalRecords: cerResult.count + uvaResult.count
    };
    
    console.info('🎉 Backfill BCRA completado:', JSON.stringify(results, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Backfill de datos históricos BCRA completado',
      results
    });
    
  } catch (error) {
    console.error('💥 Error en backfill BCRA:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}