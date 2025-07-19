// src/app/api/user/api-key/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerComponentClient()

    // Get user's API key
    const { data, error } = await supabase
      .from('users')
      .select('api_key')
      .eq('clerk_user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching API key:', error)
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

    const supabase = createServerComponentClient()

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