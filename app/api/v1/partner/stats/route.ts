import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createHash } from 'crypto'

export async function GET(request: Request) {
  const partnerKey = request.headers.get('x-partner-key')
  if (!partnerKey) return NextResponse.json({ error: 'X-Partner-Key header required' }, { status: 401 })

  const keyHash = createHash('sha256').update(partnerKey).digest('hex')
  const supabase = createServiceClient()

  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('api_key_hash', keyHash)
    .single()

  if (!partner) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

  return NextResponse.json({
    partnerId: partner.id,
    name: partner.name,
    plan: partner.plan,
    monthlyQueries: partner.monthly_queries,
  })
}
