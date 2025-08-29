// src/lib/rate-limit.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
  error?: string
  userId?: string
}

// Crear cliente de Supabase para rate limiting
function createRateLimitSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables for rate limiting')
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function checkRateLimit(req: NextRequest): Promise<RateLimitResult> {
  try {
    // Obtener headers relevantes
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    const referer = req.headers.get('referer')
    const userAgent = req.headers.get('user-agent') || ''
    
    // Debug logging para headers (deshabilitado)
    // console.log('Rate limit headers:', { origin, host, referer, userAgent: userAgent.substring(0, 50) + '...' })
    
    // Lista de dominios permitidos sin API key
    const allowedDomains = [
      'localhost:3000',
      'localhost:3001',
      'localhost:3002',
      'localhost:3003',
      'localhost:3004',
      'localhost:3005',
      '127.0.0.1:3000',
      '127.0.0.1:3001',
      '127.0.0.1:3002', 
      '127.0.0.1:3003',
      '127.0.0.1:3004',
      '127.0.0.1:3005',
      'argenstats.com',
      'www.argenstats.com',
      'argenstats.vercel.app',
    ]
    
    // Detectar si es una petición desde el navegador (tiene origin o referer válido)
    const isBrowserRequest = !!(origin || referer)
    
    // Verificar si es una petición interna genuina
    const isInternalRequest = 
      isBrowserRequest &&
      (
        (origin && host && new URL(origin).host === host) ||
        (referer && host && new URL(referer).host === host) ||
        (origin && allowedDomains.some(domain => origin.includes(domain))) ||
        (referer && allowedDomains.some(domain => referer.includes(domain)))
      )
    
    // Detectar herramientas de desarrollo/testing conocidas
    const isDevelopmentTool = 
      userAgent.toLowerCase().includes('postman') ||
      userAgent.toLowerCase().includes('insomnia') ||
      userAgent.toLowerCase().includes('thunder client') ||
      userAgent.toLowerCase().includes('httpie') ||
      userAgent.toLowerCase().includes('curl') ||
      userAgent.toLowerCase().includes('wget')
    
    // NUEVA LÓGICA: SIN RATE LIMITING
    // Si es desde localhost, permitir sin límites (desarrollo)
    if (host && host.includes('localhost')) {
      // console.info('Localhost request detected, allowing without limits', { host, origin, referer })
      return {
        success: true,
        limit: 999999,
        remaining: 999999,
        reset: new Date(Date.now() + 86400000), // 24 horas
      }
    }
    
    // Si es una petición interna genuina desde el navegador, permitir sin límites
    if (isInternalRequest && !isDevelopmentTool) {
      console.info('Internal request detected, allowing without limits')
      return {
        success: true,
        limit: 999999,
        remaining: 999999,
        reset: new Date(Date.now() + 86400000), // 24 horas
      }
    }
    
    // Para peticiones externas, verificar API key pero SIN aplicar límites
    const apiKey = req.headers.get('x-api-key')
    
    if (!apiKey) {
      console.info('External request without API key')
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: new Date(),
        error: 'API key required for external requests'
      }
    }

    console.info('Checking API key:', apiKey.substring(0, 10) + '...')

    // Crear cliente de Supabase
    const supabase = createRateLimitSupabaseClient()

    // Get user by API key (para tracking, no para limitar)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, plan_type, daily_requests_count, last_request_reset_at')
      .eq('api_key', apiKey)
      .single()

    if (userError || !user) {
      console.error('Error fetching user:', userError)
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: new Date(),
        error: 'Invalid API key'
      }
    }

    console.info('User found:', { id: user.id, plan: user.plan_type })

    // NUEVO: Sin límites, solo tracking
    // Devolver límites "infinitos" para que el usuario sepa que no hay restricciones
    const virtualLimit = 999999
    
    // Solo incrementar contador para tracking (sin verificar límites)
    const currentCount = user.daily_requests_count || 0
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        daily_requests_count: currentCount + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating request count:', updateError)
      // No bloquear la petición si no se puede actualizar el contador
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return {
      success: true,
      limit: virtualLimit,
      remaining: virtualLimit - 1, // Mostrar siempre remaining alto
      reset: tomorrow,
      userId: user.id
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    
    // En caso de error, permitir la petición sin límites
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: new Date(Date.now() + 86400000),
    }
  }
}

// Helper para aplicar rate limiting y tracking a una API route
export function withRateLimit(handler: (req: NextRequest, ...args: any[]) => Promise<Response>) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now()
    let response: Response
    let rateLimitResult: RateLimitResult | undefined
    
    try {
      rateLimitResult = await checkRateLimit(req)

      // Agregar headers de rate limit
      const headers = new Headers({
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
      })

      if (!rateLimitResult.success) {
        response = new Response(
          JSON.stringify({ 
            error: rateLimitResult.error,
            message: 'Access token required for external API requests. Get yours at https://argenstats.com/profile'
          }),
          { 
            status: 401, 
            headers 
          }
        )
        return response
      }

      // Llamar al handler original
      response = await handler(req, ...args)
      
      // Agregar headers de rate limit a la respuesta
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
        response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toISOString())
      }

      return response
    } catch (error) {
      console.error('Error in withRateLimit wrapper:', error)
      
      // En caso de error en el rate limiting, permitir que la request continúe
      response = await handler(req, ...args)
      return response
    } finally {
      // Trackear la petición de forma asíncrona (importar dinámicamente para evitar circular deps)
      setTimeout(async () => {
        try {
          const { trackRequest } = await import('./request-tracker')
          const responseTime = Date.now() - startTime
          await trackRequest(
            req, 
            response?.status || 500, 
            responseTime, 
            rateLimitResult?.userId
          )
        } catch (trackingError) {
          console.error('Error in request tracking:', trackingError)
        }
      }, 0)
    }
  }
}