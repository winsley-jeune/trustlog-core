import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || ''
  const agentId = searchParams.get('agentId') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const before = searchParams.get('before') || ''

  const supabase = await createClient()

  let query = supabase
    .from('trust_ledger')
    .select('*, agents(name)')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (type) query = query.eq('event_type', type)
  if (agentId) query = query.eq('agent_id', agentId)
  if (before) query = query.lt('published_at', before)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: 'Failed to fetch ledger' }, { status: 500 })

  return NextResponse.json(data || [])
}
