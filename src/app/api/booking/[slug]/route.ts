import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const HOUR_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

const BUDGET_MAP: Record<string, { min: number | null; max: number | null }> = {
  'hasta-100':   { min: 0,    max: 100  },
  '100-300':     { min: 100,  max: 300  },
  '300-500':     { min: 300,  max: 500  },
  '500-1000':    { min: 500,  max: 1000 },
  'mas-de-1000': { min: 1000, max: null },
}

// ── GET /api/booking/[slug] ────────────────────────────────────────
// Returns studio info + booked appointment slots for the next 60 days.
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createAdminClient()

  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name, city, styles')
    .eq('booking_slug', params.slug)
    .single()

  if (bizErr || !biz) {
    return NextResponse.json({ error: 'Studio not found' }, { status: 404 })
  }

  const today    = new Date().toISOString().split('T')[0]
  const endDate  = new Date(Date.now() + 60 * 86_400_000).toISOString().split('T')[0]

  const { data: appts } = await supabase
    .from('appointments')
    .select('date, time_start')
    .eq('business_id', biz.id)
    .gte('date', today)
    .lte('date', endDate)
    .in('status', ['scheduled', 'confirmed'])

  // Return booked slots as "YYYY-MM-DD_HH:MM" strings for easy client lookup
  const bookedSlots: string[] = (appts ?? []).map(
    a => `${a.date}_${(a.time_start as string ?? '').slice(0, 5)}`
  )

  return NextResponse.json({
    business: {
      name:   biz.name   as string,
      city:   biz.city   as string | null,
      styles: biz.styles as string[],
    },
    bookedSlots,
    hourSlots: HOUR_SLOTS,
  })
}

// ── POST /api/booking/[slug] ───────────────────────────────────────
// Inserts a lead + appointment for a client booking request.
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  let body: {
    name?: string
    phone?: string
    email?: string | null
    styleInterest?: string | null
    bodyPart?: string | null
    budget?: string | null
    notes?: string | null
    date?: string
    time?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name?.trim())  return NextResponse.json({ error: 'name is required' },  { status: 400 })
  if (!body.phone?.trim()) return NextResponse.json({ error: 'phone is required' }, { status: 400 })
  if (!body.date || !body.time) {
    return NextResponse.json({ error: 'date and time are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('booking_slug', params.slug)
    .single()

  if (bizErr || !biz) {
    return NextResponse.json({ error: 'Studio not found' }, { status: 404 })
  }

  const budgetRange = body.budget ? BUDGET_MAP[body.budget] : null

  // 1. Insert lead
  const { data: lead, error: leadErr } = await supabase
    .from('leads')
    .insert({
      business_id:    biz.id,
      name:           body.name.trim(),
      phone:          body.phone.trim(),
      email:          body.email?.trim()   || null,
      style_interest: body.styleInterest   ? [body.styleInterest] : [],
      body_part:      body.bodyPart?.trim() || null,
      budget_min:     budgetRange?.min ?? null,
      budget_max:     budgetRange?.max ?? null,
      notes:          body.notes?.trim()   || null,
      status:         'nuevo',
      source:         'booking_page',
    })
    .select('id')
    .single()

  if (leadErr) {
    console.error('[POST /api/booking] lead insert error:', leadErr.message)
    return NextResponse.json({ error: leadErr.message }, { status: 500 })
  }

  // 2. Insert appointment
  const { error: apptErr } = await supabase
    .from('appointments')
    .insert({
      business_id: biz.id,
      lead_id:     lead.id,
      date:        body.date,
      time_start:  body.time,
      status:      'scheduled',
      notes:       body.notes?.trim() || null,
    })

  if (apptErr) {
    console.error('[POST /api/booking] appointment insert error:', apptErr.message)
    // Lead was created — return success anyway so client gets confirmation
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
