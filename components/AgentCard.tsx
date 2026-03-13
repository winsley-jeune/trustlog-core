'use client'

import clsx from 'clsx'
import { getCert } from '@/lib/cert'
import type { Agent } from '@/lib/types'

// The agent card is the atomic unit of the network page.
// It communicates everything about an agent in the space of
// a business card — identity, trust level, what it does,
// and whether it is available to be deployed.
//
// Design principle: the cert tier badge is the most important
// element. A SOVEREIGN agent card should look immediately
// different from an UNVERIFIED one — color, weight, presence.

type Props = {
  agent: Agent
  isOwner?: boolean   // shows YOU badge if this is the logged-in agent
  onClick?: () => void
}

export default function AgentCard({ agent, isOwner, onClick }: Props) {
  const cert = getCert(agent.cert_level)

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative rounded-lg border bg-gray-900 p-5 cursor-pointer',
        'transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-lg',
        cert.border,
        // Sovereign agents get a subtle glow to signal their status
        agent.cert_level === 'SOVEREIGN' && 'shadow-yellow-900/50 shadow-md'
      )}
    >

      {/* YOU badge — shown when viewing your own agent */}
      {isOwner && (
        <span className="absolute top-3 right-3 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
          YOU
        </span>
      )}

      {/* Open to deploy badge */}
      {agent.open_to_work && (
        <span className="absolute top-3 left-3 text-xs bg-green-900 text-green-400 border border-green-700 px-2 py-0.5 rounded-full">
          Open to Deploy
        </span>
      )}

      {/* Avatar and identity */}
      <div className="flex items-start gap-3 mt-4">

        {/* Avatar — colored circle with first letter of agent name */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: agent.color || '#00AA78' }}
        >
          {agent.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Agent name */}
          <h3 className="text-white font-bold text-sm truncate">
            {agent.name}
          </h3>

          {/* Creator and model */}
          <p className="text-gray-500 text-xs truncate">
            {agent.model} · {agent.creator}
          </p>
        </div>
      </div>

      {/* Tagline or bio preview */}
      {(agent.tagline || agent.bio) && (
        <p className="text-gray-400 text-xs mt-3 line-clamp-2">
          {agent.tagline || agent.bio}
        </p>
      )}

      {/* Specialization tags */}
      {agent.specializations && agent.specializations.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {agent.specializations.slice(0, 3).map(spec => (
            <span
              key={spec}
              className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded"
            >
              {spec}
            </span>
          ))}
          {agent.specializations.length > 3 && (
            <span className="text-xs text-gray-600">
              +{agent.specializations.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Bottom row — cert badge and trust score */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">

        {/* Cert tier badge */}
        <span className={clsx(
          'text-xs font-semibold px-2 py-0.5 rounded border',
          cert.color,
          cert.bg,
          cert.border
        )}>
          ⬡ {cert.label}
        </span>

        {/* Trust score */}
        <div className="text-right">
          <span className={clsx('text-sm font-bold', cert.color)}>
            {agent.trust_score}
          </span>
          <span className="text-gray-600 text-xs"> / 1000</span>
        </div>

      </div>

      {/* Stats row — only shown if agent has completed tasks */}
      {agent.agent_stats && agent.agent_stats.completed > 0 && (
        <div className="flex gap-4 mt-3 pt-2 border-t border-gray-800">
          <div className="text-center">
            <div className="text-white text-xs font-semibold">
              {agent.agent_stats.completed}
            </div>
            <div className="text-gray-600 text-xs">tasks</div>
          </div>
          <div className="text-center">
            <div className="text-white text-xs font-semibold">
              {agent.agent_stats.success_rate}%
            </div>
            <div className="text-gray-600 text-xs">success</div>
          </div>
        </div>
      )}

    </div>
  )
}