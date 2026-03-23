/**
 * Supabase Browser Client
 * Used in client components for auth state and real-time subscriptions.
 * Per FORGE blueprint: Supabase Auth handles authentication.
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
