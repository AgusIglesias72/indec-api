// src/lib/request-tracker.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

interface RequestTrackingData {
  user_id?: string
  endpoint: string
  method: string
  status_code: number
  response_time_ms?: number
  user_agent?: string
  ip_address?: string
  referer?: string
  request_params?: any
  api_key_used?: string
  is_internal: boolean
}

// Crear cliente de Supabase para tracking
function createTrackingSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables for request tracking')
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Hash de API key para seguridad
function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex').substring(0, 16)
}

// Detectar si es una petición interna
export function isInternalRequest(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  const referer = req.headers.get('referer')
  
  const allowedDomains = [
    'localhost:3000',
    '127.0.0.1:3000',
    'argenstats.com',
    'www.argenstats.com',
    'argenstats.vercel.app',
  ]
  
  const isBrowserRequest = !!(origin || referer)
  
  if (!isBrowserRequest) return false
  
  try {
    return (
      (origin && host && new URL(origin).host === host) ||
      (referer && host && new URL(referer).host === host) ||
      (origin && allowedDomains.some(domain => origin.includes(domain))) ||
      (referer && allowedDomains.some(domain => referer.includes(domain)))
    ) === true
  } catch {
    return false
  }
}

// Extraer IP address
function getClientIP(req: NextRequest): string | undefined {
  const xForwardedFor = req.headers.get('x-forwarded-for')
  const xRealIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  if (xRealIP) {
    return xRealIP
  }
  
  return undefined
}

// Trackear petición a la API
export async function trackRequest(
  req: NextRequest,
  statusCode: number,
  responseTimeMs?: number,
  userId?: string
): Promise<void> {
  try {
    const supabase = createTrackingSupabaseClient()
    
    // Extraer información de la petición
    const endpoint = new URL(req.url).pathname
    const method = req.method
    const userAgent = req.headers.get('user-agent')
    const referer = req.headers.get('referer')
    const apiKey = req.headers.get('x-api-key')
    const clientIP = getClientIP(req)
    const isInternal = isInternalRequest(req)
    
    // IMPORTANTE: Solo trackear si la petición usa API key o NO es interna
    // Esto evita contar las peticiones del propio sitio web que no usan API key
    if (!apiKey && isInternal) {
      return // No trackear peticiones internas sin API key
    }
    
    // Extraer parámetros de query (sin información sensible)
    const { searchParams } = new URL(req.url)
    const params: any = {}
    searchParams.forEach((value, key) => {
      // No guardar información sensible
      if (!['api_key', 'token', 'password', 'secret'].includes(key.toLowerCase())) {
        params[key] = value
      }
    })
    
    const trackingData: RequestTrackingData = {
      user_id: userId,
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      user_agent: userAgent || undefined,
      ip_address: clientIP,
      referer: referer || undefined,
      request_params: Object.keys(params).length > 0 ? params : null,
      api_key_used: apiKey ? hashApiKey(apiKey) : undefined,
      is_internal: isInternal
    }
    
    // Insertar en la base de datos (async, no bloquear la respuesta)
    supabase
      .from('api_requests')
      .insert(trackingData)
      .then(({ error }) => {
        if (error) {
          console.error('Error tracking request:', error)
        }
      })
    
  } catch (error) {
    console.error('Error in trackRequest:', error)
    // No bloquear la respuesta si falla el tracking
  }
}

// Wrapper para aplicar tracking a una API route
export function withRequestTracking(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>
) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now()
    let response: Response
    let userId: string | undefined
    
    try {
      // Ejecutar el handler original
      response = await handler(req, ...args)
      
      // Intentar extraer userId de la respuesta o headers si está disponible
      // (esto puede requerir modificaciones adicionales según tu implementación)
      
      return response
    } catch (error) {
      console.error('Error in handler:', error)
      
      // Crear respuesta de error
      response = new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
      
      return response
    } finally {
      // Trackear la petición después de que termine
      const responseTime = Date.now() - startTime
      
      // Ejecutar tracking de forma asíncrona para no bloquear la respuesta
      setTimeout(() => {
        trackRequest(req, response?.status || 500, responseTime, userId)
      }, 0)
    }
  }
}

// Función para obtener estadísticas de un usuario
export async function getUserApiStats(userId: string, days: number = 30): Promise<any> {
  try {
    const supabase = createTrackingSupabaseClient()
    
    const { data, error } = await supabase.rpc('get_user_api_stats', {
      user_id_param: userId,
      start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date().toISOString()
    })
    
    if (error) {
      console.error('Error fetching user stats:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getUserApiStats:', error)
    return null
  }
}