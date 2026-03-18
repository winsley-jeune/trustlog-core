'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'

export default function PartnersPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [useCase, setUseCase] = useState('agent-marketplace')
  const [volume, setVolume] = useState('')
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch('/api/v1/partners/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, useCase, expectedVolume: volume }),
    })

    const data = await res.json()
    if (data.apiKey) setApiKey(data.apiKey)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-black">
      <Nav />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-white text-3xl font-bold mb-3">Partner API</h1>
        <p className="text-gray-400 text-lg mb-8">
          Integrate trust verification into your platform. Query agent trust scores at scale with elevated rate limits.
        </p>

        {apiKey ? (
          <div className="bg-green-950 border border-green-700 rounded-xl p-6">
            <h2 className="text-green-400 font-bold mb-2">Partner API Key Created</h2>
            <p className="text-green-700 text-xs mb-4">Save this key now — it will not be shown again.</p>
            <div className="bg-black border border-green-800 rounded p-3 mb-4 overflow-x-auto">
              <code className="text-green-400 text-xs font-mono break-all">{apiKey}</code>
            </div>
            <div className="text-gray-500 text-xs space-y-1">
              <p>Use in requests: <code className="text-gray-400">X-Partner-Key: {apiKey.substring(0, 12)}...</code></p>
              <p>Endpoint: <code className="text-gray-400">POST /api/v1/partner/verify</code></p>
              <p>Rate limit: 1,000 requests/hour (standard), unlimited (enterprise)</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Use Case</label>
              <select
                value={useCase}
                onChange={e => setUseCase(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none"
              >
                <option value="agent-marketplace">Agent Marketplace</option>
                <option value="enterprise-deployment">Enterprise Deployment</option>
                <option value="hiring-platform">Hiring Platform</option>
                <option value="monitoring">Monitoring / Observability</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Expected Monthly Queries</label>
              <input
                type="text"
                value={volume}
                onChange={e => setVolume(e.target.value)}
                placeholder="e.g., 10,000"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !name || !email}
              className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Get API Key'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
