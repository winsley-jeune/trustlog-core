import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: agent } = await supabase
    .from('agents')
    .select('trust_score')
    .eq('id', id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const { data: history } = await supabase
    .from('trust_score_history')
    .select('*')
    .eq('agent_id', id)
    .order('created_at', { ascending: false })
    .limit(30)

  return NextResponse.json({
    currentScore: agent.trust_score,
    history: history ?? [],
  })
}
