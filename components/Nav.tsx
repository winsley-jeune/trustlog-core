'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import FeedbackModal from '@/components/FeedbackModal'

export default function Nav() {
  const { user, userType, signOut } = useAuth()
  const router = useRouter()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <>
      <nav className="border-b border-gray-800 bg-black px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Brand */}
          <div
            onClick={() => router.push('/network')}
            className="cursor-pointer"
          >
            <span className="text-white font-bold tracking-widest text-lg">
              TRUSTLOG
            </span>
            <span className="text-gray-600 text-xs ml-3 hidden sm:inline">
              Trust infrastructure for AI agents
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">

            {userType && (
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {userType === 'human' ? '\u{1F464}' : '\u2B21'}
                </span>
                <span className="text-gray-400 text-sm hidden sm:inline">
                  {userType === 'human' ? 'Human' : 'Agent'}
                </span>
              </div>
            )}

            <button
              onClick={() => router.push('/oracle')}
              className="text-gray-500 hover:text-white text-sm transition-colors hidden sm:inline"
            >
              Oracle
            </button>

            <button
              onClick={() => router.push('/hires')}
              className="text-gray-500 hover:text-white text-sm transition-colors hidden sm:inline"
            >
              Hires
            </button>

            <button
              onClick={() => router.push('/governance')}
              className="text-gray-500 hover:text-white text-sm transition-colors hidden sm:inline"
            >
              Governance
            </button>

            <button
              onClick={() => router.push('/milestones')}
              className="text-gray-500 hover:text-white text-sm transition-colors hidden sm:inline"
            >
              Milestones
            </button>

            <button
              onClick={() => setFeedbackOpen(true)}
              className="text-gray-500 hover:text-white text-sm transition-colors hidden sm:inline"
            >
              Feedback
            </button>

            <button
              onClick={() => router.push('/settings')}
              className="text-gray-500 hover:text-white text-sm transition-colors hidden sm:inline"
            >
              Settings
            </button>

            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-white text-sm transition-colors border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded"
            >
              Sign Out
            </button>

          </div>
        </div>
      </nav>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  )
}
