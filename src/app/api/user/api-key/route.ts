import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch user's API key
export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('api_key')
      .eq('clerk_user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ apiKey: user?.api_key || null })
  } catch (error) {
    console.error('Error in GET /api/user/api-key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Generate new API key
export async function POST() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate new API key
    const apiKey = `ak_${randomBytes(32).toString('hex')}`

    const { data: user, error } = await supabase
      .from('users')
      .update({ 
        api_key: apiKey,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', userId)
      .select('api_key')
      .single()

    if (error) {
      console.error('Error updating user API key:', error)
      return NextResponse.json({ error: 'Failed to generate API key' }, { status: 500 })
    }

    return NextResponse.json({ apiKey: user.api_key })
  } catch (error) {
    console.error('Error in POST /api/user/api-key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}