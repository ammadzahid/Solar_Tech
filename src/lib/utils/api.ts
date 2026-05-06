// ─────────────────────────────────────────────
// API route wrapper
// Every route uses this — no scattered try/catch
// ─────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { AppError, toApiError, statusFromCode } from '@/lib/utils/errors'
import type { ApiResponse } from '@/types'

type RouteHandler<T> = () => Promise<T>

// Wrap every API route handler with this
// Catches all errors, returns consistent ApiResponse shape
export async function apiHandler<T>(
  handler: RouteHandler<T>
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    const data = await handler()
    return NextResponse.json({ ok: true, data })
  } catch (error) {
    const apiError = toApiError(error)
    const status = error instanceof AppError
      ? error.statusCode
      : statusFromCode(apiError.code as any)

    return NextResponse.json(apiError, { status })
  }
}

// Quick success response
export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { ok: true, data, ...(message && { message }) }
}
