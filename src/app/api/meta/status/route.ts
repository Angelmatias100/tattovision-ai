import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

// ── GET /api/meta/status ──────────────────────────────────────────
// Returns the current Meta OAuth connection status for the business.
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: biz, error } = await supabase
    .from('businesses')
    .select('meta_access_token, meta_user_name, meta_account_id, meta_account_name, meta_ad_accounts')
    .eq('user_id', userId)
    .single()

  if (error || !biz) {
    return NextResponse.json({ connected: false, user_name: null, account_id: null, account_name: null, ad_accounts: [] })
  }

  const connected = !!biz.meta_access_token

  return NextResponse.json({
    connected,
    user_name:    connected ? (biz.meta_user_name    as string | null) : null,
    account_id:   connected ? (biz.meta_account_id   as string | null) : null,
    account_name: connected ? (biz.meta_account_name as string | null) : null,
    ad_accounts:  connected ? ((biz.meta_ad_accounts as { id: string; name: string }[] | null) ?? []) : [],
  })
}

// ── PATCH /api/meta/status ────────────────────────────────────────
// Saves the user's selected ad account.
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { meta_account_id?: string; meta_account_name?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('businesses')
    .update({ meta_account_id: body.meta_account_id ?? null, meta_account_name: body.meta_account_name ?? null })
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// ── DELETE /api/meta/status ───────────────────────────────────────
// Disconnects Meta by clearing the stored token.
export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('businesses')
    .update({
      meta_access_token: null,
      meta_user_name:    null,
      meta_account_id:   null,
      meta_account_name: null,
      meta_ad_accounts:  null,
    })
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
