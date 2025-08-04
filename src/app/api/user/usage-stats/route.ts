// src/app/api/user/usage-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Configurar runtime
export const dynamic = 'force-dynamic';

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/user/usage-stats
 * 
 * Obtener estadísticas de uso de API del usuario autenticado
 * 
 * Query Parameters:
 * - days: number (default: 30) - Días hacia atrás para calcular estadísticas
 * - detailed: boolean (default: false) - Si incluir detalles por endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 365);
    const detailed = searchParams.get('detailed')?.toLowerCase() === 'true';

    // Obtener usuario de la base de datos
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, plan_type, daily_requests_count, api_key')
      .eq('clerk_id', session.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Calcular fechas
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Obtener estadísticas generales
    const { data: totalRequests, error: totalError } = await supabase
      .from('api_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (totalError) {
      console.error('Error fetching total requests:', totalError);
    }

    // Obtener estadísticas por endpoint
    const { data: endpointStats, error: endpointError } = await supabase
      .rpc('get_user_api_stats', {
        user_id_param: user.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

    if (endpointError) {
      console.error('Error fetching endpoint stats:', endpointError);
    }

    // Obtener distribución por día (últimos 7 días para el gráfico)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const { data: dailyStats, error: dailyError } = await supabase
      .from('api_requests')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', last7Days.toISOString())
      .order('created_at', { ascending: true });

    if (dailyError) {
      console.error('Error fetching daily stats:', dailyError);
    }

    // Procesar datos diarios
    const dailyDistribution = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const requestsOnDay = (dailyStats || []).filter(req => 
        req.created_at.startsWith(dateStr)
      ).length;

      return {
        date: dateStr,
        requests: requestsOnDay
      };
    });

    // Obtener top endpoints
    const topEndpoints = (endpointStats || [])
      .sort((a: any, b: any) => b.request_count - a.request_count)
      .slice(0, 5);

    // Construir respuesta
    const response = {
      success: true,
      data: {
        user: {
          id: user.id,
          plan_type: user.plan_type,
          has_api_key: !!user.api_key
        },
        period: {
          days,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        },
        summary: {
          total_requests: totalRequests?.length || 0,
          daily_average: Math.round((totalRequests?.length || 0) / days),
          today_requests: user.daily_requests_count || 0,
          unique_endpoints: (endpointStats || []).length
        },
        daily_distribution: dailyDistribution,
        top_endpoints: topEndpoints.map((endpoint: any) => ({
          endpoint: endpoint.endpoint,
          requests: parseInt(endpoint.request_count),
          avg_response_time: parseFloat(endpoint.avg_response_time) || null,
          last_used: endpoint.last_request
        }))
      },
      meta: {
        timestamp: new Date().toISOString(),
        cache_duration: '5 minutes'
      }
    };

    // Agregar detalles si se solicita
    if (detailed && endpointStats) {
      (response.data as any).detailed_stats = endpointStats.map((endpoint: any) => ({
        endpoint: endpoint.endpoint,
        requests: parseInt(endpoint.request_count),
        avg_response_time: parseFloat(endpoint.avg_response_time) || null,
        last_used: endpoint.last_request
      }));
    }

    // Headers de caché
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=300' // 5 minutos
    });

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error in usage stats API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: (error as Error).message
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
}

/**
 * DELETE /api/user/usage-stats
 * 
 * Limpiar historial de requests del usuario (para testing o privacidad)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Obtener usuario de la base de datos
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', session.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const { searchParams } = request.nextUrl;
    const confirm = searchParams.get('confirm');

    if (confirm !== 'yes') {
      return NextResponse.json({
        success: false,
        error: 'Confirmation required',
        message: 'Add ?confirm=yes to delete all your request history'
      }, { status: 400 });
    }

    // Eliminar historial de requests
    const { error: deleteError, count } = await supabase
      .from('api_requests')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting requests:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete request history'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Request history deleted successfully',
      deleted_records: count || 0
    });

  } catch (error) {
    console.error('Error deleting usage stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}