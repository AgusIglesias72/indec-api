// src/lib/rate-limit.ts
import { createServerComponentClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
  error?: string
}

export async function checkRateLimit(req: NextRequest): Promise<RateLimitResult> {
  const apiKey = req.headers.get('x-api-key')
  
  if (!apiKey) {
    return {
      success: false,
      limit: 0,
      remaining: 0,
      reset: new Date(),
      error: 'API key required'
    }
  }

  const supabase = createServerComponentClient()

  try {
    // First, reset daily counts if needed
    await supabase.rpc('reset_daily_requests')

    // Get user by API key
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, plan_type, daily_requests_count, last_request_reset_at')
      .eq('api_key', apiKey)
      .single()

    if (userError || !user) {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: new Date(),
        error: 'Invalid API key'
      }
    }

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
    return {
      success: false,
      limit: 0,
      remaining: 0,
      reset: new Date(),
      error: 'Internal server error'
    }
  }
}

// Helper para aplicar rate limiting a una API route
export function withRateLimit(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
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
      rateLimitResult.limit && response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
      rateLimitResult.remaining !== undefined && response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      rateLimitResult.reset && response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toISOString())
    }

    return response
  }
}