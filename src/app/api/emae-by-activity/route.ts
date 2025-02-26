// src/app/api/emae-by-activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { EmaeByActivityRow } from '@/types';

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Obtener parámetros de consulta
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const page = parseInt(searchParams.get('page') || '1');
    const sectorCode = searchParams.get('sector_code');
    const groupBySector = searchParams.get('group_by_sector') === 'true';
    const format = searchParams.get('format') || 'json';
    
    // Construir consulta base
    let query = supabase
      .from('emae_by_activity')
      .select('*');
    
    // Aplicar filtros si existen
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
   
    
    if (sectorCode) {
      query = query.eq('economy_sector_code', sectorCode);
    }
    
    // Ordenar resultados
    if (groupBySector) {
      query = query.order('economy_sector_code', { ascending: true }).order('date', { ascending: true });
    } else {
      query = query.order('date', { ascending: true }).order('economy_sector_code', { ascending: true });
    }
    
    // Aplicar paginación
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Ejecutar consulta
    const { data, error } = await query;
    
    if (error) {
      console.error('Error al consultar datos EMAE por actividad:', error);
      return NextResponse.json(
        { error: 'Error al consultar la base de datos', details: error.message },
        { status: 500 }
      );
    }
    
    // Transformar datos según parámetros
    let transformedData: any[] = data || [];
    
    // Si se solicita agrupar por sector y hay datos disponibles
    if (groupBySector && data && data.length > 0) {
      const groupedData: Record<string, any> = {};
      
      // Agrupar por sector
      (data as EmaeByActivityRow[]).forEach(item => {
        const sectorKey = item.economy_sector_code || 'unknown';
        
        if (!groupedData[sectorKey]) {
          groupedData[sectorKey] = {
            sector_code: item.economy_sector_code,
            sector_name: item.economy_sector,
            data: []
          };
        }
        
        groupedData[sectorKey].data.push({
          date: item.date,
          value: item.original_value
        });
      });
      
      transformedData = Object.values(groupedData);
    } else if (data && data.length > 0) {
      // Si no se agrupa, devolver los datos tal cual (pero con tipos más específicos)
      transformedData = (data as EmaeByActivityRow[]).map(item => ({
        date: item.date,
        economy_sector: item.economy_sector,
        economy_sector_code: item.economy_sector_code,
        original_value: item.original_value      }));
    }
    
    // Responder en el formato solicitado
    if (format === 'csv') {
      return respondWithCSV(transformedData, 'emae_by_activity_data.csv');
    }
    
    // Responder con JSON por defecto
    return NextResponse.json({
      data: transformedData,
      metadata: {
        count: transformedData.length,
        page,
        limit,
        start_date: startDate,
        end_date: endDate,
        sector_code: sectorCode,
        group_by_sector: groupBySector
      }
    });
    
  } catch (error) {
    console.error('Error en la API de EMAE por actividad:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Genera una respuesta en formato CSV
 */
function respondWithCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: 'No hay datos para exportar' },
      { status: 404 }
    );
  }
  
  // Obtener las cabeceras del CSV
  const headers = Object.keys(data[0]);
  
  // Generar contenido CSV
  let csvContent = headers.join(',') + '\n';
  
  // Agregar filas de datos
  csvContent += data.map(row => {
    return headers
      .map(header => {
        // Formatear el valor según el tipo
        const value = row[header];
        // Si es string y contiene comas, rodearlo con comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== null && value !== undefined ? value : '';
      })
      .join(',');
  }).join('\n');
  
  // Configurar la respuesta HTTP
  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}