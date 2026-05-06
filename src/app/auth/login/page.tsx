'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{email?: string; password?: string}>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!email) e.email = 'Email required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email'
    if (!password) e.password = 'Password required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const result = await res.json()
      if (!result.ok) { toast.error(result.error); return }
      document.cookie = `sp_session_token=${result.data.session_token}; path=/; max-age=${60*60*24*30}`
      toast.success('Welcome back!')
      router.push(result.data.user.role === 'superadmin' ? '/admin' : '/dashboard/calculator')
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'16px', background:'linear-gradient(135deg,#0a0a0f 0%,#1a1025 100%)',
      fontFamily:"'DM Sans',system-ui,sans-serif"
    }}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{fontSize:'36px',fontWeight:'900',color:'#f5a623',letterSpacing:'-1px'}}>
            Solar<span style={{color:'white'}}>Pro</span>
          </div>
          <p style={{color:'#6b7280',fontSize:'13px',marginTop:'6px'}}>Solar Business Management</p>
        </div>
        <div style={{background:'#13131a',border:'1px solid #ffffff15',borderRadius:'20px',padding:'32px'}}>
          <h1 style={{fontSize:'22px',fontWeight:'700',color:'white',marginBottom:'24px'}}>
            Sign in to your account
          </h1>
          <form onSubmit={onSubmit}>
            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block',fontSize:'11px',fontWeight:'600',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'6px'}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"
                style={{width:'100%',padding:'11px 14px',background:'#1c1c26',border:`1px solid ${errors.email?'#ef4444':'#ffffff15'}`,borderRadius:'10px',fontSize:'14px',color:'white',outline:'none',boxSizing:'border-box'}}/>
              {errors.email&&<p style={{color:'#ef4444',fontSize:'12px',marginTop:'4px'}}>{errors.email}</p>}
            </div>
            <div style={{marginBottom:'24px'}}>
              <label style={{display:'block',fontSize:'11px',fontWeight:'600',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'6px'}}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                style={{width:'100%',padding:'11px 14px',background:'#1c1c26',border:`1px solid ${errors.password?'#ef4444':'#ffffff15'}`,borderRadius:'10px',fontSize:'14px',color:'white',outline:'none',boxSizing:'border-box'}}/>
              {errors.password&&<p style={{color:'#ef4444',fontSize:'12px',marginTop:'4px'}}>{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'13px',background:loading?'#d97706':'#f5a623',border:'none',borderRadius:'12px',fontSize:'14px',fontWeight:'700',color:'#000',cursor:loading?'not-allowed':'pointer'}}>
              {loading?'Signing in...':'Sign in'}
            </button>
          </form>
          <div style={{marginTop:'24px',paddingTop:'24px',borderTop:'1px solid #ffffff10',textAlign:'center'}}>
            <p style={{fontSize:'13px',color:'#6b7280'}}>
              No account?{' '}
              <Link href="/auth/register" style={{color:'#f5a623',fontWeight:'600',textDecoration:'none'}}>
                Register your company
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
