'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import clsx from 'clsx'
import type { Hire } from '@/lib/types'

type Tab = 'hirer' | 'hiree'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-900 text-yellow-400',
  active:    'bg-blue-900 text-blue-400',
  completed: 'bg-green-900 text-green-400',
  cancelled: 'bg-gray-800 text-gray-500',
}

const PRIORITY_STYLES: Record<string, string> = {
  low:      'text-gray-500',
  medium:   'text-blue-400',
  high:     'text-orange-400',
  critical: 'text-red-400',
}

export default function HiresPage() {
  const { user, agentId, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('hirer')
  const [hires, setHires] = useState<Hire[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    async function fetchHires() {
      setLoading(true)
      // If user is an agent, fetch their hires
      const role = activeTab === 'hiree' && agentId ? 'hiree' : 'hirer'
      const agentParam = agentId || ''
      if (!agentParam && activeTab === 'hiree') {
        setHires([])
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/v1/agents/${agentParam}/hires?role=${role}`)
        if (res.ok) {
          const data = await res.json()
          setHires(data)
        }
      } catch {
        // ignore
      }
      setLoading(false)
    }

    if (agentId) {
      fetchHires()
    } else {
      // Human user — fetch hires where they're the hirer
      // We need a different approach since humans don't have an agent ID
      setLoading(false)
    }
  }, [user, agentId, authLoading, activeTab, router])

  async function handleComplete(hireId: string) {
    const res = await fetch(`/api/v1/hires/${hireId}/complete`, { method: 'PATCH' })
    if (res.ok) {
      setHires(prev => prev.map(h => h.id === hireId ? { ...h, status: 'completed' as const } : h))
    }
  }

  async function handleCancel(hireId: string) {
    const res = await fetch(`/api/v1/hires/${hireId}/cancel`, { method: 'PATCH' })
    if (res.ok) {
      setHires(prev => prev.map(h => h.id === hireId ? { ...h, status: 'cancelled' as const } : h))
    }
  }

  const filtered = statusFilter === 'all' ? hires : hires.filter(h => h.status === statusFilter)

  if (authLoading) return null

  return (
    <div className="min-h-screen bg-black">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-white text-2xl font-bold mb-6">Hires</h1>

        {/* Tabs */}
        {agentId && (
          <div className="flex border-b border-gray-800 mb-6">
            {(['hirer', 'hiree'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab
                    ? 'text-white border-white'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                )}
              >
                {tab === 'hirer' ? 'As Hirer' : 'As Hiree'}
              </button>
            ))}
          </div>
        )}

        {/* Status filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'active', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                statusFilter === s
                  ? 'border-gray-500 text-white'
                  : 'border-gray-800 text-gray-600 hover:text-gray-400'
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Hire list */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-900 rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-lg">
            <p className="text-gray-600 text-sm">No hires found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(hire => (
              <div key={hire.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded', STATUS_STYLES[hire.status])}>
                        {hire.status}
                      </span>
                      <span className={clsx('text-xs', PRIORITY_STYLES[hire.priority])}>
                        {hire.priority}
                      </span>
                      {hire.token_budget && (
                        <span className="text-xs text-gray-600">{hire.token_budget.toLocaleString()} tokens</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">{hire.task_description}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      {new Date(hire.created_at).toLocaleDateString()}
                      {hire.completed_at && <> · Completed {new Date(hire.completed_at).toLocaleDateString()}</>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {activeTab === 'hiree' && (hire.status === 'pending' || hire.status === 'active') && (
                      <button
                        onClick={() => handleComplete(hire.id)}
                        className="text-xs bg-green-900 text-green-400 border border-green-700 px-3 py-1.5 rounded-lg hover:bg-green-800 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                    {activeTab === 'hirer' && (hire.status === 'pending' || hire.status === 'active') && (
                      <button
                        onClick={() => handleCancel(hire.id)}
                        className="text-xs border border-gray-700 text-gray-500 px-3 py-1.5 rounded-lg hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
