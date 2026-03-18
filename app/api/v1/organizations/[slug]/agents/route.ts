import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 })

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  const { error } = await supabase
    .from('org_agents')
    .insert({ org_id: org.id, agent_id: body.agentId })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Agent already in fleet' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to add agent' }, { status: 500 })
  }

  await supabase.from('agents').update({ org_id: org.id }).eq('id', body.agentId)

  return NextResponse.json({ added: body.agentId }, { status: 201 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const agentId = searchParams.get('agentId')
  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 })

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  await supabase.from('org_agents').delete().eq('org_id', org.id).eq('agent_id', agentId)
  await supabase.from('agents').update({ org_id: null }).eq('id', agentId)

  return NextResponse.json({ removed: agentId })
}
