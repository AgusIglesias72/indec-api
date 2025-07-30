// src/app/api/admin/check-schema/route.ts
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

    const supabase = createServerComponentClient()
    
    // Check if users table exists and get its structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_structure', { table_name: 'users' })
      .single()

    if (tableError) {
      // Fallback: try to query the table directly to see what columns exist
      const { data: sampleData, error: sampleError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (sampleError) {
        return NextResponse.json({
          table_exists: false,
          error: sampleError.message,
          suggestion: 'Run the SQL in data/create-users-table.sql in Supabase SQL Editor'
        })
      }

      // If we got sample data, extract column names
      const columns = sampleData.length > 0 ? Object.keys(sampleData[0]) : []
      
      return NextResponse.json({
        table_exists: true,
        columns_found: columns,
        sample_count: sampleData.length,
        missing_columns: {
          first_name: !columns.includes('first_name'),
          last_name: !columns.includes('last_name'),
          api_key: !columns.includes('api_key'),
          subscription_status: !columns.includes('subscription_status')
        }
      })
    }

    return NextResponse.json({
      table_exists: true,
      structure: tableInfo
    })

  } catch (error) {
    console.error('Error checking schema:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}