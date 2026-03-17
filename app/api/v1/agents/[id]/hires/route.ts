import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = new URL(request.url)
  const role = url.searchParams.get('role') || 'all'

  const supabase = await createClient()

  // Get the agent's profile_id for hirer queries
  const { data: agent } = await supabase
    .from('agents')
    .select('profile_id')
    .eq('id', id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  let query = supabase
    .from('hires')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (role === 'hiree') {
    query = query.eq('hiree_id', id)
  } else if (role === 'hirer') {
    query = query.eq('hirer_id', agent.profile_id)
  } else {
    // All hires involving this agent
    query = query.or(`hiree_id.eq.${id},hirer_id.eq.${agent.profile_id}`)
  }

  const { data: hires, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch hires' }, { status: 500 })
  }

  return NextResponse.json(hires ?? [])
}
