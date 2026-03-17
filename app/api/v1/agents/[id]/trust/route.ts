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

  return NextResponse.json(
    {
      agentId: data.id,
      trustScore: data.trust_score,
      certLevel: data.cert_level,
      status: data.status,
      openToWork: data.open_to_work,
      lastUpdated: data.updated_at,
    },
    {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store',
      },
    }
  )
}
