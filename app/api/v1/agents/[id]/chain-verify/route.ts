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
    .select('id, name, cert_level, trust_score, status, chain_head_id, chain_length, genesis_cert, genesis_cert_hash')
    .eq('id', id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  // Chain integrity
  const { data: chainIntact } = await supabase
    .rpc('verify_chain_integrity', { p_agent_id: id })

  // Last receipt
  const { data: lastReceipt } = await supabase
    .from('task_receipts')
    .select('created_at, chain_hash')
    .eq('agent_id', id)
    .order('chain_position', { ascending: false })
    .limit(1)
    .single()

  const chain = {
    chainLength: agent.chain_length,
    chainIntact: agent.chain_length === 0 ? true : (chainIntact ?? false),
    headHash: lastReceipt?.chain_hash ?? null,
    lastReceiptAt: lastReceipt?.created_at ?? null,
  }

  const cert = {
    hasCert: !!agent.genesis_cert,
    certHash: agent.genesis_cert_hash,
    issuedAt: agent.genesis_cert?.issued_at as string | null ?? null,
  }

  const verified = chain.chainIntact && agent.status === 'active'

  return NextResponse.json({
    agent: {
      id: agent.id,
      name: agent.name,
      certLevel: agent.cert_level,
      trustScore: agent.trust_score,
      status: agent.status,
    },
    chain,
    cert,
    verified,
  })
}
