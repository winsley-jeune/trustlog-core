import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

const VALID_EVENTS = [
  'agent.flagged', 'agent.revoked', 'tier.upgraded',
  'tier.downgraded', 'hire.completed', 'hire.failed',
]

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.url || !body?.events?.length) {
    return NextResponse.json({ error: 'url and events[] required' }, { status: 400 })
  }

  const invalidEvents = (body.events as string[]).filter(e => !VALID_EVENTS.includes(e))
  if (invalidEvents.length > 0) {
    return NextResponse.json({ error: `Invalid events: ${invalidEvents.join(', ')}` }, { status: 400 })
  }

  const secret = `whsec_${randomBytes(24).toString('hex')}`

  const { data: webhook, error } = await supabase
    .from('webhooks')
    .insert({
      user_id: user.id,
      org_id: body.orgId || null,
      url: body.url,
      secret,
      events: body.events,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 })

  return NextResponse.json({ ...webhook, secret }, { status: 201 })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('webhooks')
    .select('id, url, events, active, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}
