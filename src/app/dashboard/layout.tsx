export const dynamic = 'force-dynamic'

import DashboardSidebar from './DashboardSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', height:'100vh', background:'#0a0a0f', fontFamily:'system-ui,sans-serif', overflow:'hidden' }}>
      <DashboardSidebar />
      <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column' }}>
        <main style={{ flex:1, overflow:'auto', padding:'24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
