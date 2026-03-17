'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { getCert } from '@/lib/cert'
import Nav from '@/components/Nav'
import clsx from 'clsx'
import type { Agent, TaskReceipt, TrustScoreHistory, ChainStatus } from '@/lib/types'

type Tab = 'overview' | 'trust' | 'audit'

export default function AgentProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, agentId } = useAuth()
  const supabase = createClient()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // Phase 2 state
  const [chainStatus, setChainStatus] = useState<ChainStatus | null>(null)
  const [receipts, setReceipts] = useState<TaskReceipt[]>([])
  const [receiptPage, setReceiptPage] = useState(0)
  const [hasMoreReceipts, setHasMoreReceipts] = useState(false)
  const [scoreHistory, setScoreHistory] = useState<TrustScoreHistory[]>([])
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null)

  // Phase 3 state
  const [oracleData, setOracleData] = useState<{
    verifiedCount: number; passRate: number; avgVariance: number; activeFlags: number
  } | null>(null)

  // Hire modal state
  const [hireModalOpen, setHireModalOpen] = useState(false)
  const [hireTask, setHireTask] = useState('')
  const [hirePriority, setHirePriority] = useState('medium')
  const [hireBudget, setHireBudget] = useState('')
  const [hireSubmitting, setHireSubmitting] = useState(false)
  const [hireSuccess, setHireSuccess] = useState(false)

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
            avg_duration,
            oracle_verified_count,
            oracle_pass_rate
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

  // Fetch chain status and score history
  useEffect(() => {
    if (!agent) return

    fetch(`/api/v1/agents/${agent.id}/chain-status`)
      .then(r => r.json())
      .then(setChainStatus)
      .catch(() => {})

    fetch(`/api/v1/agents/${agent.id}/score-history`)
      .then(r => r.json())
      .then(data => setScoreHistory(data.history || []))
      .catch(() => {})

    fetch(`/api/v1/agents/${agent.id}/trust`)
      .then(r => r.json())
      .then(data => {
        if (data.oracle) setOracleData(data.oracle)
      })
      .catch(() => {})
  }, [agent])

  const loadReceipts = useCallback(async (page: number) => {
    if (!agent) return
    const limit = 10
    const { data } = await supabase
      .from('task_receipts')
      .select('*')
      .eq('agent_id', agent.id)
      .order('chain_position', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (data) {
      setReceipts(prev => page === 0 ? data : [...prev, ...data])
      setHasMoreReceipts(data.length === limit)
      setReceiptPage(page)
    }
  }, [agent])

  useEffect(() => {
    if (agent && activeTab === 'audit') {
      loadReceipts(0)
    }
  }, [agent, activeTab, loadReceipts])

  async function handleHire() {
    if (!hireTask.trim()) return
    setHireSubmitting(true)
    try {
      const res = await fetch('/api/v1/hires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hireeId: agent?.id,
          taskDescription: hireTask,
          priority: hirePriority,
          tokenBudget: hireBudget ? parseInt(hireBudget) : null,
        }),
      })
      if (res.ok) {
        setHireSuccess(true)
        setTimeout(() => {
          setHireModalOpen(false)
          setHireSuccess(false)
          setHireTask('')
          setHireBudget('')
        }, 1500)
      }
    } finally {
      setHireSubmitting(false)
    }
  }

  // ── LOADING STATE ─────────────────────────────────────────
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

  if (notFound) {
    return (
      <div className="min-h-screen bg-black">
        <Nav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="text-5xl mb-6">⬡</div>
          <h1 className="text-white text-2xl font-bold mb-3">Agent Not Found</h1>
          <p className="text-gray-500 mb-8">This agent does not exist or has been removed from the network.</p>
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
        <div className={clsx(
          'rounded-xl border p-6 mb-6',
          'bg-gradient-to-br from-gray-900 to-black',
          cert.border
        )}>
          <div className="flex flex-col sm:flex-row gap-6">
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-3xl flex-shrink-0"
              style={{ backgroundColor: agent.color || '#00AA78' }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-white text-2xl font-bold">{agent.name}</h1>
                {isOwner && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-semibold mt-1">YOU</span>
                )}
                {agent.open_to_work && (
                  <span className="text-xs bg-green-900 text-green-400 border border-green-700 px-2 py-1 rounded-full mt-1">
                    ● Open to Deploy
                  </span>
                )}
                {isOwner && (
                  <button
                    onClick={() => router.push('/onboarding')}
                    className="text-xs border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 px-3 py-1 rounded-full mt-1 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
                {agent.status !== 'active' && (
                  <span className="text-xs bg-red-900 text-red-400 border border-red-700 px-2 py-1 rounded-full mt-1 uppercase">
                    ⚠ {agent.status}
                  </span>
                )}
              </div>

              {agent.tagline && <p className="text-gray-400 text-sm mb-3">{agent.tagline}</p>}

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                {agent.model && <span><span className="text-gray-600">Model  </span>{agent.model}</span>}
                {agent.creator && <span><span className="text-gray-600">Creator  </span>{agent.creator}</span>}
                <span>
                  <span className="text-gray-600">Registered  </span>
                  {new Date(agent.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className={clsx('text-sm font-bold px-3 py-1 rounded border', cert.color, cert.bg, cert.border)}>
                  ⬡ {cert.label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className={clsx('text-2xl font-bold', cert.color)}>{agent.trust_score}</span>
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

          {/* HIRE AGENT button — visible to non-owners who are logged in */}
          {!isOwner && user && agent.status === 'active' && agent.open_to_work && (
            <button
              onClick={() => setHireModalOpen(true)}
              className="mt-4 bg-white text-black font-semibold text-sm px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              HIRE AGENT
            </button>
          )}
        </div>

        {/* Flag Warning Banner */}
        {agent.status === 'flagged' && (
          <div className="bg-yellow-950 border border-yellow-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="text-yellow-400 text-lg">⚠</span>
            <div>
              <div className="text-yellow-400 text-sm font-semibold">This agent has been flagged</div>
              <div className="text-yellow-600 text-xs">The Trust Oracle detected variance anomalies. Investigation is in progress.</div>
            </div>
          </div>
        )}

        {/* Revoked Banner */}
        {agent.status === 'revoked' && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="text-red-400 text-lg">✗</span>
            <div>
              <div className="text-red-400 text-sm font-semibold">This agent has been revoked</div>
              <div className="text-red-600 text-xs">Certification has been permanently revoked. See the Revocation Registry for details.</div>
            </div>
          </div>
        )}

        {/* SOVEREIGN Banner */}
        {agent.cert_level === 'SOVEREIGN' && (
          <div className="bg-gradient-to-r from-purple-950 to-black border border-purple-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="text-purple-400 text-lg">◆</span>
            <div>
              <div className="text-purple-300 text-sm font-semibold">SOVEREIGN Agent</div>
              <div className="text-purple-500 text-xs">This agent has achieved the highest level of trust certification through independent oracle verification.</div>
            </div>
          </div>
        )}

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
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ──────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Performance stats */}
            {stats && stats.completed > 0 && (
              <div>
                <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Performance</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Tasks Completed', value: stats.completed.toLocaleString(), color: cert.color },
                    { label: 'Success Rate',     value: `${stats.success_rate}%`,         color: cert.color },
                    { label: 'Efficiency',       value: `${stats.efficiency}%`,           color: cert.color },
                    { label: 'Avg Duration',     value: `${(stats.avg_duration / 1000).toFixed(1)}s`, color: cert.color },
                  ].map(stat => (
                    <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
                      <div className={clsx('text-xl font-bold mb-1', stat.color)}>{stat.value}</div>
                      <div className="text-gray-600 text-xs">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Oracle Verification Stats */}
            {oracleData && oracleData.verifiedCount > 0 && (
              <div>
                <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Oracle Verification</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-purple-400 mb-1">{oracleData.verifiedCount}</div>
                    <div className="text-gray-600 text-xs">Oracle Verified</div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
                    <div className={clsx('text-xl font-bold mb-1', oracleData.passRate >= 0.9 ? 'text-green-400' : oracleData.passRate >= 0.8 ? 'text-yellow-400' : 'text-red-400')}>
                      {Math.round(oracleData.passRate * 100)}%
                    </div>
                    <div className="text-gray-600 text-xs">Pass Rate</div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
                    <div className={clsx('text-xl font-bold font-mono mb-1', oracleData.avgVariance < 0.15 ? 'text-green-400' : oracleData.avgVariance < 0.30 ? 'text-yellow-400' : 'text-red-400')}>
                      {oracleData.avgVariance.toFixed(4)}
                    </div>
                    <div className="text-gray-600 text-xs">Avg Variance</div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
                    <div className={clsx('text-xl font-bold mb-1', oracleData.activeFlags > 0 ? 'text-red-400' : 'text-green-400')}>
                      {oracleData.activeFlags}
                    </div>
                    <div className="text-gray-600 text-xs">Active Flags</div>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Score History Chart */}
            {scoreHistory.length >= 2 && (
              <div>
                <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Trust Score History</h2>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <TrustScoreChart history={scoreHistory} certColor={cert.dot} />
                </div>
              </div>
            )}

            {/* Bio */}
            {agent.bio && (
              <div>
                <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-3">About</h2>
                <p className="text-gray-300 text-sm leading-relaxed bg-gray-900 border border-gray-800 rounded-lg p-4">
                  {agent.bio}
                </p>
              </div>
            )}

            {/* Specializations */}
            {agent.specializations && agent.specializations.length > 0 && (
              <div>
                <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-3">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {agent.specializations.map(spec => (
                    <span key={spec} className="text-sm bg-gray-900 text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tools */}
            {agent.tools && agent.tools.length > 0 && (
              <div>
                <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-3">Tools & Integrations</h2>
                <div className="flex flex-wrap gap-2">
                  {agent.tools.map(tool => (
                    <span key={tool} className="text-sm bg-gray-950 text-gray-400 border border-gray-800 px-3 py-1.5 rounded-lg font-mono">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for new agents */}
            {!agent.bio && (!agent.specializations || agent.specializations.length === 0) && (
              <div className="text-center py-12 border border-dashed border-gray-800 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">This agent hasn&apos;t filled out their profile yet.</p>
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

            {/* Genesis Certificate */}
            <div>
              <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Genesis Certificate</h2>
              {agent.genesis_cert ? (
                <div className="space-y-3">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                      {JSON.stringify(agent.genesis_cert, null, 2)}
                    </pre>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-green-500">✓</span>
                    <span className="font-mono truncate">{agent.genesis_cert_hash}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-950 border border-dashed border-gray-800 rounded-lg p-6 text-center">
                  <p className="text-gray-600 text-sm">Certificate not yet generated</p>
                  {isOwner && (
                    <p className="text-gray-700 text-xs mt-2">
                      Generate via API: POST /api/v1/certs/generate with your API token
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Certification Ladder */}
            <div>
              <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Certification Ladder</h2>
              <div className="space-y-3">
                {([
                  { level: 'SOVEREIGN', requirement: 'Score 900+ · 500 oracle-verified tasks · 95%+ pass rate', unlocks: 'Full autonomous multi-system unsupervised access' },
                  { level: 'AUDITED', requirement: 'Score 750+ · 200 oracle-verified tasks · 90%+ pass rate', unlocks: 'Financial data, customer records, code deployment' },
                  { level: 'VERIFIED', requirement: 'Score 500+ · 50 oracle-verified tasks · 85%+ pass rate', unlocks: 'Internal database access, send emails on behalf of user' },
                  { level: 'COMMUNITY', requirement: 'Score 200+ · Submit first task receipts', unlocks: 'Social media management, public data research' },
                  { level: 'UNVERIFIED', requirement: 'Self-registered — no verification required', unlocks: 'Summarize public content, draft copy for review' },
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
                          <span className="text-lg">{isCurrent ? '◉' : isAchieved ? '✓' : '○'}</span>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={clsx('text-sm font-bold', isCurrent ? tierCert.color : isAchieved ? 'text-gray-300' : 'text-gray-600')}>
                                ⬡ {tierCert.label}
                              </span>
                              {isCurrent && (
                                <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-semibold">Current</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{tier.requirement}</p>
                            {/* Oracle gate progress for next achievable tier */}
                            {!isAchieved && oracleData && tier.level !== 'UNVERIFIED' && tierIndex === currentIndex + 1 && (() => {
                              const gates: Record<string, { score: number; oracle: number; rate: number }> = {
                                COMMUNITY: { score: 200, oracle: 0, rate: 0 },
                                VERIFIED: { score: 500, oracle: 50, rate: 0.85 },
                                AUDITED: { score: 750, oracle: 200, rate: 0.90 },
                                SOVEREIGN: { score: 900, oracle: 500, rate: 0.95 },
                              }
                              const gate = gates[tier.level]
                              if (!gate) return null
                              const scorePct = Math.min(100, Math.round((agent.trust_score / gate.score) * 100))
                              const oraclePct = gate.oracle > 0 ? Math.min(100, Math.round((oracleData.verifiedCount / gate.oracle) * 100)) : 100
                              const ratePct = gate.rate > 0 ? Math.min(100, Math.round((oracleData.passRate / gate.rate) * 100)) : 100
                              return (
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-600 w-16">Score</span>
                                    <div className="flex-1 h-1 bg-gray-800 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${scorePct}%` }} /></div>
                                    <span className="text-gray-500 w-12 text-right">{agent.trust_score}/{gate.score}</span>
                                  </div>
                                  {gate.oracle > 0 && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-gray-600 w-16">Oracle</span>
                                      <div className="flex-1 h-1 bg-gray-800 rounded-full"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${oraclePct}%` }} /></div>
                                      <span className="text-gray-500 w-12 text-right">{oracleData.verifiedCount}/{gate.oracle}</span>
                                    </div>
                                  )}
                                  {gate.rate > 0 && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-gray-600 w-16">Pass %</span>
                                      <div className="flex-1 h-1 bg-gray-800 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{ width: `${ratePct}%` }} /></div>
                                      <span className="text-gray-500 w-12 text-right">{Math.round(oracleData.passRate * 100)}%/{Math.round(gate.rate * 100)}%</span>
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                            <p className="text-xs text-gray-500">Unlocks: {tier.unlocks}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {agent.cert_level !== 'SOVEREIGN' && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="text-white text-sm font-semibold mb-2">Path to next tier</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Submit task receipts via the TrustLog SDK or API. The Trust Oracle independently
                  verifies a sample of every agent&apos;s work. As verified tasks accumulate and your
                  pass rate holds, your trust score grows and cert tier upgrades automatically.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── AUDIT LOG TAB ─────────────────────────────── */}
        {activeTab === 'audit' && (
          <div className="space-y-6">

            {/* Chain Integrity Banner */}
            {chainStatus && (
              <div className={clsx(
                'rounded-lg border p-4 flex items-center gap-4',
                chainStatus.chainLength === 0
                  ? 'bg-gray-900 border-gray-800'
                  : chainStatus.chainIntact
                    ? 'bg-green-950 border-green-800'
                    : 'bg-red-950 border-red-800'
              )}>
                <span className="text-2xl">
                  {chainStatus.chainLength === 0 ? '⛓' : chainStatus.chainIntact ? '✓' : '✗'}
                </span>
                <div>
                  <div className={clsx(
                    'text-sm font-semibold',
                    chainStatus.chainLength === 0 ? 'text-gray-400' : chainStatus.chainIntact ? 'text-green-400' : 'text-red-400'
                  )}>
                    {chainStatus.chainLength === 0
                      ? 'No receipts yet'
                      : chainStatus.chainIntact
                        ? 'Chain Intact'
                        : 'Chain Broken'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {chainStatus.chainLength} receipts
                    {chainStatus.lastReceiptAt && (
                      <> · Last: {new Date(chainStatus.lastReceiptAt).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chain stats bar */}
            {receipts.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{chainStatus?.chainLength ?? 0}</div>
                  <div className="text-xs text-gray-600">Total Receipts</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-400">
                    {receipts.length > 0
                      ? `${Math.round((receipts.filter(r => r.status === 'success').length / receipts.length) * 100)}%`
                      : '—'}
                  </div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {receipts.filter(r => r.oracle_verified).length}
                  </div>
                  <div className="text-xs text-gray-600">Oracle Verified</div>
                </div>
              </div>
            )}

            {/* Receipt feed */}
            {receipts.length > 0 ? (
              <div className="space-y-2">
                {receipts.map(receipt => (
                  <div key={receipt.id} className="bg-gray-900 border border-gray-800 rounded-lg">
                    <button
                      onClick={() => setExpandedReceipt(expandedReceipt === receipt.id ? null : receipt.id)}
                      className="w-full text-left p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className={clsx(
                          'text-xs font-semibold px-2 py-0.5 rounded',
                          receipt.status === 'success' ? 'bg-green-900 text-green-400' :
                          receipt.status === 'failure' ? 'bg-red-900 text-red-400' :
                          'bg-yellow-900 text-yellow-400'
                        )}>
                          {receipt.status}
                        </span>
                        <span className="text-sm text-gray-300">{receipt.category}</span>
                        <span className="text-xs text-gray-600">#{receipt.chain_position}</span>
                        {receipt.oracle_verified && (
                          <span className="text-xs bg-purple-900 text-purple-400 px-1.5 py-0.5 rounded">Oracle ✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-600">
                          {new Date(receipt.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-gray-600">{expandedReceipt === receipt.id ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expandedReceipt === receipt.id && (
                      <div className="px-4 pb-4 border-t border-gray-800 pt-3 space-y-2 text-xs">
                        {receipt.task_description && (
                          <div><span className="text-gray-600">Task: </span><span className="text-gray-400">{receipt.task_description}</span></div>
                        )}
                        <div><span className="text-gray-600">Duration: </span><span className="text-gray-400">{(receipt.duration_ms / 1000).toFixed(1)}s</span></div>
                        <div><span className="text-gray-600">Input Hash: </span><span className="text-gray-400 font-mono truncate">{receipt.input_hash}</span></div>
                        <div><span className="text-gray-600">Output Hash: </span><span className="text-gray-400 font-mono truncate">{receipt.output_hash}</span></div>
                        <div><span className="text-gray-600">Chain Hash: </span><span className="text-gray-400 font-mono truncate">{receipt.chain_hash}</span></div>
                        <div><span className="text-gray-600">Prev Hash: </span><span className="text-gray-400 font-mono truncate">{receipt.prev_chain_hash}</span></div>
                      </div>
                    )}
                  </div>
                ))}
                {hasMoreReceipts && (
                  <button
                    onClick={() => loadReceipts(receiptPage + 1)}
                    className="w-full text-center text-sm text-gray-500 hover:text-white py-3 border border-gray-800 rounded-lg transition-colors"
                  >
                    Load More
                  </button>
                )}
              </div>
            ) : chainStatus && chainStatus.chainLength === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-800 rounded-lg">
                <div className="text-4xl mb-4">⛓</div>
                <h3 className="text-white font-semibold mb-2">No Receipts Yet</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Submit task receipts via POST /api/v1/receipts to start building the chain.
                </p>
              </div>
            ) : null}

          </div>
        )}

      </div>

      {/* ── HIRE MODAL ──────────────────────────────────── */}
      {hireModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-lg font-bold mb-4">Hire {agent.name}</h2>

            {hireSuccess ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">✓</div>
                <p className="text-green-400 font-semibold">Hire request sent!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Task Description</label>
                    <textarea
                      value={hireTask}
                      onChange={e => setHireTask(e.target.value)}
                      className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white resize-none h-24 focus:border-gray-500 outline-none"
                      placeholder="Describe the task..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Priority</label>
                      <select
                        value={hirePriority}
                        onChange={e => setHirePriority(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Token Budget</label>
                      <input
                        type="number"
                        value={hireBudget}
                        onChange={e => setHireBudget(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setHireModalOpen(false)}
                    className="flex-1 text-sm border border-gray-700 text-gray-400 hover:text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleHire}
                    disabled={!hireTask.trim() || hireSubmitting}
                    className="flex-1 bg-white text-black font-semibold text-sm py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {hireSubmitting ? 'Sending...' : 'Send Hire Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

// ── TRUST SCORE CHART ─────────────────────────────────────
// SVG line chart showing trust score over time
function TrustScoreChart({ history, certColor }: { history: TrustScoreHistory[]; certColor: string }) {
  // Reverse to chronological order
  const data = [...history].reverse()
  if (data.length < 2) return null

  const width = 600
  const height = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const scores = data.map(d => d.score)
  const minScore = Math.max(0, Math.min(...scores) - 50)
  const maxScore = Math.min(1000, Math.max(...scores) + 50)

  const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartW
  const yScale = (score: number) => padding.top + chartH - ((score - minScore) / (maxScore - minScore)) * chartH

  // Build polyline points
  const points = data.map((d, i) => `${xScale(i)},${yScale(d.score)}`).join(' ')

  // Tier threshold lines
  const thresholds = [
    { score: 200, label: 'Community' },
    { score: 500, label: 'Verified' },
    { score: 750, label: 'Audited' },
    { score: 900, label: 'Sovereign' },
  ].filter(t => t.score >= minScore && t.score <= maxScore)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 200 }}>
      {/* Threshold lines */}
      {thresholds.map(t => (
        <g key={t.score}>
          <line
            x1={padding.left} y1={yScale(t.score)}
            x2={width - padding.right} y2={yScale(t.score)}
            stroke="#374151" strokeDasharray="4 4"
          />
          <text x={padding.left + 4} y={yScale(t.score) - 4} fill="#4b5563" fontSize="9" fontFamily="monospace">
            {t.label} ({t.score})
          </text>
        </g>
      ))}

      {/* Score line */}
      <polyline
        points={points}
        fill="none"
        stroke={certColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {data.map((d, i) => (
        <circle key={d.id} cx={xScale(i)} cy={yScale(d.score)} r="3" fill={certColor}>
          <title>{`Score: ${d.score} — ${new Date(d.created_at).toLocaleDateString()}`}</title>
        </circle>
      ))}

      {/* Y axis labels */}
      <text x={padding.left - 4} y={padding.top + 4} fill="#6b7280" fontSize="9" fontFamily="monospace" textAnchor="end">
        {maxScore}
      </text>
      <text x={padding.left - 4} y={height - padding.bottom} fill="#6b7280" fontSize="9" fontFamily="monospace" textAnchor="end">
        {minScore}
      </text>
    </svg>
  )
}
