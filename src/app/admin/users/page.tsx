'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function UsersPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/companies').then(r => r.json()).then(d => {
      if (d.ok) setCompanies(d.data)
      setLoading(false)
    })
  }, [])

  const suspend = async (id: string) => {
    const r = await fetch('/api/admin/approvals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: id, action: 'suspend' }),
    })
    const d = await r.json()
    if (d.ok) toast.success('Suspended')
    else toast.error(d.error)
  }

  const statusColor: Record<string, string> = {
    active: '#00d97e', pending_payment: '#f5a623',
    pending_approval: '#f5a623', suspended: '#ef4444', expired: '#6b7280'
  }

  if (loading) return <div style={{ color:'#6b7280' }}>Loading...</div>

  return (
    <div>
      <h1 style={{ fontSize:'24px', fontWeight:'800', color:'white', marginBottom:'8px' }}>All Companies</h1>
      <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'24px' }}>{companies.length} total</p>
      {companies.map(c => (
        <div key={c.id} style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'14px', padding:'18px', marginBottom:'10px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'15px', fontWeight:'700', color:'white' }}>{c.name}</span>
                <span style={{ fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'6px', background: statusColor[c.subscription_status] + '20', color: statusColor[c.subscription_status] }}>
                  {c.subscription_status}
                </span>
              </div>
              <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'4px' }}>
                {c.city} · {c.phone} · {c.subscription_plan} plan
              </div>
            </div>
            {c.subscription_status === 'active' && (
              <button onClick={() => suspend(c.id)} style={{
                padding:'6px 14px', background:'transparent', color:'#ef4444',
                border:'1px solid #ef444440', borderRadius:'8px', fontSize:'12px', cursor:'pointer'
              }}>Suspend</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
