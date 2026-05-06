import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  try {
    const admin = getAdmin()
    const { data, error } = await admin
      .from('product_categories')
      .select(`id,name,display_name,icon,sort_order,product_models(id,brand,model_name,specs,price_per_unit,unit_label,is_active,sort_order)`)
      .order('sort_order')

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    const result = data?.map(cat => ({ ...cat, product_models: (cat.product_models as any[]).filter(p => p.is_active) }))
    return NextResponse.json({ ok: true, data: result })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const admin = getAdmin()
    const { data, error } = await admin.from('product_models').insert(body).select().single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
