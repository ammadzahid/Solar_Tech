'use client'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ChatbotPage() {
  const [text, setText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [applying, setApplying] = useState(false)
  const [parseResult, setParseResult] = useState<any>(null)
  const [applied, setApplied] = useState(false)

  const parse = async () => {
    if (text.trim().length < 10) { toast.error('WhatsApp message paste karo'); return }
    setParsing(true)
    setParseResult(null)
    setApplied(false)
    const r = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    const d = await r.json()
    if (d.ok) setParseResult(d.data)
    else toast.error(d.error)
    setParsing(false)
  }

  const applyPrices = async () => {
    if (!parseResult?.price_updates?.length) return
    setApplying(true)
    const r = await fetch('/api/chatbot', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: parseResult.price_updates.map((u: any) => ({ product_model_id: u.product_model_id, new_price: u.new_price })), raw_text: text }),
    })
    const d = await r.json()
    if (d.ok) {
      toast.success(d.data.updated_count + ' prices updated!')
      setApplied(true)
    } else {
      toast.error(d.error)
    }
    setApplying(false)
  }

  const confColor = { high:'#00d97e', medium:'#f5a623', low:'#ef4444' }

  return (
    <div style={{ maxWidth:'680px', fontFamily:'system-ui,sans-serif' }}>
      <h1 style={{ fontSize:'22px', fontWeight:'800', color:'white', marginBottom:'4px' }}>AI Price Chatbot</h1>
      <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'24px' }}>Dealer ka WhatsApp message paste karo — AI automatically prices update kar dega</p>

      {/* How it works */}
      <div style={{ background:'#f5a62310', border:'1px solid #f5a62325', borderRadius:'12px', padding:'14px 16px', marginBottom:'20px' }}>
        <div style={{ fontSize:'12px', fontWeight:'700', color:'#f5a623', marginBottom:'6px' }}>Kaise kaam karta hai?</div>
        <div style={{ fontSize:'12px', color:'#9ca3af', lineHeight:'1.7' }}>
          1. Dealer ka message copy karo WhatsApp se<br/>
          2. Yahan paste karo<br/>
          3. "Parse Karo" dabao — AI prices nikalega<br/>
          4. Review karo aur "Apply" dabao — DB update ho jaayega
        </div>
      </div>

      {/* Example */}
      <div style={{ background:'#1c1c26', border:'1px solid #ffffff10', borderRadius:'10px', padding:'12px 14px', marginBottom:'16px' }}>
        <div style={{ fontSize:'10px', color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Example message:</div>
        <div style={{ fontSize:'12px', color:'#6b7280', lineHeight:'1.6', fontFamily:'monospace' }}>
          "Longi 580W - 32/W<br/>
          Growatt 10kW - 195,000<br/>
          Pylontech US5000 - 185,000"
        </div>
        <button onClick={() => setText('Longi 580W - 32/W\nGrowatt 10kW - 195,000\nPylontech US5000 - 185,000')} style={{ marginTop:'8px', padding:'4px 10px', background:'transparent', border:'1px solid #ffffff15', borderRadius:'6px', fontSize:'11px', color:'#6b7280', cursor:'pointer' }}>
          Example Use Karo
        </button>
      </div>

      {/* Input */}
      <div style={{ marginBottom:'12px' }}>
        <label style={{ display:'block', fontSize:'11px', fontWeight:'600', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>
          Dealer Ka Message
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="WhatsApp se message copy karke yahan paste karo..."
          style={{ width:'100%', minHeight:'140px', padding:'12px 14px', background:'#13131a', border:'1px solid #ffffff15', borderRadius:'11px', fontSize:'13px', color:'white', outline:'none', resize:'vertical', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' }}
        />
      </div>

      <button onClick={parse} disabled={parsing} style={{
        width:'100%', padding:'13px', background: parsing ? '#d97706' : '#f5a623',
        border:'none', borderRadius:'11px', fontSize:'14px', fontWeight:'700',
        color:'#000', cursor: parsing ? 'not-allowed' : 'pointer', marginBottom:'20px'
      }}>
        {parsing ? '🤖 AI Parse Kar Raha Hai...' : '🤖 Parse Karo'}
      </button>

      {/* Results */}
      {parseResult && (
        <div>
          {parseResult.price_updates?.length > 0 ? (
            <div>
              <div style={{ fontSize:'13px', fontWeight:'700', color:'white', marginBottom:'12px' }}>
                {parseResult.price_updates.length} prices mili hain — review karo:
              </div>
              {parseResult.price_updates.map((u: any, i: number) => (
                <div key={i} style={{ background:'#13131a', border:'1px solid #ffffff12', borderRadius:'11px', padding:'14px 16px', marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:'600', color:'white' }}>{u.brand} {u.model_name}</div>
                    <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'3px', display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ textDecoration:'line-through' }}>Rs {u.old_price?.toLocaleString()}</span>
                      <span style={{ color:'#f5a623' }}>→ Rs {u.new_price?.toLocaleString()}</span>
                    </div>
                  </div>
                  <span style={{ fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'6px', background: (confColor as any)[u.confidence] + '20', color: (confColor as any)[u.confidence] }}>
                    {u.confidence}
                  </span>
                </div>
              ))}

              {parseResult.unrecognized?.length > 0 && (
                <div style={{ background:'#ef444415', border:'1px solid #ef444430', borderRadius:'10px', padding:'12px 14px', marginBottom:'12px' }}>
                  <div style={{ fontSize:'11px', fontWeight:'700', color:'#ef4444', marginBottom:'6px' }}>Match nahi hua:</div>
                  {parseResult.unrecognized.map((u: string, i: number) => (
                    <div key={i} style={{ fontSize:'12px', color:'#9ca3af' }}>• {u}</div>
                  ))}
                </div>
              )}

              {!applied ? (
                <button onClick={applyPrices} disabled={applying} style={{
                  width:'100%', padding:'13px', background: applying ? '#1a4d2e' : '#00d97e',
                  border:'none', borderRadius:'11px', fontSize:'14px', fontWeight:'700',
                  color:'#000', cursor: applying ? 'not-allowed' : 'pointer'
                }}>
                  {applying ? 'Updating...' : '✅ Apply Karo — Prices Update Ho Jayen Gi'}
                </button>
              ) : (
                <div style={{ background:'#00d97e15', border:'1px solid #00d97e30', borderRadius:'11px', padding:'14px', textAlign:'center' }}>
                  <div style={{ fontSize:'20px', marginBottom:'4px' }}>✅</div>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:'#00d97e' }}>Prices updated successfully!</div>
                  <button onClick={() => { setText(''); setParseResult(null); setApplied(false) }} style={{ marginTop:'10px', padding:'6px 16px', background:'transparent', border:'1px solid #00d97e40', borderRadius:'8px', fontSize:'12px', color:'#6b7280', cursor:'pointer' }}>New Update</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background:'#ef444415', border:'1px solid #ef444430', borderRadius:'11px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'13px', color:'#ef4444' }}>Koi matching product nahi mila — message check karo ya manually update karo</div>
              <a href="/dashboard/products" style={{ display:'inline-block', marginTop:'10px', padding:'6px 16px', background:'transparent', border:'1px solid #ef444440', borderRadius:'8px', fontSize:'12px', color:'#6b7280', textDecoration:'none' }}>Manual Update Karo</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
