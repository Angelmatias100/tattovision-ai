import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

const CONTACT_TYPES = ['note', 'call', 'whatsapp', 'email', 'instagram_dm']

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!business) return NextResponse.json({ activities: [] })

  const { data: activities, error } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('lead_id', params.id)
    .eq('business_id', business.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[GET /api/leads/[id]/activities]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ activities: activities ?? [] })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { type?: string; content?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.type) {
    return NextResponse.json({ error: 'type is required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const { data: activity, error } = await supabase
    .from('lead_activities')
    .insert({
      lead_id:       params.id,
      business_id:   business.id,
      type:          body.type,
      content:       body.content?.trim() || null,
      clerk_user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/leads/[id]/activities]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update last_contacted_at for contact-type activities
  if (CONTACT_TYPES.includes(body.type)) {
    await supabase
      .from('leads')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('business_id', business.id)
  }

  return NextResponse.json({ activity }, { status: 201 })
}
