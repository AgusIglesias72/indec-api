import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing environment variables for Supabase connection');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Obtener datos de la vista de metadata
    const { data: componentsData, error: componentsError } = await supabase
      .from('ipc_components_metadata')
      .select('*')
      

    if (componentsError) {
      throw new Error(`Error fetching components metadata: ${componentsError.message}`);
    }

    // Procesar los datos para crear una estructura organizada
    const regions = new Set<string>();
    const componentsByType: Record<string, Array<{
      code: string;
      name: string;
    }>> = {};

    componentsData?.forEach(item => {
      // Agregar región al conjunto de regiones únicas
      if (item.region) {
        regions.add(item.region);
      }

      // Organizar componentes por tipo
      if (item.component_type) {
        if (!componentsByType[item.component_type]) {
          componentsByType[item.component_type] = [];
        }

        // Evitar duplicados en componentes
        const existingComponent = componentsByType[item.component_type]
          .find((comp: { code: string | null }) => comp.code === item.component_code);

        if (!existingComponent && item.component_code && item.component_type) {
          componentsByType[item.component_type].push({
            code: item.component_code,
            name: item.component || '' // Using component instead of component_name
          });
        }
      }
    });

    // Obtener la última fecha de actualización
    const { data: lastUpdateData, error: lastUpdateError } = await supabase
      .from('ipc')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (lastUpdateError) {
      console.warn('Error fetching last update date:', lastUpdateError);
    }

    const response = {
      regions: Array.from(regions).sort(),
      components: componentsByType,
      metadata: {
        last_updated: lastUpdateData?.date || null,
        available_formats: ['json', 'csv'],
        endpoints: {
          main: '/api/ipc',
          latest: '/api/ipc/latest',
          metadata: '/api/ipc/metadata'
        }
      }
    };

    // Configurar caché para 1 hora
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    });

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('Error in IPC metadata endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}