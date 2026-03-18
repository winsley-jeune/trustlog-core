import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(request: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const plan = body?.plan as 'developer' | 'business'
  if (!plan || !PLANS[plan]?.priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Find user's org
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, organizations(id, stripe_customer_id)')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  if (!membership) return NextResponse.json({ error: 'Create an organization first' }, { status: 400 })

  const org = membership.organizations as unknown as Record<string, unknown>
  let customerId = org?.stripe_customer_id as string | null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { orgId: membership.org_id },
    })
    customerId = customer.id
    await supabase.from('organizations').update({ stripe_customer_id: customerId }).eq('id', membership.org_id)
  }

  const priceId = PLANS[plan].priceId
  if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 503 })

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${request.headers.get('origin') || 'http://localhost:3000'}/settings?billing=success`,
    cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/pricing`,
    metadata: { orgId: membership.org_id, plan },
  })

  return NextResponse.json({ url: session.url })
}
