// ─────────────────────────────────────────────
// Centralized error handling
// All errors go through here — easy to debug
// ─────────────────────────────────────────────

import type { ApiError } from '@/types'

// Error codes — grep-able, never guess what went wrong
export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS:    'AUTH_001',
  EMAIL_NOT_VERIFIED:     'AUTH_002',
  SESSION_EXPIRED:        'AUTH_003',
  DEVICE_KICKED:          'AUTH_004',  // another device logged in
  NOT_APPROVED:           'AUTH_005',
  SUBSCRIPTION_EXPIRED:   'AUTH_006',
  UNAUTHORIZED:           'AUTH_007',

  // Validation
  VALIDATION_ERROR:       'VAL_001',
  MISSING_FIELD:          'VAL_002',

  // Resources
  NOT_FOUND:              'RES_001',
  ALREADY_EXISTS:         'RES_002',

  // Payments
  PAYMENT_FAILED:         'PAY_001',
  PAYMENT_PENDING:        'PAY_002',

  // AI
  AI_PARSE_FAILED:        'AI_001',
  AI_NO_PRICES_FOUND:     'AI_002',

  // Server
  INTERNAL_ERROR:         'SRV_001',
  DATABASE_ERROR:         'SRV_002',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// Custom error class — carries code + optional field
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly field?: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Convert any error into a clean ApiError response
export function toApiError(error: unknown): ApiError {
  if (error instanceof AppError) {
    return {
      ok: false,
      error: error.message,
      code: error.code,
      ...(error.field && { field: error.field }),
    }
  }

  // Supabase errors
  if (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    'code' in error
  ) {
    const e = error as { message: string; code: string }
    // Map common Supabase error codes
    if (e.code === '23505') {
      return { ok: false, error: 'Already exists', code: ERROR_CODES.ALREADY_EXISTS }
    }
    if (e.code === 'PGRST116') {
      return { ok: false, error: 'Not found', code: ERROR_CODES.NOT_FOUND }
    }
    return { ok: false, error: e.message, code: ERROR_CODES.DATABASE_ERROR }
  }

  // Unknown errors — log but don't expose internals
  console.error('[AppError] Unexpected error:', error)
  return {
    ok: false,
    error: 'Something went wrong. Please try again.',
    code: ERROR_CODES.INTERNAL_ERROR,
  }
}

// HTTP status from error code
export function statusFromCode(code: ErrorCode): number {
  const map: Partial<Record<ErrorCode, number>> = {
    [ERROR_CODES.INVALID_CREDENTIALS]: 401,
    [ERROR_CODES.SESSION_EXPIRED]:     401,
    [ERROR_CODES.DEVICE_KICKED]:       401,
    [ERROR_CODES.UNAUTHORIZED]:        403,
    [ERROR_CODES.NOT_APPROVED]:        403,
    [ERROR_CODES.SUBSCRIPTION_EXPIRED]:403,
    [ERROR_CODES.NOT_FOUND]:           404,
    [ERROR_CODES.ALREADY_EXISTS]:      409,
    [ERROR_CODES.INTERNAL_ERROR]:      500,
    [ERROR_CODES.DATABASE_ERROR]:      500,
  }
  return map[code] ?? 400
}
