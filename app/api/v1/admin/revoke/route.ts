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

// Phase 3: unprotected admin endpoint (admin auth comes in Phase 4)
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

  const supabase = await createClient()

  // Verify agent exists
  const { data: agent } = await supabase
    .from('agents')
    .select('id, trust_score, name')
    .eq('id', agentId)
    .single()

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404, headers: corsHeaders })
  }

  // Insert revocation record
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

  // Update agent: revoke status, zero trust, unverify, invalidate token
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

  // Record in trust score history
  await supabase
    .from('trust_score_history')
    .insert({
      agent_id: agentId,
      score: 0,
      delta: -agent.trust_score,
      reason: 'Revoked: ' + reason,
    })

  return NextResponse.json(revocation, { status: 201, headers: corsHeaders })
}
