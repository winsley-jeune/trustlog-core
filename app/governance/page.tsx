'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Nav from '@/components/Nav'

type CouncilMember = {
  id: string
  name: string
  organization: string
  joined_at: string
  active: boolean
}

type Revocation = {
  id: string
  agent_id: string
  reason: string
  severity: string
  revoked_at: string
  appeal_status: string
  agents?: { name: string } | null
}

export default function GovernancePage() {
  const supabase = createClient()
  const [members, setMembers] = useState<CouncilMember[]>([])
  const [revocations, setRevocations] = useState<Revocation[]>([])
  const [pendingAppeals, setPendingAppeals] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [membersRes, revoRes, appealsRes] = await Promise.all([
        supabase.from('council_members').select('*').order('joined_at'),
        supabase.from('revocations').select('*, agents(name)').order('revoked_at', { ascending: false }).limit(10),
        supabase.from('revocations').select('id').eq('appeal_status', 'pending'),
      ])
      if (membersRes.data) setMembers(membersRes.data)
      if (revoRes.data) setRevocations(revoRes.data as Revocation[])
      setPendingAppeals(appealsRes.data?.length || 0)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-white text-2xl font-bold mb-2">Governance</h1>
        <p className="text-gray-500 text-sm mb-8">
          TrustLog&apos;s governance council ensures neutrality, transparency, and accountability in all certification decisions.
        </p>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-900 rounded-lg" />
          </div>
        ) : (
          <div className="space-y-8">

            {/* Principles */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-white font-semibold mb-3">Governance Principles</h2>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>1. No single entity controls trust verdicts. The Oracle operates independently of any agent creator or deployer.</li>
                <li>2. All verification data, revocations, and appeals are publicly visible. Trust requires transparency.</li>
                <li>3. CRITICAL severity revocations require 2-of-3 council member approval (Phase 4).</li>
              </ul>
            </div>

            {/* Council members */}
            <div>
              <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Council Members</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {members.map(member => (
                  <div key={member.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="text-white font-semibold mb-1">{member.name}</div>
                    <div className="text-gray-500 text-sm">{member.organization}</div>
                    <div className="text-gray-600 text-xs mt-2">
                      Joined {new Date(member.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </div>
                    <span className={`text-xs mt-1 inline-block ${member.active ? 'text-green-500' : 'text-gray-600'}`}>
                      {member.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
                <div className="text-white text-2xl font-bold">{revocations.length}</div>
                <div className="text-gray-600 text-xs">Total Revocations</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
                <div className="text-yellow-400 text-2xl font-bold">{pendingAppeals}</div>
                <div className="text-gray-600 text-xs">Pending Appeals</div>
              </div>
            </div>

            {/* Recent revocations */}
            {revocations.length > 0 && (
              <div>
                <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Recent Revocations</h2>
                <div className="space-y-2">
                  {revocations.map(rev => (
                    <div key={rev.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white text-sm">{(rev.agents as Record<string, unknown>)?.name as string || 'Unknown'}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${rev.severity === 'CRITICAL' ? 'bg-red-900 text-red-400' : 'bg-orange-900 text-orange-400'}`}>
                          {rev.severity}
                        </span>
                      </div>
                      <span className="text-gray-600 text-xs">{new Date(rev.revoked_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
