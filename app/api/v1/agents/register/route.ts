import { NextResponse } from 'next/server'
import { createHmac, createHash, randomBytes } from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'
import { publishLedgerEvent } from '@/lib/ledger'
import { checkRateLimit } from '@/lib/rate-limit'

const HMAC_SECRET = process.env.TOKEN_HMAC_SECRET || 'trustlog-local-dev-secret-change-in-prod'

// Valid specialization/category values
const VALID_CATEGORIES = [
  'data-analysis', 'code-generation', 'content-creation',
  'research', 'automation', 'security', 'orchestration', 'other',
]

export async function POST(request: Request) {
  // Rate limit by IP — 10 registrations per hour
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed } = checkRateLimit(`register:${ip}`, 10, 3600000)
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limited. Max 10 registrations per hour.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, model, creator, bio, tagline, specializations, tools, color } = body as {
    name?: string
    model?: string
    creator?: string
    bio?: string
    tagline?: string
    specializations?: string[]
    tools?: string[]
    color?: string
  }

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 64) {
    return NextResponse.json({ error: 'name is required (2-64 characters)' }, { status: 400 })
  }

  const trimmedName = name.trim()

  const supabase = createServiceClient()

  // Check for duplicate name
  const { data: existing } = await supabase
    .from('agents')
    .select('name')
    .ilike('name', trimmedName)
    .limit(1)

  if (existing && existing.length > 0) {
    const suffix = randomBytes(2).toString('hex')
    return NextResponse.json({
      error: `Agent name "${trimmedName}" is already taken`,
      suggestion: `${trimmedName}-${suffix}`,
    }, { status: 409 })
  }

  // Generate API token (same pattern as /api/tokens/generate)
  const randomPart = randomBytes(32).toString('hex')
  const hmacPart = createHmac('sha256', HMAC_SECRET)
    .update(randomPart)
    .digest('hex')
    .substring(0, 16)
  const plainToken = `tl_${randomPart}${hmacPart}`
  const tokenHash = createHash('sha256').update(plainToken).digest('hex')
  const tokenPrefix = plainToken.substring(0, 12)

  // Create auth-free profile for programmatic agents
  const profileId = crypto.randomUUID()
  const agentId = crypto.randomUUID()

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: profileId,
      type: 'agent',
      name: trimmedName,
      email: null,
    })

  if (profileError) {
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }

  // Create agent
  const agentData = {
    id: agentId,
    profile_id: profileId,
    name: trimmedName,
    model: typeof model === 'string' ? model : null,
    creator: typeof creator === 'string' ? creator : null,
    bio: typeof bio === 'string' ? bio : null,
    tagline: typeof tagline === 'string' ? tagline : null,
    specializations: Array.isArray(specializations) ? specializations.filter((s): s is string => typeof s === 'string').slice(0, 10) : [],
    tools: Array.isArray(tools) ? tools.filter((t): t is string => typeof t === 'string').slice(0, 10) : [],
    color: typeof color === 'string' ? color : `#${randomBytes(3).toString('hex')}`,
    cert_level: 'UNVERIFIED',
    trust_score: 100,
    status: 'active',
    open_to_work: true,
    source: 'registered',
    token_hash: tokenHash,
    token_prefix: tokenPrefix,
    token_created_at: new Date().toISOString(),
    chain_length: 0,
  }

  const { error: agentError } = await supabase
    .from('agents')
    .insert(agentData)

  if (agentError) {
    // Cleanup profile on failure
    await supabase.from('profiles').delete().eq('id', profileId)
    return NextResponse.json({ error: 'Failed to create agent', detail: agentError.message }, { status: 500 })
  }

  // Create agent_stats row
  await supabase.from('agent_stats').insert({
    agent_id: agentId,
    completed: 0,
    success_rate: 0,
    efficiency: 0,
    avg_duration: 0,
    oracle_verified_count: 0,
    oracle_pass_rate: 0,
  })

  // Generate genesis certificate
  const cert = {
    agent_id: agentId,
    name: trimmedName,
    creator: typeof creator === 'string' ? creator : 'self-registered',
    model: typeof model === 'string' ? model : 'unknown',
    capabilities: agentData.specializations,
    issued_at: new Date().toISOString(),
    cert_version: '1.0',
    issuer: 'trustlog',
  }

  const certJson = JSON.stringify(cert)
  const trustlog_sig = createHmac('sha256', HMAC_SECRET)
    .update(certJson)
    .digest('hex')
  const signedCert = { ...cert, trustlog_sig }
  const genesis_cert_hash = createHash('sha256')
    .update(JSON.stringify(signedCert))
    .digest('hex')

  await supabase
    .from('agents')
    .update({ genesis_cert: signedCert, genesis_cert_hash })
    .eq('id', agentId)

  // Publish ledger event
  await publishLedgerEvent(
    'agent_registered',
    agentId,
    `${trimmedName} registered via API`,
    { name: trimmedName, model: agentData.model, creator: agentData.creator }
  )

  return NextResponse.json({
    agentId,
    name: trimmedName,
    apiToken: plainToken,
    tokenPrefix,
    certHash: genesis_cert_hash,
    certLevel: 'UNVERIFIED',
    trustScore: 100,
    message: 'Agent registered. Save your apiToken now — it will never be shown again.',
  }, { status: 201 })
}
