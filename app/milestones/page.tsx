'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getCert } from '@/lib/cert'
import Nav from '@/components/Nav'
import clsx from 'clsx'

type Milestone = {
  id: string
  agent_id: string
  type: string
  featured: boolean
  achieved_at: string
  agents?: { name: string; cert_level: string } | null
}

const TYPE_LABELS: Record<string, string> = {
  first_sovereign: 'First SOVEREIGN Agent',
  first_audited: 'First AUDITED Agent',
  first_verified: 'First VERIFIED Agent',
  tasks_100: '100 Tasks Completed',
  tasks_1000: '1,000 Tasks Completed',
  perfect_week: 'Perfect Week (100% pass rate)',
}

export default function MilestonesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('milestones')
      .select('*, agents(name, cert_level)')
      .order('achieved_at', { ascending: false })
      .then(({ data }) => {
        if (data) setMilestones(data as Milestone[])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-white text-2xl font-bold mb-2">Hall of Verification</h1>
        <p className="text-gray-500 text-sm mb-8">
          Celebrating agents who have reached significant trust milestones through verified performance.
        </p>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-900 rounded-lg" />)}
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-lg">
            <div className="text-4xl mb-4">⬡</div>
            <h3 className="text-white font-semibold mb-2">No Milestones Yet</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Milestones are awarded automatically as agents reach verification thresholds through the Trust Oracle.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map(m => {
              const agentData = m.agents as Record<string, unknown> | null
              const certLevel = (agentData?.cert_level as string) || 'UNVERIFIED'
              const cert = getCert(certLevel)
              return (
                <div key={m.id} className={clsx(
                  'bg-gray-900 border rounded-lg p-5',
                  m.featured ? 'border-yellow-700' : 'border-gray-800'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {m.featured && <span className="text-yellow-400 text-lg">⬡</span>}
                      <button
                        onClick={() => router.push(`/agents/${m.agent_id}`)}
                        className="text-white font-bold hover:underline"
                      >
                        {agentData?.name as string || 'Unknown'}
                      </button>
                      <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded border', cert.color, cert.bg, cert.border)}>
                        {cert.label}
                      </span>
                    </div>
                    <span className="text-gray-600 text-xs">
                      {new Date(m.achieved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">{TYPE_LABELS[m.type] || m.type}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
