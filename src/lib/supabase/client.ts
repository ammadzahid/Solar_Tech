// ─────────────────────────────────────────────
// Supabase browser client
// Used in Client Components only
// ─────────────────────────────────────────────

import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern — one instance per browser tab
let client: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseClient() {
  if (client) return client

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}
