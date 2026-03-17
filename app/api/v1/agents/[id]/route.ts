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
    .select('id, name, cert_level, trust_score, specializations, open_to_work, created_at, model, creator, tagline, status')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Agent not found' },
      { status: 404, headers: corsHeaders }
    )
  }

  const response = {
    id: data.id,
    name: data.name,
    certLevel: data.cert_level,
    trustScore: data.trust_score,
    specializations: data.specializations,
    openToWork: data.open_to_work,
    createdAt: data.created_at,
    model: data.model,
    creator: data.creator,
    tagline: data.tagline,
    status: data.status,
  }

  return NextResponse.json(response, {
    headers: {
      ...corsHeaders,
      'Cache-Control': 'public, max-age=60',
    },
  })
}
