'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const STATUS_COLOR: Record<string, string> = {
  draft: '#6b7280', sent: '#f5a623', accepted: '#00d97e',
  rejected: '#ef4444', expired: '#374151'
}

export default function QuotationsPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/quotations').then(r => r.json()).then(d => {
      if (d.ok) setQuotes(d.data.quotations ?? [])
      setLoading(false)
    })
  }, [])

  const s = { fontFamily:'system-ui,sans-serif' }
  const card = { background:'#13131a', border:'1px solid #ffffff12', borderRadius:'14px', padding:'18px', marginBottom:'10px', cursor:'pointer' as const, transition:'border-color .2s' }

  if (loading) return <div style={{ color:'#6b7280', ...s }}>Loading...</div>

  return (
    <div style={s}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:'800', color:'white', margin:0 }}>Quotations</h1>
          <p style={{ color:'#6b7280', fontSize:'13px', marginTop:'4px' }}>{quotes.length} total quotations</p>
        </div>
        <button onClick={() => router.push('/dashboard/quotations/new')} style={{
          padding:'10px 20px', background:'#f5a623', border:'none',
          borderRadius:'10px', fontSize:'13px', fontWeight:'700', color:'#000', cursor:'pointer'
        }}>+ New Quotation</button>
      </div>

      {quotes.length === 0 && (
        <div style={{ ...card, textAlign:'center', padding:'48px', cursor:'default' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>📋</div>
          <div style={{ color:'white', fontWeight:'700', marginBottom:'8px' }}>No quotations yet</div>
          <div style={{ color:'#6b7280', fontSize:'13px', marginBottom:'20px' }}>Calculator se calculate karke quotation banao</div>
          <button onClick={() => router.push('/dashboard/calculator')} style={{
            padding:'10px 20px', background:'#f5a623', border:'none',
            borderRadius:'10px', fontSize:'13px', fontWeight:'700', color:'#000', cursor:'pointer'
          }}>Calculator Pe Jao</button>
        </div>
      )}

      {quotes.map(q => (
        <div key={q.id} style={card} onClick={() => router.push('/dashboard/quotations/' + q.id)}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:'15px', fontWeight:'700', color:'white' }}>{q.client_name}</div>
              <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'3px' }}>
                {q.client_address} · {q.system_kw} kW · {q.system_type}
              </div>
              <div style={{ fontSize:'11px', color:'#374151', marginTop:'3px' }}>
                {new Date(q.created_at).toLocaleDateString('en-PK')}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'16px', fontWeight:'800', color:'#f5a623' }}>Rs {q.total_price?.toLocaleString()}</div>
              <div style={{ fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'6px', marginTop:'4px', display:'inline-block',
                background: STATUS_COLOR[q.status] + '20', color: STATUS_COLOR[q.status] }}>
                {q.status}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
