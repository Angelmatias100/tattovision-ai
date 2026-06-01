import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

const VALID_STATUSES = [
  'nuevo', 'respondido', 'consulta', 'presupuesto',
  'deposito', 'confirmado', 'realizado', 'reactivar',
] as const

const VALID_PRIORITIES = ['high', 'medium', 'low'] as const

// ── GET /api/leads ────────────────────────────────────────────────────────────

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (bizErr || !business) return NextResponse.json({ leads: [] })

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*, artist:artists(id, name)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/leads]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ leads: leads ?? [] })
}

// ── POST /api/leads ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    name?:          string
    instagram?:     string | null
    phone?:         string | null
    styleInterest?: string | null
    budgetMin?:     string | number | null
    budgetMax?:     string | number | null
    notes?:         string | null
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

  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (bizErr || !business) {
    return NextResponse.json(
      { error: 'Business not found — complete onboarding first' },
      { status: 404 }
    )
  }

  const instagram = body.instagram?.trim()
    ? body.instagram.trim().replace(/^@/, '')
    : null

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      business_id:    business.id,
      name:           body.name.trim(),
      instagram:      instagram,
      phone:          body.phone?.trim()    || null,
      style_interest: body.styleInterest    ? [body.styleInterest] : [],
      budget_min:     body.budgetMin  != null ? parseFloat(String(body.budgetMin))  : null,
      budget_max:     body.budgetMax  != null ? parseFloat(String(body.budgetMax))  : null,
      notes:          body.notes?.trim()    || null,
      status:         'nuevo',
      source:         'manual',
      tags:           [],
      priority:       'medium',
    })
    .select('*, artist:artists(id, name)')
    .single()

  if (error) {
    console.error('[POST /api/leads]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lead }, { status: 201 })
}

// ── PATCH /api/leads ──────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    id?:        string
    status?:    string
    tags?:      string[]
    priority?:  string
    artist_id?: string | null
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  if (body.status && !VALID_STATUSES.includes(body.status as typeof VALID_STATUSES[number])) {
    return NextResponse.json({ error: `Invalid status` }, { status: 400 })
  }

  if (body.priority && !VALID_PRIORITIES.includes(body.priority as typeof VALID_PRIORITIES[number])) {
    return NextResponse.json({ error: `Invalid priority` }, { status: 400 })
  }

  // Build update payload — only include fields that were sent
  const updates: Record<string, unknown> = {}
  if (body.status   !== undefined) updates.status    = body.status
  if (body.tags     !== undefined) updates.tags      = body.tags
  if (body.priority !== undefined) updates.priority  = body.priority
  if ('artist_id'  in body)        updates.artist_id = body.artist_id // allow explicit null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (bizErr || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Log stage change before updating
  if (body.status) {
    const { data: current } = await supabase
      .from('leads')
      .select('status')
      .eq('id', body.id)
      .eq('business_id', business.id)
      .single()

    if (current && current.status !== body.status) {
      await supabase.from('lead_activities').insert({
        lead_id:       body.id,
        business_id:   business.id,
        type:          'status_change',
        old_status:    current.status,
        new_status:    body.status,
        clerk_user_id: userId,
      })
    }
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', body.id)
    .eq('business_id', business.id)
    .select('*, artist:artists(id, name)')
    .single()

  if (error) {
    console.error('[PATCH /api/leads]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lead })
}
