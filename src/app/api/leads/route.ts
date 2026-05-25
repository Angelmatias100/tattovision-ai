import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

const VALID_STATUSES = [
  'nuevo', 'respondido', 'consulta', 'presupuesto',
  'deposito', 'confirmado', 'realizado', 'reactivar',
] as const

// ── GET /api/leads ────────────────────────────────────────────────────────────
// Returns all leads that belong to the current user's business.
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Resolve business for this Clerk user
  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (bizErr || !business) {
    // User hasn't finished onboarding yet — return empty list gracefully
    return NextResponse.json({ leads: [] })
  }

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/leads]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ leads: leads ?? [] })
}

// ── POST /api/leads ───────────────────────────────────────────────────────────
// Creates a new lead in the current user's business with status 'nuevo'.
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    name?: string
    instagram?: string | null
    phone?: string | null
    styleInterest?: string | null
    budgetMin?: string | number | null
    budgetMax?: string | number | null
    notes?: string | null
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
    return NextResponse.json({ error: 'Business not found — complete onboarding first' }, { status: 404 })
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
      budget_min:     body.budgetMin != null ? parseFloat(String(body.budgetMin)) : null,
      budget_max:     body.budgetMax != null ? parseFloat(String(body.budgetMax)) : null,
      notes:          body.notes?.trim()    || null,
      status:         'nuevo',
      source:         'manual',
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/leads]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lead }, { status: 201 })
}

// ── PATCH /api/leads ──────────────────────────────────────────────────────────
// Updates a lead's status. Scoped to the current user's business for safety.
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { id?: string; status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  if (!body.status || !VALID_STATUSES.includes(body.status as typeof VALID_STATUSES[number])) {
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

  // Update only if the lead belongs to this user's business (security check)
  const { data: lead, error } = await supabase
    .from('leads')
    .update({ status: body.status })
    .eq('id', body.id)
    .eq('business_id', business.id)
    .select()
    .single()

  if (error) {
    console.error('[PATCH /api/leads]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lead })
}
