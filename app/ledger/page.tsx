'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import clsx from 'clsx'

type LedgerEntry = {
  id: string
  event_type: string
  agent_id: string
  summary: string
  evidence_hash: string
  published_at: string
  agents?: { name: string } | null
}

const EVENT_COLORS: Record<string, string> = {
  cert_issued: 'bg-blue-900 text-blue-400',
  tier_upgraded: 'bg-green-900 text-green-400',
  tier_downgraded: 'bg-orange-900 text-orange-400',
  agent_revoked: 'bg-red-900 text-red-400',
  council_decision: 'bg-purple-900 text-purple-400',
  appeal_resolved: 'bg-yellow-900 text-yellow-400',
  agent_registered: 'bg-gray-800 text-gray-400',
}

const EVENT_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Registered', value: 'agent_registered' },
  { label: 'Certified', value: 'cert_issued' },
  { label: 'Tier Changes', value: 'tier_upgraded' },
  { label: 'Revocations', value: 'agent_revoked' },
]

export default function LedgerPage() {
  const supabase = createClient()
  const router = useRouter()
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  async function loadEntries(eventType: string, before?: string) {
    let query = supabase
      .from('trust_ledger')
      .select('*, agents(name)')
      .order('published_at', { ascending: false })
      .limit(20)

    if (eventType) query = query.eq('event_type', eventType)
    if (before) query = query.lt('published_at', before)

    const { data } = await query
    return (data || []) as LedgerEntry[]
  }

  useEffect(() => {
    setLoading(true)
    loadEntries(filter).then(data => {
      setEntries(data)
      setLoading(false)
    })
  }, [filter])

  function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="min-h-screen bg-black">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-white text-2xl font-bold mb-2">Trust Ledger</h1>
        <p className="text-gray-500 text-sm mb-6">
          Immutable public record of all significant trust events. Append-only — entries cannot be modified or deleted.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {EVENT_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-full border transition-colors',
                filter === f.value
                  ? 'bg-white text-black border-white font-semibold'
                  : 'text-gray-400 border-gray-700 hover:border-gray-500'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-900 rounded-lg" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-lg">
            <p className="text-gray-600 text-sm">No ledger entries yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => (
              <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded', EVENT_COLORS[entry.event_type] || 'bg-gray-800 text-gray-400')}>
                      {entry.event_type.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => router.push(`/agents/${entry.agent_id}`)}
                      className="text-white text-sm font-semibold hover:underline"
                    >
                      {(entry.agents as Record<string, unknown>)?.name as string || 'Unknown'}
                    </button>
                  </div>
                  <span className="text-gray-600 text-xs">{timeAgo(entry.published_at)}</span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{entry.summary}</p>
                <p className="text-gray-700 text-xs font-mono">
                  {entry.evidence_hash.substring(0, 16)}...
                </p>
              </div>
            ))}

            {entries.length >= 20 && (
              <button
                onClick={async () => {
                  const last = entries[entries.length - 1]
                  const more = await loadEntries(filter, last.published_at)
                  setEntries(prev => [...prev, ...more])
                }}
                className="w-full text-center text-sm text-gray-500 hover:text-white py-3 border border-gray-800 rounded-lg transition-colors"
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
