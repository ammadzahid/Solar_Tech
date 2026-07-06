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

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const logout = async () => {
    await fetch('/api/auth/logout', { method:'POST' })
    document.cookie = 'sp_session_token=; path=/; max-age=0'
    router.push('/auth/login')
    toast.success('Logged out')
  }

  const SidebarContent = () => (
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
    <>
      <div style={{ flexShrink:0 }}>
        <SidebarContent />
      </div>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'#00000080', zIndex:40 }} />
      )}
    </>
  )
}
