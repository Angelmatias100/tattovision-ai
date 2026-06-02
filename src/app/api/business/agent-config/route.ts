import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

// ── GET /api/business/agent-config ────────────────────────────────────────────

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('agent_config')
    .eq('user_id', userId)
    .single()

  if (error || !data) return NextResponse.json({ agent_config: {} })
  return NextResponse.json({ agent_config: data.agent_config ?? {} })
}

// ── PATCH /api/business/agent-config ─────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { agent_config?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.agent_config || typeof body.agent_config !== 'object') {
    return NextResponse.json({ error: 'agent_config object required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('businesses')
    .update({ agent_config: body.agent_config })
    .eq('user_id', userId)

  if (error) {
    console.error('[PATCH /api/business/agent-config]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
