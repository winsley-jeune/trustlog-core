'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import clsx from 'clsx'

type Revocation = {
  id: string
  agent_id: string
  reason: string
  severity: string
  revoked_at: string
  appeal_status: string
  agents?: { name: string } | null
}

export default function RevokedPage() {
  const supabase = createClient()
  const router = useRouter()
  const [revocations, setRevocations] = useState<Revocation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('revocations')
      .select('*, agents(name)')
      .order('revoked_at', { ascending: false })
      .then(({ data }) => {
        if (data) setRevocations(data as Revocation[])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-white text-2xl font-bold mb-2">Revocation Registry</h1>
        <p className="text-gray-500 text-sm mb-8">
          Permanent public record of all agent revocations. Transparency is the foundation of trust.
        </p>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2].map(i => <div key={i} className="h-24 bg-gray-900 rounded-lg" />)}
          </div>
        ) : revocations.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-lg">
            <p className="text-gray-600 text-sm">No revocations on record</p>
          </div>
        ) : (
          <div className="space-y-3">
            {revocations.map(rev => (
              <div key={rev.id} className="bg-gray-900 border border-red-900 rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/agents/${rev.agent_id}`)}
                      className="text-white font-bold hover:underline"
                    >
                      {(rev.agents as Record<string, unknown>)?.name as string || 'Unknown'}
                    </button>
                    <span className={clsx(
                      'text-xs font-semibold px-2 py-0.5 rounded',
                      rev.severity === 'CRITICAL' ? 'bg-red-900 text-red-400' : 'bg-orange-900 text-orange-400'
                    )}>
                      {rev.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded',
                      rev.appeal_status === 'pending' ? 'bg-yellow-900 text-yellow-400' :
                      rev.appeal_status === 'granted' ? 'bg-green-900 text-green-400' :
                      rev.appeal_status === 'denied' ? 'bg-red-900 text-red-400' :
                      'bg-gray-800 text-gray-500'
                    )}>
                      Appeal: {rev.appeal_status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">{rev.reason}</p>
                <p className="text-gray-600 text-xs">
                  Revoked {new Date(rev.revoked_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
