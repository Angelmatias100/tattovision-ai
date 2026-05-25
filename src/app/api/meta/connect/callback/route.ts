import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/meta/connect/callback
 *
 * Handles the OAuth redirect from Meta after the user grants permission.
 *
 * Flow:
 *   1. Verify the `state` param matches the authenticated Clerk userId (CSRF check)
 *   2. Exchange the short-lived `code` for a short-lived user access token
 *   3. Exchange that for a long-lived user access token (60-day TTL)
 *   4. Save the encrypted token to `businesses.meta_access_token`
 *   5. Redirect to /configuracion?meta=connected
 *
 * On any error, redirect to /configuracion?meta=error&reason=…
 *
 * Meta token exchange docs:
 * https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // ── 1. Handle user denial ───────────────────────────────────────────────────
  if (error) {
    const reason = searchParams.get('error_reason') ?? error
    console.warn('[Meta OAuth] User denied or error:', reason)
    return NextResponse.redirect(
      new URL(`/configuracion?meta=error&reason=${encodeURIComponent(reason)}`, req.url)
    )
  }

  // ── 2. CSRF state check ─────────────────────────────────────────────────────
  if (!code || !state || decodeURIComponent(state) !== userId) {
    console.error('[Meta OAuth] State mismatch or missing code')
    return NextResponse.redirect(
      new URL('/configuracion?meta=error&reason=state_mismatch', req.url)
    )
  }

  const appId       = process.env.META_APP_ID
  const appSecret   = process.env.META_APP_SECRET
  const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI

  if (!appId || !appSecret || !redirectUri) {
    console.error('[Meta OAuth] Missing env vars: META_APP_ID / META_APP_SECRET / NEXT_PUBLIC_META_REDIRECT_URI')
    return NextResponse.redirect(
      new URL('/configuracion?meta=error&reason=server_config', req.url)
    )
  }

  try {
    // ── 3. Exchange code → short-lived token ──────────────────────────────────
    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id',     appId)
    tokenUrl.searchParams.set('client_secret', appSecret)
    tokenUrl.searchParams.set('redirect_uri',  redirectUri)
    tokenUrl.searchParams.set('code',          code)

    const tokenRes = await fetch(tokenUrl.toString())
    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      throw new Error(`Token exchange failed: ${errBody}`)
    }

    const tokenData = (await tokenRes.json()) as {
      access_token?: string
      error?: { message: string }
    }

    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error?.message ?? 'No access_token in response')
    }

    const shortLivedToken = tokenData.access_token

    // ── 4. Exchange short-lived → long-lived token (60-day TTL) ──────────────
    const longTokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
    longTokenUrl.searchParams.set('grant_type',        'fb_exchange_token')
    longTokenUrl.searchParams.set('client_id',          appId)
    longTokenUrl.searchParams.set('client_secret',      appSecret)
    longTokenUrl.searchParams.set('fb_exchange_token',  shortLivedToken)

    const longTokenRes = await fetch(longTokenUrl.toString())
    if (!longTokenRes.ok) {
      const errBody = await longTokenRes.text()
      throw new Error(`Long-lived token exchange failed: ${errBody}`)
    }

    const longTokenData = (await longTokenRes.json()) as {
      access_token?: string
      expires_in?:   number
      error?: { message: string }
    }

    if (longTokenData.error || !longTokenData.access_token) {
      throw new Error(longTokenData.error?.message ?? 'No long-lived access_token in response')
    }

    const longLivedToken = longTokenData.access_token

    // ── 5. Persist token in businesses table ──────────────────────────────────
    // NOTE: In a production app you would encrypt this token before storing it.
    // For now we store it in plain text; add AES-256-GCM encryption when going live.
    const supabase = createAdminClient()

    const { error: dbErr } = await supabase
      .from('businesses')
      .update({ meta_access_token: longLivedToken })
      .eq('user_id', userId)

    if (dbErr) {
      throw new Error(`Supabase update failed: ${dbErr.message}`)
    }

    // ── 6. Success → redirect ─────────────────────────────────────────────────
    return NextResponse.redirect(new URL('/configuracion?meta=connected', req.url))

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown_error'
    console.error('[Meta OAuth callback]', message)
    return NextResponse.redirect(
      new URL(`/configuracion?meta=error&reason=${encodeURIComponent(message)}`, req.url)
    )
  }
}
