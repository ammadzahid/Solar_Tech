'use client'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ companies: 0, pending: 0, active: 0 })

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(r => {
      if (r.ok) setStats(r.data)
    }).catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Companies', value: stats.companies, color: '#f5a623', icon: '🏢' },
    { label: 'Pending Approval', value: stats.pending, color: '#ef4444', icon: '⏳' },
    { label: 'Active Subscriptions', value: stats.active, color: '#00d97e', icon: '✅' },
  ]

  return (
    <div>
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'800', color:'white', margin:0 }}>Admin Dashboard</h1>
        <p style={{ color:'#6b7280', fontSize:'13px', marginTop:'4px' }}>SolarPro management panel</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'32px' }}>
        {cards.map(c => (
          <div key={c.label} style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'16px', padding:'20px' }}>
            <div style={{ fontSize:'28px', marginBottom:'8px' }}>{c.icon}</div>
            <div style={{ fontSize:'28px', fontWeight:'800', color:c.color }}>{c.value}</div>
            <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'4px' }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'16px', padding:'20px' }}>
        <h2 style={{ color:'white', fontSize:'16px', fontWeight:'700', marginBottom:'16px' }}>Quick Actions</h2>
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
          <a href="/admin/approvals" style={{ padding:'10px 20px', background:'#f5a623', color:'#000', borderRadius:'10px', textDecoration:'none', fontSize:'13px', fontWeight:'700' }}>
            View Pending Approvals
          </a>
          <a href="/admin/users" style={{ padding:'10px 20px', background:'#1c1c26', color:'#9ca3af', borderRadius:'10px', textDecoration:'none', fontSize:'13px', border:'1px solid #ffffff15' }}>
            Manage Companies
          </a>
        </div>
      </div>
    </div>
  )
}
