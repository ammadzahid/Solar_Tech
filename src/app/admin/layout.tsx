export const dynamic = 'force-dynamic'

import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0a0a0f', fontFamily:'system-ui,sans-serif' }}>
      <AdminSidebar />
      <div style={{ flex:1, overflow:'auto', padding:'32px' }}>{children}</div>
    </div>
  )
}
