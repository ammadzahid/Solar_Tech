import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { z } from 'zod'

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ ok: false, error: 'Invalid email or password' }, { status: 400 })
    }

    const { email, password } = result.data
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { ok: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const admin = getAdmin()

    const { data: profile } = await admin
      .from('profiles')
      .select('*, companies(*)')
      .eq('id', authData.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ ok: false, error: 'Profile not found' }, { status: 403 })
    }

    const company = profile.companies

    if (profile.role !== 'superadmin' && company) {
      if (!company.is_approved) {
        return NextResponse.json(
          { ok: false, error: 'Account pending approval. We will notify you once approved.' },
          { status: 403 }
        )
      }
    }

    const sessionToken = crypto.randomBytes(32).toString('hex')

    if (company) {
      await admin
        .from('companies')
        .update({ active_session_token: sessionToken })
        .eq('id', company.id)
    }

    return NextResponse.json({
      ok: true,
      data: {
        session_token: sessionToken,
        user: {
          id:         profile.id,
          email:      profile.email,
          full_name:  profile.full_name,
          role:       profile.role,
          company_id: profile.company_id,
        },
        company: company ? {
          id:                  company.id,
          name:                company.name,
          subscription_status: company.subscription_status,
          is_approved:         company.is_approved,
        } : null,
      }
    })

  } catch (error: any) {
    console.error('[Login Error]', error)
    return NextResponse.json(
      { ok: false, error: error.message ?? 'Something went wrong' },
      { status: 500 }
    )
  }
}
