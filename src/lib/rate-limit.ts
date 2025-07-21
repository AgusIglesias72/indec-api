// src/lib/rate-limit.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
  error?: string
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
    
    // Log para debugging
    console.info('Rate limit check:', {
      origin,
      host,
      referer,
      userAgent: userAgent.substring(0, 50),
      path: req.url
    })
    
    // Lista de dominios permitidos sin API key
    const allowedDomains = [
      'localhost:3000',
      '127.0.0.1:3000',
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
    
    // Si es una herramienta de desarrollo, siempre requerir API key
    if (isDevelopmentTool) {
      const apiKey = req.headers.get('x-api-key')
      
      if (!apiKey) {
        console.info('Development tool detected without API key')
        return {
          success: false,
          limit: 0,
          remaining: 0,
          reset: new Date(),
          error: 'API key required for development tools'
        }
      }
      
      // Continuar con la verificación de API key más abajo
    }
    
    // Si es una petición interna genuina desde el navegador, permitir sin límites
    if (isInternalRequest && !isDevelopmentTool) {
      console.info('Internal request detected, allowing without rate limit')
      return {
        success: true,
        limit: 999999,
        remaining: 999999,
        reset: new Date(Date.now() + 86400000), // 24 horas
      }
    }
    
    // Para todas las demás peticiones (externas o de herramientas), verificar API key
    const apiKey = req.headers.get('x-api-key')
    
    if (!apiKey) {
      console.info('External request without API key')
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: new Date(),
        error: 'API key required'
      }
    }

//    console.log('Checking API key:', apiKey.substring(0, 10) + '...')
    console.info('Checking API key:', apiKey)

    // Crear cliente de Supabase
    const supabase = createRateLimitSupabaseClient()

    // First, reset daily counts if needed
    const { error: rpcError } = await supabase.rpc('reset_daily_requests')
    if (rpcError) {
      console.error('Error resetting daily requests:', rpcError)
      // No bloquear si falla el reset
    }

    // Get user by API key
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

    console.info('User found:', { id: user.id, plan: user.plan_type, count: user.daily_requests_count })

    // Determine rate limit based on plan
    const limits = {
      free: 100,
      pro: 1000,
      enterprise: 10000
    }

    const limit = limits[user.plan_type as keyof typeof limits] || limits.free
    const currentCount = user.daily_requests_count || 0

    // Check if limit exceeded
    if (currentCount >= limit) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      console.info('Rate limit exceeded:', { limit, currentCount })

      return {
        success: false,
        limit,
        remaining: 0,
        reset: tomorrow,
        error: 'Rate limit exceeded'
      }
    }

    // Increment counter
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        daily_requests_count: currentCount + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating request count:', updateError)
      // Don't block the request if we can't update the counter
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return {
      success: true,
      limit,
      remaining: limit - currentCount - 1,
      reset: tomorrow
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    
    // En caso de error, permitir la petición pero con límites conservadores
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: new Date(Date.now() + 86400000),
    }
  }
}

// Helper para aplicar rate limiting a una API route
export function withRateLimit(handler: (req: NextRequest, ...args: any[]) => Promise<Response>) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      const rateLimitResult = await checkRateLimit(req)

      // Agregar headers de rate limit
      const headers = new Headers({
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
      })

      if (!rateLimitResult.success) {
        return new Response(
          JSON.stringify({ error: rateLimitResult.error }),
          { 
            status: 429, 
            headers 
          }
        )
      }

      // Llamar al handler original
      const response = await handler(req, ...args)
      
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
      return handler(req, ...args)
    }
  }
}