import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

// ── POST /api/onboarding ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Authenticate via Clerk
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let body: {
    businessType?: string
    studioName?: string
    city?: string
    country?: string
    styles?: string[]
    avgTicket?: string | number
    citasPerMonth?: number
    instagram?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { businessType, studioName, city, country, styles, avgTicket, citasPerMonth, instagram } = body

  // 3. Validate required fields
  if (!studioName?.trim()) {
    return NextResponse.json({ error: 'studioName is required' }, { status: 400 })
  }

  // 4. Build derived values
  const avgTicketNum = avgTicket ? parseFloat(String(avgTicket)) : null

  // Monthly revenue goal = appointments/month × avg ticket (if both supplied)
  const monthlyGoal =
    citasPerMonth && avgTicketNum
      ? Math.round(citasPerMonth * avgTicketNum * 100) / 100
      : (citasPerMonth ?? null)

  const instagramUrl = instagram?.trim()
    ? `@${instagram.trim().replace(/^@/, '')}`
    : null

  // Reset date: 30 days from today (YYYY-MM-DD)
  const resetDate = new Date()
  resetDate.setDate(resetDate.getDate() + 30)
  const resetDateStr = resetDate.toISOString().split('T')[0]

  // 5. Upsert into businesses using the service-role admin client (bypasses RLS)
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('businesses')
    .upsert(
      {
        user_id:              userId,
        name:                 studioName.trim(),
        business_type:        businessType || null,
        city:                 city?.trim()    || null,
        country:              country?.trim() || null,
        styles:               styles          ?? [],
        artists_count:        1,
        avg_ticket:           avgTicketNum,
        monthly_goal:         monthlyGoal,
        instagram_url:        instagramUrl,
        plan:                 'starter',
        tv_tokens_balance:    200,
        tv_tokens_reset_date: resetDateStr,
      },
      { onConflict: 'user_id' }  // idempotent — re-running onboarding just updates
    )
    .select()
    .single()

  if (error) {
    console.error('[POST /api/onboarding] Supabase error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, business: data }, { status: 200 })
}
