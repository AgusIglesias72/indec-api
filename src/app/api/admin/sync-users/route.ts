// src/app/api/admin/sync-users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClerkClient } from '@clerk/nextjs/server'
import { createServerComponentClient } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Simple admin authentication check
    const headersList = await headers()
    const adminKey = headersList.get('x-admin-key')
    
    if (!adminKey || adminKey !== process.env.ADMIN_SYNC_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.info('Starting user synchronization...')
    
    const supabase = createServerComponentClient()
    
    // Get all users from Clerk
    console.info('Fetching users from Clerk...')
    const clerk = createClerkClient({ 
      secretKey: process.env.CLERK_SECRET_KEY 
    })
    const clerkUsersResponse = await clerk.users.getUserList({
      limit: 500, // Adjust as needed
    })
    const clerkUsers = clerkUsersResponse

    console.info(`Found ${clerkUsers.totalCount} users in Clerk`)

    // Get existing users from Supabase
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('clerk_user_id')

    if (fetchError) {
      console.error('Error fetching existing users:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const existingClerkIds = new Set(existingUsers?.map(u => u.clerk_user_id) || [])
    
    // Find users that exist in Clerk but not in Supabase
    const missingUsers = clerkUsers.data.filter(user => !existingClerkIds.has(user.id))
    
    console.info(`Found ${missingUsers.length} users missing in Supabase`)

    if (missingUsers.length === 0) {
      return NextResponse.json({ 
        message: 'All users are already synchronized',
        clerkCount: clerkUsers.totalCount,
        supabaseCount: existingUsers?.length || 0
      })
    }

    // Create missing users in Supabase
    const usersToInsert = []
    
    for (const user of missingUsers) {
      // Generate API key for each user
      const { data: apiKeyData } = await supabase.rpc('generate_api_key')
      
      usersToInsert.push({
        clerk_user_id: user.id,
        email: user.emailAddresses[0]?.emailAddress || null,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
        image_url: user.imageUrl || null,
        api_key: apiKeyData,
        plan_type: 'free',
        daily_requests_count: 0,
        created_at: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }

    // Bulk insert users
    const { error: insertError } = await supabase
      .from('users')
      .insert(usersToInsert)

    if (insertError) {
      console.error('Error inserting users:', insertError)
      return NextResponse.json({ error: 'Failed to create users' }, { status: 500 })
    }

    console.info(`Successfully synchronized ${usersToInsert.length} users`)

    return NextResponse.json({
      message: 'Users synchronized successfully',
      synchronized: usersToInsert.length,
      clerkTotal: clerkUsers.totalCount,
      supabaseTotal: (existingUsers?.length || 0) + usersToInsert.length
    })

  } catch (error) {
    console.error('Error in user synchronization:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage 
    }, { status: 500 })
  }
}

// GET endpoint to check sync status without making changes
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const adminKey = headersList.get('x-admin-key')
    
    if (!adminKey || adminKey !== process.env.ADMIN_SYNC_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerComponentClient()
    
    // Get counts from both systems
    const clerk = createClerkClient({ 
      secretKey: process.env.CLERK_SECRET_KEY 
    })
    const clerkUsersResponse = await clerk.users.getUserList({ limit: 1 })
    const clerkUsers = clerkUsersResponse
    const { count: supabaseCount, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      clerk_users: clerkUsers.totalCount,
      supabase_users: supabaseCount || 0,
      difference: clerkUsers.totalCount - (supabaseCount || 0)
    })

  } catch (error) {
    console.error('Error checking sync status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}