import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createCampaign } from '@/lib/meta/client'

const TOKEN_COST = 25

// Maps UI objective ids to Meta API objective strings
const META_OBJECTIVES: Record<string, string> = {
  leads:    'OUTCOME_LEADS',
  brand:    'OUTCOME_AWARENESS',
  traffic:  'OUTCOME_TRAFFIC',
  messages: 'OUTCOME_ENGAGEMENT',
  visits:   'OUTCOME_AWARENESS',
  video:    'OUTCOME_ENGAGEMENT',
}

// ── POST /api/campaigns/[id]/launch ──────────────────────────────────────────
// Deducts 25 tokens and creates the campaign in Meta Ads (PAUSED state).
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('id, tv_tokens_balance, meta_access_token, meta_account_id')
    .eq('user_id', userId)
    .single()

  if (bizErr || !biz) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  if (!biz.meta_access_token || !biz.meta_account_id) {
    return NextResponse.json(
      { error: 'No tienes una cuenta de Meta Ads conectada. Ve a Configuración para conectarla.' },
      { status: 403 }
    )
  }

  const balance = biz.tv_tokens_balance ?? 0
  if (balance < TOKEN_COST) {
    return NextResponse.json(
      { error: `Tokens insuficientes — necesitas ${TOKEN_COST}, tienes ${balance}` },
      { status: 402 }
    )
  }

  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', params.id)
    .eq('business_id', biz.id)
    .single()

  if (campErr || !campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  if (campaign.status !== 'draft') {
    return NextResponse.json(
      { error: 'Solo se pueden lanzar campañas en estado borrador' },
      { status: 400 }
    )
  }

  // Deduct tokens before calling Meta
  await supabase
    .from('businesses')
    .update({ tv_tokens_balance: balance - TOKEN_COST })
    .eq('id', biz.id)

  try {
    const metaResult = await createCampaign(biz.meta_access_token as string, {
      adAccountId:  `act_${biz.meta_account_id}`,
      name:         campaign.name as string,
      objective:    META_OBJECTIVES[campaign.objective as string] ?? 'OUTCOME_LEADS',
      dailyBudget:  campaign.budget_daily != null
                      ? Math.round((campaign.budget_daily as number) * 100)
                      : undefined,
    })

    await supabase
      .from('campaigns')
      .update({ meta_campaign_id: metaResult.id, status: 'active' })
      .eq('id', campaign.id)

    return NextResponse.json({ success: true, meta_campaign_id: metaResult.id })
  } catch (err: unknown) {
    // Refund tokens on Meta failure
    await supabase
      .from('businesses')
      .update({ tv_tokens_balance: balance })
      .eq('id', biz.id)

    const msg = err instanceof Error ? err.message : 'Error al lanzar en Meta'
    console.error('[POST /api/campaigns/[id]/launch]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
