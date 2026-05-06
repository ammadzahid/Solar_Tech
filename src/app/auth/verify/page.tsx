'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function VerifyContent() {
  const params = useSearchParams()
  const email = params.get('email') ?? ''

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'16px', background:'linear-gradient(135deg,#0a0a0f 0%,#1a1025 100%)',
      fontFamily:"system-ui,sans-serif"
    }}>
      <div style={{width:'100%',maxWidth:'440px',textAlign:'center'}}>
        <div style={{fontSize:'64px',marginBottom:'24px'}}>✅</div>
        <div style={{fontSize:'28px',fontWeight:'900',color:'#f5a623',marginBottom:'8px'}}>
          Account Created!
        </div>
        <div style={{
          background:'#13131a', border:'1px solid #ffffff15',
          borderRadius:'20px', padding:'32px', marginTop:'24px'
        }}>
          <p style={{color:'#9ca3af',fontSize:'14px',lineHeight:'1.7',marginBottom:'20px'}}>
            Account ban gaya <strong style={{color:'white'}}>{email}</strong> ke liye.
          </p>

          <div style={{
            background:'#1c1c26', border:'1px solid #f5a62330',
            borderRadius:'12px', padding:'16px', marginBottom:'24px',
            textAlign:'left'
          }}>
            <div style={{fontSize:'12px',fontWeight:'700',color:'#f5a623',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.5px'}}>
              Next Steps
            </div>
            <div style={{fontSize:'13px',color:'#9ca3af',lineHeight:'1.8'}}>
              1. Admin approval ka wait karo<br/>
              2. Approval ke baad login kar sakte ho<br/>
              3. Payment instructions email pe aayengi
            </div>
          </div>

          <Link href="/auth/login" style={{
            display:'block', width:'100%', padding:'13px',
            background:'#f5a623', border:'none', borderRadius:'12px',
            fontSize:'14px', fontWeight:'700', color:'#000',
            textDecoration:'none', textAlign:'center'
          }}>
            Login Page Pe Jao
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
