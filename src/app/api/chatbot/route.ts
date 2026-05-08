import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function parseText(text: string) {
  const results: Array<{ brand: string; model: string; price: number; raw: string }> = []
  const lines = text.split('\n').filter((l: string) => l.trim())
  for (const line of lines) {
    const priceMatch = line.match(/[\d,]+(?:\.\d+)?/)
    if (!priceMatch) continue
    const price = parseFloat(priceMatch[0].replace(/,/g, ''))
    if (!price || price < 1) continue
    const cleanLine = line.replace(/[-:–|]/g, ' ').trim()
    const words = cleanLine.split(/\s+/).filter((w: string) => !w.match(/^\d/) && w.length > 1)
    const brand = words[0] ?? 'Unknown'
    const model = words.slice(1, 3).join(' ') || ''
    results.push({ brand: brand.toLowerCase(), model: model.toLowerCase(), price, raw: line.trim() })
  }
  return results
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text || text.length < 5) {
      return NextResponse.json({ ok: false, error: 'Text required' }, { status: 400 })
    }

    const admin = getAdmin()
    const { data: products, error } = await admin
      .from('product_models')
      .select('id, brand, model_name, price_per_unit, unit_label')
      .eq('is_active', true)

    if (error || !products) {
      return NextResponse.json({ ok: false, error: 'Could not load products' }, { status: 500 })
    }

    let priceUpdates: any[] = []
    let unrecognized: string[] = []

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey && apiKey.startsWith('sk-ant')) {
      try {
        const { default: Anthropic } = await import('@anthropic-ai/sdk')
        const client = new Anthropic({ apiKey })
        const productList = products.map((p: any) =>
          `ID:${p.id} | ${p.brand} ${p.model_name} | Current: Rs ${p.price_per_unit} ${p.unit_label}`
        ).join('\n')

        const msg = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Extract prices from this dealer message and match to products.\n\nPRODUCTS:\n${productList}\n\nMESSAGE:\n${text}\n\nReturn ONLY JSON:\n{"price_updates":[{"product_model_id":"uuid","brand":"name","model_name":"model","old_price":0,"new_price":0,"confidence":"high"}],"unrecognized":["text"]}`
          }]
        })

        const responseText = msg.content[0]?.type === 'text' ? msg.content[0].text : ''
        const clean = responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(clean)
        priceUpdates = parsed.price_updates ?? []
        unrecognized = parsed.unrecognized ?? []
      } catch (claudeErr: any) {
        console.log('[Chatbot] Claude failed, using regex:', claudeErr.message)
      }
    }

    if (priceUpdates.length === 0) {
      const parsed = parseText(text)
      for (const item of parsed) {
        const match = products.find((p: any) => {
          const pBrand = p.brand.toLowerCase()
          const pModel = p.model_name.toLowerCase()
          return pBrand.includes(item.brand) || item.brand.includes(pBrand) ||
                 pModel.includes(item.model) || item.model.includes(pBrand)
        })
        if (match) {
          priceUpdates.push({
            product_model_id: match.id,
            brand: match.brand,
            model_name: match.model_name,
            old_price: match.price_per_unit,
            new_price: item.price,
            confidence: 'medium',
          })
        } else {
          unrecognized.push(item.raw)
        }
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        success: priceUpdates.length > 0,
        raw_text: text,
        price_updates: priceUpdates,
        unrecognized,
        error: priceUpdates.length === 0 ? 'Koi matching product nahi mila' : null,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { updates, raw_text } = body

    if (!updates?.length) {
      return NextResponse.json({ ok: false, error: 'No updates provided' }, { status: 400 })
    }

    const admin = getAdmin()
    const results = []

    for (const update of updates) {
      const { data: current } = await admin
        .from('product_models')
        .select('price_per_unit, brand, model_name')
        .eq('id', update.product_model_id)
        .single()

      if (!current) continue

      const { error } = await admin
        .from('product_models')
        .update({ price_per_unit: update.new_price })
        .eq('id', update.product_model_id)

      if (error) continue

      // Log price history — use try/catch instead of .catch()
      try {
        await admin.from('price_history').insert({
          product_model_id: update.product_model_id,
          old_price: current.price_per_unit,
          new_price: update.new_price,
          source: 'ai_chatbot',
          raw_text: raw_text ?? null,
        })
      } catch (histErr) {
        console.log('Price history log failed:', histErr)
      }

      results.push({
        id: update.product_model_id,
        brand: current.brand,
        model_name: current.model_name,
        old_price: current.price_per_unit,
        new_price: update.new_price,
        updated: true,
      })
    }

    return NextResponse.json({
      ok: true,
      data: { updated_count: results.length, results }
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
