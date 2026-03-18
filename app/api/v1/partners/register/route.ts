import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { randomBytes, createHash } from 'crypto'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.name || !body?.email) {
    return NextResponse.json({ error: 'name and email required' }, { status: 400 })
  }

  const apiKey = `tlp_${randomBytes(32).toString('hex')}`
  const apiKeyHash = createHash('sha256').update(apiKey).digest('hex')

  const supabase = createServiceClient()

  const { data: partner, error } = await supabase
    .from('partners')
    .insert({
      name: body.name,
      api_key: apiKey.substring(0, 12) + '...',
      api_key_hash: apiKeyHash,
      org_id: body.orgId || null,
      plan: 'standard',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })

  return NextResponse.json({ ...partner, apiKey }, { status: 201 })
}
