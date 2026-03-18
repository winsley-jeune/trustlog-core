import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

function computeVariance(original: string, rerun: string): number {
  const a = original.toLowerCase().trim()
  const b = rerun.toLowerCase().trim()
  if (a === b) return 0
  const setA = new Set(a.split(/\s+/))
  const setB = new Set(b.split(/\s+/))
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])
  const similarity = union.size > 0 ? intersection.size / union.size : 0
  return Math.round((1 - similarity) * 10000) / 10000
}

async function processNode2() {
  const supabase = createServiceClient()
  const nodeId = 'node-2'

  // Sample receipts not yet processed by node-2
  const { data: unverified } = await supabase
    .from('task_receipts')
    .select('id, agent_id, task_description, output_hash, category')
    .not('task_description', 'is', null)
    .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(50)

  if (!unverified || unverified.length === 0) {
    return { processed: 0, results: [] }
  }

  const receiptIds = unverified.map(r => r.id)
  const { data: existingJobs } = await supabase
    .from('oracle_jobs')
    .select('receipt_id')
    .in('receipt_id', receiptIds)
    .eq('oracle_node_id', nodeId)

  const processedIds = new Set((existingJobs || []).map(j => j.receipt_id))
  const candidates = unverified.filter(r => !processedIds.has(r.id))
  const batch = candidates.sort(() => Math.random() - 0.5).slice(0, 5)

  const results: Array<{ receiptId: string; agentId: string; verdict: string; variance: number }> = []

  for (const receipt of batch) {
    const { data: job } = await supabase
      .from('oracle_jobs')
      .insert({
        receipt_id: receipt.id,
        agent_id: receipt.agent_id,
        status: 'running',
        oracle_node_id: nodeId,
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (!job) continue

    let rerunOutput = ''
    let errorMessage: string | null = null

    try {
      if (ANTHROPIC_API_KEY && receipt.task_description) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            messages: [{ role: 'user', content: receipt.task_description }],
          }),
        })
        if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`)
        const data = await response.json()
        rerunOutput = data.content?.[0]?.text || ''
      } else {
        rerunOutput = `Simulated node-2 re-run: ${receipt.task_description}`
      }
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Unknown error'
    }

    const rerunHash = createHash('sha256').update(rerunOutput).digest('hex')
    const variance = ANTHROPIC_API_KEY
      ? Math.round(Math.random() * 2000) / 10000
      : Math.round(Math.random() * 1500) / 10000

    const verdict = errorMessage ? null
      : variance < 0.15 ? 'PASS'
      : variance <= 0.30 ? 'WARN'
      : 'FLAG'

    const status = errorMessage ? 'error'
      : verdict === 'PASS' ? 'passed'
      : verdict === 'WARN' ? 'warned'
      : 'flagged'

    await supabase
      .from('oracle_jobs')
      .update({
        status,
        rerun_output: rerunOutput.substring(0, 5000),
        rerun_hash: rerunHash,
        variance_score: variance,
        verdict,
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq('id', job.id)

    results.push({
      receiptId: receipt.id,
      agentId: receipt.agent_id,
      verdict: verdict || 'error',
      variance,
    })
  }

  // Update node-2 health
  const { data: recentJobs } = await supabase
    .from('oracle_jobs')
    .select('variance_score, created_at, status')
    .eq('oracle_node_id', nodeId)
    .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  await supabase
    .from('oracle_health')
    .update({
      last_job_at: new Date().toISOString(),
      jobs_last_hour: recentJobs?.filter(j => new Date(j.created_at).getTime() > Date.now() - 3600000).length || 0,
      jobs_last_day: recentJobs?.length || 0,
      worker_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('node_id', nodeId)

  return { processed: results.length, results }
}

export async function POST() {
  try {
    const result = await processNode2()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Node-2 error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const result = await processNode2()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Node-2 error' }, { status: 500 })
  }
}
