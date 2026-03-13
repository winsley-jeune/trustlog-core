import { createBrowserClient } from '@supabase/ssr'

// This client runs in the browser — it reads cookies automatically
// to know if a user is logged in. Used in React components with
// useState, useEffect, and event handlers.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}