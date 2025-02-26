// src/app/api/ipc/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { IpcRow, IpcResponse } from '@/types';

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
    const searchParams = request.nextUrl.searchParams;
    
    // Obtener parámetros de consulta
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const format = searchParams.get('format') || 'json';
    const componentType = searchParams.get('component_type');
    const componentCode = searchParams.get('component_code') || 'GENERAL';
    const region = searchParams.get('region') || 'Nacional';
    const includeVariations = searchParams.get('include_variations') !== 'false'; // Por defecto, incluir variaciones
    
    // Construir consulta base
    let query = supabase
      .from('ipc')
      .select('*');
    
    // Aplicar filtros si existen
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Filtrar por tipo de componente si se especifica
    if (componentType) {
      query = query.eq('component_type', componentType);
    }
    
    // Filtrar por código de componente si se especifica
    if (componentCode) {
      query = query.eq('component_code', componentCode);
    }
    
    // Filtrar por región
    if (region) {
      query = query.eq('region', region);
    }
    
    // Ordenar resultados
    query = query.order('date', { ascending: true });
    
    // Aplicar paginación
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Ejecutar consulta
    const { data, error } = await query;
    
    if (error) {
      console.error('Error al consultar datos IPC:', error);
      return NextResponse.json(
        { error: 'Error al consultar la base de datos', details: error.message },
        { status: 500 }
      );
    }
    
    // Transformar datos y calcular variaciones si se solicitan
    let transformedData: any[] = data || [];
    
    if (includeVariations && data && data.length > 0) {
      // Agrupar por componente y región para calcular variaciones
      const dataByKey: Record<string, IpcRow[]> = {};
      
      // Primero, agrupar por componente y región
      data.forEach(item => {
        const key = `${item.region}_${item.component_code}`;
        if (!dataByKey[key]) {
          dataByKey[key] = [];
        }
        dataByKey[key].push(item as IpcRow);
      });
      
      // Para cada grupo, obtener datos adicionales necesarios para calcular variaciones
      const allKeys = Object.keys(dataByKey);
      const additionalDataPromises = allKeys.map(async (key) => {
        const items = dataByKey[key];
        const earliestDate = items[0].date; // Ya están ordenados cronológicamente
        
        // Obtener datos para este componente y región desde el año anterior
        // para poder calcular variaciones
        const [regionPart] = key.split('_', 1);
        const componentCode = key.substring(regionPart.length + 1);
        const earliestDateObj = new Date(earliestDate);
        const oneYearBefore = new Date(earliestDateObj);
        oneYearBefore.setFullYear(earliestDateObj.getFullYear() - 1);
        
        // Obtener datos del año anterior y último diciembre
        const { data: historicalData } = await supabase
          .from('ipc')
          .select('*')
          .eq('region', regionPart)
          .eq('component_code', componentCode)
          .lt('date', earliestDate)
          .gte('date', oneYearBefore.toISOString().slice(0, 10))
          .order('date', { ascending: true });
        
        if (historicalData && historicalData.length > 0) {
          // Añadir datos históricos a los grupos
          dataByKey[key] = [...historicalData as IpcRow[], ...dataByKey[key]];
        }
      });
      
      // Esperar a que se completen todas las consultas adicionales
      await Promise.all(additionalDataPromises);
      
      // Ahora, calcular las variaciones para cada item en los resultados
      transformedData = data.map(item => {
        const key = `${item.region}_${item.component_code}`;
        const itemsInGroup = dataByKey[key];
        
        // Ordenar por fecha para garantizar orden cronológico
        const sortedItems = [...itemsInGroup].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        const currentIndex = sortedItems.findIndex(i => i.id === item.id);
        const result: IpcResponse = {
          id: item.id,
          date: item.date,
          component: item.component,
          component_code: item.component_code,
          component_type: item.component_type,
          index_value: item.index_value,
          region: item.region
        };
        
        // Calcular variación mensual (respecto al mes anterior)
        if (currentIndex > 0) {
          const prevItem = sortedItems[currentIndex - 1];
          result.monthly_pct_change = calculatePercentageChange(
            prevItem.index_value, 
            item.index_value
          );
        }
        
        // Calcular variación anual (respecto al mismo mes del año anterior)
        const currentDate = new Date(item.date);
        const targetMonth = currentDate.getMonth();
        const targetYear = currentDate.getFullYear() - 1;
        
        const sameMonthLastYear = sortedItems.find(i => {
          const itemDate = new Date(i.date);
          return itemDate.getMonth() === targetMonth && 
                 itemDate.getFullYear() === targetYear;
        });
        
        if (sameMonthLastYear) {
          result.yearly_pct_change = calculatePercentageChange(
            sameMonthLastYear.index_value, 
            item.index_value
          );
        }
        
        // Calcular variación acumulada (respecto a diciembre del año anterior)
        const lastDecemberYear = currentDate.getFullYear() - 1;
        
        const lastDecember = sortedItems.find(i => {
          const itemDate = new Date(i.date);
          return itemDate.getMonth() === 11 && 
                 itemDate.getFullYear() === lastDecemberYear;
        });
        
        if (lastDecember) {
          result.accumulated_pct_change = calculatePercentageChange(
            lastDecember.index_value, 
            item.index_value
          );
        }
        
        return result;
      });
    }
    
    // Responder en el formato solicitado
    if (format === 'csv') {
      return respondWithCSV(transformedData, 'ipc_data.csv');
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
        component_type: componentType,
        component_code: componentCode,
        region: region,
        include_variations: includeVariations
      }
    });
    
  } catch (error) {
    console.error('Error en la API de IPC:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Calcula el cambio porcentual entre dos valores
 */
function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  const change = ((newValue - oldValue) / oldValue) * 100;
  return parseFloat(change.toFixed(1));
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