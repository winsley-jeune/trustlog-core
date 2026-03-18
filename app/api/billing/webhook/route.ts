import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

  const sig = request.headers.get('stripe-signature')
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const body = await request.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const orgId = session.metadata?.orgId
      const plan = session.metadata?.plan
      if (orgId && plan) {
        await supabase.from('organizations').update({
          plan,
          stripe_subscription_id: session.subscription as string,
        }).eq('id', orgId)
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object
      const customerId = sub.customer as string
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
      if (org) {
        const status = sub.status
        if (status === 'active') {
          // Plan is maintained
        } else if (status === 'canceled' || status === 'unpaid') {
          await supabase.from('organizations').update({ plan: 'free' }).eq('id', org.id)
        }
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const customerId = sub.customer as string
      await supabase.from('organizations').update({ plan: 'free' }).eq('stripe_customer_id', customerId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
