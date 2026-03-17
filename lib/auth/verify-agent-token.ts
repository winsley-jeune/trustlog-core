import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'

// Verifies an API token from the Authorization header.
// Returns the agent row if valid, null otherwise.
// Used by all agent-authenticated API routes.
export async function verifyAgentToken(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  if (!token.startsWith('tl_')) return null

  // Hash the token and look it up — same pattern as storage
  const tokenHash = createHash('sha256').update(token).digest('hex')

  const supabase = await createClient()
  const { data } = await supabase
    .from('agents')
    .select('*')
    .eq('token_hash', tokenHash)
    .single()

  return data ?? null
}
