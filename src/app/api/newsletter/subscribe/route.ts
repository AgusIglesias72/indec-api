// src/app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    // Parsear el body de la request
    const body = await request.json();
    const { email, source = 'website' } = body;

    // Validaciones
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Email no válido' },
        { status: 400 }
      );
    }

    // Normalizar email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar si el email ya existe
    const { data: existingSubscription, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('id, status')
      .eq('email', normalizedEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows found, que está bien
      console.error('Error checking existing subscription:', checkError);
      return NextResponse.json(
        { success: false, error: 'Error interno del servidor' },
        { status: 500 }
      );
    }

    // Si ya existe la suscripción
    if (existingSubscription) {
      if (existingSubscription.status === 'active') {
        return NextResponse.json(
          { success: false, error: 'Este email ya está suscripto' },
          { status: 409 }
        );
      } else {
        // Reactivar suscripción si estaba inactiva
        const { error: updateError } = await supabase
          .from('newsletter_subscriptions')
          .update({
            status: 'active',
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null
          })
          .eq('id', existingSubscription.id);

        if (updateError) {
          console.error('Error reactivating subscription:', updateError);
          return NextResponse.json(
            { success: false, error: 'Error al reactivar suscripción' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Suscripción reactivada exitosamente',
          data: { email: normalizedEmail, status: 'reactivated' }
        });
      }
    }

    // Crear nueva suscripción
    const { data: newSubscription, error: insertError } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email: normalizedEmail,
        source,
        status: 'active',
        subscribed_at: new Date().toISOString(),
        metadata: {
          user_agent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          referrer: request.headers.get('referer')
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating subscription:', insertError);
      return NextResponse.json(
        { success: false, error: 'Error al crear suscripción' },
        { status: 500 }
      );
    }

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Suscripción creada exitosamente',
      data: {
        id: newSubscription.id,
        email: newSubscription.email,
        status: 'subscribed'
      }
    });

  } catch (error) {
    console.error('Error in newsletter subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Método GET para verificar estado de suscripción (opcional)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Email es requerido' },
      { status: 400 }
    );
  }

  try {
    const { data: subscription, error } = await supabase
      .from('newsletter_subscriptions')
      .select('email, status, subscribed_at')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      return NextResponse.json(
        { success: false, error: 'Error interno del servidor' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subscription || null
    });

  } catch (error) {
    console.error('Error in GET newsletter:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}