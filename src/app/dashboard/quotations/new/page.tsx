'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function NewQuotationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [calcResult, setCalcResult] = useState<any>(null)

  // Form state
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [advancePct, setAdvancePct] = useState(50)
  const [notes, setNotes] = useState('')
  const [validDays, setValidDays] = useState(15)
  const [companyName, setCompanyName] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')

  // Auto-fill from calculator
  useEffect(() => {
    const stored = localStorage.getItem('sp_calc_result')
    if (stored) {
      try { setCalcResult(JSON.parse(stored)) } catch {}
    }
  }, [])

  const result = calcResult?.result
  const inp = { width:'100%', padding:'10px 13px', background:'#1c1c26', border:'1px solid #ffffff15', borderRadius:'9px', fontSize:'14px', color:'white', outline:'none', boxSizing:'border-box' as const, fontFamily:'system-ui,sans-serif' }
  const lbl = { display:'block' as const, fontSize:'11px', fontWeight:'600' as const, color:'#6b7280', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'5px' }
  const card = { background:'#13131a', border:'1px solid #ffffff12', borderRadius:'14px', padding:'20px', marginBottom:'14px' }

  const submit = async () => {
    if (!clientName || !clientPhone || !clientAddress) { toast.error('Client details fill karo'); return }
    if (!result) { toast.error('Pehle calculator se calculate karo'); return }

    setLoading(true)
    const r = await fetch('/api/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: clientName,
        client_phone: clientPhone,
        client_address: clientAddress,
        system_type: calcResult.systemType ?? result.system_type,
        advance_percent: advancePct,
        notes: notes || null,
        valid_days: validDays,
        system_kw: result.system_kw,
        total_price: result.client_quote,
        line_items: [
          { product_model_id: calcResult.panelId, brand: 'Panel', model_name: 'Solar Panel 580W', unit_label: 'per panel', quantity: result.panel_count, unit_price: result.panel_cost / result.panel_count, total_price: result.panel_cost },
          { product_model_id: calcResult.inverterId, brand: 'Inverter', model_name: result.system_kw + 'kW Inverter', unit_label: 'unit', quantity: 1, unit_price: result.inverter_cost, total_price: result.inverter_cost },
          ...(result.battery_cost > 0 ? [{ product_model_id: calcResult.batteryId, brand: 'Battery', model_name: 'Lithium Battery', unit_label: 'unit', quantity: result.battery_units || 1, unit_price: result.battery_cost / (result.battery_units || 1), total_price: result.battery_cost }] : []),
          { product_model_id: 'misc', brand: 'Kuka', model_name: 'DC Cable + Structure', unit_label: 'set', quantity: 1, unit_price: result.cable_cost + result.structure_cost, total_price: result.cable_cost + result.structure_cost },
          { product_model_id: 'misc2', brand: 'Labour', model_name: 'Installation + Net Metering', unit_label: 'set', quantity: 1, unit_price: result.labour_cost + (result.net_metering_fee || 0), total_price: result.labour_cost + (result.net_metering_fee || 0) },
        ],
      }),
    })
    const d = await r.json()
    if (d.ok) {
      toast.success('Quotation saved!')
      localStorage.removeItem('sp_calc_result')
      router.push('/dashboard/quotations')
    } else {
      toast.error(d.error)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth:'680px', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
        <button onClick={() => router.back()} style={{ background:'transparent', border:'none', color:'#6b7280', cursor:'pointer', fontSize:'20px' }}>←</button>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:'800', color:'white', margin:0 }}>New Quotation</h1>
          <p style={{ color:'#6b7280', fontSize:'13px', marginTop:'3px' }}>Client details fill karo</p>
        </div>
      </div>

      {/* Calculator result preview */}
      {result ? (
        <div style={{ background:'linear-gradient(135deg,#1c1a0f,#1a1025)', border:'1px solid #f5a62330', borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
          <div style={{ fontSize:'11px', color:'#f5a623', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>Calculator Se Auto-Fill</div>
          <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
            <div><div style={{ fontSize:'10px', color:'#6b7280' }}>System</div><div style={{ fontSize:'14px', fontWeight:'700', color:'white' }}>{result.system_kw} kW</div></div>
            <div><div style={{ fontSize:'10px', color:'#6b7280' }}>Quote Price</div><div style={{ fontSize:'14px', fontWeight:'700', color:'#f5a623' }}>Rs {result.client_quote?.toLocaleString()}</div></div>
            <div><div style={{ fontSize:'10px', color:'#6b7280' }}>Your Margin</div><div style={{ fontSize:'14px', fontWeight:'700', color:'#00d97e' }}>Rs {result.margin_amount?.toLocaleString()}</div></div>
          </div>
        </div>
      ) : (
        <div style={{ background:'#1c1c26', border:'1px dashed #f5a62340', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
          <div style={{ fontSize:'13px', color:'#f5a623' }}>⚠️ Calculator se calculate karo pehle — phir yahan aao</div>
          <button onClick={() => router.push('/dashboard/calculator')} style={{ marginTop:'8px', padding:'6px 14px', background:'transparent', border:'1px solid #f5a623', borderRadius:'8px', color:'#f5a623', fontSize:'12px', cursor:'pointer' }}>Calculator Pe Jao</button>
        </div>
      )}

      {/* Company info */}
      <div style={card}>
        <div style={{ fontSize:'12px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'14px' }}>Tumhari Company</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <div><label style={lbl}>Company Naam</label><input style={inp} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Chiniot Solar Solutions" /></div>
          <div><label style={lbl}>Phone</label><input style={inp} value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="03XX XXXXXXX" /></div>
        </div>
      </div>

      {/* Client info */}
      <div style={card}>
        <div style={{ fontSize:'12px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'14px' }}>Client Details</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
          <div><label style={lbl}>Client Naam *</label><input style={inp} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Muhammad Akram" /></div>
          <div><label style={lbl}>Phone *</label><input style={inp} value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="03XX XXXXXXX" /></div>
        </div>
        <div><label style={lbl}>Address *</label><input style={inp} value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Chiniot, Din Garden" /></div>
      </div>

      {/* Payment terms */}
      <div style={card}>
        <div style={{ fontSize:'12px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'14px' }}>Payment Terms</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <div>
            <label style={lbl}>Advance %</label>
            <select style={{ ...inp }} value={advancePct} onChange={e => setAdvancePct(parseInt(e.target.value))}>
              <option value={30}>30%</option><option value={40}>40%</option><option value={50}>50%</option>
            </select>
            {result && <div style={{ fontSize:'11px', color:'#f5a623', marginTop:'4px' }}>Rs {Math.round(result.client_quote * advancePct / 100).toLocaleString()} advance</div>}
          </div>
          <div>
            <label style={lbl}>Valid Days</label>
            <select style={{ ...inp }} value={validDays} onChange={e => setValidDays(parseInt(e.target.value))}>
              <option value={7}>7 days</option><option value={15}>15 days</option><option value={30}>30 days</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop:'12px' }}>
          <label style={lbl}>Notes (optional)</label>
          <textarea style={{ ...inp, minHeight:'70px', resize:'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Koi special notes..." />
        </div>
      </div>

      <button onClick={submit} disabled={loading} style={{
        width:'100%', padding:'14px', background: loading ? '#d97706' : '#f5a623',
        border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:'700',
        color:'#000', cursor: loading ? 'not-allowed' : 'pointer'
      }}>
        {loading ? 'Saving...' : 'Quotation Save Karo'}
      </button>
    </div>
  )
}
