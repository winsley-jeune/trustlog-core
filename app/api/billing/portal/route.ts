import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('org_members')
    .select('organizations(stripe_customer_id)')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  const customerId = (membership?.organizations as unknown as Record<string, unknown>)?.stripe_customer_id as string | null
  if (!customerId) return NextResponse.json({ error: 'No billing account' }, { status: 400 })

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${request.headers.get('origin') || 'http://localhost:3000'}/settings`,
  })

  return NextResponse.json({ url: session.url })
}
