import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  const { data, error } = await supabase
    .from('agents')
    .select('cert_level, open_to_work')

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500, headers: corsHeaders }
    )
  }

  const agents = data || []

  // Oracle stats
  const { data: oracleJobs } = await supabase
    .from('oracle_jobs')
    .select('verdict')
    .not('verdict', 'is', null)

  const totalOracleJobs = oracleJobs?.length || 0
  const passCount = oracleJobs?.filter(j => j.verdict === 'PASS').length || 0
  const networkPassRate = totalOracleJobs > 0 ? Math.round((passCount / totalOracleJobs) * 100) / 100 : 0

  const { data: allFlags } = await supabase
    .from('flags')
    .select('status')

  const totalFlags = allFlags?.length || 0
  const activeFlags = allFlags?.filter(f => f.status === 'open').length || 0

  return NextResponse.json(
    {
      totalAgents: agents.length,
      sovereignCount: agents.filter(a => a.cert_level === 'SOVEREIGN').length,
      auditedCount: agents.filter(a => a.cert_level === 'AUDITED').length,
      verifiedCount: agents.filter(a => a.cert_level === 'VERIFIED').length,
      communityCount: agents.filter(a => a.cert_level === 'COMMUNITY').length,
      unverifiedCount: agents.filter(a => a.cert_level === 'UNVERIFIED').length,
      openToWorkCount: agents.filter(a => a.open_to_work).length,
      oracleJobsTotal: totalOracleJobs,
      networkPassRate,
      totalFlags,
      activeFlags,
    },
    {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=300',
      },
    }
  )
}
