/**
 * Stripe Configuration
 *
 * Three tiers, no free plan. Payment before custody begins.
 * $99/mo  — up to 2 active projects (Foundation)
 * $199/mo — up to 5 active projects (Standard)
 * $499/mo — unlimited projects (Professional)
 */

import Stripe from 'stripe'

// Lazy initialization — only fails when actually called, not at import time.
// This lets the build succeed without env vars.
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    })
  }
  return _stripe
}

/** @deprecated Use getStripe() for lazy init. Kept for backward compat. */
export const stripe = typeof process !== 'undefined' && process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover', typescript: true })
  : (null as unknown as Stripe)

/**
 * Plan configuration.
 * Price IDs are set via environment variables — they're created in the Stripe Dashboard.
 * This keeps test vs. live keys separate.
 */
export const PLANS = {
  foundation: {
    name: 'Foundation',
    priceId: process.env.STRIPE_FOUNDATION_PRICE_ID!,
    price: 99,
    projectLimit: 2,
    description: 'Up to 2 active projects',
  },
  standard: {
    name: 'Standard',
    priceId: process.env.STRIPE_STANDARD_PRICE_ID!,
    price: 199,
    projectLimit: 5,
    description: 'Up to 5 active projects',
  },
  professional: {
    name: 'Professional',
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    price: 499,
    projectLimit: Infinity,
    description: 'Unlimited active projects',
  },
} as const

export type PlanKey = keyof typeof PLANS
