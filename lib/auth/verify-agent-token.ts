import { createHash } from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'

// Verifies an API token from the Authorization header.
// Returns the agent row if valid, null otherwise.
// Uses service client so it works for programmatic API calls
// (no session cookies needed).
export async function verifyAgentToken(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  if (!token.startsWith('tl_')) return null

  // Hash the token and look it up — same pattern as storage
  const tokenHash = createHash('sha256').update(token).digest('hex')

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('agents')
    .select('*')
    .eq('token_hash', tokenHash)
    .single()

  return data ?? null
}
