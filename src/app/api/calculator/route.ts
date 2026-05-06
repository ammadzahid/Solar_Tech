import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PEAK_SUN = 4
const PANEL_W_DEFAULT = 580
const CABLE_M_PER_KW = 25
const UNIT_RATE = 38

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
    const {
      monthly_bill, monthly_units, system_type,
      panel_model_id, inverter_model_id,
      battery_model_id, include_battery,
      backup_hours, battery_units, margin_percent
    } = body

    if (!monthly_bill && !monthly_units) {
      return NextResponse.json({ ok: false, error: 'Bill ya units required' }, { status: 400 })
    }

    const admin = getAdmin()

    // Fetch selected products
    const ids = [panel_model_id, inverter_model_id, battery_model_id].filter(Boolean)
    const { data: products } = await admin
      .from('product_models')
      .select('id, brand, model_name, price_per_unit, unit_label, pricing_type, wattage, capacity_kw, capacity_kwh')
      .in('id', ids)

    // Fetch misc (cable, structure, labour, net metering)
    const { data: miscItems } = await admin
      .from('product_models')
      .select('id, brand, model_name, price_per_unit, unit_label, pricing_type')
      .eq('is_active', true)
      .in('brand', ['Kuka', 'Local', 'Labour', 'FESCO/LESCO'])
      .order('sort_order')

    const getP = (id: string) => products?.find(p => p.id === id)
    const getMisc = (brand: string, nameContains?: string) =>
      miscItems?.find(p => p.brand === brand && (!nameContains || p.model_name.includes(nameContains)))

    const panel    = getP(panel_model_id)
    const inverter = getP(inverter_model_id)
    const battery  = battery_model_id ? getP(battery_model_id) : null
    const cable    = getMisc('Kuka')
    const structure = getMisc('Local', 'Structure')
    const labour   = getMisc('Labour')
    const netM     = getMisc('FESCO/LESCO')

    if (!panel || !inverter) {
      return NextResponse.json({ ok: false, error: 'Panel ya inverter not found' }, { status: 400 })
    }

    // ─── Calculate units and system size
    const monthlyUnits = monthly_units ?? Math.round(monthly_bill / UNIT_RATE)
    const monthlyBill  = monthly_bill ?? monthlyUnits * UNIT_RATE
    const kw = Math.ceil(monthlyUnits / 30 / PEAK_SUN)

    // ─── Panel cost — always per watt
    const panelWattage = panel.wattage ?? PANEL_W_DEFAULT
    const panelCount   = Math.ceil((kw * 1000) / panelWattage)
    const panelCost    = panelCount * panelWattage * (panel.price_per_unit ?? 30)

    // ─── Inverter cost — depends on pricing_type
    let inverterCost = 0
    const invPricingType = inverter.pricing_type ?? 'flat'

    if (invPricingType === 'flat') {
      // Flat per unit — find how many units needed for this kW
      const invKw = inverter.capacity_kw ?? 5
      const invUnitsNeeded = Math.ceil(kw / invKw)
      const iMult = include_battery ? 1.0 : 1.0  // hybrid inverter already priced separately
      inverterCost = invUnitsNeeded * (inverter.price_per_unit ?? 0) * iMult
    } else if (invPricingType === 'per_kw') {
      // Old style — price per kW
      const iMult = include_battery ? 1.4 : 1.0
      inverterCost = kw * (inverter.price_per_unit ?? 18000) * iMult
    }

    // ─── Battery cost — flat per unit
    let batteryCost = 0
    let battUnitsCount = 0
    if (include_battery && battery) {
      const bKwh = battery.capacity_kwh ?? 5.12
      const hrs = backup_hours ?? 4
      const avgLoad = 3  // kW
      const energyNeeded = avgLoad * hrs
      battUnitsCount = battery_units > 0 ? battery_units : Math.ceil(energyNeeded / bKwh)
      batteryCost = battUnitsCount * (battery.price_per_unit ?? 180000)
    }

    // ─── Misc costs
    const cablePrice   = cable?.price_per_unit ?? 85
    const cableCost    = kw * CABLE_M_PER_KW * cablePrice

    const structCost   = kw * (structure?.price_per_unit ?? 5000)
    const labourCost   = kw * (labour?.price_per_unit ?? 4000)
    const nmFee = (system_type === 'ongrid' || system_type === 'hybrid')
      ? (netM?.price_per_unit ?? 15000) : 0

    const totalCost = panelCost + inverterCost + batteryCost + cableCost + structCost + labourCost + nmFee
    const mp = (margin_percent ?? 20) / 100
    const clientQuote = Math.round(totalCost * (1 + mp) / 1000) * 1000
    const marginAmount = clientQuote - totalCost
    const paybackYears = parseFloat((clientQuote / (monthlyBill * 12)).toFixed(1))

    return NextResponse.json({
      ok: true,
      data: {
        system_kw:        kw,
        panel_count:      panelCount,
        panel_wattage:    panelWattage,
        system_type,
        panel_brand:      panel.brand,
        panel_model:      panel.model_name,
        inverter_brand:   inverter.brand,
        inverter_model:   inverter.model_name,
        battery_brand:    battery?.brand ?? null,
        battery_model:    battery?.model_name ?? null,
        battery_units:    battUnitsCount,
        panel_cost:       Math.round(panelCost),
        inverter_cost:    Math.round(inverterCost),
        battery_cost:     Math.round(batteryCost),
        cable_cost:       Math.round(cableCost),
        structure_cost:   Math.round(structCost),
        labour_cost:      Math.round(labourCost),
        net_metering_fee: Math.round(nmFee),
        total_buying_cost: Math.round(totalCost),
        client_quote:     clientQuote,
        margin_amount:    Math.round(marginAmount),
        margin_percent:   margin_percent ?? 20,
        payback_years:    paybackYears,
        monthly_saving:   monthlyBill,
        panel_model_id, inverter_model_id, battery_model_id,
        include_battery, backup_hours,
      }
    })

  } catch (e: any) {
    console.error('[Calculator]', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
