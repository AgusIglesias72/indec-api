// src/app/api/user/api-key/route.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// IMPORTANTE: Usar Service Role Key para operaciones admin
function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // ← IMPORTANTE: Service Role, no Anon Key

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

    const supabase = createSupabaseAdmin()

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

    const supabase = createSupabaseAdmin()

    // Obtener información del usuario de Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Primero, verificar si el usuario existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, clerk_user_id')
      .eq('clerk_user_id', userId)
      .single()

    // Si el usuario no existe, crearlo
    if (checkError && checkError.code === 'PGRST116') {
      console.log('Creating new user in database...')
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_user_id: userId,
          email: user.emailAddresses?.[0]?.emailAddress || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
          plan_type: 'free',
          daily_requests_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user:', insertError)
        return NextResponse.json({ 
          error: 'Error creating user', 
          details: insertError.message 
        }, { status: 500 })
      }
      
      console.log('User created successfully:', newUser?.id)
    }

    // Generate new API key
    const { data: apiKeyData, error: rpcError } = await supabase.rpc('generate_api_key')

    if (rpcError) {
      console.error('Error generating API key:', rpcError)
      return NextResponse.json({ 
        error: 'Error generating API key',
        details: rpcError.message 
      }, { status: 500 })
    }

    console.log('Generated API key:', apiKeyData?.substring(0, 10) + '...')

    // Update user's API key
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        api_key: apiKeyData,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating API key:', updateError)
      return NextResponse.json({ 
        error: 'Error updating API key',
        details: updateError.message 
      }, { status: 500 })
    }

    console.log('API key updated successfully for user:', updatedUser?.id)

    return NextResponse.json({ 
      apiKey: apiKeyData,
      message: 'API key generated successfully' 
    })
    
  } catch (error) {
    console.error('Error in API key POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}