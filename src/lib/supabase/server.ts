// ─────────────────────────────────────────────
// Supabase server-side client
// Used in API routes and Server Components
// ─────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User, Company, Session } from '@/types'
import { AppError, ERROR_CODES } from '@/lib/utils/errors'

// Standard server client — reads/writes auth cookies
export function createSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // In Server Components, cookies can't be set — that's fine
          }
        },
      },
    }
  )
}

// Admin client — bypasses RLS, for internal API routes only
// NEVER expose this to the client
export function createSupabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// ─── Get current session with full user + company data ───
// Use this in every protected API route
export async function getSession(): Promise<Session> {
  const supabase = createSupabaseServer()

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    throw new AppError(ERROR_CODES.SESSION_EXPIRED, 'Not authenticated', undefined, 401)
  }

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (profileError || !profile) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, 'Profile not found', undefined, 403)
  }

  // Get company if user has one
  let company: Company | null = null
  if (profile.company_id) {
    const { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('id', profile.company_id)
      .single()
    company = companyData
  }

  return {
    user: profile as User,
    company,
  }
}

// ─── Guard: must be authenticated ────────────────────────
export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  return session
}

// ─── Guard: must have active subscription ────────────────
export async function requireActiveSubscription(): Promise<Session> {
  const session = await requireAuth()

  // Superadmin bypasses subscription check
  if (session.user.role === 'superadmin') return session

  if (!session.company) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, 'No company found', undefined, 403)
  }

  if (!session.company.is_approved) {
    throw new AppError(ERROR_CODES.NOT_APPROVED, 'Account pending approval', undefined, 403)
  }

  if (session.company.subscription_status !== 'active') {
    throw new AppError(ERROR_CODES.SUBSCRIPTION_EXPIRED, 'Subscription not active', undefined, 403)
  }

  const expiry = session.company.subscription_expires_at
  if (expiry && new Date(expiry) < new Date()) {
    throw new AppError(ERROR_CODES.SUBSCRIPTION_EXPIRED, 'Subscription expired', undefined, 403)
  }

  return session
}

// ─── Guard: must be superadmin ───────────────────────────
export async function requireSuperAdmin(): Promise<Session> {
  const session = await requireAuth()

  if (session.user.role !== 'superadmin') {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, 'Admin access required', undefined, 403)
  }

  return session
}
