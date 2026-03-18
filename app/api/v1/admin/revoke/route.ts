import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { publishLedgerEvent } from '@/lib/ledger'
import { deliverWebhook } from '@/lib/webhooks/deliver'

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
  if (!body?.agentId || !body?.reason || !body?.severity) {
    return NextResponse.json(
      { error: 'agentId, reason, and severity are required' },
      { status: 400, headers: corsHeaders }
    )
  }

  const { agentId, reason, severity, evidence } = body

  if (!['HIGH', 'CRITICAL'].includes(severity)) {
    return NextResponse.json(
      { error: 'severity must be HIGH or CRITICAL' },
      { status: 400, headers: corsHeaders }
    )
  }

  const supabase = createServiceClient()

  const { data: agent } = await supabase
    .from('agents')
    .select('id, trust_score, name, profile_id')
    .eq('id', agentId)
    .single()

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404, headers: corsHeaders })
  }

  const { data: revocation, error: revError } = await supabase
    .from('revocations')
    .insert({
      agent_id: agentId,
      reason,
      evidence: evidence || null,
      severity,
    })
    .select()
    .single()

  if (revError) {
    return NextResponse.json({ error: 'Failed to create revocation' }, { status: 500, headers: corsHeaders })
  }

  await supabase
    .from('agents')
    .update({
      status: 'revoked',
      cert_level: 'UNVERIFIED',
      trust_score: 0,
      token_hash: null,
      token_prefix: null,
      token_created_at: null,
    })
    .eq('id', agentId)

  await supabase
    .from('trust_score_history')
    .insert({
      agent_id: agentId,
      score: 0,
      delta: -agent.trust_score,
      reason: 'Revoked: ' + reason,
    })

  // Publish to trust ledger
  await publishLedgerEvent('agent_revoked', agentId, `${agent.name} revoked: ${reason}`, {
    severity,
    previousScore: agent.trust_score,
    revocationId: revocation.id,
  }).catch(() => {})

  // Deliver webhooks
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('url, secret, events')
    .eq('user_id', agent.profile_id)
    .eq('active', true)

  if (webhooks) {
    for (const wh of webhooks) {
      if ((wh.events as string[]).includes('agent.revoked')) {
        await deliverWebhook(wh.url, wh.secret, 'agent.revoked', {
          agentId,
          agentName: agent.name,
          reason,
          severity,
          revokedAt: new Date().toISOString(),
        }).catch(() => {})
      }
    }
  }

  return NextResponse.json(revocation, { status: 201, headers: corsHeaders })
}
