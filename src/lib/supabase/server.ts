import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

/**
 * Server-side Supabase client (Server Components, Route Handlers, Server Actions).
 *
 * Gets the current Clerk JWT via `auth()` and sets it as the Authorization
 * header so Supabase can verify it against the configured Clerk JWKS endpoint
 * and apply RLS policies using `auth.jwt() ->> 'sub'`.
 *
 * This function is async — always `await` it:
 *   const supabase = await createClient()
 */
export async function createClient() {
  const { getToken } = await auth()
  const token = await getToken()

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      auth: {
        // Clerk owns the session — disable Supabase's own auth machinery
        persistSession:      false,
        autoRefreshToken:    false,
        detectSessionInUrl:  false,
      },
    }
  )
}

/**
 * Service-role Supabase client — bypasses RLS entirely.
 * Use only in trusted server contexts (webhooks, admin routes).
 * NEVER import this in browser code.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession:      false,
        autoRefreshToken:    false,
        detectSessionInUrl:  false,
      },
    }
  )
}
