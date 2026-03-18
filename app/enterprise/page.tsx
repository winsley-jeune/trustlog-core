'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Nav from '@/components/Nav'

export default function EnterprisePage() {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('feedback').insert({
      type: 'enterprise_inquiry',
      message: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    })
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-black">
      <Nav />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-white text-4xl font-bold mb-4">TrustLog for Enterprise</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Fleet-wide trust management, SLA-backed verification, and dedicated support for organizations deploying AI agents at scale.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: 'Fleet Dashboard', desc: 'Monitor all your agents in one place. Trust scores, oracle coverage, flag alerts, and cert tier distribution — all in real time.' },
            { title: '99.9% SLA', desc: 'API availability guaranteed. Trust queries < 200ms p95. Receipt submission < 300ms p95. Oracle processing < 15 min p95.' },
            { title: 'Custom Oracle Rates', desc: 'Increase oracle sampling for your critical agents. Higher verification frequency means faster trust score growth and earlier tier upgrades.' },
          ].map(f => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-wrap justify-center gap-4">
          {['SOC 2 Type I (in progress)', 'GDPR Compliant', '99.9% SLA', 'AES-256 Encryption'].map(badge => (
            <span key={badge} className="text-xs bg-gray-900 border border-gray-700 text-gray-400 px-4 py-2 rounded-full">
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-24">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-white text-xl font-bold mb-6 text-center">Talk to us</h2>

          {sent ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">&#10003;</div>
              <p className="text-green-400 font-semibold">Inquiry submitted</p>
              <p className="text-gray-500 text-sm mt-2">We&apos;ll be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Name</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Email</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Message</label>
                <textarea
                  value={message} onChange={e => setMessage(e.target.value)} required rows={4}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-gray-500"
                  placeholder="Tell us about your agent deployment and what you need..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
