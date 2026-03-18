import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { verifyAgentToken } from '@/lib/auth/verify-agent-token'
import { createClient } from '@/lib/supabase/server'

const VALID_CATEGORIES = [
  'data-analysis', 'code-generation', 'content-creation',
  'research', 'automation', 'security', 'orchestration', 'other',
]
const HEX_64 = /^[a-f0-9]{64}$/

export async function POST(request: Request) {
  const agent = await verifyAgentToken(request)
  if (!agent) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (agent.status === 'revoked') return NextResponse.json({ error: 'Agent revoked' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body?.receipts || !Array.isArray(body.receipts)) {
    return NextResponse.json({ error: 'receipts array required' }, { status: 400 })
  }

  if (body.receipts.length > 100) {
    return NextResponse.json({ error: 'Max 100 receipts per batch' }, { status: 400 })
  }

  const supabase = await createClient()
  const results: Array<{ index: number; receiptId?: string; chainHash?: string; chainPosition?: number; error?: string }> = []

  // Process sequentially to maintain chain ordering
  for (let i = 0; i < body.receipts.length; i++) {
    const r = body.receipts[i]

    if (!r.inputHash || !HEX_64.test(r.inputHash) ||
        !r.outputHash || !HEX_64.test(r.outputHash) ||
        !VALID_CATEGORIES.includes(r.category) ||
        !Number.isInteger(r.durationMs) || r.durationMs <= 0) {
      results.push({ index: i, error: 'Invalid receipt data' })
      continue
    }

    const status = r.status || 'success'

    const { data: currentAgent } = await supabase
      .from('agents')
      .select('chain_head_id, chain_length')
      .eq('id', agent.id)
      .single()

    const chainPosition = (currentAgent?.chain_length ?? 0) + 1

    let prevChainHash: string | null = null
    if (currentAgent?.chain_head_id) {
      const { data: head } = await supabase
        .from('task_receipts')
        .select('chain_hash')
        .eq('id', currentAgent.chain_head_id)
        .single()
      prevChainHash = head?.chain_hash ?? null
    }

    const receiptData = JSON.stringify({
      agent_id: agent.id,
      input_hash: r.inputHash,
      output_hash: r.outputHash,
      category: r.category,
      duration_ms: r.durationMs,
      status,
      chain_position: chainPosition,
      prev_chain_hash: prevChainHash || 'GENESIS',
    })

    const chainHash = createHash('sha256').update(receiptData).digest('hex')

    const { data: receipt, error: insertError } = await supabase
      .from('task_receipts')
      .insert({
        agent_id: agent.id,
        task_description: r.taskDescription || null,
        category: r.category,
        input_hash: r.inputHash,
        output_hash: r.outputHash,
        duration_ms: r.durationMs,
        status,
        chain_hash: chainHash,
        prev_chain_hash: prevChainHash || 'GENESIS',
        chain_position: chainPosition,
        metadata: r.metadata || {},
      })
      .select('id')
      .single()

    if (insertError || !receipt) {
      results.push({ index: i, error: 'Insert failed' })
      continue
    }

    await supabase
      .from('agents')
      .update({ chain_head_id: receipt.id, chain_length: chainPosition })
      .eq('id', agent.id)

    results.push({ index: i, receiptId: receipt.id, chainHash, chainPosition })
  }

  return NextResponse.json({ results }, { status: 201 })
}
