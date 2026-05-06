import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data } = await admin.from('companies').select('subscription_status, is_approved')
    const companies = data ?? []
    return NextResponse.json({
      ok: true,
      data: {
        companies: companies.length,
        pending: companies.filter(c => !c.is_approved).length,
        active: companies.filter(c => c.subscription_status === 'active').length,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
