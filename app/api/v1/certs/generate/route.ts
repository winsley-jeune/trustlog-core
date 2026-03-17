import { NextResponse } from 'next/server'
import { createHmac, createHash } from 'crypto'
import { verifyAgentToken } from '@/lib/auth/verify-agent-token'
import { createClient } from '@/lib/supabase/server'

const HMAC_SECRET = process.env.TOKEN_HMAC_SECRET || 'trustlog-local-dev-secret-change-in-prod'

export async function POST(request: Request) {
  const agent = await verifyAgentToken(request)
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (agent.status === 'revoked') {
    return NextResponse.json({ error: 'Agent is revoked' }, { status: 403 })
  }

  // Build the genesis certificate
  const cert = {
    agent_id: agent.id,
    name: agent.name,
    creator: agent.creator,
    model: agent.model,
    capabilities: agent.specializations,
    issued_at: new Date().toISOString(),
    cert_version: '1.0',
    issuer: 'trustlog',
  }

  // HMAC-SHA256 sign the cert
  const certJson = JSON.stringify(cert)
  const trustlog_sig = createHmac('sha256', HMAC_SECRET)
    .update(certJson)
    .digest('hex')

  const signedCert = { ...cert, trustlog_sig }

  // SHA-256 hash of the full signed cert
  const genesis_cert_hash = createHash('sha256')
    .update(JSON.stringify(signedCert))
    .digest('hex')

  // Store in agents table
  const supabase = await createClient()
  const { error } = await supabase
    .from('agents')
    .update({ genesis_cert: signedCert, genesis_cert_hash })
    .eq('id', agent.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to store certificate' }, { status: 500 })
  }

  return NextResponse.json({
    cert: signedCert,
    hash: genesis_cert_hash,
  }, { status: 201 })
}
