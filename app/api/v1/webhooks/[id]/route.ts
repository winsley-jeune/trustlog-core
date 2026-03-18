import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deliverWebhook } from '@/lib/webhooks/deliver'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('webhooks').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ deleted: id })
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: webhook } = await supabase
    .from('webhooks')
    .select('url, secret')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!webhook) return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })

  const result = await deliverWebhook(webhook.url, webhook.secret, 'test', {
    message: 'This is a test webhook from TrustLog',
    timestamp: new Date().toISOString(),
  })

  return NextResponse.json(result)
}
