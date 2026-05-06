'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'

const STATUS_COLOR: Record<string, string> = {
  draft:'#6b7280', sent:'#f5a623', accepted:'#00d97e', rejected:'#ef4444', expired:'#374151'
}
const SYS_LABEL: Record<string, string> = {
  ongrid:'On-Grid (Net Metering)', hybrid:'Hybrid (Battery Backup)',
  offgrid:'Off-Grid', tubwell:'Tube Well / Agricultural'
}

export default function QuotationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [q, setQ] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')

  useEffect(() => {
    fetch('/api/quotations/' + id).then(r => r.json()).then(d => {
      if (d.ok) setQ(d.data)
      else toast.error('Quotation not found')
      setLoading(false)
    })
    // Get company info
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.ok && d.data) { setCompanyName(d.data.name ?? ''); setCompanyPhone(d.data.phone ?? '') }
    })
  }, [id])

  const openPDF = () => {
    const url = `/api/quotations/pdf?id=${id}&company=${encodeURIComponent(companyName)}&phone=${encodeURIComponent(companyPhone)}`
    window.open(url, '_blank')
  }

  const updateStatus = async (status: string) => {
    const r = await fetch('/api/quotations/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const d = await r.json()
    if (d.ok) { toast.success('Status updated'); setQ({ ...q, status }) }
    else toast.error(d.error)
  }

  if (loading) return <div style={{ color:'#6b7280', fontFamily:'system-ui,sans-serif' }}>Loading...</div>
  if (!q) return <div style={{ color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>Quotation not found</div>

  const items = q.line_items ?? []
  const st = q.status

  return (
    <div style={{ maxWidth:'700px', fontFamily:'system-ui,sans-serif' }}>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button onClick={() => router.back()} style={{ background:'transparent', border:'none', color:'#6b7280', cursor:'pointer', fontSize:'20px' }}>←</button>
          <div>
            <h1 style={{ fontSize:'20px', fontWeight:'800', color:'white', margin:0 }}>{q.client_name}</h1>
            <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'2px' }}>{q.client_address} · {new Date(q.created_at).toLocaleDateString('en-PK')}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={openPDF} style={{
            padding:'9px 18px', background:'#f5a623', border:'none',
            borderRadius:'9px', fontSize:'13px', fontWeight:'700', color:'#000', cursor:'pointer'
          }}>🖨️ Print / PDF</button>
          <span style={{ fontSize:'11px', fontWeight:'700', padding:'9px 12px', borderRadius:'9px',
            background:(STATUS_COLOR[st]??'#6b7280')+'20', color:STATUS_COLOR[st]??'#6b7280',
            border:`1px solid ${STATUS_COLOR[st]??'#6b7280'}30` }}>{st}</span>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'16px' }}>
        {[
          { label:'System Size', value:q.system_kw + ' kW', sub: SYS_LABEL[q.system_type] ?? q.system_type },
          { label:'Total Price', value:'Rs ' + Math.round(q.total_price).toLocaleString(), sub:'Advance: Rs ' + Math.round(q.advance_amount).toLocaleString() },
          { label:'Valid Until', value:q.expires_at ? new Date(q.expires_at).toLocaleDateString('en-PK') : '—', sub:q.valid_days + ' days' },
        ].map(c => (
          <div key={c.label} style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'11px', padding:'14px' }}>
            <div style={{ fontSize:'10px', color:'#6b7280', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{c.label}</div>
            <div style={{ fontSize:'14px', fontWeight:'800', color:'#f5a623' }}>{c.value}</div>
            <div style={{ fontSize:'11px', color:'#374151', marginTop:'2px' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Client info */}
      <div style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'12px', padding:'16px', marginBottom:'12px' }}>
        <div style={{ fontSize:'11px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>Client</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', fontSize:'13px' }}>
          <div><span style={{ color:'#6b7280' }}>Naam: </span><span style={{ color:'white', fontWeight:'600' }}>{q.client_name}</span></div>
          <div><span style={{ color:'#6b7280' }}>Phone: </span><span style={{ color:'white', fontWeight:'600' }}>{q.client_phone}</span></div>
          <div style={{ gridColumn:'1/-1' }}><span style={{ color:'#6b7280' }}>Address: </span><span style={{ color:'white' }}>{q.client_address}</span></div>
        </div>
      </div>

      {/* Line items */}
      <div style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'12px', overflow:'hidden', marginBottom:'12px' }}>
        <div style={{ fontSize:'11px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', padding:'14px 16px', borderBottom:'1px solid #ffffff08' }}>Items</div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#1c1c26' }}>
              {['Item','Brand','Qty','Total'].map(h => (
                <th key={h} style={{ padding:'9px 12px', textAlign: h==='Total'||h==='Qty' ? 'right' : 'left', fontSize:'10px', color:'#6b7280', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, i: number) => (
              <tr key={i} style={{ borderBottom:'1px solid #ffffff08' }}>
                <td style={{ padding:'10px 12px', fontSize:'12px', fontWeight:'600', color:'white' }}>{item.model_name}</td>
                <td style={{ padding:'10px 12px', fontSize:'12px', color:'#6b7280' }}>{item.brand}</td>
                <td style={{ padding:'10px 12px', fontSize:'12px', color:'#6b7280', textAlign:'right' }}>{item.quantity}</td>
                <td style={{ padding:'10px 12px', fontSize:'12px', fontWeight:'700', color:'#f5a623', textAlign:'right' }}>Rs {Math.round(item.total_price).toLocaleString()}</td>
              </tr>
            ))}
            <tr style={{ background:'#fef3c710', borderTop:'2px solid #f5a62330' }}>
              <td colSpan={3} style={{ padding:'12px', fontSize:'13px', fontWeight:'800', color:'#f5a623' }}>TOTAL</td>
              <td style={{ padding:'12px', fontSize:'15px', fontWeight:'900', color:'#f5a623', textAlign:'right' }}>Rs {Math.round(q.total_price).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
        {[
          { label:`Advance (${q.advance_percent}%)`, amount: q.advance_amount, sub:'On order confirmation' },
          { label:`Balance (${100-q.advance_percent}%)`, amount: q.remaining_amount, sub:'After installation' },
        ].map(p => (
          <div key={p.label} style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'11px', padding:'14px', textAlign:'center' }}>
            <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'4px' }}>{p.label}</div>
            <div style={{ fontSize:'17px', fontWeight:'800', color:'white' }}>Rs {Math.round(p.amount).toLocaleString()}</div>
            <div style={{ fontSize:'10px', color:'#374151', marginTop:'2px' }}>{p.sub}</div>
          </div>
        ))}
      </div>

      {/* Status update */}
      <div style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
        <div style={{ fontSize:'11px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>Status Update</div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {['draft','sent','accepted','rejected'].map(s => (
            <button key={s} onClick={() => updateStatus(s)} style={{
              padding:'7px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer', border:'none',
              background: st===s ? (STATUS_COLOR[s]??'#6b7280') : (STATUS_COLOR[s]??'#6b7280')+'20',
              color: st===s ? (s==='sent'?'#000':'#000') : (STATUS_COLOR[s]??'#6b7280')
            }}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
          ))}
        </div>
      </div>

      {q.notes && (
        <div style={{ background:'#fffbeb20', border:'1px solid #f5a62325', borderRadius:'11px', padding:'14px', fontSize:'13px', color:'#9ca3af' }}>
          <strong style={{ color:'#f5a623' }}>Notes: </strong>{q.notes}
        </div>
      )}
    </div>
  )
}
