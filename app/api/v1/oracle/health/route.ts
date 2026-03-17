import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders })
}

export async function GET() {
  const supabase = await createClient()

  const { data: health } = await supabase
    .from('oracle_health')
    .select('*')
    .eq('node_id', 'node-1')
    .single()

  // Compute network pass rate
  const { data: allJobs } = await supabase
    .from('oracle_jobs')
    .select('verdict')
    .not('verdict', 'is', null)

  const totalJobs = allJobs?.length || 0
  const passCount = allJobs?.filter(j => j.verdict === 'PASS').length || 0
  const networkPassRate = totalJobs > 0 ? Math.round((passCount / totalJobs) * 100) / 100 : 0

  // Check if worker is idle (no jobs in 15 min)
  const lastJobAt = health?.last_job_at
  const isIdle = !lastJobAt || (Date.now() - new Date(lastJobAt).getTime() > 15 * 60 * 1000)

  return NextResponse.json({
    nodeId: health?.node_id || 'node-1',
    workerStatus: isIdle ? 'idle' : (health?.worker_status || 'idle'),
    lastJobAt: health?.last_job_at || null,
    jobsLastHour: health?.jobs_last_hour || 0,
    jobsLastDay: health?.jobs_last_day || 0,
    errorCount24h: health?.error_count_24h || 0,
    avgVariance24h: health?.avg_variance_24h || 0,
    networkPassRate,
  }, { headers: corsHeaders })
}
