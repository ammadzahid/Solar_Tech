'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.ok) setCompany(d.data)
      setLoading(false)
    })
  }, [])

  const inp = { width:'100%', padding:'10px 13px', background:'#1c1c26', border:'1px solid #ffffff15', borderRadius:'9px', fontSize:'14px', color:'white', outline:'none', boxSizing:'border-box' as const, fontFamily:'system-ui,sans-serif' }
  const lbl = { display:'block' as const, fontSize:'11px', fontWeight:'600' as const, color:'#6b7280', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'5px' }
  const card = { background:'#13131a', border:'1px solid #ffffff12', borderRadius:'14px', padding:'20px', marginBottom:'16px' }

  if (loading) return <div style={{ color:'#6b7280', fontFamily:'system-ui,sans-serif' }}>Loading...</div>

  const statusColor: Record<string, string> = { active:'#00d97e', pending_payment:'#f5a623', pending_approval:'#f5a623', suspended:'#ef4444', expired:'#6b7280' }
  const st = company?.subscription_status ?? 'pending'

  return (
    <div style={{ maxWidth:'560px', fontFamily:'system-ui,sans-serif' }}>
      <h1 style={{ fontSize:'22px', fontWeight:'800', color:'white', marginBottom:'4px' }}>Settings</h1>
      <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'24px' }}>Company info aur subscription</p>

      {/* Subscription status */}
      <div style={{ ...card, border: '1px solid ' + (statusColor[st] ?? '#6b7280') + '40' }}>
        <div style={{ fontSize:'12px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px' }}>Subscription</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'16px', fontWeight:'700', color:'white' }}>{company?.name}</div>
            <div style={{ fontSize:'13px', color:'#6b7280', marginTop:'2px' }}>Plan: <span style={{ color:'#f5a623', fontWeight:'600' }}>{company?.subscription_plan}</span></div>
          </div>
          <span style={{ fontSize:'12px', fontWeight:'700', padding:'5px 12px', borderRadius:'8px', background: (statusColor[st] ?? '#6b7280') + '20', color: statusColor[st] ?? '#6b7280' }}>
            {st}
          </span>
        </div>
        {company?.subscription_expires_at && (
          <div style={{ fontSize:'12px', color:'#374151', marginTop:'10px' }}>
            Expires: {new Date(company.subscription_expires_at).toLocaleDateString('en-PK')}
          </div>
        )}
        {st !== 'active' && (
          <div style={{ marginTop:'14px', padding:'12px', background:'#f5a62310', borderRadius:'10px', fontSize:'12px', color:'#f5a623' }}>
            Payment karo aur admin se approval lo — JazzCash/EasyPaisa available hai
          </div>
        )}
      </div>

      {/* Company info */}
      <div style={card}>
        <div style={{ fontSize:'12px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'14px' }}>Company Info</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <div><label style={lbl}>Company Naam</label><input style={{ ...inp, background:'#0a0a0f', color:'#6b7280' }} value={company?.name ?? ''} readOnly /></div>
          <div><label style={lbl}>City</label><input style={{ ...inp, background:'#0a0a0f', color:'#6b7280' }} value={company?.city ?? ''} readOnly /></div>
          <div><label style={lbl}>Phone</label><input style={{ ...inp, background:'#0a0a0f', color:'#6b7280' }} value={company?.phone ?? ''} readOnly /></div>
        </div>
        <p style={{ fontSize:'11px', color:'#374151', marginTop:'10px' }}>Company info change karne ke liye admin se contact karo</p>
      </div>

      {/* Payment info */}
      <div style={card}>
        <div style={{ fontSize:'12px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'14px' }}>Payment Info</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          {[
            { name:'JazzCash', num:'03XX XXXXXXX', color:'#00b04f' },
            { name:'EasyPaisa', num:'03XX XXXXXXX', color:'#0066cc' },
          ].map(p => (
            <div key={p.name} style={{ background:'#1c1c26', borderRadius:'10px', padding:'12px', border:'1px solid #ffffff10' }}>
              <div style={{ fontSize:'13px', fontWeight:'700', color:'white' }}>{p.name}</div>
              <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'3px' }}>{p.num}</div>
              <div style={{ fontSize:'10px', color:'#374151', marginTop:'4px' }}>Screenshot bhejo admin ko</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
