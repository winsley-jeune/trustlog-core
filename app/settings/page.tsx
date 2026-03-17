'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import Nav from '@/components/Nav'
import clsx from 'clsx'

// The settings page serves two different users:
// - Humans: update display name and email preferences
// - Agents: manage their API token
//
// The most important UX principle here is the one-time reveal.
// When a new token is generated, we show it in full with a
// prominent warning. The moment the user navigates away or
// refreshes, it is gone forever. This is intentional —
// it forces the agent creator to treat the token like a secret.

export default function SettingsPage() {
  const { user, userType, agentId } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  // Human settings state
  const [displayName, setDisplayName] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  // Agent token state
  const [tokenPrefix, setTokenPrefix] = useState<string | null>(null)
  const [tokenCreatedAt, setTokenCreatedAt] = useState<string | null>(null)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)

  useEffect(() => {
    if (!user) return

    // Load current display name for humans
    if (userType === 'human') {
      setDisplayName(user.user_metadata?.name || '')
    }

    // Load current token info for agents
    if (userType === 'agent' && agentId) {
      supabase
        .from('agents')
        .select('token_prefix, token_created_at')
        .eq('id', agentId)
        .single()
        .then(({ data }) => {
          if (data) {
            setTokenPrefix(data.token_prefix)
            setTokenCreatedAt(data.token_created_at)
          }
        })
    }
  }, [user, userType, agentId])

  // ── UPDATE DISPLAY NAME ───────────────────────────────────
  async function handleUpdateName() {
    setNameLoading(true)
    setNameSaved(false)

    await supabase.auth.updateUser({
      data: { name: displayName }
    })

    await supabase
      .from('profiles')
      .update({ name: displayName })
      .eq('id', user?.id)

    setNameLoading(false)
    setNameSaved(true)

    // Clear the saved confirmation after 3 seconds
    setTimeout(() => setNameSaved(false), 3000)
  }

  // ── GENERATE TOKEN ────────────────────────────────────────
  async function handleGenerateToken() {
    setTokenLoading(true)
    setShowConfirm(false)
    setNewToken(null)

    const res = await fetch('/api/tokens/generate', { method: 'POST' })
    const data = await res.json()

    if (data.token) {
      setNewToken(data.token)
      setTokenPrefix(data.prefix)
      setTokenCreatedAt(data.created_at)
    }

    setTokenLoading(false)
  }

  // ── COPY TOKEN ────────────────────────────────────────────
  async function handleCopyToken() {
    if (!newToken) return
    await navigator.clipboard.writeText(newToken)
    setTokenCopied(true)
    setTimeout(() => setTokenCopied(false), 3000)
  }

  return (
    <div className="min-h-screen bg-black">
      <Nav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold mb-1">Settings</h1>
          <p className="text-gray-500 text-sm">
            Manage your {userType === 'agent' ? 'agent' : 'account'} settings
          </p>
        </div>

        {/* ── HUMAN SETTINGS ──────────────────────────── */}
        {userType === 'human' && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-white font-semibold mb-4">Account</h2>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-gray-600 text-sm cursor-not-allowed"
                />
                <p className="text-gray-700 text-xs mt-1">
                  Email cannot be changed in this version
                </p>
              </div>

              <button
                onClick={handleUpdateName}
                disabled={nameLoading || !displayName}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
              >
                {nameLoading ? 'Saving...' : nameSaved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ── AGENT TOKEN SETTINGS ─────────────────── */}
        {userType === 'agent' && (
          <div className="space-y-4">

            {/* Current token status */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-white font-semibold mb-1">API Token</h2>
              <p className="text-gray-500 text-xs mb-4">
                Your agent uses this token to submit task receipts to TrustLog.
                Treat it like a password — never commit it to a repository.
              </p>

              {tokenPrefix ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                      Current Token
                    </label>
                    {/* Show masked token — prefix + dots */}
                    <div className="flex items-center gap-3 bg-black border border-gray-700 rounded px-3 py-2">
                      <span className="text-green-400 font-mono text-sm">
                        {tokenPrefix}
                      </span>
                      <span className="text-gray-700 font-mono text-sm">
                        ••••••••••••••••••••••••••••••••••••••••
                      </span>
                    </div>
                  </div>

                  {tokenCreatedAt && (
                    <p className="text-gray-600 text-xs">
                      Generated {new Date(tokenCreatedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-950 border border-yellow-800 rounded px-3 py-2">
                  <p className="text-yellow-400 text-xs">
                    No API token generated yet. Generate one below to start submitting task receipts.
                  </p>
                </div>
              )}
            </div>

            {/* New token reveal — shown immediately after generation */}
            {newToken && (
              <div className="bg-green-950 border border-green-700 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-green-400 text-lg">⚠</span>
                  <div>
                    <p className="text-green-400 text-sm font-semibold mb-1">
                      Save this token now
                    </p>
                    <p className="text-green-700 text-xs">
                      This is the only time your full token will be shown.
                      After you leave this page it cannot be recovered —
                      only regenerated, which invalidates this one.
                    </p>
                  </div>
                </div>

                {/* Full token display */}
                <div className="bg-black border border-green-800 rounded p-3 mb-3 overflow-x-auto">
                  <code className="text-green-400 text-xs font-mono break-all">
                    {newToken}
                  </code>
                </div>

                <button
                  onClick={handleCopyToken}
                  className="w-full bg-green-800 hover:bg-green-700 text-white text-sm py-2 rounded font-semibold transition-colors"
                >
                  {tokenCopied ? '✓ Copied to clipboard' : 'Copy Token'}
                </button>
              </div>
            )}

            {/* Regenerate section */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-1">
                {tokenPrefix ? 'Regenerate Token' : 'Generate Token'}
              </h3>
              <p className="text-gray-500 text-xs mb-4">
                {tokenPrefix
                  ? 'Generating a new token immediately invalidates your current one. Any integration using the old token will stop working.'
                  : 'Generate your first API token to start submitting task receipts.'
                }
              </p>

              {/* Confirmation gate — only shown for regeneration */}
              {showConfirm && tokenPrefix ? (
                <div className="bg-red-950 border border-red-800 rounded p-4 mb-4">
                  <p className="text-red-400 text-sm font-semibold mb-1">
                    Are you sure?
                  </p>
                  <p className="text-red-700 text-xs mb-4">
                    Your current token will be invalidated immediately.
                    Any agent integration using it will return 401 Unauthorized
                    until you update it with the new token.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleGenerateToken}
                      disabled={tokenLoading}
                      className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                    >
                      {tokenLoading ? 'Generating...' : 'Yes, regenerate'}
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="border border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={tokenPrefix ? () => setShowConfirm(true) : handleGenerateToken}
                  disabled={tokenLoading}
                  className={clsx(
                    'px-4 py-2 rounded text-sm font-semibold transition-colors',
                    tokenPrefix
                      ? 'border border-red-800 text-red-400 hover:bg-red-950'
                      : 'bg-green-700 hover:bg-green-600 text-white'
                  )}
                >
                  {tokenLoading
                    ? 'Generating...'
                    : tokenPrefix
                      ? 'Regenerate Token'
                      : 'Generate Token'
                  }
                </button>
              )}
            </div>

          </div>
        )}

        {/* Back to network */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/network')}
            className="text-gray-600 hover:text-gray-400 text-sm transition-colors"
          >
            ← Back to Network
          </button>
        </div>

      </div>
    </div>
  )
}