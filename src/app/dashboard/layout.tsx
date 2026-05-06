'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'

const NAV = [
  { href:'/dashboard/calculator', label:'Calculator',  icon:'🔢' },
  { href:'/dashboard/quotations', label:'Quotations',  icon:'📋' },
  { href:'/dashboard/products',   label:'Products',    icon:'📦' },
  { href:'/dashboard/chatbot',    label:'AI Chatbot',  icon:'🤖' },
  { href:'/dashboard/settings',   label:'Settings',    icon:'⚙️' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const logout = async () => {
    await fetch('/api/auth/logout', { method:'POST' })
    document.cookie = 'sp_session_token=; path=/; max-age=0'
    router.push('/auth/login')
    toast.success('Logged out')
  }

  const Sidebar = () => (
    <div style={{ width:'220px', background:'#13131a', borderRight:'1px solid #ffffff10', display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'22px 20px', borderBottom:'1px solid #ffffff10' }}>
        <div style={{ fontSize:'18px', fontWeight:'900', color:'#f5a623', letterSpacing:'-0.5px' }}>SolarPro</div>
        <div style={{ fontSize:'10px', color:'#374151', marginTop:'2px' }}>Business Management</div>
      </div>
      <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'10px 12px', borderRadius:'10px', marginBottom:'3px',
              fontSize:'13px', fontWeight: active ? '700' : '400',
              color: active ? '#f5a623' : '#6b7280',
              background: active ? '#f5a62312' : 'transparent',
              border: active ? '1px solid #f5a62225' : '1px solid transparent',
              textDecoration:'none', transition:'all .15s'
            }}>
              <span style={{ fontSize:'15px' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding:'10px 8px', borderTop:'1px solid #ffffff10' }}>
        <button onClick={logout} style={{
          width:'100%', display:'flex', alignItems:'center', gap:'10px',
          padding:'10px 12px', borderRadius:'10px', background:'transparent',
          border:'1px solid transparent', color:'#6b7280', fontSize:'13px',
          cursor:'pointer', fontFamily:'system-ui,sans-serif'
        }}>
          <span>🚪</span> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', height:'100vh', background:'#0a0a0f', fontFamily:'system-ui,sans-serif', overflow:'hidden' }}>
      {/* Desktop sidebar */}
      <div style={{ display:'none' }} className="desktop-sidebar">
        <Sidebar />
      </div>
      {/* Always show sidebar on desktop */}
      <div style={{ flexShrink:0 }}>
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'#00000080', zIndex:40 }} />
      )}

      {/* Main */}
      <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column' }}>
        {/* Mobile topbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid #ffffff10', background:'#13131a' }}>
          <button onClick={() => setMobileOpen(true)} style={{ background:'transparent', border:'none', color:'#6b7280', cursor:'pointer', fontSize:'20px' }}>☰</button>
          <span style={{ fontWeight:'900', color:'#f5a623', fontSize:'16px' }}>SolarPro</span>
          <div style={{ width:'24px' }} />
        </div>
        <main style={{ flex:1, overflow:'auto', padding:'24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
