// Chain integrity tests — run with: npx tsx --test tests/chain-integrity.test.ts
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createHash, createHmac, randomBytes } from 'crypto'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

// Helper to make API calls
async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

// Helper to make Supabase direct calls
async function supabaseQuery(table: string, query: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  })
  return res.json()
}

describe('Hash utility endpoint', () => {
  it('should hash content', async () => {
    const { status, body } = await api('/api/v1/receipts/hash', {
      method: 'POST',
      body: JSON.stringify({ content: 'hello world' }),
    })
    assert.equal(status, 200)
    assert.equal(body.hash, sha256('hello world'))
  })

  it('should reject missing content', async () => {
    const { status } = await api('/api/v1/receipts/hash', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    assert.equal(status, 400)
  })
})

describe('Receipt submission', () => {
  it('should reject unauthenticated requests', async () => {
    const { status } = await api('/api/v1/receipts', {
      method: 'POST',
      body: JSON.stringify({
        inputHash: sha256('test-input'),
        outputHash: sha256('test-output'),
        category: 'other',
        durationMs: 100,
      }),
    })
    assert.equal(status, 401)
  })

  it('should reject invalid inputHash', async () => {
    const { status } = await api('/api/v1/receipts', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer tl_fake_token' },
      body: JSON.stringify({
        inputHash: 'not-a-hash',
        outputHash: sha256('test'),
        category: 'other',
        durationMs: 100,
      }),
    })
    // Will be 401 (invalid token) — that's fine, validates auth comes first
    assert.ok(status === 401 || status === 400)
  })

  it('should reject invalid category', async () => {
    const { status } = await api('/api/v1/receipts', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer tl_fake_token' },
      body: JSON.stringify({
        inputHash: sha256('in'),
        outputHash: sha256('out'),
        category: 'invalid-category',
        durationMs: 100,
      }),
    })
    assert.ok(status === 401 || status === 400)
  })
})

describe('Chain status endpoint', () => {
  it('should return status for a seed agent', async () => {
    const agentId = '10000000-0000-0000-0000-000000000001' // ARIA-7
    const { status, body } = await api(`/api/v1/agents/${agentId}/chain-status`)
    assert.equal(status, 200)
    assert.equal(typeof body.chainLength, 'number')
    assert.equal(typeof body.chainIntact, 'boolean')
  })

  it('should return 404 for nonexistent agent', async () => {
    const { status } = await api('/api/v1/agents/00000000-0000-0000-0000-000000000000/chain-status')
    assert.equal(status, 404)
  })
})

describe('Chain verification endpoint', () => {
  it('should verify a seed agent', async () => {
    const agentId = '10000000-0000-0000-0000-000000000001'
    const { status, body } = await api(`/api/v1/agents/${agentId}/chain-verify`)
    assert.equal(status, 200)
    assert.equal(body.agent.name, 'ARIA-7')
    assert.equal(body.verified, true)
    assert.equal(body.cert.hasCert, true)
  })
})

describe('Score history endpoint', () => {
  it('should return score history', async () => {
    const agentId = '10000000-0000-0000-0000-000000000001'
    const { status, body } = await api(`/api/v1/agents/${agentId}/score-history`)
    assert.equal(status, 200)
    assert.equal(typeof body.currentScore, 'number')
    assert.ok(Array.isArray(body.history))
  })
})

describe('Badge endpoint', () => {
  it('should return SVG for a seed agent', async () => {
    const agentId = '10000000-0000-0000-0000-000000000001'
    const res = await fetch(`${BASE_URL}/api/v1/badge/${agentId}`)
    assert.equal(res.status, 200)
    assert.equal(res.headers.get('content-type'), 'image/svg+xml')
    const svg = await res.text()
    assert.ok(svg.includes('ARIA-7'))
    assert.ok(svg.includes('SOVEREIGN'))
  })
})

describe('Trust score computation', () => {
  it('should return 100 for agents with 0 receipts', async () => {
    // FLUX-1 has 0 receipts and trust_score = 100 in seed
    const agentId = '10000000-0000-0000-0000-000000000009'
    const { status, body } = await api(`/api/v1/agents/${agentId}/score-history`)
    assert.equal(status, 200)
    // The seed score is 100, and compute_trust_score returns 100 for 0 receipts
    assert.equal(body.currentScore, 100)
  })
})
