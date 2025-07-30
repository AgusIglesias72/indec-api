// src/app/api/test/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const adminKey = headersList.get('x-admin-key')
    
    if (!adminKey || adminKey !== process.env.ADMIN_SYNC_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Simulate a Clerk webhook payload
    const testPayload = {
      data: {
        id: 'test_user_' + Date.now(),
        email_addresses: [
          {
            email_address: 'test@example.com'
          }
        ],
        first_name: 'Test',
        last_name: 'User',
        image_url: 'https://example.com/avatar.jpg'
      },
      type: 'user.created'
    }

    // Send test webhook to our own endpoint
    const webhookUrl = new URL('/api/webhook/clerk', request.url)
    
    const response = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Skip verification for testing
        'x-test-webhook': 'true'
      },
      body: JSON.stringify(testPayload)
    })

    const result = await response.text()

    return NextResponse.json({
      status: response.status,
      result: result,
      payload: testPayload
    })

  } catch (error) {
    console.error('Error testing webhook:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}