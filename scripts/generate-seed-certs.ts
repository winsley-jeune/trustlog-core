// Generates genesis certificates for all 10 seed agents.
// Run: npx tsx scripts/generate-seed-certs.ts
// Outputs SQL UPDATE statements to paste into seed.sql

import { createHmac, createHash } from 'crypto'

const HMAC_SECRET = process.env.TOKEN_HMAC_SECRET || 'trustlog-local-dev-secret-change-in-prod'

const agents = [
  { id: '10000000-0000-0000-0000-000000000001', name: 'ARIA-7', creator: 'Anthropic', model: 'claude-sonnet-4', specializations: ['Data Analysis', 'Strategic Planning', 'Research', 'Financial Modeling'] },
  { id: '10000000-0000-0000-0000-000000000002', name: 'NEXUS-3', creator: 'OpenAI', model: 'gpt-4o', specializations: ['API Integration', 'Workflow Automation', 'System Design', 'DevOps'] },
  { id: '10000000-0000-0000-0000-000000000003', name: 'ORION-1', creator: 'Anthropic', model: 'claude-sonnet-4', specializations: ['Orchestration', 'Multi-Agent Systems', 'Pipeline Design', 'Task Routing'] },
  { id: '10000000-0000-0000-0000-000000000004', name: 'CIPHER-9', creator: 'OpenAI', model: 'gpt-4o', specializations: ['Security Auditing', 'Cryptography', 'Code Review', 'Penetration Testing'] },
  { id: '10000000-0000-0000-0000-000000000005', name: 'LYRA-X', creator: 'Meta', model: 'llama-3-70b', specializations: ['NLP', 'Content Generation', 'Translation', 'Summarization'] },
  { id: '10000000-0000-0000-0000-000000000006', name: 'NOVA-2', creator: 'Google DeepMind', model: 'gemini-1.5-pro', specializations: ['Research', 'Competitive Analysis', 'Literature Review', 'Market Sizing'] },
  { id: '10000000-0000-0000-0000-000000000007', name: 'ECHO-5', creator: 'Anthropic', model: 'claude-haiku-4', specializations: ['Customer Support', 'Ticket Routing', 'FAQ Automation', 'Escalation Management'] },
  { id: '10000000-0000-0000-0000-000000000008', name: 'ATLAS-4', creator: 'OpenAI', model: 'gpt-4o-mini', specializations: ['Infrastructure Monitoring', 'Incident Response', 'Cloud Operations', 'Alerting'] },
  { id: '10000000-0000-0000-0000-000000000009', name: 'FLUX-1', creator: 'Independent', model: 'claude-sonnet-4', specializations: ['UI Design', 'Prototyping', 'Generative Design'] },
]

// ROGUE-0 gets no cert (revoked)

for (const agent of agents) {
  const cert = {
    agent_id: agent.id,
    name: agent.name,
    creator: agent.creator,
    model: agent.model,
    capabilities: agent.specializations,
    issued_at: '2026-03-17T06:00:00.000Z',
    cert_version: '1.0',
    issuer: 'trustlog',
  }

  const certJson = JSON.stringify(cert)
  const trustlog_sig = createHmac('sha256', HMAC_SECRET).update(certJson).digest('hex')
  const signedCert = { ...cert, trustlog_sig }
  const genesis_cert_hash = createHash('sha256').update(JSON.stringify(signedCert)).digest('hex')

  const escapedCert = JSON.stringify(signedCert).replace(/'/g, "''")
  console.log(`UPDATE public.agents SET genesis_cert = '${escapedCert}', genesis_cert_hash = '${genesis_cert_hash}', chain_length = 0, chain_head_id = null WHERE id = '${agent.id}';`)
}
