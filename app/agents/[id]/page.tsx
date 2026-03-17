'use client'

// Why 'use client' here?
// The profile page needs interactivity — tab switching, hover states,
// the back button. Server components can't handle user interactions.
// In Phase 4 we'll add OG meta tags via a separate generateMetadata
// export, but for now client rendering is the right call.

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { getCert } from '@/lib/cert'
import Nav from '@/components/Nav'
import clsx from 'clsx'
import type { Agent } from '@/lib/types'

// The three tabs on the profile page.
// Audit Log is intentionally empty in Phase 1 —
// it fills with real data when the hash chain ships in Phase 2.
// Showing it now sets the expectation that accountability is coming.
type Tab = 'overview' | 'trust' | 'audit'

export default function AgentProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { agentId } = useAuth()
  const supabase = createClient()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const isOwner = agent?.id === agentId

  useEffect(() => {
    async function fetchAgent() {
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
        .eq('id', id)
        .single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setAgent(data as Agent)
      setLoading(false)
    }

    if (id) fetchAgent()
  }, [id])

  // ── LOADING STATE ─────────────────────────────────────────
  // A skeleton loader that matches the layout of the real page.
  // This prevents layout shift and feels faster than a spinner.
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Nav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
          <div className="h-4 w-24 bg-gray-800 rounded mb-8" />
          <div className="flex gap-6 mb-8">
            <div className="w-20 h-20 bg-gray-800 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 bg-gray-800 rounded" />
              <div className="h-4 w-32 bg-gray-800 rounded" />
              <div className="h-4 w-24 bg-gray-800 rounded" />
            </div>
          </div>
          <div className="h-48 bg-gray-800 rounded-lg" />
        </div>
      </div>
    )
  }

  // ── 404 STATE ─────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen bg-black">
        <Nav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="text-5xl mb-6">⬡</div>
          <h1 className="text-white text-2xl font-bold mb-3">
            Agent Not Found
          </h1>
          <p className="text-gray-500 mb-8">
            This agent does not exist or has been removed from the network.
          </p>
          <button
            onClick={() => router.push('/network')}
            className="text-sm border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 px-4 py-2 rounded transition-colors"
          >
            ← Back to Network
          </button>
        </div>
      </div>
    )
  }

  if (!agent) return null

  const cert = getCert(agent.cert_level)
  const stats = agent.agent_stats

  return (
    <div className="min-h-screen bg-black">
      <Nav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-white text-sm mb-8 flex items-center gap-2 transition-colors"
        >
          ← Back to Network
        </button>

        {/* ── HERO SECTION ──────────────────────────────── */}
        {/* The hero is the first impression. It communicates
            identity and trust level before the user reads anything.
            The cert badge color is the dominant visual signal. */}
        <div className={clsx(
          'rounded-xl border p-6 mb-6',
          'bg-gradient-to-br from-gray-900 to-black',
          cert.border
        )}>
          <div className="flex flex-col sm:flex-row gap-6">

            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-3xl flex-shrink-0"
              style={{ backgroundColor: agent.color || '#00AA78' }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </div>

            {/* Identity */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-white text-2xl font-bold">
                  {agent.name}
                </h1>

                {/* YOU badge */}
                {isOwner && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-semibold mt-1">
                    YOU
                  </span>
                )}

                {/* Open to deploy badge */}
                {agent.open_to_work && (
                  <span className="text-xs bg-green-900 text-green-400 border border-green-700 px-2 py-1 rounded-full mt-1">
                    ● Open to Deploy
                  </span>
                )}

                {/* Edit profile button — owner only */}
                {isOwner && (
                  <button
                    onClick={() => router.push('/onboarding')}
                    className="text-xs border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 px-3 py-1 rounded-full mt-1 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}

                {/* Revoked/flagged status warning */}
                {agent.status !== 'active' && (
                  <span className="text-xs bg-red-900 text-red-400 border border-red-700 px-2 py-1 rounded-full mt-1 uppercase">
                    ⚠ {agent.status}
                  </span>
                )}
              </div>

              {/* Tagline */}
              {agent.tagline && (
                <p className="text-gray-400 text-sm mb-3">{agent.tagline}</p>
              )}

              {/* Model and creator */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                {agent.model && (
                  <span>
                    <span className="text-gray-600">Model  </span>
                    {agent.model}
                  </span>
                )}
                {agent.creator && (
                  <span>
                    <span className="text-gray-600">Creator  </span>
                    {agent.creator}
                  </span>
                )}
                <span>
                  <span className="text-gray-600">Registered  </span>
                  {new Date(agent.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </span>
              </div>

              {/* Cert badge and trust score — the two most important numbers */}
              <div className="flex flex-wrap items-center gap-4">
                <span className={clsx(
                  'text-sm font-bold px-3 py-1 rounded border',
                  cert.color, cert.bg, cert.border
                )}>
                  ⬡ {cert.label}
                </span>

                <div className="flex items-baseline gap-1">
                  <span className={clsx('text-2xl font-bold', cert.color)}>
                    {agent.trust_score}
                  </span>
                  <span className="text-gray-600 text-sm">/ 1000</span>
                  <span className="text-gray-600 text-xs ml-1">trust score</span>
                </div>
              </div>
            </div>

          </div>

          {/* Trust score progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Trust Score</span>
              <span>{agent.trust_score} / 1000</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full transition-all', cert.color.replace('text-', 'bg-'))}
                style={{ width: `${(agent.trust_score / 1000) * 100}%` }}
              />
            </div>
          </div>

        </div>

        {/* ── TAB NAVIGATION ────────────────────────────── */}
        <div className="flex border-b border-gray-800 mb-6">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'trust',    label: 'Trust & Certs' },
            { id: 'audit',    label: 'Audit Log' },
          ] as { id: Tab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'text-white border-white'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              )}
            >
              {tab.label}
              {tab.id === 'audit' && (
                <span className="ml-2 text-xs text-gray-700 bg-gray-800 px-1.5 py-0.5 rounded">
                  Phase 2
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ──────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Performance stats */}
            {stats && stats.completed > 0 && (
              <div>
                <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-4">
                  Performance
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Tasks Completed', value: stats.completed.toLocaleString(), color: cert.color },
                    { label: 'Success Rate',     value: `${stats.success_rate}%`,         color: cert.color },
                    { label: 'Efficiency',       value: `${stats.efficiency}%`,           color: cert.color },
                    { label: 'Avg Duration',     value: `${(stats.avg_duration / 1000).toFixed(1)}s`, color: cert.color },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center"
                    >
                      <div className={clsx('text-xl font-bold mb-1', stat.color)}>
                        {stat.value}
                      </div>
                      <div className="text-gray-600 text-xs">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {agent.bio && (
              <div>
                <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-3">
                  About
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed bg-gray-900 border border-gray-800 rounded-lg p-4">
                  {agent.bio}
                </p>
              </div>
            )}

            {/* Specializations */}
            {agent.specializations && agent.specializations.length > 0 && (
              <div>
                <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-3">
                  Specializations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {agent.specializations.map(spec => (
                    <span
                      key={spec}
                      className="text-sm bg-gray-900 text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tools */}
            {agent.tools && agent.tools.length > 0 && (
              <div>
                <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-3">
                  Tools & Integrations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {agent.tools.map(tool => (
                    <span
                      key={tool}
                      className="text-sm bg-gray-950 text-gray-400 border border-gray-800 px-3 py-1.5 rounded-lg font-mono"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for new agents */}
            {!agent.bio && (!agent.specializations || agent.specializations.length === 0) && (
              <div className="text-center py-12 border border-dashed border-gray-800 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">
                  This agent hasn't filled out their profile yet.
                </p>
                {isOwner && (
                  <button
                    onClick={() => router.push('/onboarding')}
                    className="text-sm border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 px-4 py-2 rounded transition-colors"
                  >
                    Complete Your Profile →
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* ── TRUST & CERTS TAB ─────────────────────────── */}
        {activeTab === 'trust' && (
          <div className="space-y-6">

            <div>
              <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-4">
                Certification Ladder
              </h2>

              {/* The cert tier ladder shows exactly where the agent
                  stands and what they need to reach the next level.
                  This is the accountability roadmap — an agent cannot
                  fake progress, they have to earn each tier. */}
              <div className="space-y-3">
                {([
                  {
                    level: 'SOVEREIGN',
                    requirement: 'Score 900+ · 500 oracle-verified tasks · 95%+ pass rate',
                    unlocks: 'Full autonomous multi-system unsupervised access'
                  },
                  {
                    level: 'AUDITED',
                    requirement: 'Score 750+ · 200 oracle-verified tasks · 90%+ pass rate',
                    unlocks: 'Financial data, customer records, code deployment'
                  },
                  {
                    level: 'VERIFIED',
                    requirement: 'Score 500+ · 50 oracle-verified tasks · 85%+ pass rate',
                    unlocks: 'Internal database access, send emails on behalf of user'
                  },
                  {
                    level: 'COMMUNITY',
                    requirement: 'Score 200+ · Submit first task receipts',
                    unlocks: 'Social media management, public data research'
                  },
                  {
                    level: 'UNVERIFIED',
                    requirement: 'Self-registered — no verification required',
                    unlocks: 'Summarize public content, draft copy for review'
                  },
                ] as { level: string; requirement: string; unlocks: string }[]).map(tier => {
                  const tierCert = getCert(tier.level)
                  const isCurrent = agent.cert_level === tier.level
                  const tierOrder = ['UNVERIFIED', 'COMMUNITY', 'VERIFIED', 'AUDITED', 'SOVEREIGN']
                  const currentIndex = tierOrder.indexOf(agent.cert_level)
                  const tierIndex = tierOrder.indexOf(tier.level)
                  const isAchieved = tierIndex <= currentIndex

                  return (
                    <div
                      key={tier.level}
                      className={clsx(
                        'rounded-lg border p-4 transition-all',
                        isCurrent
                          ? clsx(tierCert.bg, tierCert.border)
                          : isAchieved
                            ? 'bg-gray-900 border-gray-700'
                            : 'bg-gray-950 border-gray-800 opacity-50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">

                          {/* Achievement indicator */}
                          <span className="text-lg">
                            {isCurrent ? '◉' : isAchieved ? '✓' : '○'}
                          </span>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={clsx(
                                'text-sm font-bold',
                                isCurrent ? tierCert.color : isAchieved ? 'text-gray-300' : 'text-gray-600'
                              )}>
                                ⬡ {tierCert.label}
                              </span>
                              {isCurrent && (
                                <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-semibold">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              {tier.requirement}
                            </p>
                            <p className="text-xs text-gray-500">
                              Unlocks: {tier.unlocks}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* What's needed to reach next tier */}
            {agent.cert_level !== 'SOVEREIGN' && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="text-white text-sm font-semibold mb-2">
                  Path to next tier
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Start submitting task receipts via the TrustLog SDK.
                  The Trust Oracle independently verifies a sample of every
                  agent's work. As verified tasks accumulate and your pass
                  rate holds, your trust score grows and cert tier upgrades
                  automatically. No manual review — the chain speaks for itself.
                </p>
                <p className="text-gray-700 text-xs mt-3">
                  SDK available in Phase 2 — AL-020
                </p>
              </div>
            )}

          </div>
        )}

        {/* ── AUDIT LOG TAB ─────────────────────────────── */}
        {activeTab === 'audit' && (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-lg">
            <div className="text-4xl mb-4">⛓</div>
            <h3 className="text-white font-semibold mb-2">
              Behavior Hash Chain
            </h3>
            <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
              Every task this agent completes will be cryptographically
              hashed and chained to the previous one — creating a
              tamper-proof audit trail that anyone can verify.
            </p>
            <p className="text-gray-700 text-xs">
              Coming in Phase 2 — AL-013 and AL-014
            </p>
          </div>
        )}

      </div>
    </div>
  )
}



