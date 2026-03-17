import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { verifyAgentToken } from '@/lib/auth/verify-agent-token'
import { createClient } from '@/lib/supabase/server'

// In-memory rate limiter: 60 requests per minute per agent
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(agentId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(agentId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(agentId, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 60) return false
  entry.count++
  return true
}

const VALID_CATEGORIES = [
  'data-analysis', 'code-generation', 'content-creation',
  'research', 'automation', 'security', 'orchestration', 'other',
]

const HEX_64 = /^[a-f0-9]{64}$/

export async function POST(request: Request) {
  const agent = await verifyAgentToken(request)
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (agent.status === 'revoked') {
    return NextResponse.json({ error: 'Agent has been revoked' }, { status: 403 })
  }

  if (!checkRateLimit(agent.id)) {
    return NextResponse.json({ error: 'Rate limit exceeded (60/min)' }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { inputHash, outputHash, category, durationMs, taskDescription, status, metadata } = body

  // Validate required fields
  if (!inputHash || !HEX_64.test(inputHash)) {
    return NextResponse.json({ error: 'inputHash must be 64-char hex string' }, { status: 400 })
  }
  if (!outputHash || !HEX_64.test(outputHash)) {
    return NextResponse.json({ error: 'outputHash must be 64-char hex string' }, { status: 400 })
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 })
  }
  if (!Number.isInteger(durationMs) || durationMs <= 0) {
    return NextResponse.json({ error: 'durationMs must be a positive integer' }, { status: 400 })
  }

  const receiptStatus = status || 'success'
  if (!['success', 'failure', 'partial'].includes(receiptStatus)) {
    return NextResponse.json({ error: 'status must be success, failure, or partial' }, { status: 400 })
  }

  // Fetch current chain head
  const supabase = await createClient()
  const { data: currentAgent } = await supabase
    .from('agents')
    .select('chain_head_id, chain_length')
    .eq('id', agent.id)
    .single()

  const chainPosition = (currentAgent?.chain_length ?? 0) + 1

  // Get previous chain hash
  let prevChainHash: string | null = null
  if (currentAgent?.chain_head_id) {
    const { data: headReceipt } = await supabase
      .from('task_receipts')
      .select('chain_hash')
      .eq('id', currentAgent.chain_head_id)
      .single()
    prevChainHash = headReceipt?.chain_hash ?? null
  }

  // Compute chain hash = SHA-256(receipt data + prev hash)
  const receiptData = JSON.stringify({
    agent_id: agent.id,
    input_hash: inputHash,
    output_hash: outputHash,
    category,
    duration_ms: durationMs,
    status: receiptStatus,
    chain_position: chainPosition,
    prev_chain_hash: prevChainHash || 'GENESIS',
  })

  const chainHash = createHash('sha256').update(receiptData).digest('hex')

  // Insert receipt
  const { data: receipt, error: insertError } = await supabase
    .from('task_receipts')
    .insert({
      agent_id: agent.id,
      task_description: taskDescription || null,
      category,
      input_hash: inputHash,
      output_hash: outputHash,
      duration_ms: durationMs,
      status: receiptStatus,
      chain_hash: chainHash,
      prev_chain_hash: prevChainHash || 'GENESIS',
      chain_position: chainPosition,
      metadata: metadata || {},
    })
    .select('id')
    .single()

  if (insertError || !receipt) {
    return NextResponse.json({ error: 'Failed to insert receipt' }, { status: 500 })
  }

  // Update agent chain head atomically
  const { error: updateError } = await supabase
    .from('agents')
    .update({
      chain_head_id: receipt.id,
      chain_length: chainPosition,
    })
    .eq('id', agent.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update chain head' }, { status: 500 })
  }

  return NextResponse.json({
    receiptId: receipt.id,
    chainHash,
    chainPosition,
    agentId: agent.id,
  }, { status: 201 })
}
