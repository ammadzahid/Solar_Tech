'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CalculatorPage() {
  const [products, setProducts] = useState<any[]>([])
  const [bill, setBill] = useState('')
  const [units, setUnits] = useState('')
  const [systemType, setSystemType] = useState('ongrid')
  const [panelId, setPanelId] = useState('')
  const [inverterId, setInverterId] = useState('')
  const [batteryId, setBatteryId] = useState('')
  const [includeBattery, setIncludeBattery] = useState(false)
  const [backupHours, setBackupHours] = useState(4)
  const [margin, setMargin] = useState(20)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => {
      if (d.ok) {
        setProducts(d.data)
        // Set defaults
        const panels = d.data.find((c: any) => c.name === 'solar_panel')?.product_models
        const invs = d.data.find((c: any) => c.name === 'inverter')?.product_models
        const batts = d.data.find((c: any) => c.name === 'battery')?.product_models
        if (panels?.[1]) setPanelId(panels[1].id)
        if (invs?.[0]) setInverterId(invs[0].id)
        if (batts?.[0]) setBatteryId(batts[0].id)
      }
    })
  }, [])

  const hasBatt = systemType === 'hybrid' || systemType === 'offgrid'
  const panels = products.find(c => c.name === 'solar_panel')?.product_models ?? []
  const invs = products.find(c => c.name === 'inverter')?.product_models ?? []
  const batts = products.find(c => c.name === 'battery')?.product_models ?? []

  const calculate = async () => {
    if (!bill && !units) { toast.error('Bill ya units daao'); return }
    setLoading(true)
    const r = await fetch('/api/calculator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthly_bill: bill ? parseFloat(bill) : null,
        monthly_units: units ? parseFloat(units) : null,
        system_type: systemType,
        panel_model_id: panelId,
        inverter_model_id: inverterId,
        battery_model_id: hasBatt && includeBattery ? batteryId : null,
        include_battery: hasBatt && includeBattery,
        backup_hours: backupHours,
        battery_units: 0,
        margin_percent: margin,
      }),
    })
    const d = await r.json()
    if (d.ok) setResult(d.data)
    else toast.error(d.error)
    setLoading(false)
  }

  const goToQuote = () => {
    if (!result) return
    localStorage.setItem('sp_calc_result', JSON.stringify({ result, panelId, inverterId, batteryId, systemType }))
    window.location.href = '/dashboard/quotations/new'
  }

  const s = (v: any) => ({ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'12px', padding:'16px', marginBottom:'12px', ...v })
  const inp = { width:'100%', padding:'10px 13px', background:'#1c1c26', border:'1px solid #ffffff15', borderRadius:'9px', fontSize:'14px', color:'white', outline:'none', boxSizing:'border-box' as const }
  const lbl = { display:'block' as const, fontSize:'11px', fontWeight:'600' as const, color:'#6b7280', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'5px' }

  return (
    <div style={{ maxWidth:'700px' }}>
      <h1 style={{ fontSize:'22px', fontWeight:'800', color:'white', marginBottom:'4px' }}>Calculator</h1>
      <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'24px' }}>Client ka bill daao — system calculate ho jaayega</p>

      {/* Bill inputs */}
      <div style={s({})}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <div><label style={lbl}>Bill (Rs/month)</label><input style={inp} type="number" value={bill} onChange={e => setBill(e.target.value)} placeholder="15000" /></div>
          <div><label style={lbl}>Ya Units/month</label><input style={inp} type="number" value={units} onChange={e => setUnits(e.target.value)} placeholder="400" /></div>
        </div>
      </div>

      {/* System type */}
      <div style={s({})}>
        <label style={lbl}>System Type</label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          {[
            { k:'ongrid', label:'On-Grid', desc:'Net metering, no battery' },
            { k:'hybrid', label:'Hybrid', desc:'Battery backup included' },
            { k:'offgrid', label:'Off-Grid', desc:'No WAPDA needed' },
            { k:'tubwell', label:'Tube Well', desc:'ZTBL loan available' },
          ].map(t => (
            <div key={t.k} onClick={() => { setSystemType(t.k); setIncludeBattery(t.k === 'hybrid' || t.k === 'offgrid') }} style={{
              padding:'12px', borderRadius:'10px', cursor:'pointer',
              border: systemType === t.k ? '1.5px solid #f5a623' : '1px solid #ffffff12',
              background: systemType === t.k ? '#f5a62312' : '#1c1c26'
            }}>
              <div style={{ fontSize:'12px', fontWeight:'700', color:'white' }}>{t.label}</div>
              <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'2px' }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div style={s({})}>
        <label style={lbl}>Panel Brand</label>
        <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px' }}>
          {panels.map((p: any) => (
            <div key={p.id} onClick={() => setPanelId(p.id)} style={{
              flexShrink:0, padding:'10px 14px', borderRadius:'10px', cursor:'pointer',
              border: panelId === p.id ? '1.5px solid #f5a623' : '1px solid #ffffff12',
              background: panelId === p.id ? '#f5a62312' : '#1c1c26'
            }}>
              <div style={{ fontSize:'12px', fontWeight:'700', color:'white' }}>{p.brand}</div>
              <div style={{ fontSize:'11px', color:'#f5a623', marginTop:'2px' }}>Rs {p.price_per_unit}/{p.unit_label.replace('per ','')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Inverter */}
      <div style={s({})}>
        <label style={lbl}>Inverter Brand</label>
        <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px' }}>
          {invs.map((p: any) => (
            <div key={p.id} onClick={() => setInverterId(p.id)} style={{
              flexShrink:0, padding:'10px 14px', borderRadius:'10px', cursor:'pointer',
              border: inverterId === p.id ? '1.5px solid #f5a623' : '1px solid #ffffff12',
              background: inverterId === p.id ? '#f5a62312' : '#1c1c26'
            }}>
              <div style={{ fontSize:'12px', fontWeight:'700', color:'white' }}>{p.brand}</div>
              <div style={{ fontSize:'11px', color:'#f5a623', marginTop:'2px' }}>Rs {p.price_per_unit.toLocaleString()}/kW</div>
            </div>
          ))}
        </div>
      </div>

      {/* Battery */}
      {hasBatt && (
        <div style={s({})}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
            <label style={{ ...lbl, marginBottom:0 }}>Battery</label>
            <div onClick={() => setIncludeBattery(!includeBattery)} style={{
              width:'40px', height:'22px', borderRadius:'11px', cursor:'pointer',
              background: includeBattery ? '#f5a623' : '#374151', position:'relative', transition:'all .2s'
            }}>
              <div style={{ position:'absolute', top:'3px', left: includeBattery ? '21px' : '3px', width:'16px', height:'16px', borderRadius:'50%', background:'white', transition:'all .2s' }} />
            </div>
          </div>
          {includeBattery && (
            <>
              <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px', marginBottom:'10px' }}>
                {batts.map((p: any) => (
                  <div key={p.id} onClick={() => setBatteryId(p.id)} style={{
                    flexShrink:0, padding:'10px 14px', borderRadius:'10px', cursor:'pointer',
                    border: batteryId === p.id ? '1.5px solid #f5a623' : '1px solid #ffffff12',
                    background: batteryId === p.id ? '#f5a62312' : '#1c1c26'
                  }}>
                    <div style={{ fontSize:'12px', fontWeight:'700', color:'white' }}>{p.brand}</div>
                    <div style={{ fontSize:'11px', color:'#f5a623', marginTop:'2px' }}>Rs {p.price_per_unit.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <label style={lbl}>Backup Hours</label>
              <select style={{ ...inp }} value={backupHours} onChange={e => setBackupHours(parseInt(e.target.value))}>
                <option value={4}>4 ghante</option>
                <option value={6}>6 ghante</option>
                <option value={8}>Raat bhar (8 ghante)</option>
              </select>
            </>
          )}
        </div>
      )}

      {/* Margin */}
      <div style={s({})}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
          <label style={{ ...lbl, marginBottom:0 }}>Tumhara Margin</label>
          <span style={{ fontSize:'18px', fontWeight:'800', color:'#f5a623' }}>{margin}%</span>
        </div>
        <input type="range" min={10} max={35} value={margin} onChange={e => setMargin(parseInt(e.target.value))} style={{ width:'100%', accentColor:'#f5a623' }} />
      </div>

      <button onClick={calculate} disabled={loading} style={{
        width:'100%', padding:'14px', background: loading ? '#d97706' : '#f5a623',
        border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:'700',
        color:'#000', cursor: loading ? 'not-allowed' : 'pointer', marginBottom:'16px'
      }}>
        {loading ? 'Calculating...' : 'Calculate Karo'}
      </button>

      {/* Result */}
      {result && (
        <div style={{ background:'linear-gradient(135deg,#1c1a0f,#1a1025)', border:'1px solid #f5a62335', borderRadius:'16px', padding:'20px' }}>
          <div style={{ fontSize:'30px', fontWeight:'900', color:'#f5a623' }}>{result.system_kw} kW</div>
          <div style={{ fontSize:'12px', color:'#9ca3af', marginBottom:'16px' }}>{result.panel_count} panels · {result.system_type}</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
            {[
              ['Panel Cost', result.panel_cost],
              ['Inverter Cost', result.inverter_cost],
              ['Cable + Structure', result.cable_cost + result.structure_cost],
              ['Labour', result.labour_cost],
              ...(result.battery_cost > 0 ? [['Battery Cost', result.battery_cost]] : []),
              ['Buying Cost', result.total_buying_cost],
            ].map(([l, v]) => (
              <div key={l as string} style={{ background:'#ffffff08', borderRadius:'9px', padding:'10px' }}>
                <div style={{ fontSize:'10px', color:'#6b7280' }}>{l}</div>
                <div style={{ fontSize:'13px', fontWeight:'700', color:'white', marginTop:'2px' }}>Rs {(v as number).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', borderTop:'1px solid #ffffff15', paddingTop:'14px' }}>
            <div style={{ fontSize:'11px', color:'#6b7280' }}>Client Ko Quote Karo</div>
            <div style={{ fontSize:'28px', fontWeight:'900', color:'#f5a623' }}>Rs {result.client_quote.toLocaleString()}</div>
            <div style={{ fontSize:'12px', color:'#00d97e', marginTop:'4px' }}>Margin: Rs {result.margin_amount.toLocaleString()} ({margin}%)</div>
            <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'2px' }}>Payback: {result.payback_years} saal</div>
          </div>
          <button onClick={goToQuote} style={{
            width:'100%', marginTop:'14px', padding:'12px',
            background:'transparent', border:'1.5px solid #f5a623',
            borderRadius:'11px', fontSize:'13px', fontWeight:'700',
            color:'#f5a623', cursor:'pointer'
          }}>Is Se Quotation Banao →</button>
        </div>
      )}
    </div>
  )
}
