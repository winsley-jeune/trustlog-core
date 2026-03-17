import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  SOVEREIGN:  { bg: '#854d0e', text: '#eab308' },
  AUDITED:    { bg: '#581c87', text: '#a855f7' },
  VERIFIED:   { bg: '#14532d', text: '#22c55e' },
  COMMUNITY:  { bg: '#1e3a5f', text: '#3b82f6' },
  UNVERIFIED: { bg: '#374151', text: '#9ca3af' },
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: agent } = await supabase
    .from('agents')
    .select('name, cert_level, trust_score, chain_length, status')
    .eq('id', id)
    .single()

  if (!agent) {
    return new NextResponse('Agent not found', { status: 404 })
  }

  const { data: chainIntact } = agent.chain_length > 0
    ? await supabase.rpc('verify_chain_integrity', { p_agent_id: id })
    : { data: true }

  const colors = TIER_COLORS[agent.cert_level] || TIER_COLORS.UNVERIFIED
  const chainIcon = chainIntact ? '✓' : '✗'
  const chainColor = chainIntact ? '#22c55e' : '#ef4444'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="60" viewBox="0 0 320 60">
  <rect width="320" height="60" rx="8" fill="#111"/>
  <rect x="1" y="1" width="318" height="58" rx="7" fill="none" stroke="${colors.bg}" stroke-width="1"/>
  <text x="12" y="22" font-family="monospace" font-size="13" font-weight="bold" fill="white">${escapeXml(agent.name)}</text>
  <rect x="12" y="30" width="80" height="18" rx="4" fill="${colors.bg}"/>
  <text x="52" y="43" font-family="monospace" font-size="10" fill="${colors.text}" text-anchor="middle">${agent.cert_level}</text>
  <text x="105" y="43" font-family="monospace" font-size="10" fill="#9ca3af">Score: ${agent.trust_score}</text>
  <text x="200" y="43" font-family="monospace" font-size="10" fill="${chainColor}">${chainIcon} Chain: ${agent.chain_length}</text>
  <text x="275" y="22" font-family="monospace" font-size="8" fill="#4b5563">TRUSTLOG</text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
