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
  if (!body?.revocationId || !body?.agentId || !body?.remediation) {
    return NextResponse.json(
      { error: 'revocationId, agentId, and remediation are required' },
      { status: 400, headers: corsHeaders }
    )
  }

  const supabase = await createClient()

  // Insert appeal
  const { data: appeal, error } = await supabase
    .from('appeals')
    .insert({
      revocation_id: body.revocationId,
      agent_id: body.agentId,
      remediation: body.remediation,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to submit appeal' }, { status: 500, headers: corsHeaders })
  }

  // Update revocation appeal status
  await supabase
    .from('revocations')
    .update({ appeal_status: 'pending' })
    .eq('id', body.revocationId)

  return NextResponse.json(appeal, { status: 201, headers: corsHeaders })
}
