import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

// UI type → DB type
const TYPE_TO_DB: Record<string, string> = {
  reel:     'reel',
  historia: 'story',
  carrusel: 'carousel',
  post:     'post',
}

// DB type → UI type
const TYPE_TO_UI: Record<string, string> = {
  reel:     'reel',
  story:    'historia',
  carousel: 'carrusel',
  post:     'post',
}

// DB status → UI status
const STATUS_TO_UI: Record<string, string> = {
  draft:     'borrador',
  scheduled: 'aprobado',
  published: 'publicado',
  archived:  'archivado',
}

// ── GET /api/contenido ────────────────────────────────────────────────────────
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (bizErr || !biz) return NextResponse.json({ content: [] })

  const { data: pieces, error } = await supabase
    .from('content_pieces')
    .select('*')
    .eq('business_id', biz.id)
    .neq('status', 'archived')
    .order('publish_date', { ascending: true })

  if (error) {
    console.error('[GET /api/contenido]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const mapped = (pieces ?? []).map(p => ({
    ...p,
    type_ui:   TYPE_TO_UI[p.type as string]   ?? p.type,
    status_ui: STATUS_TO_UI[p.status as string] ?? p.status,
  }))

  return NextResponse.json({ content: mapped })
}

// ── POST /api/contenido ───────────────────────────────────────────────────────
// Saves an AI-generated idea with the next available publish_date.
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    type?: string
    title?: string
    hook?: string
    caption?: string
    hashtags?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
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

  // Find next available publish_date (first future date with no piece already scheduled)
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: scheduled } = await supabase
    .from('content_pieces')
    .select('publish_date')
    .eq('business_id', biz.id)
    .not('publish_date', 'is', null)
    .gte('publish_date', todayStr)

  const takenDates = new Set((scheduled ?? []).map(p => p.publish_date as string))

  let candidate = new Date(Date.now() + 86_400_000) // start from tomorrow
  for (let i = 0; i < 90; i++) {
    const d = candidate.toISOString().split('T')[0]
    if (!takenDates.has(d)) break
    candidate = new Date(candidate.getTime() + 86_400_000)
  }

  const publishDate = candidate.toISOString().split('T')[0]

  // Combine hook + caption + hashtags into the body field
  const bodyText = [body.hook, body.caption, body.hashtags]
    .filter(Boolean)
    .join('\n\n') || null

  const { data: piece, error } = await supabase
    .from('content_pieces')
    .insert({
      business_id:  biz.id,
      type:         TYPE_TO_DB[body.type ?? 'post'] ?? 'post',
      title:        body.title ?? null,
      body:         bodyText,
      status:       'draft',
      publish_date: publishDate,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/contenido]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ piece }, { status: 201 })
}
