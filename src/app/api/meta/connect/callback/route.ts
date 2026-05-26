import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/meta/connect/callback
 *
 * Handles the OAuth redirect from Meta after the user grants permission.
 *
 * Flow:
 *   1. Verify `state` param matches the authenticated Clerk userId (CSRF check)
 *   2. Exchange the short-lived `code` for a short-lived user access token
 *   3. Exchange that for a long-lived user access token (60-day TTL)
 *   4. Fetch the Meta user name (/me) and ad accounts (/me/adaccounts)
 *   5. Save token + user info + ad accounts to `businesses`
 *   6. Redirect to /configuracion?tab=integraciones&meta=connected
 *
 * On any error, redirect to /configuracion?tab=integraciones&meta=error&reason=…
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

  const errorBase = '/configuracion?tab=integraciones&meta=error'

  // ── 1. Handle user denial ──────────────────────────────────────────────────
  if (error) {
    const reason = searchParams.get('error_reason') ?? error
    return NextResponse.redirect(new URL(`${errorBase}&reason=${encodeURIComponent(reason)}`, req.url))
  }

  // ── 2. CSRF state check ────────────────────────────────────────────────────
  if (!code || !state || decodeURIComponent(state) !== userId) {
    return NextResponse.redirect(new URL(`${errorBase}&reason=state_mismatch`, req.url))
  }

  const appId       = process.env.META_APP_ID
  const appSecret   = process.env.META_APP_SECRET
  const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI

  if (!appId || !appSecret || !redirectUri) {
    return NextResponse.redirect(new URL(`${errorBase}&reason=server_config`, req.url))
  }

  try {
    // ── 3. Exchange code → short-lived token ──────────────────────────────────
    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id',     appId)
    tokenUrl.searchParams.set('client_secret', appSecret)
    tokenUrl.searchParams.set('redirect_uri',  redirectUri)
    tokenUrl.searchParams.set('code',          code)

    const tokenRes = await fetch(tokenUrl.toString())
    if (!tokenRes.ok) throw new Error(`Token exchange failed: ${await tokenRes.text()}`)

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: { message: string } }
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error?.message ?? 'No access_token in response')
    }

    // ── 4. Exchange short-lived → long-lived token (60-day TTL) ──────────────
    const longTokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
    longTokenUrl.searchParams.set('grant_type',       'fb_exchange_token')
    longTokenUrl.searchParams.set('client_id',         appId)
    longTokenUrl.searchParams.set('client_secret',     appSecret)
    longTokenUrl.searchParams.set('fb_exchange_token', tokenData.access_token)

    const longTokenRes = await fetch(longTokenUrl.toString())
    if (!longTokenRes.ok) throw new Error(`Long token exchange failed: ${await longTokenRes.text()}`)

    const longTokenData = (await longTokenRes.json()) as { access_token?: string; error?: { message: string } }
    if (longTokenData.error || !longTokenData.access_token) {
      throw new Error(longTokenData.error?.message ?? 'No long-lived access_token')
    }

    const token = longTokenData.access_token

    // ── 5. Fetch Meta user name ────────────────────────────────────────────────
    let metaUserName: string | null = null
    try {
      const meUrl = new URL('https://graph.facebook.com/v19.0/me')
      meUrl.searchParams.set('fields',       'name')
      meUrl.searchParams.set('access_token', token)
      const meRes  = await fetch(meUrl.toString())
      const meData = (await meRes.json()) as { name?: string }
      metaUserName = meData.name ?? null
    } catch {
      // non-fatal — we have the token, just no display name
    }

    // ── 6. Fetch ad accounts ───────────────────────────────────────────────────
    let adAccounts: { id: string; name: string }[] = []
    let firstAccountId:   string | null = null
    let firstAccountName: string | null = null
    try {
      const acctUrl = new URL('https://graph.facebook.com/v19.0/me/adaccounts')
      acctUrl.searchParams.set('fields',       'id,name')
      acctUrl.searchParams.set('access_token', token)
      const acctRes  = await fetch(acctUrl.toString())
      const acctData = (await acctRes.json()) as { data?: { id: string; name: string }[] }
      adAccounts = acctData.data ?? []
      if (adAccounts.length > 0) {
        firstAccountId   = adAccounts[0].id
        firstAccountName = adAccounts[0].name
      }
    } catch {
      // non-fatal
    }

    // ── 7. Persist to businesses ───────────────────────────────────────────────
    const supabase = createAdminClient()
    const { error: dbErr } = await supabase
      .from('businesses')
      .update({
        meta_access_token: token,
        meta_user_name:    metaUserName,
        meta_account_id:   firstAccountId,
        meta_account_name: firstAccountName,
        meta_ad_accounts:  adAccounts.length > 0 ? adAccounts : null,
      })
      .eq('user_id', userId)

    if (dbErr) throw new Error(`DB update failed: ${dbErr.message}`)

    return NextResponse.redirect(new URL('/configuracion?tab=integraciones&meta=connected', req.url))

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown_error'
    console.error('[Meta OAuth callback]', message)
    return NextResponse.redirect(
      new URL(`${errorBase}&reason=${encodeURIComponent(message)}`, req.url)
    )
  }
}
