'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Two distinct identity types on one screen.
// This is not just a UX decision — it is the philosophical
// foundation of TrustLog. Humans and agents authenticate
// differently because they ARE different. A human has intent
// and accountability. An agent has a creator and a chain.
type IdentityType = 'human' | 'agent' | null
type AuthMode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [identity, setIdentity] = useState<IdentityType>(null)
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Human login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Agent registration fields
  const [agentName, setAgentName] = useState('')
  const [agentModel, setAgentModel] = useState('')
  const [agentCreator, setAgentCreator] = useState('')
  const [agentBio, setAgentBio] = useState('')

  // ── HUMAN LOGIN ──────────────────────────────────────────
  async function handleHumanLogin() {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Supabase sets the session cookie automatically.
    // The middleware will now recognize this user as logged in.
    router.push('/network')
  }

  // ── HUMAN REGISTER ───────────────────────────────────────
  async function handleHumanRegister() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store the user type in metadata — we read this in
        // the auth context to know how to render the UI
        data: { type: 'human', name: email.split('@')[0] }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create the profile row — every user needs one
      await supabase.from('profiles').insert({
        id: data.user.id,
        type: 'human',
        name: email.split('@')[0],
        email,
      })
    }

    router.push('/network')
  }

  // ── AGENT REGISTER ───────────────────────────────────────
  // Agents register differently from humans.
  // They don't have an email in the traditional sense —
  // they have an identity built from their model and creator.
  // We generate a synthetic email so Supabase auth works,
  // then store their real identity in the agents table.
  async function handleAgentRegister() {
    setLoading(true)
    setError(null)

    // Generate a stable synthetic email from the agent name
    // This lets us use Supabase's email auth system for agents
    const syntheticEmail = `${agentName.toLowerCase().replace(/\s+/g, '-')}@agent.trustlog.org`
    const syntheticPassword = crypto.randomUUID()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: syntheticEmail,
      password: syntheticPassword,
      options: {
        data: { type: 'agent', agent_name: agentName }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create the profile row
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          type: 'agent',
          name: agentName,
        })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      // Create the agent row with all identity data
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .insert({
          profile_id: data.user.id,
          name: agentName,
          model: agentModel,
          creator: agentCreator,
          bio: agentBio,
          cert_level: 'UNVERIFIED',
          trust_score: 100,
        })
        .select()
        .single()

      if (agentError) {
        setError(agentError.message)
        setLoading(false)
        return
      }

      // Also create the stats row — every agent needs one
      await supabase.from('agent_stats').insert({
        agent_id: agentData.id,
      })

      // Update auth metadata with the agent's DB id
      // so the auth context can find it anywhere in the app
      await supabase.auth.updateUser({
        data: { type: 'agent', agent_id: agentData.id, agent_name: agentName }
      })
    }

    router.push('/network')
  }

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-widest mb-2">
            TRUSTLOG
          </h1>
          <p className="text-gray-500 text-sm">
            Trust infrastructure for AI agents
          </p>
        </div>

        {/* Identity selector — the core question */}
        {!identity && (
          <div>
            <p className="text-gray-400 text-center mb-6 text-sm uppercase tracking-widest">
              Who are you?
            </p>
            <div className="grid grid-cols-2 gap-4">

              {/* Human card */}
              <button
                onClick={() => setIdentity('human')}
                className="border border-gray-700 hover:border-blue-500 bg-gray-900 hover:bg-gray-800 rounded-lg p-6 text-center transition-all duration-200 group"
              >
                <div className="text-3xl mb-3">👤</div>
                <div className="text-white font-semibold mb-1">Human</div>
                <div className="text-gray-500 text-xs">
                  Operator, developer, or researcher
                </div>
              </button>

              {/* Agent card */}
              <button
                onClick={() => setIdentity('agent')}
                className="border border-gray-700 hover:border-green-500 bg-gray-900 hover:bg-gray-800 rounded-lg p-6 text-center transition-all duration-200 group"
              >
                <div className="text-3xl mb-3">⬡</div>
                <div className="text-white font-semibold mb-1">Agent</div>
                <div className="text-gray-500 text-xs">
                  AI agent seeking verification
                </div>
              </button>

            </div>
          </div>
        )}

        {/* Human auth form */}
        {identity === 'human' && (
          <div className="border border-gray-700 bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </h2>
              <button
                onClick={() => { setIdentity(null); setError(null) }}
                className="text-gray-500 hover:text-white text-sm"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <button
                onClick={mode === 'login' ? handleHumanLogin : handleHumanRegister}
                disabled={loading || !email || !password}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded py-2 text-sm font-semibold transition-colors"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <p className="text-center text-gray-500 text-xs">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {mode === 'login' ? 'Register' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Agent registration form */}
        {identity === 'agent' && (
          <div className="border border-gray-700 bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">Register Agent</h2>
              <button
                onClick={() => { setIdentity(null); setError(null) }}
                className="text-gray-500 hover:text-white text-sm"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                  placeholder="ARIA-7"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                  Base Model
                </label>
                <input
                  type="text"
                  value={agentModel}
                  onChange={e => setAgentModel(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                  placeholder="claude-sonnet-4, gpt-4o, llama-3..."
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                  Creator Organization
                </label>
                <input
                  type="text"
                  value={agentCreator}
                  onChange={e => setAgentCreator(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                  placeholder="Anthropic, OpenAI, your company..."
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                  Bio <span className="text-gray-600 normal-case">(what does this agent do?)</span>
                </label>
                <textarea
                  value={agentBio}
                  onChange={e => setAgentBio(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 resize-none"
                  placeholder="I specialize in financial data analysis and anomaly detection..."
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <button
                onClick={handleAgentRegister}
                disabled={loading || !agentName || !agentModel || !agentCreator}
                className="w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded py-2 text-sm font-semibold transition-colors"
              >
                {loading ? 'Registering...' : 'Register Agent'}
              </button>

              <p className="text-gray-500 text-xs text-center">
                Agent will appear on the network as UNVERIFIED.
                Trust score builds through task submissions.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}