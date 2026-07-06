'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin', label: '📊 Dashboard', exact: true },
  { href: '/admin/approvals', label: '✅ Approvals' },
  { href: '/admin/users', label: '👥 Companies' },
  { href: '/dashboard/calculator', label: '🔢 Calculator' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    document.cookie = 'sp_session_token=; path=/; max-age=0'
    router.push('/auth/login')
  }

  return (
    <div style={{ width:'220px', background:'#13131a', borderRight:'1px solid #ffffff12', display:'flex', flexDirection:'column', flexShrink:0 }}>
      <div style={{ padding:'24px 20px', borderBottom:'1px solid #ffffff12' }}>
        <div style={{ fontSize:'18px', fontWeight:'900', color:'#f5a623' }}>SolarPro</div>
        <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'2px' }}>Admin Panel</div>
      </div>
      <nav style={{ flex:1, padding:'12px 8px' }}>
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display:'block', padding:'10px 12px', borderRadius:'10px', marginBottom:'4px',
              fontSize:'13px', fontWeight: active ? '700' : '400',
              color: active ? '#f5a623' : '#9ca3af',
              background: active ? '#f5a62315' : 'transparent',
              textDecoration:'none', border: active ? '1px solid #f5a62330' : '1px solid transparent'
            }}>{item.label}</Link>
          )
        })}
      </nav>
      <div style={{ padding:'12px 8px', borderTop:'1px solid #ffffff12' }}>
        <button onClick={logout} style={{
          width:'100%', padding:'10px 12px', borderRadius:'10px',
          background:'transparent', border:'1px solid transparent',
          color:'#6b7280', fontSize:'13px', cursor:'pointer', textAlign:'left'
        }}>🚪 Sign out</button>
      </div>
    </div>
  )
}
