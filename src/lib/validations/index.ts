// ─────────────────────────────────────────────
// Validation schemas using Zod
// All input validated here before touching DB
// ─────────────────────────────────────────────

import { z } from 'zod'

// ─── Auth ────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password required'),
})

export const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100),
  email: z
    .string()
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirm_password: z.string(),
  company_name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100),
  city: z
    .string()
    .min(2, 'City required'),
  phone: z
    .string()
    .regex(/^(03\d{9}|92\d{10}|\+92\d{10})$/, 'Invalid Pakistan phone number'),
  plan: z.enum(['trial', 'basic', 'pro']),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

// ─── Products ────────────────────────────────

export const productModelSchema = z.object({
  category_id: z.string().uuid('Invalid category'),
  brand: z
    .string()
    .min(1, 'Brand required')
    .max(100),
  model_name: z
    .string()
    .min(1, 'Model name required')
    .max(200),
  specs: z.record(z.union([z.string(), z.number()])),
  price_per_unit: z
    .number()
    .positive('Price must be positive')
    .max(99999999, 'Price too large'),
  unit_label: z
    .string()
    .min(1, 'Unit label required'),
  is_active: z.boolean().default(true),
})

export const priceUpdateSchema = z.object({
  product_model_id: z.string().uuid(),
  new_price: z
    .number()
    .positive('Price must be positive')
    .max(99999999),
})

export const bulkPriceUpdateSchema = z.object({
  updates: z.array(priceUpdateSchema).min(1, 'No updates provided'),
})

// ─── Calculator ──────────────────────────────

export const calculatorSchema = z.object({
  monthly_bill: z.number().positive().nullable(),
  monthly_units: z.number().positive().nullable(),
  system_type: z.enum(['ongrid', 'hybrid', 'offgrid', 'tubwell']),
  panel_model_id: z.string().uuid(),
  inverter_model_id: z.string().uuid(),
  battery_model_id: z.string().uuid().nullable(),
  battery_units: z.number().int().min(0).default(0),
  backup_hours: z.number().min(1).max(24).default(4),
  margin_percent: z.number().min(5).max(50).default(20),
  include_battery: z.boolean().default(false),
}).refine(
  d => d.monthly_bill !== null || d.monthly_units !== null,
  { message: 'Provide either monthly bill or monthly units', path: ['monthly_bill'] }
)

// ─── Quotations ──────────────────────────────

const lineItemSchema = z.object({
  product_model_id: z.string().uuid(),
  brand: z.string(),
  model_name: z.string(),
  unit_label: z.string(),
  quantity: z.number().positive(),
  unit_price: z.number().positive(),
  total_price: z.number().positive(),
})

export const quotationSchema = z.object({
  client_name: z
    .string()
    .min(2, 'Client name required')
    .max(200),
  client_phone: z
    .string()
    .regex(/^(03\d{9}|92\d{10}|\+92\d{10})$/, 'Invalid phone number'),
  client_address: z
    .string()
    .min(5, 'Address required')
    .max(500),
  system_type: z.enum(['ongrid', 'hybrid', 'offgrid', 'tubwell']),
  advance_percent: z.number().int().min(10).max(100).default(50),
  notes: z.string().max(1000).nullable().default(null),
  valid_days: z.number().int().min(1).max(90).default(15),
  system_kw: z.number().positive(),
  total_price: z.number().positive(),
  line_items: z.array(lineItemSchema).min(1, 'At least one item required'),
})

// ─── Chatbot price text ───────────────────────

export const chatbotSchema = z.object({
  text: z
    .string()
    .min(10, 'Text too short — paste the dealer message')
    .max(5000, 'Text too long'),
})

// ─── Payment ─────────────────────────────────

export const paymentInitSchema = z.object({
  plan: z.enum(['basic', 'pro']),
  months: z.number().int().min(1).max(12),
  method: z.enum(['jazzcash', 'easypaisa']),
})

// ─── Helper: validate and throw ──────────────
// Use this in API routes for clean validation
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const first = result.error.errors[0]
    const { AppError, ERROR_CODES } = require('@/lib/utils/errors')
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      first?.message ?? 'Validation failed',
      first?.path.join('.'),
    )
  }
  return result.data
}
