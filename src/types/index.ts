// ─────────────────────────────────────────────
// SolarPro — Central type definitions
// Every entity in the system is typed here.
// ─────────────────────────────────────────────

// ─── Auth & Users ───────────────────────────

export type UserRole = 'superadmin' | 'company_admin' | 'user'

export type SubscriptionPlan = 'trial' | 'basic' | 'pro'

export type SubscriptionStatus =
  | 'pending_payment'
  | 'pending_approval'
  | 'active'
  | 'expired'
  | 'suspended'

export interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  company_id: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  owner_id: string
  city: string | null
  phone: string | null
  address: string | null
  subscription_status: SubscriptionStatus
  subscription_plan: SubscriptionPlan
  subscription_expires_at: string | null
  is_approved: boolean
  approved_by: string | null
  approved_at: string | null
  active_session_token: string | null  // single device lock
  created_at: string
  updated_at: string
}

export interface Session {
  user: User
  company: Company | null
}

// ─── Products ────────────────────────────────

export type ProductCategory =
  | 'solar_panel'
  | 'inverter'
  | 'battery'
  | 'cable'
  | 'structure'
  | 'accessory'

export interface ProductModel {
  id: string
  category_id: string
  brand: string
  model_name: string
  specs: Record<string, string | number>  // flexible specs per category
  price_per_unit: number
  unit_label: string         // "per watt", "per kW", "per meter", etc.
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ProductCategory_DB {
  id: string
  name: ProductCategory
  display_name: string
  icon: string
  description: string | null
  sort_order: number
}

// ─── Calculator ──────────────────────────────

export type SystemType = 'ongrid' | 'hybrid' | 'offgrid' | 'tubwell'

export interface CalculatorInput {
  monthly_bill: number | null
  monthly_units: number | null
  system_type: SystemType
  panel_model_id: string
  inverter_model_id: string
  battery_model_id: string | null
  battery_units: number
  backup_hours: number
  margin_percent: number
  include_battery: boolean
}

export interface CalculatorResult {
  system_kw: number
  panel_count: number
  panel_cost: number
  inverter_cost: number
  battery_cost: number
  cable_cost: number
  structure_cost: number
  labour_cost: number
  net_metering_fee: number
  total_buying_cost: number
  client_quote: number
  margin_amount: number
  margin_percent: number
  payback_years: number
  monthly_saving: number
}

// ─── Quotations ──────────────────────────────

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export interface QuotationLineItem {
  product_model_id: string
  brand: string
  model_name: string
  unit_label: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Quotation {
  id: string
  company_id: string
  created_by: string
  status: QuotationStatus

  // Client info
  client_name: string
  client_phone: string
  client_address: string

  // System
  system_type: SystemType
  system_kw: number
  line_items: QuotationLineItem[]

  // Pricing
  subtotal: number
  total_price: number
  advance_percent: number
  advance_amount: number
  remaining_amount: number

  // Meta
  valid_days: number
  notes: string | null
  pdf_url: string | null

  created_at: string
  updated_at: string
  expires_at: string
}

// ─── Payments ────────────────────────────────

export type PaymentMethod = 'jazzcash' | 'easypaisa' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  company_id: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transaction_id: string | null
  gateway_response: Record<string, unknown> | null
  plan: SubscriptionPlan
  months: number
  created_at: string
  updated_at: string
}

// ─── AI Chatbot ──────────────────────────────

export interface PriceUpdate {
  product_model_id: string
  brand: string
  model_name: string
  old_price: number
  new_price: number
  confidence: 'high' | 'medium' | 'low'
}

export interface ChatbotParseResult {
  success: boolean
  raw_text: string
  price_updates: PriceUpdate[]
  unrecognized: string[]
  error: string | null
}

// ─── API Response wrapper ─────────────────────
// Every API route returns this shape — no surprises

export type ApiSuccess<T> = {
  ok: true
  data: T
  message?: string
}

export type ApiError = {
  ok: false
  error: string
  code: string
  field?: string    // for validation errors
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Form types ──────────────────────────────

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  full_name: string
  email: string
  password: string
  confirm_password: string
  company_name: string
  city: string
  phone: string
  plan: SubscriptionPlan
}

export interface ProductModelForm {
  category_id: string
  brand: string
  model_name: string
  specs: Record<string, string | number>
  price_per_unit: number
  unit_label: string
  is_active: boolean
}

export interface QuotationForm {
  client_name: string
  client_phone: string
  client_address: string
  system_type: SystemType
  advance_percent: number
  notes: string
  valid_days: number
  // These come from calculator
  system_kw: number
  total_price: number
  line_items: QuotationLineItem[]
}
