import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getCurrentUser() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll(s) { s.forEach(({name,value,options}) => cookieStore.set(name,value,options)) } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })

    const admin = getAdmin()
    const { data: profile } = await admin.from('profiles').select('company_id').eq('id', user.id).single()
    if (!profile?.company_id) return NextResponse.json({ ok: true, data: { quotations: [], total: 0 } })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = 20
    const offset = (page - 1) * limit

    const { data, error, count } = await admin
      .from('quotations')
      .select('*', { count: 'exact' })
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, data: { quotations: data, total: count ?? 0, page, pages: Math.ceil((count??0)/limit) } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })

    const admin = getAdmin()
    const { data: profile } = await admin.from('profiles').select('company_id').eq('id', user.id).single()
    if (!profile?.company_id) return NextResponse.json({ ok: false, error: 'No company' }, { status: 400 })

    const body = await request.json()
    const advance_amount = Math.round(body.total_price * body.advance_percent / 100)
    const remaining_amount = body.total_price - advance_amount

    const { data, error } = await admin.from('quotations').insert({
      company_id:      profile.company_id,
      created_by:      user.id,
      client_name:     body.client_name,
      client_phone:    body.client_phone,
      client_address:  body.client_address,
      system_type:     body.system_type,
      system_kw:       body.system_kw,
      line_items:      body.line_items,
      subtotal:        body.total_price,
      total_price:     body.total_price,
      advance_percent: body.advance_percent,
      advance_amount,
      remaining_amount,
      valid_days:      body.valid_days ?? 15,
      notes:           body.notes ?? null,
    }).select().single()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
