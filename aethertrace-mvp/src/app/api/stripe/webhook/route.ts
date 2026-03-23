/**
 * POST /api/stripe/webhook — Handle Stripe webhook events
 *
 * Critical events:
 * - checkout.session.completed → Activate subscription
 * - customer.subscription.updated → Update plan/status
 * - customer.subscription.deleted → Deactivate subscription
 *
 * Uses STRIPE_WEBHOOK_SECRET to verify webhook signatures.
 * Uses admin Supabase client (bypasses RLS) for database updates.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getStripe, PLANS } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orgId = session.metadata?.org_id
        const plan = session.metadata?.plan

        if (orgId && plan) {
          await supabase
            .from('organizations')
            .update({
              subscription_status: 'active',
              plan: plan,
              stripe_customer_id: session.customer as string,
            })
            .eq('id', orgId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const orgId = subscription.metadata?.org_id
        const plan = subscription.metadata?.plan

        if (orgId) {
          await supabase
            .from('organizations')
            .update({
              subscription_status: subscription.status === 'active' ? 'active' : 'past_due',
              ...(plan ? { plan } : {}),
            })
            .eq('id', orgId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const orgId = subscription.metadata?.org_id

        if (orgId) {
          await supabase
            .from('organizations')
            .update({
              subscription_status: 'cancelled',
            })
            .eq('id', orgId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find org by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          await supabase
            .from('organizations')
            .update({ subscription_status: 'past_due' })
            .eq('id', org.id)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
