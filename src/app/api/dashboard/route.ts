import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

const TOKEN_LIMITS: Record<string, number> = {
  free:    500,
  starter: 2000,
  pro:     8000,
  agency:  30000,
}

// The 4 columns shown in the dashboard pipeline mini-widget
const PIPELINE_STATUSES = ['nuevo', 'consulta', 'confirmado', 'realizado'] as const
const PIPELINE_LABELS: Record<string, string> = {
  nuevo:      'NUEVO',
  consulta:   'CONSULTA',
  confirmado: 'CONFIRMADO',
  realizado:  'REALIZADO',
}

type Appt = {
  time_start: string | null
  notes: string | null
  leads: { name: string } | null
}

function formatAppt(a: Appt) {
  return {
    time:   (a.time_start ?? '').slice(0, 5),
    name:   a.leads?.name ?? 'Sin nombre',
    detail: a.notes ?? '',
  }
}

// ── GET /api/dashboard ────────────────────────────────────────────────────────
// Returns KPI aggregates + pipeline + upcoming appointments.
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const supabase = createAdminClient()

    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .select('id, name, plan, tv_tokens_balance')
      .eq('user_id', userId)
      .single()

    if (bizErr || !biz) {
      return NextResponse.json(
        { error: 'Business not found — complete onboarding first' },
        { status: 404 }
      )
    }

    const bizId      = biz.id
    const now        = new Date()
    const today      = now.toISOString().split('T')[0]
    const tomorrow   = new Date(now.getTime() + 86_400_000).toISOString().split('T')[0]
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [leadsCountRes, apptTodayRes, apptTomRes, allLeadsRes] = await Promise.all([
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', bizId)
        .gte('created_at', monthStart),

      supabase
        .from('appointments')
        .select('time_start, notes, leads(name)')
        .eq('business_id', bizId)
        .eq('date', today)
        .order('time_start', { ascending: true }),

      supabase
        .from('appointments')
        .select('time_start, notes, leads(name)')
        .eq('business_id', bizId)
        .eq('date', tomorrow)
        .order('time_start', { ascending: true }),

      supabase
        .from('leads')
        .select('name, instagram, style_interest, status, budget_max')
        .eq('business_id', bizId),
    ])

    const allLeads = allLeadsRes.data ?? []

    const pipelineValue = allLeads
      .filter(l => l.status !== 'realizado')
      .reduce((sum, l) => sum + ((l.budget_max as number | null) ?? 0), 0)

    const pipeline = PIPELINE_STATUSES.map(status => ({
      id:    status,
      label: PIPELINE_LABELS[status],
      count: allLeads.filter(l => l.status === status).length,
      dim:   status === 'realizado',
      leads: allLeads
        .filter(l => l.status === status)
        .slice(0, 3)
        .map(l => ({
          name:      l.name as string,
          instagram: l.instagram ? `@${l.instagram}` : null,
          style:     (l.style_interest as string[] | null)?.[0] ?? '',
        })),
    }))

    return NextResponse.json({
      business_name:      biz.name as string,
      plan:               biz.plan as string ?? 'starter',
      tv_tokens_balance:  biz.tv_tokens_balance ?? 0,
      tv_tokens_limit:    TOKEN_LIMITS[biz.plan as string] ?? 500,
      leads_this_month:   leadsCountRes.count ?? 0,
      appointments_today: (apptTodayRes.data ?? []).length,
      pipeline_value:     pipelineValue,
      pipeline,
      today_appointments:    (apptTodayRes.data ?? []).map(a => formatAppt(a as unknown as Appt)),
      tomorrow_appointments: (apptTomRes.data  ?? []).map(a => formatAppt(a as unknown as Appt)),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno del servidor'
    console.error('[GET /api/dashboard]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
