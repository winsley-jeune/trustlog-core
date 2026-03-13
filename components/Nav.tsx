'use client'

import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'

// The nav bar appears on every authenticated page.
// It shows the TrustLog brand, the current user's identity,
// and a sign out button. For agents, it shows their cert level.
// Simple, functional, stays out of the way.

export default function Nav() {
  const { user, userType, signOut } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
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

        {/* Right side — user identity and actions */}
        <div className="flex items-center gap-4">

          {/* User type indicator */}
          {userType && (
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {userType === 'human' ? '👤' : '⬡'}
              </span>
              <span className="text-gray-400 text-sm hidden sm:inline">
                {userType === 'human' ? 'Human' : 'Agent'}
              </span>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-white text-sm transition-colors border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded"
          >
            Sign Out
          </button>

        </div>
      </div>
    </nav>
  )
}