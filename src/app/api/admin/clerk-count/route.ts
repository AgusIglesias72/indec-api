// src/app/api/admin/clerk-count/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClerkClient } from '@clerk/nextjs/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const adminKey = headersList.get('x-admin-key')
    
    if (!adminKey || adminKey !== process.env.ADMIN_SYNC_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.info('Getting Clerk user count...')
    
    // Create Clerk client with secret key
    const clerk = createClerkClient({ 
      secretKey: process.env.CLERK_SECRET_KEY 
    })
    
    // Get user count from Clerk
    const clerkUsersResponse = await clerk.users.getUserList({ 
      limit: 10  // Small limit just to get total count
    })

    console.info(`Clerk API response:`, {
      totalCount: clerkUsersResponse.totalCount,
      dataLength: clerkUsersResponse.data.length
    })

    // Get sample users to see their structure
    const sampleUsers = clerkUsersResponse.data.slice(0, 3).map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt
    }))

    return NextResponse.json({
      success: true,
      clerk_total_count: clerkUsersResponse.totalCount,
      sample_users: sampleUsers,
      message: 'Got Clerk user data successfully'
    })

  } catch (error) {
    console.error('Error getting Clerk users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Error accessing Clerk API',
      details: errorMessage 
    }, { status: 500 })
  }
}