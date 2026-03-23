/**
 * Supabase Server Client
 * Used in Server Components, API routes, and server actions.
 * Creates a new client per request with cookie-based auth.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method is called from a Server Component
            // where cookies can't be set. This is safe to ignore
            // if middleware is refreshing user sessions.
          }
        },
      },
    }
  )
}

/**
 * Supabase Admin Client
 * Uses SERVICE_ROLE_KEY — bypasses RLS.
 * ONLY use for admin operations (webhook handlers, migrations).
 * Never expose to client-side code.
 */
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}
