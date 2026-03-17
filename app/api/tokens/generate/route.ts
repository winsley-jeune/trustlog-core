import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createHmac, randomBytes, createHash } from 'crypto'

// Why server-side token generation?
// If we generated tokens in the browser, the logic would be
// visible to anyone who opened DevTools. Server-side means
// the generation algorithm, the HMAC secret, and the hashing
// all happen in an environment the user cannot inspect.

// The HMAC secret signs the token — proves it was generated
// by TrustLog and not fabricated by someone else.
// In production this comes from an environment variable.
// Never hardcode secrets — this is a placeholder for local dev.
const HMAC_SECRET = process.env.TOKEN_HMAC_SECRET || 'trustlog-local-dev-secret-change-in-prod'

export async function POST() {
  const supabase = await createClient()

  // Verify the caller is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Verify the caller is an agent — humans don't get API tokens
  if (user.user_metadata?.type !== 'agent') {
    return NextResponse.json(
      { error: 'Only agents can generate API tokens' },
      { status: 403 }
    )
  }

  const agentId = user.user_metadata?.agent_id

  if (!agentId) {
    return NextResponse.json(
      { error: 'Agent ID not found in session' },
      { status: 400 }
    )
  }

  // ── TOKEN GENERATION ──────────────────────────────────────
  // Structure: tl_ + random bytes + HMAC signature
  //
  // tl_        — prefix identifies this as a TrustLog token
  // randomPart — 32 bytes of cryptographic randomness (unpredictable)
  // hmacPart   — HMAC-SHA256 signature (proves TrustLog issued it)
  //
  // The full token is what we return to the agent ONCE.
  // The hash is what we store in the database permanently.

  const randomPart = randomBytes(32).toString('hex')
  const hmacPart = createHmac('sha256', HMAC_SECRET)
    .update(randomPart)
    .digest('hex')
    .substring(0, 16)

  const plainToken = `tl_${randomPart}${hmacPart}`

  // Hash the token for storage — SHA-256, hex encoded
  // This is what gets stored in the DB, never the plaintext
  const tokenHash = createHash('sha256')
    .update(plainToken)
    .digest('hex')

  // Prefix is the first 12 chars — shown in the UI so the
  // agent can identify which token is active without revealing it
  const tokenPrefix = plainToken.substring(0, 12)

  // Store the hash and prefix — update any existing token
  // This invalidates the old token immediately
  const { error: updateError } = await supabase
    .from('agents')
    .update({
      token_hash: tokenHash,
      token_prefix: tokenPrefix,
      token_created_at: new Date().toISOString(),
    })
    .eq('id', agentId)

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to store token' },
      { status: 500 }
    )
  }

  // Return the PLAINTEXT token — this is the ONLY time it is
  // ever returned. The client must save it immediately.
  // On every subsequent request, only the masked prefix is shown.
  return NextResponse.json({
    token: plainToken,
    prefix: tokenPrefix,
    created_at: new Date().toISOString(),
    message: 'Save this token now. It will never be shown again.',
  })
}