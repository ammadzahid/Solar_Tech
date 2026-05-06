import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 40) + '...'
      : 'MISSING',
    anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? 'SET (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')'
      : 'MISSING',
    service_role: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? 'SET (length: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')'
      : 'MISSING',
  }

  let supabase_test = 'not tested'
  try {
    const { createClient } = require('@supabase/supabase-js')
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    )
    const { error } = await admin.from('profiles').select('count').limit(1)
    supabase_test = error ? 'ERROR: ' + error.message : 'CONNECTED OK'
  } catch (e: any) {
    supabase_test = 'EXCEPTION: ' + e.message
  }

  return NextResponse.json({ checks, supabase_test })
}
