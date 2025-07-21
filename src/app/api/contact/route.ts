// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Configurar cliente de Supabase con fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Solo crear el cliente si tenemos las variables
let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Schema de validación con Zod
const contactSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre es demasiado largo')
    .trim(),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email demasiado largo')
    .toLowerCase()
    .trim(),
  subject: z.string()
    .max(255, 'El asunto es demasiado largo')
    .optional()
    .nullable(),
  message: z.string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(5000, 'El mensaje es demasiado largo')
    .trim(),
  contact_type: z.enum(['api', 'bug', 'feature', 'general']).refine(
    (val) => ['api', 'bug', 'feature', 'general'].includes(val),
    { message: 'Tipo de contacto inválido' }
  )
});

// Función simple de detección de spam
function calculateSpamScore(data: any, userAgent: string, ip: string): number {
  let score = 0;
  
  // Patrones sospechosos en el mensaje
  const spamPatterns = [
    /https?:\/\//gi, // URLs
    /\b(buy|purchase|sale|discount|offer|free|win|prize)\b/gi, // Palabras comerciales
    /\b\d{10,}\b/g, // Números largos (teléfonos, etc)
  ];
  
  spamPatterns.forEach(pattern => {
    const matches = data.message.match(pattern);
    if (matches) score += matches.length * 0.2;
  });
  
  // Mensaje muy corto o muy largo
  if (data.message.length < 20) score += 0.3;
  if (data.message.length > 2000) score += 0.2;
  
  // Email sospechoso
  if (data.email.includes('+')) score += 0.1;
  if (data.email.match(/\d{4,}/)) score += 0.2;
  
  // User agent sospechoso
  if (!userAgent || userAgent.length < 20) score += 0.3;
  
  return Math.min(score, 1.0);
}

// Función para obtener IP real
function getRealIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * POST /api/contact
 * Crear un nuevo submission de contacto
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar configuración de Supabase
    if (!supabase) {
      console.error('Supabase client not initialized - check environment variables');
      return NextResponse.json({
        success: false,
        error: 'Configuración del servidor incorrecta'
      }, { status: 500 });
    }

    // Rate limiting básico por IP
    const ip = getRealIP(request);
    const rateLimitKey = `contact_${ip}`;
    
    // Aquí podrías implementar rate limiting con Redis o similar
    // Por ahora solo logeamos
    console.info(`Contact form submission from IP: ${ip}`);
    
    // Parsear y validar el body
    const body = await request.json();
    const validationResult = contactSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Datos inválidos',
        details: validationResult.error.format()
      }, { status: 400 });
    }
    
    const data = validationResult.data;
    
    // Obtener metadata de la request
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    
    // Calcular spam score
    const spamScore = calculateSpamScore(data, userAgent, ip);
    const isSpam = spamScore > 0.7;
    
    // Preparar datos para insertar
    const submissionData = {
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
      contact_type: data.contact_type,
      user_agent: userAgent,
      ip_address: ip,
      referrer: referrer,
      spam_score: spamScore,
      is_spam: isSpam,
      // Asignar prioridad automática
      priority: data.contact_type === 'bug' ? 'high' : 
               data.contact_type === 'api' ? 'medium' : 'low'
    };
    
    // Insertar en la base de datos
    const { data: insertedData, error } = await supabase
      .from('contact_submissions')
      .insert([submissionData])
      .select('id, created_at')
      .single();
    
    if (error) {
      console.error('Error inserting contact submission:', error);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
    
    // Log para monitoring
    console.info(`Contact submission created: ID ${insertedData.id}, Type: ${data.contact_type}, Spam Score: ${spamScore}`);
    
    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: isSpam ? 
        'Tu mensaje ha sido recibido y será revisado.' : 
        'Gracias por contactarnos. Te responderemos pronto.',
      data: {
        id: insertedData.id,
        submitted_at: insertedData.created_at
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in contact API:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

/**
 * GET /api/contact/stats
 * Obtener estadísticas públicas de contacto
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar configuración de Supabase
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Configuración del servidor incorrecta'
      }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('contact_stats')
      .select('*');
    
    if (error) {
      console.error('Error fetching contact stats:', error);
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo estadísticas'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: data || []
    });
    
  } catch (error) {
    console.error('Error in contact stats API:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}