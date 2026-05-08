'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ProductModel {
  id: string; brand: string; model_name: string
  price_per_unit: number; unit_label: string; specs: Record<string,any>
}
interface Category { id: string; name: string; display_name: string; icon: string; product_models: ProductModel[] }

export default function CalculatorPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Inputs
  const [bill, setBill] = useState('')
  const [units, setUnits] = useState('')
  const [systemType, setSystemType] = useState('ongrid')
  const [includeBattery, setIncludeBattery] = useState(false)
  const [backupHours, setBackupHours] = useState(4)
  const [margin, setMargin] = useState(20)

  // Brand+Model selection
  const [panelBrand, setPanelBrand] = useState('')
  const [panelModelId, setPanelModelId] = useState('')
  const [invBrand, setInvBrand] = useState('')
  const [invModelId, setInvModelId] = useState('')
  const [battBrand, setBattBrand] = useState('')
  const [battModelId, setBattModelId] = useState('')

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => {
      if (d.ok) {
        setCategories(d.data)
        // Set defaults
        const panels = d.data.find((c: Category) => c.name === 'solar_panel')?.product_models ?? []
        const invs   = d.data.find((c: Category) => c.name === 'inverter')?.product_models ?? []
        const batts  = d.data.find((c: Category) => c.name === 'battery')?.product_models ?? []
        if (panels[2]) { setPanelBrand(panels[2].brand); setPanelModelId(panels[2].id) }
        if (invs[2])   { setInvBrand(invs[2].brand);     setInvModelId(invs[2].id) }
        if (batts[2])  { setBattBrand(batts[2].brand);   setBattModelId(batts[2].id) }
      }
      setLoading(false)
    })
  }, [])

  // Get unique brands per category
  const getModels = (catName: string) =>
    categories.find(c => c.name === catName)?.product_models ?? []

  const getUniqueBrands = (catName: string) =>
    [...new Set(getModels(catName).map(m => m.brand))]

  const getModelsByBrand = (catName: string, brand: string) =>
    getModels(catName).filter(m => m.brand === brand)

  const getModel = (id: string) =>
    categories.flatMap(c => c.product_models).find(m => m.id === id)

  const hasBatt = systemType === 'hybrid' || systemType === 'offgrid'

  const calculate = async () => {
    if (!bill && !units) { toast.error('Bill ya units daao'); return }
    if (!panelModelId || !invModelId) { toast.error('Panel aur inverter select karo'); return }
    setCalculating(true)
    try {
      const r = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthly_bill:      bill ? parseFloat(bill) : null,
          monthly_units:     units ? parseFloat(units) : null,
          system_type:       systemType,
          panel_model_id:    panelModelId,
          inverter_model_id: invModelId,
          battery_model_id:  hasBatt && includeBattery ? battModelId : null,
          include_battery:   hasBatt && includeBattery,
          backup_hours:      backupHours,
          battery_units:     0,
          margin_percent:    margin,
        }),
      })
      const d = await r.json()
      if (d.ok) setResult(d.data)
      else toast.error(d.error)
    } finally { setCalculating(false) }
  }

  const goToQuote = () => {
    if (!result) return
    const panelModel = getModel(panelModelId)
    const invModel   = getModel(invModelId)
    const battModel  = battModelId ? getModel(battModelId) : null
    localStorage.setItem('sp_calc_result', JSON.stringify({
      result, panelId: panelModelId, inverterId: invModelId,
      batteryId: battModelId, systemType,
      panelName: panelModel ? `${panelModel.brand} ${panelModel.model_name}` : '',
      invName:   invModel   ? `${invModel.brand} ${invModel.model_name}` : '',
      battName:  battModel  ? `${battModel.brand} ${battModel.model_name}` : '',
    }))
    router.push('/dashboard/quotations/new')
  }

  // Styles
  const card = (extra?: any) => ({ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'14px', padding:'18px', marginBottom:'14px', ...extra })
  const secTitle = { fontSize:'11px', fontWeight:'700' as const, color:'#6b7280', textTransform:'uppercase' as const, letterSpacing:'0.8px', marginBottom:'12px' }
  const inp = { width:'100%', padding:'11px 14px', background:'#1c1c26', border:'1px solid #ffffff15', borderRadius:'10px', fontSize:'15px', color:'white', outline:'none', boxSizing:'border-box' as const, fontFamily:'system-ui,sans-serif' }

  if (loading) return <div style={{ color:'#6b7280', fontFamily:'system-ui,sans-serif' }}>Loading products...</div>

  const panelModel = getModel(panelModelId)
  const invModel   = getModel(invModelId)
  const battModel  = battModelId ? getModel(battModelId) : null

  return (
    <div style={{ maxWidth:'720px', fontFamily:'system-ui,sans-serif' }}>
      <h1 style={{ fontSize:'22px', fontWeight:'800', color:'white', marginBottom:'4px' }}>Calculator</h1>
      <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'22px' }}>Client ka bill daao — system calculate ho jaayega</p>

      {/* Step 1: Bill */}
      <div style={card()}>
        <div style={secTitle}>Step 1 — Client ki bijli</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <div>
            <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'5px' }}>Bijli bill (Rs/month)</div>
            <input style={inp} type="number" value={bill} onChange={e => { setBill(e.target.value); setUnits('') }} placeholder="e.g. 15,000" />
          </div>
          <div>
            <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'5px' }}>Ya units/month</div>
            <input style={inp} type="number" value={units} onChange={e => { setUnits(e.target.value); setBill('') }} placeholder="e.g. 400" />
          </div>
        </div>
      </div>

      {/* Step 2: System type */}
      <div style={card()}>
        <div style={secTitle}>Step 2 — System type</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          {[
            { k:'ongrid',  icon:'🔗', name:'On-Grid',    desc:'Net metering — WAPDA connected, no battery. Sabse sasta.' },
            { k:'hybrid',  icon:'⚡', name:'Hybrid',     desc:'Battery backup — load shedding mein bhi bijli.' },
            { k:'offgrid', icon:'🏝️', name:'Off-Grid',   desc:'WAPDA nahi chahiye. Sirf battery se.' },
            { k:'tubwell', icon:'💧', name:'Tube Well',  desc:'DC pump directly panel se. ZTBL loan milta hai.' },
          ].map(t => (
            <div key={t.k} onClick={() => {
              setSystemType(t.k)
              setIncludeBattery(t.k === 'hybrid' || t.k === 'offgrid')
            }} style={{
              padding:'13px', borderRadius:'11px', cursor:'pointer', transition:'all .15s',
              border: systemType===t.k ? '1.5px solid #f5a623' : '1px solid #ffffff12',
              background: systemType===t.k ? '#f5a62312' : '#1c1c26',
            }}>
              <div style={{ fontSize:'18px', marginBottom:'5px' }}>{t.icon}</div>
              <div style={{ fontSize:'12px', fontWeight:'700', color:'white' }}>{t.name}</div>
              <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'2px', lineHeight:'1.4' }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: Panel — Brand then Model */}
      <div style={card()}>
        <div style={secTitle}>Step 3 — Solar Panel</div>

        {/* Brand select */}
        <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'6px' }}>Brand chuno:</div>
        <div style={{ display:'flex', gap:'7px', overflowX:'auto', paddingBottom:'4px', marginBottom:'12px', scrollbarWidth:'none' }}>
          {getUniqueBrands('solar_panel').map(brand => (
            <div key={brand} onClick={() => {
              setPanelBrand(brand)
              const firstModel = getModelsByBrand('solar_panel', brand)[0]
              if (firstModel) setPanelModelId(firstModel.id)
            }} style={{
              flexShrink:0, padding:'8px 14px', borderRadius:'20px', cursor:'pointer',
              border: panelBrand===brand ? '1.5px solid #f5a623' : '1px solid #ffffff15',
              background: panelBrand===brand ? '#f5a62318' : '#1c1c26',
              fontSize:'12px', fontWeight: panelBrand===brand ? '700' : '400',
              color: panelBrand===brand ? '#f5a623' : '#9ca3af', whiteSpace:'nowrap' as const
            }}>{brand}</div>
          ))}
        </div>

        {/* Model select */}
        {panelBrand && (
          <>
            <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'6px' }}>Model chuno:</div>
            <div style={{ display:'grid', gap:'7px' }}>
              {getModelsByBrand('solar_panel', panelBrand).map(m => (
                <div key={m.id} onClick={() => setPanelModelId(m.id)} style={{
                  padding:'11px 14px', borderRadius:'10px', cursor:'pointer',
                  border: panelModelId===m.id ? '1.5px solid #f5a623' : '1px solid #ffffff10',
                  background: panelModelId===m.id ? '#f5a62310' : '#1c1c26',
                  display:'flex', justifyContent:'space-between', alignItems:'center'
                }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:'600', color:'white' }}>{m.model_name}</div>
                    <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'2px' }}>
                      {m.specs?.wattage && `${m.specs.wattage}W`}
                      {m.specs?.type && ` · ${m.specs.type}`}
                      {m.specs?.efficiency && ` · ${m.specs.efficiency} efficiency`}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:'13px', fontWeight:'700', color:'#f5a623' }}>Rs {m.price_per_unit}</div>
                    <div style={{ fontSize:'10px', color:'#374151' }}>{m.unit_label}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Step 4: Inverter — Brand then Model */}
      <div style={card()}>
        <div style={secTitle}>Step 4 — Inverter</div>

        <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'6px' }}>Brand chuno:</div>
        <div style={{ display:'flex', gap:'7px', overflowX:'auto', paddingBottom:'4px', marginBottom:'12px', scrollbarWidth:'none' }}>
          {getUniqueBrands('inverter').map(brand => (
            <div key={brand} onClick={() => {
              setInvBrand(brand)
              // Auto-select matching kW model if possible
              const models = getModelsByBrand('inverter', brand)
              const first = models[0]
              if (first) setInvModelId(first.id)
            }} style={{
              flexShrink:0, padding:'8px 14px', borderRadius:'20px', cursor:'pointer',
              border: invBrand===brand ? '1.5px solid #f5a623' : '1px solid #ffffff15',
              background: invBrand===brand ? '#f5a62318' : '#1c1c26',
              fontSize:'12px', fontWeight: invBrand===brand ? '700' : '400',
              color: invBrand===brand ? '#f5a623' : '#9ca3af', whiteSpace:'nowrap' as const
            }}>{brand}</div>
          ))}
        </div>

        {invBrand && (
          <>
            <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'6px' }}>Model chuno:</div>
            <div style={{ display:'grid', gap:'7px' }}>
              {getModelsByBrand('inverter', invBrand).map(m => (
                <div key={m.id} onClick={() => setInvModelId(m.id)} style={{
                  padding:'11px 14px', borderRadius:'10px', cursor:'pointer',
                  border: invModelId===m.id ? '1.5px solid #f5a623' : '1px solid #ffffff10',
                  background: invModelId===m.id ? '#f5a62310' : '#1c1c26',
                  display:'flex', justifyContent:'space-between', alignItems:'center'
                }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:'600', color:'white' }}>{m.model_name}</div>
                    <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'2px', display:'flex', gap:'8px' }}>
                      {m.specs?.type && <span style={{ color: m.specs.type.includes('Hybrid') ? '#00d97e' : '#6b7280' }}>{m.specs.type}</span>}
                      {m.specs?.efficiency && <span>{m.specs.efficiency} eff</span>}
                      {m.specs?.warranty_years && <span>{m.specs.warranty_years}yr warranty</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:'13px', fontWeight:'700', color:'#f5a623' }}>Rs {m.price_per_unit.toLocaleString()}</div>
                    <div style={{ fontSize:'10px', color:'#374151' }}>{m.unit_label}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Step 5: Battery (conditional) */}
      {hasBatt && (
        <div style={card()}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
            <div style={secTitle}>Step 5 — Battery</div>
            <div onClick={() => setIncludeBattery(!includeBattery)} style={{
              width:'42px', height:'24px', borderRadius:'12px', cursor:'pointer',
              background: includeBattery ? '#f5a623' : '#374151', position:'relative', transition:'all .2s', flexShrink:0
            }}>
              <div style={{ position:'absolute', top:'3px', left: includeBattery ? '21px' : '3px', width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'all .2s' }} />
            </div>
          </div>

          {includeBattery && (
            <>
              <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'6px' }}>Brand chuno:</div>
              <div style={{ display:'flex', gap:'7px', overflowX:'auto', paddingBottom:'4px', marginBottom:'12px', scrollbarWidth:'none' }}>
                {getUniqueBrands('battery').map(brand => (
                  <div key={brand} onClick={() => {
                    setBattBrand(brand)
                    const first = getModelsByBrand('battery', brand)[0]
                    if (first) setBattModelId(first.id)
                  }} style={{
                    flexShrink:0, padding:'8px 14px', borderRadius:'20px', cursor:'pointer',
                    border: battBrand===brand ? '1.5px solid #f5a623' : '1px solid #ffffff15',
                    background: battBrand===brand ? '#f5a62318' : '#1c1c26',
                    fontSize:'12px', fontWeight: battBrand===brand ? '700' : '400',
                    color: battBrand===brand ? '#f5a623' : '#9ca3af', whiteSpace:'nowrap' as const
                  }}>{brand}</div>
                ))}
              </div>

              {battBrand && (
                <>
                  <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'6px' }}>Model chuno:</div>
                  <div style={{ display:'grid', gap:'7px', marginBottom:'12px' }}>
                    {getModelsByBrand('battery', battBrand).map(m => (
                      <div key={m.id} onClick={() => setBattModelId(m.id)} style={{
                        padding:'11px 14px', borderRadius:'10px', cursor:'pointer',
                        border: battModelId===m.id ? '1.5px solid #f5a623' : '1px solid #ffffff10',
                        background: battModelId===m.id ? '#f5a62310' : '#1c1c26',
                        display:'flex', justifyContent:'space-between', alignItems:'center'
                      }}>
                        <div>
                          <div style={{ fontSize:'13px', fontWeight:'600', color:'white' }}>{m.model_name}</div>
                          <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'2px', display:'flex', gap:'8px' }}>
                            {m.specs?.kwh && <span>{m.specs.kwh} kWh</span>}
                            {m.specs?.chemistry && <span style={{ color:'#00d97e' }}>{m.specs.chemistry}</span>}
                            {m.specs?.warranty_years && <span>{m.specs.warranty_years}yr warranty</span>}
                            {m.specs?.cycles && <span>{m.specs.cycles} cycles</span>}
                          </div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{ fontSize:'13px', fontWeight:'700', color:'#f5a623' }}>Rs {m.price_per_unit.toLocaleString()}</div>
                          <div style={{ fontSize:'10px', color:'#374151' }}>{m.unit_label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'5px' }}>Backup hours?</div>
              <select style={{ ...inp, fontSize:'13px' }} value={backupHours} onChange={e => setBackupHours(parseInt(e.target.value))}>
                <option value={4}>4 ghante</option>
                <option value={6}>6 ghante</option>
                <option value={8}>Raat bhar (8 ghante)</option>
              </select>
            </>
          )}
        </div>
      )}

      {/* Margin */}
      <div style={card()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
          <div style={secTitle}>Tumhara margin</div>
          <div style={{ fontSize:'20px', fontWeight:'900', color:'#f5a623' }}>{margin}%</div>
        </div>
        <input type="range" min={10} max={35} value={margin} onChange={e => setMargin(parseInt(e.target.value))} style={{ width:'100%', accentColor:'#f5a623' }} />
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#374151', marginTop:'4px' }}>
          <span>10% (min)</span><span>35% (max)</span>
        </div>
      </div>

      {/* Selected summary before calculate */}
      {panelModelId && invModelId && (
        <div style={{ background:'#1c1c26', border:'1px solid #ffffff10', borderRadius:'11px', padding:'12px 14px', marginBottom:'14px', fontSize:'12px', color:'#6b7280' }}>
          <span style={{ color:'white', fontWeight:'600' }}>Selected: </span>
          {panelModel?.brand} {panelModel?.model_name}
          {' · '}
          {invModel?.brand} {invModel?.model_name}
          {includeBattery && battModel && ` · ${battModel.brand} ${battModel.model_name}`}
        </div>
      )}

      <button onClick={calculate} disabled={calculating} style={{
        width:'100%', padding:'14px', background: calculating ? '#d97706' : '#f5a623',
        border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:'800',
        color:'#000', cursor: calculating ? 'not-allowed' : 'pointer', marginBottom:'16px',
        letterSpacing:'0.3px'
      }}>
        {calculating ? 'Calculating...' : 'Calculate Karo →'}
      </button>

      {/* Result */}
      {result && (
        <div style={{ background:'linear-gradient(135deg,#1c1a0f,#1a1025)', border:'1px solid #f5a62340', borderRadius:'16px', padding:'22px' }}>
          <div style={{ fontSize:'32px', fontWeight:'900', color:'#f5a623' }}>{result.system_kw} kW System</div>
          <div style={{ fontSize:'12px', color:'#9ca3af', marginBottom:'18px' }}>
            {result.panel_count} panels · {panelModel?.model_name} · {invModel?.model_name}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
            {[
              ['Panel cost',      result.panel_cost],
              ['Inverter cost',   result.inverter_cost],
              ...(result.battery_cost > 0 ? [['Battery cost', result.battery_cost]] : []),
              ['Cable + Structure', result.cable_cost + result.structure_cost],
              ['Labour',          result.labour_cost],
              ['Buying cost',     result.total_buying_cost],
            ].map(([label, val]) => (
              <div key={label as string} style={{ background:'#ffffff08', borderRadius:'9px', padding:'11px 12px' }}>
                <div style={{ fontSize:'10px', color:'#6b7280', marginBottom:'3px' }}>{label}</div>
                <div style={{ fontSize:'13px', fontWeight:'700', color: label==='Buying cost' ? '#f5a623' : 'white' }}>
                  Rs {(val as number).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop:'1px solid #ffffff15', paddingTop:'16px', textAlign:'center', marginBottom:'14px' }}>
            <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'4px' }}>Client ko quote karo</div>
            <div style={{ fontSize:'32px', fontWeight:'900', color:'#f5a623' }}>Rs {result.client_quote.toLocaleString()}</div>
            <div style={{ fontSize:'13px', color:'#00d97e', marginTop:'4px' }}>
              Tumhara margin: Rs {result.margin_amount.toLocaleString()} ({margin}%)
            </div>
            <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'3px' }}>
              Client payback: {result.payback_years} saal
            </div>
          </div>

          <button onClick={goToQuote} style={{
            width:'100%', padding:'13px', background:'transparent',
            border:'1.5px solid #f5a623', borderRadius:'11px',
            fontSize:'13px', fontWeight:'700', color:'#f5a623', cursor:'pointer'
          }}>
            Is Se Quotation Banao →
          </button>
        </div>
      )}
    </div>
  )
}
