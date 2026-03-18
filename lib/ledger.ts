import { createHash } from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'

export async function publishLedgerEvent(
  eventType: string,
  agentId: string,
  summary: string,
  evidence: object
): Promise<void> {
  const supabase = createServiceClient()

  const eventJson = JSON.stringify({
    eventType,
    agentId,
    summary,
    evidence,
    publishedAt: new Date().toISOString(),
  })

  const evidenceHash = createHash('sha256')
    .update(eventJson)
    .digest('hex')

  await supabase.from('trust_ledger').insert({
    event_type: eventType,
    agent_id: agentId,
    summary,
    evidence_hash: evidenceHash,
  })
}
