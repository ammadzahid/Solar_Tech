// ─────────────────────────────────────────────
// GET   /api/admin/approvals  — pending companies
// PATCH /api/admin/approvals  — approve/reject
// ─────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { createSupabaseAdmin, requireSuperAdmin } from '@/lib/supabase/server'
import { apiHandler } from '@/lib/utils/api'
import { AppError, ERROR_CODES } from '@/lib/utils/errors'
import { z } from 'zod'
import { validate } from '@/lib/validations'

export async function GET() {
  return apiHandler(async () => {
    await requireSuperAdmin()

    const admin = createSupabaseAdmin()

    const { data, error } = await admin
      .from('companies')
      .select(`
        *,
        profiles!profiles_company_id_fkey (
          id, email, full_name, phone, created_at
        ),
        payments (
          id, amount, method, status, plan, created_at
        )
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  })
}

const approvalSchema = z.object({
  company_id: z.string().uuid(),
  action:     z.enum(['approve', 'reject', 'suspend']),
  reason:     z.string().optional(),
})

export async function PATCH(request: NextRequest) {
  return apiHandler(async () => {
    const session = await requireSuperAdmin()

    const body  = await request.json()
    const input = validate(approvalSchema, body)

    const admin = createSupabaseAdmin()

    // Verify company exists
    const { data: company } = await admin
      .from('companies')
      .select('id, subscription_plan')
      .eq('id', input.company_id)
      .single()

    if (!company) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Company not found')
    }

    let update: Record<string, unknown> = {}

    if (input.action === 'approve') {
      // Calculate subscription expiry (1 month default)
      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + 1)

      update = {
        is_approved:             true,
        approved_by:             session.user.id,
        approved_at:             new Date().toISOString(),
        subscription_status:     'active',
        subscription_expires_at: expiry.toISOString(),
      }
    } else if (input.action === 'reject') {
      update = {
        subscription_status: 'suspended',
      }
    } else if (input.action === 'suspend') {
      update = {
        is_approved:         false,
        subscription_status: 'suspended',
      }
    }

    const { data, error } = await admin
      .from('companies')
      .update(update)
      .eq('id', input.company_id)
      .select()
      .single()

    if (error) throw error

    return {
      company_id: input.company_id,
      action:     input.action,
      updated:    true,
    }
  })
}
