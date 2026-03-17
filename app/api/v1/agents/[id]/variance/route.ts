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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from('oracle_jobs')
    .select('variance_score, verdict, created_at, receipt_id')
    .eq('agent_id', id)
    .not('verdict', 'is', null)
    .order('created_at', { ascending: true })

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({
      agentId: id,
      avgVariance: null,
      varianceByCategory: {},
      trend: 'unverified',
      totalOracleJobs: 0,
      passRate: null,
    }, { headers: corsHeaders })
  }

  const variances = jobs.map(j => Number(j.variance_score))
  const avgVariance = Math.round((variances.reduce((a, b) => a + b, 0) / variances.length) * 10000) / 10000
  const passCount = jobs.filter(j => j.verdict === 'PASS').length
  const passRate = Math.round((passCount / jobs.length) * 100) / 100

  // Compute trend from first 10 vs last 10
  let trend = 'stable'
  if (jobs.length >= 20) {
    const first10 = variances.slice(0, 10)
    const last10 = variances.slice(-10)
    const firstAvg = first10.reduce((a, b) => a + b, 0) / 10
    const lastAvg = last10.reduce((a, b) => a + b, 0) / 10
    if (lastAvg < firstAvg - 0.02) trend = 'improving'
    else if (lastAvg > firstAvg + 0.02) trend = 'degrading'
  }

  // Get variance by category
  const receiptIds = jobs.map(j => j.receipt_id)
  const { data: receipts } = await supabase
    .from('task_receipts')
    .select('id, category')
    .in('id', receiptIds)

  const categoryMap = new Map<string, string>()
  receipts?.forEach(r => categoryMap.set(r.id, r.category))

  const varianceByCategory: Record<string, number> = {}
  const categoryGroups: Record<string, number[]> = {}
  jobs.forEach(j => {
    const cat = categoryMap.get(j.receipt_id) || 'other'
    if (!categoryGroups[cat]) categoryGroups[cat] = []
    categoryGroups[cat].push(Number(j.variance_score))
  })
  for (const [cat, vals] of Object.entries(categoryGroups)) {
    varianceByCategory[cat] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10000) / 10000
  }

  return NextResponse.json({
    agentId: id,
    avgVariance,
    varianceByCategory,
    trend,
    totalOracleJobs: jobs.length,
    passRate,
  }, { headers: corsHeaders })
}
