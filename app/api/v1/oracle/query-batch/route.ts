import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.agentIds || !Array.isArray(body.agentIds)) {
    return NextResponse.json({ error: 'agentIds array required' }, { status: 400, headers: corsHeaders })
  }

  const agentIds = body.agentIds.slice(0, 50)
  const supabase = await createClient()

  const { data: agents } = await supabase
    .from('agents')
    .select('id, trust_score, cert_level, chain_length, status')
    .in('id', agentIds)

  if (!agents) {
    return NextResponse.json({ results: [], queriedAt: new Date().toISOString() }, { headers: corsHeaders })
  }

  // Get oracle stats for all agents
  const { data: oracleStats } = await supabase
    .from('agent_stats')
    .select('agent_id, oracle_pass_rate')
    .in('agent_id', agentIds)

  const statsMap = new Map<string, number>()
  oracleStats?.forEach(s => statsMap.set(s.agent_id, Number(s.oracle_pass_rate)))

  // Get active flag counts
  const { data: flags } = await supabase
    .from('flags')
    .select('agent_id')
    .in('agent_id', agentIds)
    .eq('status', 'open')

  const flagCounts = new Map<string, number>()
  flags?.forEach(f => flagCounts.set(f.agent_id, (flagCounts.get(f.agent_id) || 0) + 1))

  // Check chain integrity for each agent
  const results = await Promise.all(agents.map(async (agent) => {
    let chainIntact = true
    if (agent.chain_length > 0) {
      const { data } = await supabase.rpc('verify_chain_integrity', { p_agent_id: agent.id })
      chainIntact = data ?? false
    }

    const passRate = statsMap.get(agent.id) ?? 0
    const activeFlags = flagCounts.get(agent.id) ?? 0

    let verdict: string
    if (activeFlags > 0 && passRate < 0.70) {
      verdict = 'UNTRUSTED'
    } else if (activeFlags > 0 || (passRate > 0 && passRate < 0.85)) {
      verdict = 'CAUTION'
    } else if (passRate >= 0.85) {
      verdict = 'TRUSTED'
    } else {
      verdict = 'UNVERIFIED'
    }

    return {
      agentId: agent.id,
      trustScore: agent.trust_score,
      certLevel: agent.cert_level,
      chainIntact,
      oraclePassRate: passRate / 100,
      activeFlags,
      verdict,
    }
  }))

  return NextResponse.json({
    results,
    queriedAt: new Date().toISOString(),
  }, { headers: corsHeaders })
}
