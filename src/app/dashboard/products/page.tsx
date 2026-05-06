'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const PRICING_TYPES = [
  { value:'per_watt',  label:'Per Watt (panels)' },
  { value:'per_kw',    label:'Per kW (inverters old)' },
  { value:'flat',      label:'Flat per unit (inverter/battery)' },
  { value:'per_meter', label:'Per meter (cables)' },
  { value:'per_unit',  label:'Per unit (misc)' },
]

const UNIT_LABELS = ['per watt','per unit','per meter','per kW','per pair','flat fee']

export default function ProductsPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [searchQ, setSearchQ] = useState('')

  const [form, setForm] = useState({
    category_id:'', brand:'', model_name:'', price_per_unit:0,
    unit_label:'per unit', pricing_type:'flat', is_active:true,
    wattage:'', capacity_kw:'', capacity_kwh:'', warranty_years:5,
  })

  const load = async () => {
    const r = await fetch('/api/products')
    const d = await r.json()
    if (d.ok) {
      setCategories(d.data)
      if (!activeCategory && d.data.length > 0) setActiveCategory(d.data[0].name)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // When category changes, set smart defaults
  const onCategoryChange = (catId: string) => {
    const cat = categories.find(c => c.id === catId)
    let defaults = { unit_label:'per unit', pricing_type:'flat' }
    if (cat?.name === 'solar_panel') defaults = { unit_label:'per watt', pricing_type:'per_watt' }
    if (cat?.name === 'cable') defaults = { unit_label:'per meter', pricing_type:'per_meter' }
    setForm(f => ({ ...f, category_id: catId, ...defaults }))
  }

  const save = async () => {
    if (!form.brand.trim() || !form.model_name.trim() || !form.price_per_unit) {
      toast.error('Brand, model name aur price required hain')
      return
    }
    if (!form.category_id) { toast.error('Category select karo'); return }
    setSaving(true)

    const payload = {
      category_id:    form.category_id,
      brand:          form.brand.trim(),
      model_name:     form.model_name.trim(),
      price_per_unit: parseFloat(String(form.price_per_unit)),
      unit_label:     form.unit_label,
      pricing_type:   form.pricing_type,
      is_active:      form.is_active,
      warranty_years: form.warranty_years,
      specs: {
        ...(form.wattage ? { wattage: parseFloat(form.wattage) } : {}),
        ...(form.capacity_kw ? { kw: parseFloat(form.capacity_kw) } : {}),
        ...(form.capacity_kwh ? { kwh: parseFloat(form.capacity_kwh) } : {}),
      },
      ...(form.wattage ? { wattage: parseFloat(form.wattage) } : {}),
      ...(form.capacity_kw ? { capacity_kw: parseFloat(form.capacity_kw) } : {}),
      ...(form.capacity_kwh ? { capacity_kwh: parseFloat(form.capacity_kwh) } : {}),
    }

    const url = editItem ? '/api/products/' + editItem.id : '/api/products'
    const method = editItem ? 'PATCH' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
    const d = await r.json()

    if (d.ok) {
      toast.success(editItem ? 'Updated!' : 'Added!')
      setShowForm(false)
      setEditItem(null)
      resetForm()
      load()
    } else {
      toast.error(d.error)
    }
    setSaving(false)
  }

  const resetForm = () => setForm({ category_id:'', brand:'', model_name:'', price_per_unit:0, unit_label:'per unit', pricing_type:'flat', is_active:true, wattage:'', capacity_kw:'', capacity_kwh:'', warranty_years:5 })

  const startEdit = (item: any, catId: string) => {
    setEditItem(item)
    setForm({
      category_id: catId, brand: item.brand, model_name: item.model_name,
      price_per_unit: item.price_per_unit, unit_label: item.unit_label,
      pricing_type: item.pricing_type ?? 'flat', is_active: item.is_active,
      wattage: item.wattage ?? '', capacity_kw: item.capacity_kw ?? '',
      capacity_kwh: item.capacity_kwh ?? '', warranty_years: item.warranty_years ?? 5,
    })
    setShowForm(true)
    window.scrollTo(0,0)
  }

  const del = async (id: string, name: string) => {
    if (!confirm(`"${name}" delete karo?`)) return
    const r = await fetch('/api/products/' + id, { method:'DELETE' })
    const d = await r.json()
    if (d.ok) { toast.success('Deleted'); load() }
    else toast.error(d.error)
  }

  const inp = (err?: boolean) => ({
    width:'100%', padding:'9px 12px', background:'#1c1c26',
    border:`1px solid ${err ? '#ef4444' : '#ffffff15'}`, borderRadius:'8px',
    fontSize:'13px', color:'white', outline:'none', boxSizing:'border-box' as const,
    fontFamily:'system-ui,sans-serif'
  })
  const lbl = { display:'block' as const, fontSize:'10px', fontWeight:'600' as const, color:'#6b7280', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'4px' }

  // Current category products + search filter
  const currentCat = categories.find(c => c.name === activeCategory)
  const filteredProducts = (currentCat?.product_models ?? []).filter((p: any) => {
    if (!searchQ) return true
    const q = searchQ.toLowerCase()
    return p.brand.toLowerCase().includes(q) || p.model_name.toLowerCase().includes(q)
  })

  // Group by brand
  const byBrand: Record<string, any[]> = {}
  filteredProducts.forEach((p: any) => {
    if (!byBrand[p.brand]) byBrand[p.brand] = []
    byBrand[p.brand].push(p)
  })

  if (loading) return <div style={{ color:'#6b7280', fontFamily:'system-ui,sans-serif' }}>Loading...</div>

  return (
    <div style={{ fontFamily:'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'10px' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:'800', color:'white', margin:0 }}>Products</h1>
          <p style={{ color:'#6b7280', fontSize:'13px', marginTop:'3px' }}>Brands, models aur prices manage karo</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditItem(null); resetForm() }} style={{
          padding:'10px 18px', background:'#f5a623', border:'none',
          borderRadius:'10px', fontSize:'13px', fontWeight:'700', color:'#000', cursor:'pointer'
        }}>+ Add Product</button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{ background:'#13131a', border:'1px solid #f5a62340', borderRadius:'16px', padding:'22px', marginBottom:'20px' }}>
          <h3 style={{ color:'white', fontSize:'15px', fontWeight:'700', marginBottom:'16px' }}>
            {editItem ? 'Edit: ' + editItem.brand + ' ' + editItem.model_name : 'New Product'}
          </h3>

          {/* Row 1: Category + Brand */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div>
              <label style={lbl}>Category *</label>
              <select style={inp()} value={form.category_id} onChange={e => onCategoryChange(e.target.value)}>
                <option value="">-- Select --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.display_name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Brand *</label>
              <input style={inp()} value={form.brand} onChange={e => setForm({...form, brand:e.target.value})} placeholder="e.g. Longi Solar, Growatt" />
            </div>
          </div>

          {/* Row 2: Model name */}
          <div style={{ marginBottom:'12px' }}>
            <label style={lbl}>Model Name *</label>
            <input style={inp()} value={form.model_name} onChange={e => setForm({...form, model_name:e.target.value})} placeholder="e.g. Hi-MO6 580W, MID 10KTL3-X, US5000" />
          </div>

          {/* Row 3: Price + Pricing type */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div>
              <label style={lbl}>Price (Rs) *</label>
              <input style={inp()} type="number" value={form.price_per_unit || ''} onChange={e => setForm({...form, price_per_unit:parseFloat(e.target.value)||0})} placeholder="0" />
            </div>
            <div>
              <label style={lbl}>Pricing Type</label>
              <select style={inp()} value={form.pricing_type} onChange={e => setForm({...form, pricing_type:e.target.value})}>
                {PRICING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Row 4: Specs based on category */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div>
              <label style={lbl}>Unit Label</label>
              <select style={inp()} value={form.unit_label} onChange={e => setForm({...form, unit_label:e.target.value})}>
                {UNIT_LABELS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Wattage (panels)</label>
              <input style={inp()} type="number" value={form.wattage} onChange={e => setForm({...form, wattage:e.target.value})} placeholder="e.g. 580" />
            </div>
            <div>
              <label style={lbl}>Capacity kW (inverters)</label>
              <input style={inp()} type="number" value={form.capacity_kw} onChange={e => setForm({...form, capacity_kw:e.target.value})} placeholder="e.g. 10" />
            </div>
            <div>
              <label style={lbl}>Capacity kWh (batteries)</label>
              <input style={inp()} type="number" value={form.capacity_kwh} onChange={e => setForm({...form, capacity_kwh:e.target.value})} placeholder="e.g. 5.12" />
            </div>
            <div>
              <label style={lbl}>Warranty (years)</label>
              <input style={inp()} type="number" value={form.warranty_years} onChange={e => setForm({...form, warranty_years:parseInt(e.target.value)||5})} placeholder="5" />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', paddingTop:'20px' }}>
              <label style={{ ...lbl, marginBottom:0 }}>Active</label>
              <div onClick={() => setForm({...form, is_active:!form.is_active})} style={{ width:'38px', height:'20px', borderRadius:'10px', background: form.is_active ? '#f5a623' : '#374151', cursor:'pointer', position:'relative', transition:'all .2s', flexShrink:0 }}>
                <div style={{ position:'absolute', top:'2px', left: form.is_active ? '20px' : '2px', width:'16px', height:'16px', borderRadius:'50%', background:'white', transition:'all .2s' }} />
              </div>
            </div>
          </div>

          {/* Helper text */}
          <div style={{ background:'#1c1c26', borderRadius:'8px', padding:'10px 12px', marginBottom:'14px', fontSize:'11px', color:'#6b7280', lineHeight:'1.6' }}>
            <strong style={{ color:'#9ca3af' }}>Tips:</strong> Panels → Wattage daalo, Price = per watt (e.g. 30) &nbsp;|&nbsp;
            Inverters → Capacity kW daalo, Price = flat unit price (e.g. 160000) &nbsp;|&nbsp;
            Batteries → kWh daalo, Price = flat (e.g. 180000)
          </div>

          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={save} disabled={saving} style={{ padding:'10px 22px', background: saving ? '#d97706' : '#f5a623', border:'none', borderRadius:'9px', fontSize:'13px', fontWeight:'700', color:'#000', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : editItem ? '✓ Update' : '+ Add'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null); resetForm() }} style={{ padding:'10px 18px', background:'transparent', border:'1px solid #ffffff15', borderRadius:'9px', fontSize:'13px', color:'#6b7280', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'16px', overflowX:'auto', paddingBottom:'4px', scrollbarWidth:'none' }}>
        {categories.map(cat => (
          <button key={cat.name} onClick={() => setActiveCategory(cat.name)} style={{
            flexShrink:0, padding:'8px 14px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:'600',
            background: activeCategory === cat.name ? '#f5a623' : '#13131a',
            color: activeCategory === cat.name ? '#000' : '#6b7280',
          }}>
            {cat.icon} {cat.display_name}
            <span style={{ marginLeft:'6px', fontSize:'10px', opacity:0.7 }}>({cat.product_models?.length ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={searchQ} onChange={e => setSearchQ(e.target.value)}
        placeholder="Brand ya model search karo..."
        style={{ width:'100%', padding:'9px 14px', background:'#13131a', border:'1px solid #ffffff12', borderRadius:'10px', fontSize:'13px', color:'white', outline:'none', marginBottom:'16px', boxSizing:'border-box', fontFamily:'system-ui,sans-serif' }}
      />

      {/* Products grouped by brand */}
      {Object.keys(byBrand).length === 0 && (
        <div style={{ background:'#13131a', borderRadius:'12px', padding:'40px', textAlign:'center', color:'#374151', fontSize:'13px' }}>
          Koi products nahi — "Add Product" se add karo
        </div>
      )}

      {Object.entries(byBrand).map(([brand, models]) => (
        <div key={brand} style={{ marginBottom:'20px' }}>
          {/* Brand header */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px', paddingLeft:'4px' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#f5a623', flexShrink:0 }} />
            <span style={{ fontSize:'14px', fontWeight:'800', color:'white' }}>{brand}</span>
            <span style={{ fontSize:'11px', color:'#374151' }}>{models.length} models</span>
          </div>

          {/* Models */}
          {models.map((p: any) => (
            <div key={p.id} style={{ background:'#13131a', border:'1px solid #ffffff08', borderRadius:'10px', padding:'13px 16px', marginBottom:'6px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'10px' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'white' }}>{p.model_name}</div>
                <div style={{ display:'flex', gap:'10px', marginTop:'3px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'12px', color:'#f5a623', fontWeight:'600' }}>
                    Rs {p.price_per_unit?.toLocaleString()} {p.unit_label}
                  </span>
                  {p.wattage && <span style={{ fontSize:'11px', color:'#6b7280' }}>{p.wattage}W</span>}
                  {p.capacity_kw && <span style={{ fontSize:'11px', color:'#6b7280' }}>{p.capacity_kw}kW</span>}
                  {p.capacity_kwh && <span style={{ fontSize:'11px', color:'#6b7280' }}>{p.capacity_kwh}kWh</span>}
                  {p.warranty_years && <span style={{ fontSize:'11px', color:'#374151' }}>{p.warranty_years}yr warranty</span>}
                </div>
              </div>
              <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                <button onClick={() => startEdit(p, currentCat?.id)} style={{ padding:'5px 11px', background:'#1c1c26', border:'1px solid #ffffff10', borderRadius:'7px', fontSize:'11px', color:'#9ca3af', cursor:'pointer' }}>Edit</button>
                <button onClick={() => del(p.id, p.brand + ' ' + p.model_name)} style={{ padding:'5px 11px', background:'transparent', border:'1px solid #ef444425', borderRadius:'7px', fontSize:'11px', color:'#ef4444', cursor:'pointer' }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
