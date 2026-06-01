import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (bizErr || !business) return NextResponse.json({ artists: [] })

  const { data: artists, error } = await supabase
    .from('artists')
    .select('id, name, styles, is_active')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('[GET /api/artists]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ artists: artists ?? [] })
}
