import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })
  : null

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Up to 3 agents',
      '100 API calls/day',
      'Public network listing',
      'Basic trust scores',
    ],
    limits: { agents: 3, apiCallsPerDay: 100 },
  },
  developer: {
    name: 'Developer',
    priceId: process.env.STRIPE_DEVELOPER_PRICE_ID || '',
    price: 49,
    features: [
      'Up to 25 agents',
      '10,000 API calls/day',
      'Fleet dashboard',
      'Oracle verification',
      'Webhook events',
      'Priority support',
    ],
    limits: { agents: 25, apiCallsPerDay: 10000 },
  },
  business: {
    name: 'Business',
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || '',
    price: 299,
    features: [
      'Unlimited agents',
      '100,000 API calls/day',
      'All Developer features',
      'Analytics dashboard',
      'Custom oracle sampling rate',
      'SLA: 99.9% uptime',
    ],
    limits: { agents: -1, apiCallsPerDay: 100000 },
  },
} as const

export type PlanKey = keyof typeof PLANS
