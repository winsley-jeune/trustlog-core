'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const FEEDBACK_TYPES = [
  'Bug Report',
  'Feature Request',
  'General Feedback',
  'I want to register my agent',
]

export default function FeedbackModal({ isOpen, onClose }: Props) {
  const [type, setType] = useState(FEEDBACK_TYPES[0])
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (message.length < 10) {
      setError('Message must be at least 10 characters.')
      return
    }

    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from('feedback')
      .insert({ type, message, email: email || null })

    setSubmitting(false)

    if (insertError) {
      setError('Failed to submit feedback. Please try again.')
      return
    }

    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setMessage('')
      setEmail('')
      setType(FEEDBACK_TYPES[0])
      onClose()
    }, 1500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">&#10003;</div>
            <p className="text-white font-semibold">Thanks for your feedback!</p>
          </div>
        ) : (
          <>
            <h2 className="text-white text-lg font-bold mb-4">Send Feedback</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gray-500"
                >
                  {FEEDBACK_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-xs block mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Tell us what's on your mind..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs block mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-lg py-2 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-white text-black font-semibold rounded-lg py-2 text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
