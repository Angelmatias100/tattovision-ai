import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Browser-side Supabase client with Clerk JWT injected on every request.
 *
 * Usage — always via the useSupabase() hook, never call this directly:
 *   const supabase = useSupabase()
 *
 * @param getToken  Clerk's `useAuth().getToken` — called fresh before each fetch
 *                  so the token is always current.
 */
export function createClient(getToken: () => Promise<string | null>) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
          // Fetch a fresh Clerk JWT before every Supabase request
          const token = await getToken()
          const headers = new Headers(options.headers)
          if (token) {
            headers.set('Authorization', `Bearer ${token}`)
          }
          return fetch(url, { ...options, headers })
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
