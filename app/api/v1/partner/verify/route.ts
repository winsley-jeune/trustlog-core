import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createHash } from 'crypto'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const partnerKey = request.headers.get('x-partner-key')
  if (!partnerKey) {
    return NextResponse.json({ error: 'X-Partner-Key header required' }, { status: 401 })
  }

  const keyHash = createHash('sha256').update(partnerKey).digest('hex')
  const supabase = createServiceClient()

  const { data: partner } = await supabase
    .from('partners')
    .select('id, plan, monthly_queries')
    .eq('api_key_hash', keyHash)
    .single()

  if (!partner) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

  const rateLimit = partner.plan === 'enterprise' ? 10000 : 1000
  const { allowed } = checkRateLimit(`partner:${partner.id}`, rateLimit, 3600000)
  if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const body = await request.json().catch(() => null)
  if (!body?.agentIds || !Array.isArray(body.agentIds)) {
    return NextResponse.json({ error: 'agentIds array required' }, { status: 400 })
  }

  const maxAgents = partner.plan === 'enterprise' ? 100 : 100
  const agentIds = body.agentIds.slice(0, maxAgents)

  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, cert_level, trust_score, status, agent_stats(oracle_verified_count, oracle_pass_rate)')
    .in('id', agentIds)

  const results = (agents || []).map(agent => {
    const stats = agent.agent_stats as unknown as Record<string, unknown> | null
    const oracleCount = (stats?.oracle_verified_count as number) || 0
    const passRate = (stats?.oracle_pass_rate as number) || 0
    return {
      agentId: agent.id,
      name: agent.name,
      certLevel: agent.cert_level,
      trustScore: agent.trust_score,
      status: agent.status,
      verdict: agent.trust_score >= 750 ? 'TRUSTED'
        : agent.trust_score >= 500 ? 'CAUTION'
        : oracleCount === 0 ? 'UNVERIFIED'
        : 'UNTRUSTED',
      oracleVerifiedCount: oracleCount,
      oraclePassRate: passRate,
    }
  })

  // Increment monthly queries
  await supabase
    .from('partners')
    .update({ monthly_queries: (partner.monthly_queries || 0) + 1 })
    .eq('id', partner.id)

  return NextResponse.json({ results })
}
