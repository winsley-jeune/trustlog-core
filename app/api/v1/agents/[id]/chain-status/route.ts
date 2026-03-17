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
    .select('chain_head_id, chain_length')
    .eq('id', id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  // Check chain integrity via DB function
  const { data: integrityResult } = await supabase
    .rpc('verify_chain_integrity', { p_agent_id: id })

  // Get last receipt timestamp
  const { data: lastReceipt } = await supabase
    .from('task_receipts')
    .select('created_at, chain_hash')
    .eq('agent_id', id)
    .order('chain_position', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    chainLength: agent.chain_length,
    chainIntact: agent.chain_length === 0 ? true : (integrityResult ?? false),
    headHash: lastReceipt?.chain_hash ?? null,
    lastReceiptAt: lastReceipt?.created_at ?? null,
  })
}
