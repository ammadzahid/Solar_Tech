import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const schema = z.object({
  full_name:        z.string().min(2),
  email:            z.string().email(),
  password:         z.string().min(8),
  confirm_password: z.string(),
  company_name:     z.string().min(2),
  city:             z.string().min(2),
  phone:            z.string().min(10),
  plan:             z.enum(['trial', 'basic', 'pro']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 })

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    const input = parsed.data
    if (input.password !== input.confirm_password) {
      return NextResponse.json({ ok: false, error: 'Passwords do not match' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      return NextResponse.json({ ok: false, error: 'Missing env: url=' + !!url + ' key=' + !!key }, { status: 500 })
    }

    const admin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Check existing email
    const { data: existing } = await admin.from('profiles').select('id').eq('email', input.email).maybeSingle()
    if (existing) return NextResponse.json({ ok: false, error: 'Email already registered' }, { status: 409 })

    // Create auth user
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.full_name },
    })

    if (authError || !authData.user) {
      return NextResponse.json({ ok: false, error: 'Auth error: ' + (authError?.message ?? 'unknown') }, { status: 500 })
    }

    const userId = authData.user.id

    // Create company — bypass RLS using service role
    const { data: company, error: ce } = await admin
      .from('companies')
      .insert({
        name:                input.company_name,
        city:                input.city,
        phone:               input.phone,
        subscription_status: 'pending_payment',
        subscription_plan:   input.plan,
        is_approved:         false,
      })
      .select('id, name')
      .single()

    if (ce || !company) {
      // Rollback auth user
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({
        ok: false,
        error: 'Company error: ' + (ce?.message ?? 'unknown') + ' | code: ' + (ce?.code ?? '') + ' | details: ' + (ce?.details ?? '')
      }, { status: 500 })
    }

    // Link profile to company
    // Use upsert (not update) so this works whether or not the
    // handle_new_user() DB trigger has already inserted the row yet —
    // avoids the race condition that existed with the fixed setTimeout wait.
    const { error: pe } = await admin
      .from('profiles')
      .upsert({
        id:         userId,
        email:      input.email,
        full_name:  input.full_name,
        phone:      input.phone,
        company_id: company.id,
        role:       'company_admin',
      }, { onConflict: 'id' })

    if (pe) {
      await admin.auth.admin.deleteUser(userId)
      await admin.from('companies').delete().eq('id', company.id)
      return NextResponse.json({ ok: false, error: 'Profile link error: ' + pe.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: { message: 'Account created!', company_id: company.id } })

  } catch (err: any) {
    console.error('[Register]', err)
    return NextResponse.json({ ok: false, error: 'Unexpected: ' + (err?.message ?? String(err)) }, { status: 500 })
  }
}