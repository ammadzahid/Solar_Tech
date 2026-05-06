import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken:false, persistSession:false } })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const admin = getAdmin()
    const { data: current } = await admin.from('product_models').select('price_per_unit').eq('id', params.id).single()
    if (body.price_per_unit && current && body.price_per_unit !== current.price_per_unit) {
      await admin.from('price_history').insert({ product_model_id: params.id, old_price: current.price_per_unit, new_price: body.price_per_unit, source: 'admin' })
    }
    const { data, error } = await admin.from('product_models').update(body).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = getAdmin()
    const { error } = await admin.from('product_models').update({ is_active: false }).eq('id', params.id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
