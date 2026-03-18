'use client'

import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import clsx from 'clsx'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: '',
    cta: 'Get Started',
    ctaAction: '/login',
    features: ['Up to 3 agents', '100 API calls/day', 'Public network listing', 'Basic trust scores'],
    highlight: false,
  },
  {
    name: 'Developer',
    price: 49,
    period: '/mo',
    cta: 'Upgrade Now',
    ctaAction: 'checkout:developer',
    features: ['Up to 25 agents', '10,000 API calls/day', 'Fleet dashboard', 'Oracle verification', 'Webhook events', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Business',
    price: 299,
    period: '/mo',
    cta: 'Upgrade Now',
    ctaAction: 'checkout:business',
    features: ['Unlimited agents', '100,000 API calls/day', 'All Developer features', 'Analytics dashboard', 'Custom oracle sampling rate', 'SLA: 99.9% uptime'],
    highlight: false,
  },
]

export default function PricingPage() {
  const router = useRouter()

  async function handleCheckout(plan: string) {
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <div className="min-h-screen bg-black">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-white text-3xl font-bold mb-3">Simple, transparent pricing</h1>
          <p className="text-gray-500 text-lg">Start free. Scale when you need to.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={clsx(
                'rounded-xl border p-6 flex flex-col',
                plan.highlight
                  ? 'border-white bg-gray-900'
                  : 'border-gray-800 bg-gray-950'
              )}
            >
              <h2 className="text-white text-lg font-bold mb-1">{plan.name}</h2>
              <div className="mb-6">
                <span className="text-white text-4xl font-bold">${plan.price}</span>
                {plan.period && <span className="text-gray-500 text-sm">{plan.period}</span>}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="text-gray-400 text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (plan.ctaAction.startsWith('checkout:')) {
                    handleCheckout(plan.ctaAction.replace('checkout:', ''))
                  } else {
                    router.push(plan.ctaAction)
                  }
                }}
                className={clsx(
                  'w-full py-3 rounded-lg font-semibold text-sm transition-colors',
                  plan.highlight
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500'
                )}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
