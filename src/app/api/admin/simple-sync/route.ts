// src/app/api/admin/simple-sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const adminKey = headersList.get('x-admin-key')
    
    if (!adminKey || adminKey !== process.env.ADMIN_SYNC_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.info('Testing simple sync endpoint...')
    
    const supabase = createServerComponentClient()
    
    // First, just count users in Supabase
    const { count: supabaseCount, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 })
    }

    // Try to get a sample of users to see what's in the table
    const { data: sampleUsers, error: sampleError } = await supabase
      .from('users')
      .select('clerk_user_id, email, name')
      .limit(3)

    if (sampleError) {
      return NextResponse.json({ 
        error: 'Sample query error', 
        details: sampleError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      supabase_user_count: supabaseCount || 0,
      sample_users: sampleUsers,
      message: 'Simple sync test completed'
    })

  } catch (error) {
    console.error('Error in simple sync:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage 
    }, { status: 500 })
  }
}