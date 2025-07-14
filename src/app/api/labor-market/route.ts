// src/app/api/labor-market/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

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

// Tipos para validación
type ViewType = 'temporal' | 'latest' | 'by_type' | 'comparison' | 'annual';
type DataType = 'national' | 'regional' | 'demographic' | 'all';
type IndicatorType = 'activity_rate' | 'employment_rate' | 'unemployment_rate' | 'all';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Parámetros de la API
    const view = (searchParams.get('view') || 'temporal') as ViewType;
    const dataType = (searchParams.get('data_type') || 'national') as DataType; // Por defecto: nacional
    const region = searchParams.get('region');
    const gender = searchParams.get('gender');
    const ageGroup = searchParams.get('age_group');
    const segment = searchParams.get('segment');
    const indicator = (searchParams.get('indicator') || 'all') as IndicatorType;
    const period = searchParams.get('period'); // "T1 2025" o "2024"
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const includeVariations = searchParams.get('include_variations') !== 'false'; // true por defecto
    const limit = parseInt(searchParams.get('limit') || '100');
    const format = searchParams.get('format') || 'json';

    // Validaciones
    if (!['temporal', 'latest', 'by_type', 'comparison', 'annual'].includes(view)) {
      return NextResponse.json(
        { error: 'View inválida. Use: temporal, latest, by_type, comparison, annual' },
        { status: 400 }
      );
    }

    if (!['national', 'regional', 'demographic', 'all'].includes(dataType)) {
      return NextResponse.json(
        { error: 'Data type inválido. Use: national, regional, demographic, all' },
        { status: 400 }
      );
    }

    if (format && !['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use: json, csv' },
        { status: 400 }
      );
    }

    // Seleccionar vista y campos según parámetro
    let tableName: string;
    let selectFields: string;

    switch (view) {
      case 'temporal':
        tableName = 'labor_market_temporal';
        selectFields = includeVariations 
          ? '*' 
          : 'id, date, period, data_type, region, gender, age_group, demographic_segment, activity_rate, employment_rate, unemployment_rate, total_population, economically_active_population, employed_population, unemployed_population, inactive_population, source_file, created_at, updated_at';
        break;
        
      case 'latest':
        tableName = 'labor_market_latest';
        selectFields = includeVariations 
          ? '*' 
          : 'id, date, period, data_type, region, gender, age_group, demographic_segment, activity_rate, employment_rate, unemployment_rate, total_population, economically_active_population, employed_population, unemployed_population, inactive_population';
        break;
        
      case 'by_type':
        tableName = 'labor_market_by_type';
        selectFields = '*';
        break;
        
      case 'comparison':
        tableName = 'labor_market_comparison';
        selectFields = '*';
        break;
        
      case 'annual':
        tableName = 'labor_market_annual';
        selectFields = '*';
        break;
        
      default:
        tableName = 'labor_market_temporal';
        selectFields = '*';
    }

    // Construir query base
    // Solución al error de tipado: tableName debe ser uno de los valores permitidos por el tipado de supabase.from
    // Por lo tanto, declaramos tableName como un tipo específico en vez de string
    type LaborMarketTable = 
      | 'labor_market_temporal'
      | 'labor_market_latest'
      | 'labor_market_by_type'
      | 'labor_market_comparison'
      | 'labor_market_annual';

    // Aseguramos que tableName es del tipo LaborMarketTable
    let query = supabase.from(tableName as LaborMarketTable).select(selectFields);

    // Aplicar filtros según la vista
    if (view !== 'comparison') {
      // Filtro por tipo de dato (clave principal)
      if (dataType !== 'all') {
        query = query.eq('data_type', dataType);
      }

      // Filtros geográficos
      if (region) {
        query = query.eq('region', region);
      }

      // Filtros demográficos
      if (gender) {
        query = query.eq('gender', gender);
      }

      if (ageGroup) {
        query = query.eq('age_group', ageGroup);
      }

      if (segment) {
        query = query.eq('demographic_segment', segment);
      }

      // Filtros temporales
      if (view === 'annual') {
        if (period && /^\d{4}$/.test(period)) {
          query = query.eq('year', parseInt(period));
        }
      } else {
        if (period) {
          if (period.startsWith('T')) {
            // Filtro por trimestre específico: "T1 2025"
            query = query.eq('period', period);
          } else if (/^\d{4}$/.test(period)) {
            // Filtro por año: "2025"
            query = query.like('period', `%${period}`);
          }
        }

        if (startDate) {
          query = query.gte('date', startDate);
        }

        if (endDate) {
          query = query.lte('date', endDate);
        }
      }
    } else {
      // Para vista comparison, filtros limitados
      if (period) {
        if (period.startsWith('T')) {
          query = query.eq('period', period);
        } else if (/^\d{4}$/.test(period)) {
          query = query.like('period', `%${period}`);
        }
      }

      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (endDate) {
        query = query.lte('date', endDate);
      }
    }

    // Aplicar límite
    if (limit > 0 && limit <= 1000) {
      query = query.limit(limit);
    }

    // Ordenamiento por defecto
    if (view === 'temporal' || view === 'latest' || view === 'by_type') {
      query = query.order('date', { ascending: false })
                  .order('data_type', { ascending: true })
                  .order('region', { ascending: true })
                  .order('gender', { ascending: true });
    } else if (view === 'comparison') {
      query = query.order('date', { ascending: false });
    } else if (view === 'annual') {
      query = query.order('year', { ascending: false })
                  .order('data_type', { ascending: true });
    }

    // Ejecutar query
    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching labor market data: ${error.message}`);
    }

    // Filtro adicional por indicador en el backend si es necesario
    let processedData = data || [];
    
    // Corregido: especificar el tipo de item para evitar el error de tipo implícito
    if (
      indicator !== 'all' &&
      (view === 'temporal' || view === 'latest' || view === 'by_type')
    ) {
      processedData = processedData.filter((item: Record<string, any>) =>
        item[indicator] !== null && item[indicator] !== undefined
      );
    }
    // Agregar información sobre variaciones YoY significativas
    if (view === 'latest' || view === 'temporal') {
      processedData = processedData.map(item => ({
        ...item,
        has_significant_yoy_change: hasSignificantYoYChange(item),
        significant_yoy_indicators: getSignificantYoYIndicators(item)
      }));
    }

    // Responder en CSV si se solicita
    if (format === 'csv') {
      return respondWithCSV(processedData, `labor_market_${view}_${dataType}.csv`);
    }

    // Preparar metadata
    const metadata = {
      view: view,
      data_type: dataType,
      count: processedData.length,
      includes_variations: includeVariations,
      filtered_by: {
        data_type: dataType,
        region: region,
        gender: gender,
        age_group: ageGroup,
        demographic_segment: segment,
        indicator: indicator,
        period: period,
        start_date: startDate,
        end_date: endDate
      },
      available_options: getAvailableOptions(processedData),
      data_description: getViewDescription(view),
      data_types_info: getDataTypesInfo()
    };

    // Configurar caché
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200' // 1 hora
    });

    return NextResponse.json({
      data: processedData,
      metadata: metadata
    }, { headers });

  } catch (error) {
    console.error('Error in labor market endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Genera respuesta en formato CSV
 */
function respondWithCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: 'No hay datos para exportar' },
      { status: 404 }
    );
  }

  const headers = Object.keys(data[0]);
  let csvContent = headers.join(',') + '\n';

  csvContent += data.map(row => {
    return headers
      .map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== null && value !== undefined ? value : '';
      })
      .join(',');
  }).join('\n');

  const csvHeaders = new Headers({
    'Content-Type': 'text/csv',
    'Content-Disposition': `attachment; filename="${filename}"`
  });

  return new NextResponse(csvContent, { headers: csvHeaders });
}

/**
 * Obtiene opciones únicas presentes en los datos
 */
function getAvailableOptions(data: any[]) {
  if (!data || data.length === 0) return {};

  const dataTypes = [...new Set(data.map(item => item.data_type).filter(Boolean))];
  const regions = [...new Set(data.map(item => item.region).filter(Boolean))];
  const genders = [...new Set(data.map(item => item.gender).filter(Boolean))];
  const ageGroups = [...new Set(data.map(item => item.age_group).filter(Boolean))];
  const segments = [...new Set(data.map(item => item.demographic_segment).filter(Boolean))];
  const periods = [...new Set(data.map(item => item.period || item.year).filter(Boolean))];

  return {
    data_types: dataTypes.sort(),
    regions: regions.sort(),
    genders: genders.sort(),
    age_groups: ageGroups.sort(),
    demographic_segments: segments.sort(),
    periods: periods.sort()
  };
}

/**
 * Información sobre los tipos de datos
 */
function getDataTypesInfo() {
  return {
    national: {
      name: 'Nacional',
      description: 'Datos agregados del total país (31 aglomerados urbanos)',
      typical_filters: ['period', 'indicator']
    },
    regional: {
      name: 'Regional', 
      description: 'Datos por regiones geográficas (GBA, Cuyo, NEA, NOA, Pampeana, Patagónica)',
      typical_filters: ['region', 'period', 'indicator']
    },
    demographic: {
      name: 'Demográfico',
      description: 'Datos por segmentos de población (género, edad, jefes de hogar)',
      typical_filters: ['gender', 'age_group', 'segment', 'period', 'indicator']
    },
    all: {
      name: 'Todos',
      description: 'Combinación de datos nacionales, regionales y demográficos',
      typical_filters: ['data_type', 'period', 'indicator']
    }
  };
}

/**
 * Descripción de cada vista
 */
function getViewDescription(view: ViewType) {
  const descriptions = {
    temporal: 'Serie temporal completa con variaciones vs período anterior para todos los tipos de datos',
    latest: 'Último período disponible por cada tipo de dato con variaciones',
    by_type: 'Datos organizados por tipo (nacional/regional/demográfico) para análisis específicos',
    comparison: 'Comparación del último período entre datos nacionales, regionales y demográficos',
    annual: 'Agregaciones anuales con promedios y variaciones anuales para todos los tipos'
  };

  return descriptions[view];
}

/**
 * Detecta si hay cambios significativos YoY (>1 punto porcentual)
 */
function hasSignificantYoYChange(item: any): boolean {
  const threshold = 1.0; // 1 punto porcentual
  
  return Math.abs(item.variation_yoy_activity_rate || 0) > threshold ||
         Math.abs(item.variation_yoy_employment_rate || 0) > threshold ||
         Math.abs(item.variation_yoy_unemployment_rate || 0) > threshold;
}

/**
 * Obtiene lista de indicadores con cambios YoY significativos
 */
function getSignificantYoYIndicators(item: any): string[] {
  const threshold = 1.0;
  const significant = [];
  
  if (Math.abs(item.variation_yoy_activity_rate || 0) > threshold) {
    significant.push('activity_rate');
  }
  if (Math.abs(item.variation_yoy_employment_rate || 0) > threshold) {
    significant.push('employment_rate');
  }
  if (Math.abs(item.variation_yoy_unemployment_rate || 0) > threshold) {
    significant.push('unemployment_rate');
  }
  
  return significant;
}

// Configurar revalidación
export const revalidate = 3600; // 1 hora