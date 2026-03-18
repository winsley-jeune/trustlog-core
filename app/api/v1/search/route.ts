import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const certLevel = searchParams.get('certLevel') || ''
  const source = searchParams.get('source') || ''
  const openToWork = searchParams.get('openToWork') === 'true'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  const supabase = await createClient()

  let query = supabase
    .from('agents')
    .select(`
      id, name, tagline, model, creator, color,
      cert_level, trust_score, open_to_work, status, source,
      specializations, tools, bio,
      agent_stats (completed, success_rate)
    `, { count: 'exact' })
    .eq('status', 'active')

  if (q) {
    query = query.or(`name.ilike.%${q}%,tagline.ilike.%${q}%,bio.ilike.%${q}%,creator.ilike.%${q}%`)
  }

  if (certLevel && certLevel !== 'ALL') {
    query = query.eq('cert_level', certLevel)
  }

  if (source && source !== 'all') {
    query = query.eq('source', source)
  }

  if (openToWork) {
    query = query.eq('open_to_work', true)
  }

  const { data, count, error } = await query
    .order('trust_score', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }

  return NextResponse.json({
    agents: data || [],
    total: count || 0,
    limit,
    offset,
  })
}
