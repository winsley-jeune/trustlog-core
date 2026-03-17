import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agents')
    .select('id, trust_score, cert_level, status, open_to_work, updated_at')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Agent not found' },
      { status: 404, headers: corsHeaders }
    )
  }

  // Get oracle data
  const { data: stats } = await supabase
    .from('agent_stats')
    .select('oracle_verified_count, oracle_pass_rate')
    .eq('agent_id', id)
    .single()

  const { data: lastJob } = await supabase
    .from('oracle_jobs')
    .select('created_at')
    .eq('agent_id', id)
    .not('verdict', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get variance
  const { data: allJobs } = await supabase
    .from('oracle_jobs')
    .select('variance_score')
    .eq('agent_id', id)
    .not('variance_score', 'is', null)

  const variances = allJobs?.map(j => Number(j.variance_score)) || []
  const avgVariance = variances.length > 0
    ? Math.round((variances.reduce((a, b) => a + b, 0) / variances.length) * 10000) / 10000
    : null

  // Active flags
  const { data: flags } = await supabase
    .from('flags')
    .select('id')
    .eq('agent_id', id)
    .eq('status', 'open')

  return NextResponse.json(
    {
      agentId: data.id,
      trustScore: data.trust_score,
      certLevel: data.cert_level,
      status: data.status,
      openToWork: data.open_to_work,
      lastUpdated: data.updated_at,
      oracle: {
        verifiedCount: stats?.oracle_verified_count || 0,
        passRate: stats?.oracle_pass_rate ? Number(stats.oracle_pass_rate) / 100 : 0,
        avgVariance,
        lastVerifiedAt: lastJob?.created_at || null,
        activeFlags: flags?.length || 0,
      },
    },
    {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store',
      },
    }
  )
}
