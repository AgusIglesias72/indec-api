// src/app/api/user/api-key/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Crear cliente de Supabase para API routes
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient()

    // Get user's API key
    const { data, error } = await supabase
      .from('users')
      .select('api_key')
      .eq('clerk_user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching API key:', error)
      
      // Si el usuario no existe, devolver null en lugar de error
      if (error.code === 'PGRST116') {
        return NextResponse.json({ apiKey: null })
      }
      
      return NextResponse.json({ error: 'Error fetching API key' }, { status: 500 })
    }

    return NextResponse.json({ apiKey: data?.api_key || null })
  } catch (error) {
    console.error('Error in API key GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient()

    // Primero, verificar si el usuario existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, clerk_user_id')
      .eq('clerk_user_id', userId)
      .single()

    // Si el usuario no existe, primero debemos crearlo
    if (checkError && checkError.code === 'PGRST116') {
      // Obtener información del usuario de Clerk
      const { userId, sessionClaims } = await auth();
      const user = sessionClaims;

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_user_id: userId,
          email: Array.isArray(user?.emailAddresses) && user?.emailAddresses[0]?.emailAddress
            ? user.emailAddresses[0].emailAddress
            : '',
          name: user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.username || '',
          plan_type: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error creating user:', insertError)
        return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
      }
    }

    // Generate new API key
    const { data: apiKeyData, error: rpcError } = await supabase.rpc('generate_api_key')

    if (rpcError) {
      console.error('Error generating API key:', rpcError)
      return NextResponse.json({ error: 'Error generating API key' }, { status: 500 })
    }

    // Update user's API key
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        api_key: apiKeyData,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', userId)

    if (updateError) {
      console.error('Error updating API key:', updateError)
      return NextResponse.json({ error: 'Error updating API key' }, { status: 500 })
    }

    return NextResponse.json({ apiKey: apiKeyData })
  } catch (error) {
    console.error('Error in API key POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}