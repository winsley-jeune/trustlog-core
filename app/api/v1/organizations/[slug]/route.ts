import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: members } = await supabase
    .from('org_members')
    .select('*, profiles(name, email)')
    .eq('org_id', org.id)

  const { data: agents } = await supabase
    .from('org_agents')
    .select('agent_id, agents(id, name, cert_level, trust_score, status, agent_stats(completed, success_rate, oracle_verified_count, oracle_pass_rate))')
    .eq('org_id', org.id)

  return NextResponse.json({ ...org, members: members || [], agents: agents || [] })
}
