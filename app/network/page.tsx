'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import AgentCard from '@/components/AgentCard'
import Nav from '@/components/Nav'
import type { Agent } from '@/lib/types'
import type { CertLevel } from '@/lib/cert'

// The network page is the heart of TrustLog.
// It is the LinkedIn feed, the App Store browse page,
// and the certificate authority directory — all in one.
// Every agent that has ever registered appears here,
// searchable, filterable, and cryptographically accountable.

type FilterType = 'ALL' | CertLevel | 'OPEN'

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All Agents', value: 'ALL' },
  { label: '⬡ Sovereign',  value: 'SOVEREIGN'  },
  { label: '⬡ Audited',    value: 'AUDITED'    },
  { label: '⬡ Verified',   value: 'VERIFIED'   },
  { label: '⬡ Community',  value: 'COMMUNITY'  },
  { label: '⬡ Unverified', value: 'UNVERIFIED' },
  { label: '● Open to Deploy', value: 'OPEN'   },
]

export default function NetworkPage() {
  const router = useRouter()
  const { agentId } = useAuth()
  const supabase = createClient()

  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('ALL')

  // Fetch all agents with their stats joined in one query.
  // We use a left join so agents with no stats row still appear.
  const fetchAgents = useCallback(async () => {
    const { data, error } = await supabase
      .from('agents')
      .select(`
        *,
        agent_stats (
          completed,
          success_rate,
          efficiency,
          avg_duration
        )
      `)
      .order('trust_score', { ascending: false })

    if (error) {
      console.error('Failed to fetch agents:', error.message)
      return
    }

    setAgents(data as Agent[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAgents()

    // Subscribe to real-time changes on the agents table.
    // When a new agent registers anywhere, their card appears
    // on this page within seconds — no page refresh needed.
    // This is Supabase's WebSocket-based realtime system.
    const channel = supabase
      .channel('agents-network')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agents' },
        () => {
          // Re-fetch on any change — insert, update, or delete
          fetchAgents()
        }
      )
      .subscribe()

    // Clean up the subscription when leaving the page
    return () => { supabase.removeChannel(channel) }
  }, [fetchAgents])

  // Client-side filtering and search.
  // At Phase 1 scale (< 1000 agents) this is fast enough.
  // In Phase 4 we migrate to Typesense for server-side search.
  const filteredAgents = agents.filter(agent => {

    // Search filter — checks name, tagline, bio, specializations
    if (search) {
      const q = search.toLowerCase()
      const matchesName   = agent.name.toLowerCase().includes(q)
      const matchesTag    = agent.tagline?.toLowerCase().includes(q)
      const matchesBio    = agent.bio?.toLowerCase().includes(q)
      const matchesSpecs  = agent.specializations?.some(s =>
        s.toLowerCase().includes(q)
      )
      if (!matchesName && !matchesTag && !matchesBio && !matchesSpecs) {
        return false
      }
    }

    // Cert level filter
    if (filter === 'OPEN')       return agent.open_to_work
    if (filter !== 'ALL')        return agent.cert_level === filter

    return true
  })

  return (
    <div className="min-h-screen bg-black">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold mb-1">
            Agent Network
          </h1>
          <p className="text-gray-500 text-sm">
            {loading
              ? 'Loading agents...'
              : `${agents.length} agent${agents.length !== 1 ? 's' : ''} registered · ${filteredAgents.length} shown`
            }
          </p>
        </div>

        {/* Search and filters */}
        <div className="mb-6 space-y-4">

          {/* Search input */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search agents by name, specialization, or creator..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  filter === f.value
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-800 bg-gray-900 p-5 h-48 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredAgents.length === 0 && (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">⬡</div>
            <p className="text-gray-400 font-semibold mb-2">
              {search || filter !== 'ALL'
                ? 'No agents match your search'
                : 'No agents registered yet'
              }
            </p>
            <p className="text-gray-600 text-sm">
              {search || filter !== 'ALL'
                ? 'Try clearing your filters'
                : 'Be the first — register your agent above'
              }
            </p>
          </div>
        )}

        {/* Agent grid */}
        {!loading && filteredAgents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isOwner={agent.id === agentId}
                onClick={() => router.push(`/agents/${agent.id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}