// src/app/api/admin/compare-users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClerkClient } from '@clerk/nextjs/server'
import { createServerComponentClient } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const adminKey = headersList.get('x-admin-key')
    
    if (!adminKey || adminKey !== process.env.ADMIN_SYNC_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.info('Comparing users between Clerk and Supabase...')
    
    // Get Clerk users
    const clerk = createClerkClient({ 
      secretKey: process.env.CLERK_SECRET_KEY 
    })
    
    const clerkUsersResponse = await clerk.users.getUserList({ 
      limit: 100
    })

    const clerkUsers = clerkUsersResponse.data.map(user => ({
      clerk_id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      created_at: new Date(user.createdAt).toISOString()
    }))

    // Get Supabase users  
    const supabase = createServerComponentClient()
    const { data: supabaseUsers, error } = await supabase
      .from('users')
      .select('clerk_user_id, email, name, created_at')

    if (error) {
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 })
    }

    // Find missing users
    const clerkUserIds = new Set(clerkUsers.map(u => u.clerk_id))
    const supabaseUserIds = new Set(supabaseUsers?.map(u => u.clerk_user_id) || [])

    const missingInSupabase = clerkUsers.filter(u => !supabaseUserIds.has(u.clerk_id))
    const extraInSupabase = supabaseUsers?.filter(u => !clerkUserIds.has(u.clerk_user_id)) || []

    return NextResponse.json({
      success: true,
      summary: {
        clerk_total: clerkUsers.length,
        supabase_total: supabaseUsers?.length || 0,
        missing_in_supabase: missingInSupabase.length,
        extra_in_supabase: extraInSupabase.length
      },
      clerk_users: clerkUsers,
      supabase_users: supabaseUsers,
      missing_in_supabase: missingInSupabase,
      extra_in_supabase: extraInSupabase,
      message: 'User comparison completed'
    })

  } catch (error) {
    console.error('Error comparing users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage 
    }, { status: 500 })
  }
}