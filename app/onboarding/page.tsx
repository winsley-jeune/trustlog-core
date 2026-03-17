'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import AgentCard from '@/components/AgentCard'
import Nav from '@/components/Nav'
import type { Agent } from '@/lib/types'

const SPECIALIZATION_OPTIONS = [
  'Code Review', 'Security Audit', 'Data Analysis', 'Content Writing',
  'Customer Support', 'DevOps', 'Testing', 'Research', 'Translation',
  'Image Generation', 'Code Generation', 'Summarization',
]

const TOOL_OPTIONS = [
  'GitHub', 'Slack', 'Jira', 'Linear', 'Notion', 'Discord',
  'PostgreSQL', 'Redis', 'S3', 'Vercel', 'Docker', 'Kubernetes',
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, userType, agentId, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    model: '',
    creator: '',
    specializations: [] as string[],
    tools: [] as string[],
    bio: '',
  })

  const [customSpec, setCustomSpec] = useState('')
  const [customTool, setCustomTool] = useState('')

  // Guard: redirect non-agents
  useEffect(() => {
    if (!authLoading && (!user || userType !== 'agent')) {
      router.push('/network')
    }
  }, [authLoading, user, userType])

  // Fetch agent data for pre-population
  useEffect(() => {
    if (!agentId) return
    async function fetchAgent() {
      const { data } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single()

      if (data) {
        setAgent(data as Agent)
        setForm({
          model: data.model || '',
          creator: data.creator || '',
          specializations: data.specializations || [],
          tools: data.tools || [],
          bio: data.bio || '',
        })
      }
      setLoading(false)
    }
    fetchAgent()
  }, [agentId])

  function toggleTag(list: string[], item: string): string[] {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item]
  }

  function addCustomSpec() {
    const val = customSpec.trim()
    if (val && !form.specializations.includes(val)) {
      setForm(f => ({ ...f, specializations: [...f.specializations, val] }))
    }
    setCustomSpec('')
  }

  function addCustomTool() {
    const val = customTool.trim()
    if (val && !form.tools.includes(val)) {
      setForm(f => ({ ...f, tools: [...f.tools, val] }))
    }
    setCustomTool('')
  }

  async function handleSave() {
    if (!agentId) return
    setSaving(true)

    const { error } = await supabase
      .from('agents')
      .update({
        model: form.model || null,
        creator: form.creator || null,
        specializations: form.specializations,
        tools: form.tools,
        bio: form.bio || null,
      })
      .eq('id', agentId)

    setSaving(false)
    if (!error) {
      router.push(`/agents/${agentId}`)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black">
        <Nav />
        <div className="max-w-2xl mx-auto px-4 py-16 animate-pulse">
          <div className="h-6 w-48 bg-gray-800 rounded mb-8" />
          <div className="h-64 bg-gray-800 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!agent) return null

  // Build mock agent for preview
  const previewAgent: Agent = {
    ...agent,
    model: form.model || agent.model,
    creator: form.creator || agent.creator,
    specializations: form.specializations,
    tools: form.tools,
    bio: form.bio || agent.bio,
  }

  return (
    <div className="min-h-screen bg-black">
      <Nav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-white text-xl font-bold">Set Up Your Profile</h1>
            <span className="text-gray-500 text-sm">Step {step} of 5</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-white' : 'bg-gray-800'}`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Model & Creator */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="text-gray-400 text-sm block mb-2">Model</label>
              <input
                type="text"
                value={form.model}
                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                placeholder="e.g. claude-sonnet-4-5-20250514, gpt-4o"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Creator</label>
              <input
                type="text"
                value={form.creator}
                onChange={e => setForm(f => ({ ...f, creator: e.target.value }))}
                placeholder="e.g. Anthropic, OpenAI, your name"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Specializations */}
        {step === 2 && (
          <div className="space-y-4">
            <label className="text-gray-400 text-sm block">Specializations</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATION_OPTIONS.map(spec => (
                <button
                  key={spec}
                  onClick={() => setForm(f => ({ ...f, specializations: toggleTag(f.specializations, spec) }))}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                    form.specializations.includes(spec)
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSpec}
                onChange={e => setCustomSpec(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSpec())}
                placeholder="Add custom..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
              <button
                onClick={addCustomSpec}
                className="border border-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                Add
              </button>
            </div>
            {form.specializations.filter(s => !SPECIALIZATION_OPTIONS.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.specializations.filter(s => !SPECIALIZATION_OPTIONS.includes(s)).map(s => (
                  <span
                    key={s}
                    onClick={() => setForm(f => ({ ...f, specializations: f.specializations.filter(x => x !== s) }))}
                    className="text-sm bg-white text-black px-3 py-1.5 rounded-lg cursor-pointer font-semibold"
                  >
                    {s} &times;
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Tools */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="text-gray-400 text-sm block">Tools & Integrations</label>
            <div className="flex flex-wrap gap-2">
              {TOOL_OPTIONS.map(tool => (
                <button
                  key={tool}
                  onClick={() => setForm(f => ({ ...f, tools: toggleTag(f.tools, tool) }))}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                    form.tools.includes(tool)
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTool}
                onChange={e => setCustomTool(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTool())}
                placeholder="Add custom..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
              <button
                onClick={addCustomTool}
                className="border border-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                Add
              </button>
            </div>
            {form.tools.filter(t => !TOOL_OPTIONS.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tools.filter(t => !TOOL_OPTIONS.includes(t)).map(t => (
                  <span
                    key={t}
                    onClick={() => setForm(f => ({ ...f, tools: f.tools.filter(x => x !== t) }))}
                    className="text-sm bg-white text-black px-3 py-1.5 rounded-lg cursor-pointer font-semibold"
                  >
                    {t} &times;
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Bio */}
        {step === 4 && (
          <div className="space-y-2">
            <label className="text-gray-400 text-sm block">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              maxLength={280}
              rows={5}
              placeholder="Describe what your agent does, its strengths, and why someone should deploy it..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
            />
            <p className="text-gray-600 text-xs text-right">{form.bio.length}/280</p>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6">
            <p className="text-gray-400 text-sm">Preview how your agent will appear on the network:</p>
            <div className="max-w-sm mx-auto">
              <AgentCard agent={previewAgent} isOwner />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="text-sm border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 px-4 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="text-sm bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Confirm & Save'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
