import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const SYSTEM_TYPE_LABEL: Record<string, string> = {
  ongrid: 'On-Grid (Net Metering)',
  hybrid: 'Hybrid (Battery Backup)',
  offgrid: 'Off-Grid',
  tubwell: 'Tube Well / Agricultural',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const company_name = searchParams.get('company') ?? 'Solar Company'
    const company_phone = searchParams.get('phone') ?? ''

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Quotation ID required' }, { status: 400 })
    }

    const admin = getAdmin()
    const { data: q, error } = await admin
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !q) {
      return NextResponse.json({ ok: false, error: 'Quotation not found' }, { status: 404 })
    }

    const items = (q.line_items ?? []) as any[]
    const date = new Date(q.created_at).toLocaleDateString('en-PK')
    const expiry = new Date(q.expires_at ?? q.created_at).toLocaleDateString('en-PK')
    const sysLabel = SYSTEM_TYPE_LABEL[q.system_type] ?? q.system_type

    // Generate HTML for PDF printing
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Quotation — ${q.client_name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1f2937; background: white; }
  .page { max-width: 800px; margin: 0 auto; padding: 0; }

  /* Header */
  .header { background: linear-gradient(135deg, #1a1a2e, #2d1b4e); color: white; padding: 32px 40px; }
  .company-name { font-size: 26px; font-weight: 900; color: #f5a623; letter-spacing: -0.5px; }
  .company-sub { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .header-right { text-align: right; }
  .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
  .quote-title { font-size: 13px; color: #9ca3af; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }
  .quote-num { font-size: 11px; color: #6b7280; margin-top: 2px; }

  /* Body */
  .body { padding: 32px 40px; }

  /* Client info */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
  .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; }
  .info-label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .info-value { font-size: 13px; color: #1f2937; font-weight: 600; }
  .info-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }

  /* System badge */
  .system-badge { display: inline-block; background: #f5a62318; border: 1px solid #f5a62340; color: #92400e; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px; }

  /* Table */
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead { background: #1a1a2e; }
  thead th { color: #9ca3af; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 14px; text-align: left; }
  tbody tr { border-bottom: 1px solid #f3f4f6; }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 11px 14px; font-size: 12px; color: #374151; }
  tbody tr:nth-child(even) { background: #f9fafb; }
  .text-right { text-align: right; }
  .text-bold { font-weight: 700; }

  /* Total row */
  .total-row { background: #fef3c7 !important; }
  .total-row td { font-weight: 800; font-size: 14px; color: #92400e; padding: 14px; }

  /* Payment */
  .payment-section { background: #f9fafb; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
  .payment-title { font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
  .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .pay-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
  .pay-label { font-size: 10px; color: #9ca3af; margin-bottom: 4px; }
  .pay-amount { font-size: 16px; font-weight: 800; color: #1f2937; }
  .pay-sub { font-size: 10px; color: #6b7280; margin-top: 2px; }

  /* Footer */
  .footer-notes { border-top: 2px solid #f3f4f6; padding-top: 18px; margin-top: 8px; }
  .notes-title { font-size: 11px; font-weight: 700; color: #374151; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .note-item { font-size: 11px; color: #6b7280; margin-bottom: 4px; display: flex; align-items: flex-start; gap: 6px; }
  .stamp { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-flex">
      <div>
        <div class="company-name">${company_name}</div>
        ${company_phone ? `<div class="company-sub">${company_phone}</div>` : ''}
      </div>
      <div class="header-right">
        <div class="quote-title">Solar Installation Quotation</div>
        <div class="quote-num">Date: ${date}</div>
        <div class="quote-num">Valid until: ${expiry}</div>
      </div>
    </div>
  </div>

  <div class="body">

    <!-- Client + System info -->
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Client</div>
        <div class="info-value">${q.client_name}</div>
        <div class="info-sub">${q.client_phone}</div>
        <div class="info-sub">${q.client_address}</div>
      </div>
      <div class="info-box">
        <div class="info-label">System Details</div>
        <div class="info-value">${q.system_kw} kW Solar System</div>
        <div class="info-sub">${sysLabel}</div>
        <div class="info-sub">Quotation Date: ${date}</div>
      </div>
    </div>

    <div class="system-badge">⚡ ${sysLabel} — ${q.system_kw} kW</div>

    <!-- Items table -->
    <table>
      <thead>
        <tr>
          <th>Item / Description</th>
          <th>Brand / Detail</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
        <tr>
          <td class="text-bold">${item.model_name ?? 'Item'}</td>
          <td>${item.brand ?? '—'}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">Rs ${Math.round(item.unit_price ?? 0).toLocaleString()}</td>
          <td class="text-right text-bold">Rs ${Math.round(item.total_price ?? 0).toLocaleString()}</td>
        </tr>`).join('')}
        <tr class="total-row">
          <td colspan="3"></td>
          <td class="text-bold">TOTAL PRICE</td>
          <td class="text-right text-bold">Rs ${Math.round(q.total_price).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <!-- Payment terms -->
    <div class="payment-section">
      <div class="payment-title">Payment Schedule</div>
      <div class="payment-grid">
        <div class="pay-box">
          <div class="pay-label">Advance (${q.advance_percent}%) — On Order</div>
          <div class="pay-amount">Rs ${Math.round(q.advance_amount).toLocaleString()}</div>
          <div class="pay-sub">Payable before work starts</div>
        </div>
        <div class="pay-box">
          <div class="pay-label">Balance (${100 - q.advance_percent}%) — On Completion</div>
          <div class="pay-amount">Rs ${Math.round(q.remaining_amount).toLocaleString()}</div>
          <div class="pay-sub">Payable after installation</div>
        </div>
      </div>
    </div>

    ${q.notes ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 14px;margin-bottom:20px;font-size:12px;color:#92400e;"><strong>Notes:</strong> ${q.notes}</div>` : ''}

    <!-- Terms -->
    <div class="footer-notes">
      <div class="notes-title">Terms & Conditions</div>
      <div class="note-item">✓ <span>This quotation is valid for ${q.valid_days} days from the date of issue</span></div>
      <div class="note-item">✓ <span>1 year installation warranty on workmanship</span></div>
      <div class="note-item">✓ <span>Panel and inverter warranty as per manufacturer terms</span></div>
      <div class="note-item">✓ <span>Net metering application assistance included (on-grid systems)</span></div>
      <div class="note-item">✓ <span>Prices subject to change if advance payment not received within validity period</span></div>
    </div>

    <div class="stamp">
      <span>Generated by SolarPro — Professional Solar Business Management</span>
      <span>${company_name} | ${company_phone}</span>
    </div>
  </div>

</div>

<!-- Print button — hidden in print -->
<div class="no-print" style="text-align:center;padding:24px;background:#f9fafb;border-top:1px solid #e5e7eb;">
  <button onclick="window.print()" style="padding:12px 32px;background:#f5a623;border:none;border-radius:10px;font-size:14px;font-weight:700;color:#000;cursor:pointer;margin-right:10px;">
    🖨️ Print / Save PDF
  </button>
  <button onclick="window.close()" style="padding:12px 20px;background:transparent;border:1px solid #d1d5db;border-radius:10px;font-size:14px;color:#6b7280;cursor:pointer;">
    Close
  </button>
</div>

</body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
