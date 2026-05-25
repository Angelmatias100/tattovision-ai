import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

const VALID_STATUSES = ['confirmada', 'pendiente', 'noshow', 'realizada'] as const

// ── GET /api/appointments?start=YYYY-MM-DD&end=YYYY-MM-DD ─────────────────────
// Returns appointments for the given date range, enriched with lead + artist
// names. Also returns all active artists for the sidebar legend and filter.
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')   // YYYY-MM-DD
  const end   = searchParams.get('end')     // YYYY-MM-DD

  const supabase = createAdminClient()

  // Resolve business
  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (bizErr || !business) {
    return NextResponse.json({ appointments: [], artists: [] })
  }

  // ── 1. Fetch all active artists (always returned for filter / legend) ──────
  const { data: artists } = await supabase
    .from('artists')
    .select('id, name, styles')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('name')

  // ── 2. Fetch appointments in the date window ───────────────────────────────
  let apptQuery = supabase
    .from('appointments')
    .select('*')
    .eq('business_id', business.id)
    .order('date')
    .order('time_start')

  if (start) apptQuery = apptQuery.gte('date', start)
  if (end)   apptQuery = apptQuery.lte('date', end)

  const { data: appts, error: apptErr } = await apptQuery

  if (apptErr) {
    console.error('[GET /api/appointments]', apptErr.message)
    return NextResponse.json({ error: apptErr.message }, { status: 500 })
  }

  if (!appts || appts.length === 0) {
    return NextResponse.json({ appointments: [], artists: artists ?? [] })
  }

  // ── 3. Bulk-fetch related leads and artists ────────────────────────────────
  const leadIds   = Array.from(new Set(appts.map(a => a.lead_id).filter(Boolean)))   as string[]
  const artistIds = Array.from(new Set(appts.map(a => a.artist_id).filter(Boolean)))  as string[]

  const [{ data: leads }, { data: artistRows }] = await Promise.all([
    leadIds.length > 0
      ? supabase.from('leads').select('id, name, style_interest').in('id', leadIds)
      : Promise.resolve({ data: [] }),
    artistIds.length > 0
      ? supabase.from('artists').select('id, name').in('id', artistIds)
      : Promise.resolve({ data: [] }),
  ])

  const leadMap   = Object.fromEntries((leads   ?? []).map(l => [l.id, l]))
  const artistMap = Object.fromEntries((artistRows ?? []).map(a => [a.id, a]))

  // ── 4. Enrich and return ───────────────────────────────────────────────────
  const enriched = appts.map(appt => ({
    ...appt,
    lead_name:   (leadMap[appt.lead_id]?.name              ?? null) as string | null,
    lead_style:  (leadMap[appt.lead_id]?.style_interest?.[0] ?? null) as string | null,
    artist_name: (artistMap[appt.artist_id]?.name           ?? null) as string | null,
  }))

  return NextResponse.json({ appointments: enriched, artists: artists ?? [] })
}

// ── POST /api/appointments ────────────────────────────────────────────────────
// Creates a new appointment linked to an optional lead and artist.
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    leadId?:       string | null
    artistId?:     string | null
    date?:         string
    timeStart?:    string
    timeEnd?:      string
    depositAmount?: number | null
    notes?:        string | null
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 })
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

  const { data: appt, error } = await supabase
    .from('appointments')
    .insert({
      business_id:    business.id,
      lead_id:        body.leadId        ?? null,
      artist_id:      body.artistId      ?? null,
      date:           body.date,
      time_start:     body.timeStart     ?? null,
      time_end:       body.timeEnd       ?? null,
      deposit_amount: body.depositAmount ?? null,
      notes:          body.notes         ?? null,
      status:         'confirmada',
      deposit_paid:   false,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/appointments]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ appointment: appt }, { status: 201 })
}

// ── PATCH /api/appointments ───────────────────────────────────────────────────
// Updates status (and optionally deposit_paid) for an appointment.
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { id?: string; status?: string; deposit_paid?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  if (body.status && !VALID_STATUSES.includes(body.status as typeof VALID_STATUSES[number])) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    )
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

  const patch: Record<string, unknown> = {}
  if (body.status      !== undefined) patch.status       = body.status
  if (body.deposit_paid !== undefined) patch.deposit_paid = body.deposit_paid

  const { data: appt, error } = await supabase
    .from('appointments')
    .update(patch)
    .eq('id', body.id)
    .eq('business_id', business.id)   // security: scope to this business
    .select()
    .single()

  if (error) {
    console.error('[PATCH /api/appointments]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ appointment: appt })
}
