'use client'

import { useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'

/**
 * Returns a Supabase browser client with the current Clerk session token
 * automatically injected on every request.
 *
 * - Must be used inside a Client Component (it calls useAuth internally).
 * - The client is memoised — it's only recreated when Clerk's `getToken`
 *   reference changes (i.e. when the auth session changes).
 * - Token is fetched fresh before each Supabase request, so it's always current.
 *
 * @example
 * const supabase = useSupabase()
 * const { data } = await supabase.from('leads').select('*')
 */
export function useSupabase() {
  const { getToken } = useAuth()

  return useMemo(
    () => createClient(() => getToken()),
    // getToken is a stable reference from Clerk — only changes on session change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getToken]
  )
}
