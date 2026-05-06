'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ApprovalsPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/approvals')
    const d = await r.json()
    if (d.ok) setCompanies(d.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const action = async (id: string, act: string) => {
    const r = await fetch('/api/admin/approvals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: id, action: act }),
    })
    const d = await r.json()
    if (d.ok) { toast.success(act === 'approve' ? 'Approved! User can now login.' : 'Done'); load() }
    else toast.error(d.error)
  }

  const planColor = { basic:'#f5a623', pro:'#00d97e', trial:'#6b7280' }

  if (loading) return <div style={{ color:'#6b7280', fontFamily:'system-ui,sans-serif' }}>Loading...</div>

  return (
    <div style={{ fontFamily:'system-ui,sans-serif' }}>
      <h1 style={{ fontSize:'22px', fontWeight:'800', color:'white', marginBottom:'4px' }}>Pending Approvals</h1>
      <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'24px' }}>
        {companies.length} companies waiting — payment confirm karo phir approve karo
      </p>

      {companies.length === 0 && (
        <div style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'16px', padding:'48px', textAlign:'center' }}>
          <div style={{ fontSize:'36px', marginBottom:'10px' }}>✅</div>
          <div style={{ color:'white', fontWeight:'700' }}>No pending approvals</div>
          <div style={{ color:'#6b7280', fontSize:'13px', marginTop:'4px' }}>Sab companies approved hain</div>
        </div>
      )}

      {companies.map((c: any) => {
        const owner = c.profiles?.[0]
        const plan = c.subscription_plan as keyof typeof planColor
        return (
          <div key={c.id} style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'16px', padding:'20px', marginBottom:'14px' }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
                  <span style={{ fontSize:'17px', fontWeight:'800', color:'white' }}>{c.name}</span>
                  <span style={{ fontSize:'10px', fontWeight:'700', padding:'3px 9px', borderRadius:'6px', background:(planColor[plan] ?? '#6b7280') + '20', color:planColor[plan] ?? '#6b7280' }}>
                    {c.subscription_plan} plan
                  </span>
                </div>
                <div style={{ fontSize:'12px', color:'#6b7280' }}>{c.city} · {c.phone}</div>
              </div>
              <div style={{ fontSize:'11px', color:'#374151' }}>
                {new Date(c.created_at).toLocaleDateString('en-PK')}
              </div>
            </div>

            {/* Owner info */}
            {owner && (
              <div style={{ background:'#1c1c26', borderRadius:'10px', padding:'12px 14px', marginBottom:'12px' }}>
                <div style={{ fontSize:'11px', color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Owner</div>
                <div style={{ fontSize:'13px', color:'white', fontWeight:'600' }}>{owner.full_name}</div>
                <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'2px' }}>{owner.email}</div>
                <div style={{ fontSize:'12px', color:'#6b7280' }}>{owner.phone}</div>
              </div>
            )}

            {/* Payment amount expected */}
            <div style={{ background:'#f5a62310', border:'1px solid #f5a62220', borderRadius:'10px', padding:'12px 14px', marginBottom:'14px' }}>
              <div style={{ fontSize:'11px', color:'#f5a623', fontWeight:'700', marginBottom:'4px' }}>Expected Payment</div>
              <div style={{ fontSize:'15px', fontWeight:'800', color:'white' }}>
                {c.subscription_plan === 'pro' ? 'Rs 5,000' : 'Rs 2,000'}/month
              </div>
              <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'3px' }}>
                ⚠️ Payment confirm karo WhatsApp pe — phir approve karo
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => action(c.id, 'approve')} style={{
                flex:1, padding:'10px', background:'#00d97e', color:'#000',
                border:'none', borderRadius:'9px', fontSize:'13px', fontWeight:'700', cursor:'pointer'
              }}>✅ Payment Received — Approve</button>
              <button onClick={() => action(c.id, 'reject')} style={{
                padding:'10px 16px', background:'transparent', color:'#ef4444',
                border:'1px solid #ef444430', borderRadius:'9px', fontSize:'13px', cursor:'pointer'
              }}>❌ Reject</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
