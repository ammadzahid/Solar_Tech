// ─────────────────────────────────────────────
// Calculator logic
// Pure functions — no side effects, easy to test
// ─────────────────────────────────────────────

import type { CalculatorInput, CalculatorResult, ProductModel } from '@/types'

const PEAK_SUN_HOURS = 4      // Pakistan average
const PANEL_WATTAGE  = 580    // Standard panel wattage
const CABLE_METERS_PER_KW = 25

interface CalcProducts {
  panel:    ProductModel
  inverter: ProductModel
  battery?: ProductModel
  cable:    ProductModel
  structure: ProductModel
  labour:   ProductModel
  netMetering?: ProductModel
}

export function calculateSystem(
  input: CalculatorInput,
  products: CalcProducts
): CalculatorResult {
  // ─── Step 1: Derive units from bill or vice versa
  const UNIT_RATE = 38  // Rs per unit (adjust as needed)
  const monthlyUnits = input.monthly_units
    ?? Math.round((input.monthly_bill ?? 0) / UNIT_RATE)
  const monthlyBill = input.monthly_bill
    ?? monthlyUnits * UNIT_RATE

  // ─── Step 2: System size
  const dailyUnits = monthlyUnits / 30
  const systemKw   = Math.ceil(dailyUnits / PEAK_SUN_HOURS)
  const panelCount = Math.ceil((systemKw * 1000) / PANEL_WATTAGE)

  // ─── Step 3: Component costs
  const panelCost = panelCount * PANEL_WATTAGE * products.panel.price_per_unit

  // Hybrid inverter costs ~40% more (includes hybrid charge controller)
  const inverterMultiplier = input.include_battery ? 1.4 : 1.0
  const inverterCost = systemKw * products.inverter.price_per_unit * inverterMultiplier

  // Cable cost
  const cableMeters = systemKw * CABLE_METERS_PER_KW
  const cableCost   = cableMeters * products.cable.price_per_unit

  // Structure + labour
  const structureCost = systemKw * products.structure.price_per_unit
  const labourCost    = systemKw * products.labour.price_per_unit

  // Net metering — only for on-grid and hybrid, not off-grid or tubwell
  const netMeteringFee =
    (input.system_type === 'ongrid' || input.system_type === 'hybrid') && products.netMetering
      ? products.netMetering.price_per_unit
      : 0

  // ─── Step 4: Battery
  let batteryCost = 0
  let batteryUnits = 0

  if (input.include_battery && products.battery && input.battery_model_id) {
    const BATTERY_KWH = 5.12   // per unit (Pylontech US5000 standard)
    const LOAD_KW     = 3      // assumed average load
    const energyNeeded = LOAD_KW * input.backup_hours
    batteryUnits = Math.ceil(energyNeeded / BATTERY_KWH)

    // If user specified units, use that instead
    if (input.battery_units > 0) {
      batteryUnits = input.battery_units
    }

    batteryCost = batteryUnits * products.battery.price_per_unit
  }

  // ─── Step 5: Total
  const totalBuyingCost = panelCost + inverterCost + batteryCost
    + cableCost + structureCost + labourCost + netMeteringFee

  // ─── Step 6: Quote with margin
  const marginDecimal = input.margin_percent / 100
  // Round to nearest 1,000 — looks professional
  const clientQuote = Math.round(totalBuyingCost * (1 + marginDecimal) / 1000) * 1000
  const marginAmount = clientQuote - totalBuyingCost

  // ─── Step 7: Payback period
  const paybackYears = parseFloat((clientQuote / (monthlyBill * 12)).toFixed(1))

  return {
    system_kw:        systemKw,
    panel_count:      panelCount,
    panel_cost:       Math.round(panelCost),
    inverter_cost:    Math.round(inverterCost),
    battery_cost:     Math.round(batteryCost),
    cable_cost:       Math.round(cableCost),
    structure_cost:   Math.round(structureCost),
    labour_cost:      Math.round(labourCost),
    net_metering_fee: Math.round(netMeteringFee),
    total_buying_cost: Math.round(totalBuyingCost),
    client_quote:     clientQuote,
    margin_amount:    Math.round(marginAmount),
    margin_percent:   input.margin_percent,
    payback_years:    paybackYears,
    monthly_saving:   monthlyBill,
  }
}

// Format Rs amount for display — Rs 1,23,456
export function formatRs(amount: number): string {
  return 'Rs ' + amount.toLocaleString('en-PK')
}

// Format kW
export function formatKw(kw: number): string {
  return kw >= 1000 ? `${(kw / 1000).toFixed(1)} MW` : `${kw} kW`
}
