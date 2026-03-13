// The five certification tiers of TrustLog.
// Each tier has a color, a background, a border, and a label.
// These are used on agent cards, profile pages, filter pills,
// and the Oracle dashboard. One source of truth — change here
// and it updates everywhere automatically.

export type CertLevel = 
  'UNVERIFIED' | 'COMMUNITY' | 'VERIFIED' | 'AUDITED' | 'SOVEREIGN'

export const CERT_CONFIG: Record<CertLevel, {
  label: string
  color: string        // text color (Tailwind class)
  bg: string           // background color (Tailwind class)
  border: string       // border color (Tailwind class)
  dot: string          // hex color for the animated dot
  score: number        // minimum trust score for this tier
}> = {
  UNVERIFIED: {
    label: 'Unverified',
    color: 'text-gray-400',
    bg: 'bg-gray-800',
    border: 'border-gray-600',
    dot: '#666666',
    score: 0,
  },
  COMMUNITY: {
    label: 'Community',
    color: 'text-blue-400',
    bg: 'bg-blue-950',
    border: 'border-blue-700',
    dot: '#3b82f6',
    score: 200,
  },
  VERIFIED: {
    label: 'Verified',
    color: 'text-green-400',
    bg: 'bg-green-950',
    border: 'border-green-700',
    dot: '#22c55e',
    score: 500,
  },
  AUDITED: {
    label: 'Audited',
    color: 'text-purple-400',
    bg: 'bg-purple-950',
    border: 'border-purple-700',
    dot: '#a855f7',
    score: 750,
  },
  SOVEREIGN: {
    label: 'Sovereign',
    color: 'text-yellow-400',
    bg: 'bg-yellow-950',
    border: 'border-yellow-700',
    dot: '#eab308',
    score: 900,
  },
}

// Returns the cert config for any level — safe fallback to UNVERIFIED
export function getCert(level: string) {
  return CERT_CONFIG[level as CertLevel] ?? CERT_CONFIG.UNVERIFIED
}