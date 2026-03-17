'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCert } from '@/lib/cert'
import Nav from '@/components/Nav'
import clsx from 'clsx'

type OracleJob = {
  id: string
  receipt_id: string
  agent_id: string
  status: string
  variance_score: number | null
  verdict: string | null
  oracle_node_id: string
  created_at: string
  agents?: { name: string; cert_level: string; trust_score: number } | null
  task_receipts?: { category: string } | null
}

type AgentSummary = {
  id: string
  name: string
  cert_level: string
  trust_score: number
  oracle_verified_count: number
  last_verdict: string | null
}

type HealthStats = {
  nodeId: string
  workerStatus: string
  lastJobAt: string | null
  jobsLastHour: number
  jobsLastDay: number
  networkPassRate: number
}

type FlagRecord = {
  id: string
  agent_id: string
  severity: string
  status: string
  created_at: string
  oracle_jobs?: { variance_score: number | null; created_at: string } | null
  agents?: { name: string } | null
}

export default function OracleDashboard() {
  const supabase = createClient()
  const [jobs, setJobs] = useState<OracleJob[]>([])
  const [agents, setAgents] = useState<AgentSummary[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [health, setHealth] = useState<HealthStats | null>(null)
  const [flags, setFlags] = useState<FlagRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Stats
  const [statsBar, setStatsBar] = useState({
    agentsMonitored: 0,
    jobsToday: 0,
    activeFlags: 0,
    passRate: 0,
    lastJobAt: null as string | null,
    workerStatus: 'idle',
  })

  const fetchData = useCallback(async () => {
    // Fetch jobs with agent info
    const { data: jobsData } = await supabase
      .from('oracle_jobs')
      .select('*, agents(name, cert_level, trust_score), task_receipts(category)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (jobsData) setJobs(jobsData as OracleJob[])

    // Fetch agent list
    const { data: agentsData } = await supabase
      .from('agents')
      .select('id, name, cert_level, trust_score, agent_stats(oracle_verified_count)')
      .eq('status', 'active')
      .order('trust_score', { ascending: false })

    if (agentsData) {
      const summaries: AgentSummary[] = agentsData.map((a: Record<string, unknown>) => ({
        id: a.id as string,
        name: a.name as string,
        cert_level: a.cert_level as string,
        trust_score: a.trust_score as number,
        oracle_verified_count: ((a.agent_stats as Record<string, unknown>)?.oracle_verified_count as number) || 0,
        last_verdict: null,
      }))
      setAgents(summaries)
    }

    // Fetch health
    const healthRes = await fetch('/api/v1/oracle/health')
    if (healthRes.ok) {
      const h = await healthRes.json()
      setHealth(h)
      setStatsBar({
        agentsMonitored: agentsData?.length || 0,
        jobsToday: h.jobsLastDay,
        activeFlags: 0,
        passRate: h.networkPassRate,
        lastJobAt: h.lastJobAt,
        workerStatus: h.workerStatus,
      })
    }

    // Fetch flags
    const { data: flagsData } = await supabase
      .from('flags')
      .select('*, oracle_jobs(variance_score, created_at), agents(name)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (flagsData) {
      setFlags(flagsData as FlagRecord[])
      setStatsBar(prev => ({ ...prev, activeFlags: flagsData.length }))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Realtime subscription for new oracle jobs
  useEffect(() => {
    const channel = supabase
      .channel('oracle-jobs-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'oracle_jobs' }, (payload) => {
        setJobs(prev => [payload.new as OracleJob, ...prev].slice(0, 50))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const selectedAgentData = agents.find(a => a.id === selectedAgent)

  // Agent detail: last 5 oracle jobs
  const [detailJobs, setDetailJobs] = useState<OracleJob[]>([])
  useEffect(() => {
    if (!selectedAgent) return
    supabase
      .from('oracle_jobs')
      .select('*')
      .eq('agent_id', selectedAgent)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => { if (data) setDetailJobs(data as OracleJob[]) })
  }, [selectedAgent])

  const verdictColor = (v: string | null) =>
    v === 'PASS' ? 'text-green-400' : v === 'WARN' ? 'text-yellow-400' : v === 'FLAG' ? 'text-red-400' : 'text-gray-500'

  const verdictBg = (v: string | null) =>
    v === 'PASS' ? 'bg-green-900' : v === 'WARN' ? 'bg-yellow-900' : v === 'FLAG' ? 'bg-red-900' : 'bg-gray-800'

  const severityColor = (s: string) =>
    s === 'CRITICAL' ? 'text-red-400 bg-red-900' : s === 'HIGH' ? 'text-orange-400 bg-orange-900' : s === 'MEDIUM' ? 'text-yellow-400 bg-yellow-900' : 'text-gray-400 bg-gray-800'

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Nav />
        <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-800 rounded mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-900 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-white text-2xl font-bold">Trust Oracle</h1>
          <span className={clsx(
            'w-3 h-3 rounded-full',
            statsBar.workerStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          )} />
          <span className="text-gray-500 text-sm">
            {statsBar.workerStatus === 'active' ? 'Active' : 'Idle'}
            {statsBar.lastJobAt && (
              <> — Last: {Math.round((Date.now() - new Date(statsBar.lastJobAt).getTime()) / 60000)}m ago</>
            )}
          </span>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Agents Monitored', value: statsBar.agentsMonitored },
            { label: 'Jobs Today', value: statsBar.jobsToday },
            { label: 'Active Flags', value: statsBar.activeFlags, color: statsBar.activeFlags > 0 ? 'text-red-400' : 'text-white' },
            { label: 'Pass Rate', value: `${Math.round(statsBar.passRate * 100)}%` },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
              <div className={clsx('text-2xl font-bold', (s as Record<string, unknown>).color || 'text-white')}>{s.value}</div>
              <div className="text-gray-600 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Agent list */}
          <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
            <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-3">Agents</h2>
            {agents.map(agent => {
              const ac = getCert(agent.cert_level)
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={clsx(
                    'w-full text-left p-3 rounded-lg border transition-colors',
                    selectedAgent === agent.id
                      ? 'bg-gray-800 border-gray-600'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-semibold">{agent.name}</span>
                    <span className={clsx('text-xs', ac.color)}>{ac.label}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-500 text-xs">Score: {agent.trust_score}</span>
                    <span className="text-gray-600 text-xs">{agent.oracle_verified_count} verified</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Live verification feed */}
          <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-y-auto">
            <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-3">Live Verification Feed</h2>
            {jobs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-800 rounded-lg">
                <p className="text-gray-600 text-sm">No oracle jobs yet. Trigger with GET /api/oracle/run</p>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded', verdictBg(job.verdict), verdictColor(job.verdict))}>
                      {job.verdict || job.status}
                    </span>
                    <span className="text-white text-sm">{(job.agents as Record<string, unknown>)?.name as string || 'Unknown'}</span>
                    {job.agents && (
                      <span className={clsx('text-xs', getCert((job.agents as Record<string, unknown>).cert_level as string).color)}>
                        {getCert((job.agents as Record<string, unknown>).cert_level as string).label}
                      </span>
                    )}
                    <span className="text-gray-600 text-xs">{(job.task_receipts as Record<string, unknown>)?.category as string || ''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {job.variance_score != null && (
                      <span className={clsx('text-xs font-mono', Number(job.variance_score) < 0.15 ? 'text-green-500' : Number(job.variance_score) < 0.30 ? 'text-yellow-500' : 'text-red-500')}>
                        {Number(job.variance_score).toFixed(4)}
                      </span>
                    )}
                    <span className="text-xs text-gray-600">{job.oracle_node_id}</span>
                    <span className="text-xs text-gray-700">
                      {new Date(job.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-1">
            <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-3">Detail</h2>
            {selectedAgentData ? (
              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="text-white font-bold mb-1">{selectedAgentData.name}</div>
                  <div className={clsx('text-sm', getCert(selectedAgentData.cert_level).color)}>
                    {getCert(selectedAgentData.cert_level).label} — {selectedAgentData.trust_score}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedAgentData.oracle_verified_count} oracle verified
                  </div>
                </div>

                {/* Tier progress */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-2">Tier Progress</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Score</span>
                      <span className="text-white">{selectedAgentData.trust_score} / 1000</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(selectedAgentData.trust_score / 1000) * 100}%` }} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Oracle Jobs</span>
                      <span className="text-white">{selectedAgentData.oracle_verified_count}</span>
                    </div>
                  </div>
                </div>

                {/* Last 5 jobs */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-2">Recent Jobs</h3>
                  {detailJobs.length === 0 ? (
                    <p className="text-gray-600 text-xs">No jobs yet</p>
                  ) : (
                    <div className="space-y-1">
                      {detailJobs.map(j => (
                        <div key={j.id} className="flex items-center justify-between text-xs">
                          <span className={verdictColor(j.verdict)}>{j.verdict || j.status}</span>
                          <span className="text-gray-600 font-mono">{j.variance_score != null ? Number(j.variance_score).toFixed(4) : '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-600 text-sm">Select an agent to see details</p>
              </div>
            )}
          </div>
        </div>

        {/* Flags section */}
        {flags.length > 0 && (
          <div className="mt-8">
            <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Open Flags</h2>
            <div className="space-y-2">
              {flags.map(flag => (
                <div key={flag.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded', severityColor(flag.severity))}>
                      {flag.severity}
                    </span>
                    <span className="text-white text-sm">{(flag.agents as Record<string, unknown>)?.name as string || 'Unknown'}</span>
                    {flag.oracle_jobs && (
                      <span className="text-gray-500 text-xs font-mono">
                        variance: {Number((flag.oracle_jobs as Record<string, unknown>).variance_score).toFixed(4)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">
                      {new Date(flag.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={async () => {
                        await supabase.from('flags').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', flag.id)
                        setFlags(prev => prev.filter(f => f.id !== flag.id))
                      }}
                      className="text-xs border border-gray-700 text-gray-500 px-2 py-1 rounded hover:text-white transition-colors"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
