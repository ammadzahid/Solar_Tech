'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

const PLANS = [
  {
    id: 'basic' as const,
    name: 'Basic',
    price: 'Rs 2,000/month',
    annual: 'Rs 20,000/year',
    color: '#f5a623',
    features: ['50 quotations/month', 'Calculator', 'Product manager', 'PDF export'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 'Rs 5,000/month',
    annual: 'Rs 50,000/year',
    color: '#00d97e',
    features: ['Unlimited quotations', 'AI Chatbot (WhatsApp prices)', 'Priority support', 'All Basic features'],
  },
]

const PAYMENT_METHODS = [
  { id:'jazzcash', name:'JazzCash', number:'0300-1234567', account:'Solar Pro Payments', color:'#00b04f', icon:'💚' },
  { id:'easypaisa', name:'EasyPaisa', number:'0333-1234567', account:'Solar Pro Payments', color:'#0066cc', icon:'💙' },
  { id:'bank', name:'Bank Transfer', number:'MCB: 1234-5678-9012', account:'Solar Solutions Pvt Ltd', color:'#6b7280', icon:'🏦' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1|2|3>(1)
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'basic'|'pro'>('basic')
  const [selectedMethod, setSelectedMethod] = useState('jazzcash')
  const [companyId, setCompanyId] = useState('')

  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    company_name: '', city: '', phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.full_name || form.full_name.length < 2) e.full_name = 'Name required'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.password || form.password.length < 8) e.password = 'Min 8 characters'
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    if (!form.company_name || form.company_name.length < 2) e.company_name = 'Company name required'
    if (!form.city) e.city = 'City required'
    if (!form.phone || form.phone.length < 10) e.phone = 'Valid phone required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const register = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan: selectedPlan }),
      })
      const d = await res.json()
      if (!d.ok) { toast.error(d.error); return }
      setCompanyId(d.data.company_id)
      setStep(3)
    } catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }

  const s = { fontFamily:'system-ui,sans-serif' }
  const inp = (err?: string) => ({
    width:'100%', padding:'11px 14px', background:'#1c1c26',
    border:`1px solid ${err ? '#ef4444' : '#ffffff15'}`, borderRadius:'10px',
    fontSize:'14px', color:'white', outline:'none', boxSizing:'border-box' as const,
    fontFamily:'system-ui,sans-serif'
  })
  const lbl = { display:'block' as const, fontSize:'11px', fontWeight:'600' as const, color:'#9ca3af', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'5px' }
  const errMsg = (f: string) => errors[f] ? <p style={{ color:'#ef4444', fontSize:'11px', marginTop:'3px' }}>{errors[f]}</p> : null

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a0f 0%,#1a1025 100%)', padding:'24px 16px', ...s }}>
      <div style={{ maxWidth:'560px', margin:'0 auto' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'28px', fontWeight:'900', color:'#f5a623' }}>SolarPro</div>
          <p style={{ color:'#6b7280', fontSize:'13px', marginTop:'4px' }}>Solar Business Management</p>
        </div>

        {/* Steps */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'28px' }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{
                width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'12px', fontWeight:'700',
                background: step >= n ? '#f5a623' : '#1c1c26',
                color: step >= n ? '#000' : '#374151',
                border: step >= n ? 'none' : '1px solid #ffffff15'
              }}>{n}</div>
              {n < 3 && <div style={{ width:'40px', height:'1px', background: step > n ? '#f5a623' : '#1c1c26' }} />}
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', fontSize:'12px', color:'#6b7280', marginBottom:'24px' }}>
          {step === 1 ? 'Plan chuno' : step === 2 ? 'Account banao' : 'Payment karo'}
        </div>

        <div style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'20px', padding:'28px' }}>

          {/* ─── STEP 1: Plan ─── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize:'18px', fontWeight:'800', color:'white', marginBottom:'6px' }}>Plan chuno</h2>
              <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'20px' }}>Apni company ke liye best plan select karo</p>
              <div style={{ display:'grid', gap:'12px', marginBottom:'24px' }}>
                {PLANS.map(plan => (
                  <div key={plan.id} onClick={() => setSelectedPlan(plan.id)} style={{
                    padding:'18px', borderRadius:'14px', cursor:'pointer',
                    border: selectedPlan === plan.id ? `2px solid ${plan.color}` : '1px solid #ffffff12',
                    background: selectedPlan === plan.id ? plan.color + '10' : '#1c1c26',
                    transition:'all .15s'
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                      <div>
                        <div style={{ fontSize:'16px', fontWeight:'800', color:'white' }}>{plan.name}</div>
                        <div style={{ fontSize:'14px', fontWeight:'700', color:plan.color, marginTop:'2px' }}>{plan.price}</div>
                        <div style={{ fontSize:'11px', color:'#374151', marginTop:'1px' }}>{plan.annual} annually</div>
                      </div>
                      <div style={{
                        width:'20px', height:'20px', borderRadius:'50%', flexShrink:0,
                        border: selectedPlan === plan.id ? 'none' : '2px solid #374151',
                        background: selectedPlan === plan.id ? plan.color : 'transparent',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px'
                      }}>{selectedPlan === plan.id ? '✓' : ''}</div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px' }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ fontSize:'11px', color:'#9ca3af', display:'flex', alignItems:'center', gap:'4px' }}>
                          <span style={{ color:plan.color }}>✓</span> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} style={{
                width:'100%', padding:'13px', background:'#f5a623', border:'none',
                borderRadius:'12px', fontSize:'14px', fontWeight:'700', color:'#000', cursor:'pointer'
              }}>Continue →</button>
            </div>
          )}

          {/* ─── STEP 2: Register ─── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize:'18px', fontWeight:'800', color:'white', marginBottom:'6px' }}>Account banao</h2>
              <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'20px' }}>
                Plan: <span style={{ color:'#f5a623', fontWeight:'700' }}>{selectedPlan === 'basic' ? 'Basic — Rs 2,000/month' : 'Pro — Rs 5,000/month'}</span>
              </p>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div>
                  <label style={lbl}>Full Name</label>
                  <input style={inp(errors.full_name)} value={form.full_name} onChange={e => setForm({...form, full_name:e.target.value})} placeholder="Ahmad Ali" />
                  {errMsg('full_name')}
                </div>
                <div>
                  <label style={lbl}>Phone</label>
                  <input style={inp(errors.phone)} value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="03001234567" />
                  {errMsg('phone')}
                </div>
              </div>

              <div style={{ marginBottom:'12px' }}>
                <label style={lbl}>Email</label>
                <input style={inp(errors.email)} type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@company.com" />
                {errMsg('email')}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div>
                  <label style={lbl}>Password</label>
                  <input style={inp(errors.password)} type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="Min 8 characters" />
                  {errMsg('password')}
                </div>
                <div>
                  <label style={lbl}>Confirm Password</label>
                  <input style={inp(errors.confirm_password)} type="password" value={form.confirm_password} onChange={e => setForm({...form, confirm_password:e.target.value})} placeholder="Same as above" />
                  {errMsg('confirm_password')}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
                <div>
                  <label style={lbl}>Company Name</label>
                  <input style={inp(errors.company_name)} value={form.company_name} onChange={e => setForm({...form, company_name:e.target.value})} placeholder="Chiniot Solar Solutions" />
                  {errMsg('company_name')}
                </div>
                <div>
                  <label style={lbl}>City</label>
                  <input style={inp(errors.city)} value={form.city} onChange={e => setForm({...form, city:e.target.value})} placeholder="Chiniot" />
                  {errMsg('city')}
                </div>
              </div>

              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={() => setStep(1)} style={{ padding:'13px 20px', background:'transparent', border:'1px solid #ffffff15', borderRadius:'12px', fontSize:'14px', color:'#6b7280', cursor:'pointer' }}>← Back</button>
                <button onClick={register} disabled={loading} style={{ flex:1, padding:'13px', background: loading ? '#d97706' : '#f5a623', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:'700', color:'#000', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Creating account...' : 'Create Account →'}
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Payment ─── */}
          {step === 3 && (
            <div>
              <div style={{ textAlign:'center', marginBottom:'20px' }}>
                <div style={{ fontSize:'40px', marginBottom:'8px' }}>🎉</div>
                <h2 style={{ fontSize:'18px', fontWeight:'800', color:'white', marginBottom:'4px' }}>Account ban gaya!</h2>
                <p style={{ color:'#6b7280', fontSize:'13px' }}>Ab payment karo aur activate karo</p>
              </div>

              {/* Amount */}
              <div style={{ background:'#f5a62312', border:'1px solid #f5a62330', borderRadius:'12px', padding:'14px 16px', marginBottom:'18px', textAlign:'center' }}>
                <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Amount to pay</div>
                <div style={{ fontSize:'26px', fontWeight:'900', color:'#f5a623' }}>
                  {selectedPlan === 'basic' ? 'Rs 2,000' : 'Rs 5,000'}
                </div>
                <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'2px' }}>1 month — {selectedPlan} plan</div>
              </div>

              {/* Payment methods */}
              <div style={{ marginBottom:'18px' }}>
                <div style={{ fontSize:'12px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>Payment method chuno:</div>
                {PAYMENT_METHODS.map(m => (
                  <div key={m.id} onClick={() => setSelectedMethod(m.id)} style={{
                    padding:'14px 16px', borderRadius:'11px', marginBottom:'8px', cursor:'pointer',
                    border: selectedMethod === m.id ? `1.5px solid ${m.color}` : '1px solid #ffffff12',
                    background: selectedMethod === m.id ? m.color + '10' : '#1c1c26',
                    transition:'all .15s'
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <span style={{ fontSize:'20px' }}>{m.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'13px', fontWeight:'700', color:'white' }}>{m.name}</div>
                        <div style={{ fontSize:'12px', color: selectedMethod === m.id ? m.color : '#6b7280', marginTop:'2px', fontFamily:'monospace' }}>{m.number}</div>
                        <div style={{ fontSize:'11px', color:'#374151', marginTop:'1px' }}>Account: {m.account}</div>
                      </div>
                      {selectedMethod === m.id && (
                        <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'#000', fontWeight:'700' }}>✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div style={{ background:'#1c1c26', border:'1px solid #ffffff10', borderRadius:'11px', padding:'14px 16px', marginBottom:'18px' }}>
                <div style={{ fontSize:'12px', fontWeight:'700', color:'white', marginBottom:'8px' }}>Payment steps:</div>
                <div style={{ fontSize:'12px', color:'#9ca3af', lineHeight:'1.9' }}>
                  1. Upar diye number pe <strong style={{ color:'white' }}>{selectedPlan === 'basic' ? 'Rs 2,000' : 'Rs 5,000'}</strong> bhejo<br/>
                  2. Transaction ID ya screenshot save karo<br/>
                  3. WhatsApp karo: <strong style={{ color:'#f5a623' }}>03XX-XXXXXXX</strong><br/>
                  &nbsp;&nbsp;&nbsp;Message mein likho: Company name + transaction ID<br/>
                  4. <strong style={{ color:'white' }}>24 ghante mein</strong> account activate ho jaayega
                </div>
              </div>

              <div style={{ background:'#00d97e10', border:'1px solid #00d97e20', borderRadius:'10px', padding:'12px 14px', marginBottom:'18px' }}>
                <div style={{ fontSize:'12px', color:'#00d97e' }}>
                  ✅ Account create ho gaya — payment ke baad admin approve karega aur login kar sakoge
                </div>
              </div>

              <Link href="/auth/login" style={{
                display:'block', width:'100%', padding:'13px', background:'#f5a623',
                border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:'700',
                color:'#000', textDecoration:'none', textAlign:'center'
              }}>
                Login Page Pe Jao
              </Link>
            </div>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:'12px', color:'#374151', marginTop:'16px' }}>
          Already registered? <Link href="/auth/login" style={{ color:'#f5a623', textDecoration:'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
