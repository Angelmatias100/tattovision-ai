import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

// Maps DB status values to Spanish UI labels
const STATUS_UI: Record<string, string> = {
  draft:     'borrador',
  active:    'activa',
  paused:    'pausada',
  completed: 'realizada',
  archived:  'archivada',
}

// ── GET /api/campaigns ────────────────────────────────────────────────────────
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (bizErr || !biz) return NextResponse.json({ campaigns: [] })

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/campaigns]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const mapped = (campaigns ?? []).map(c => ({
    ...c,
    status_ui: STATUS_UI[c.status as string] ?? c.status,
  }))

  return NextResponse.json({ campaigns: mapped })
}

// ── POST /api/campaigns ───────────────────────────────────────────────────────
// Saves a wizard-completed campaign as 'draft'. No tokens deducted here.
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    name?: string
    objective?: string
    selectedAngle?: { id: string; name: string }
    headline?: string
    body?: string
    cta?: string
    budget?: number
    startDate?: string
    endDate?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (bizErr || !biz) {
    return NextResponse.json(
      { error: 'Business not found — complete onboarding first' },
      { status: 404 }
    )
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert({
      business_id:   biz.id,
      name:          body.name.trim(),
      objective:     body.objective ?? null,
      status:        'draft',
      budget_daily:  body.budget   ?? null,
      start_date:    body.startDate ?? null,
      end_date:      body.endDate   ?? null,
      copy_headline: body.headline  ?? null,
      copy_body:     body.body      ?? null,
      copy_cta:      body.cta       ?? null,
      ai_strategy:   body.selectedAngle ? { angle: body.selectedAngle } : null,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/campaigns]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ campaign }, { status: 201 })
}
