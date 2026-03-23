/**
 * POST /api/stripe/checkout — Create a Stripe Checkout session
 *
 * Accepts: { plan: 'standard' | 'professional', orgId: string }
 * Returns: { url: string } — redirect URL to Stripe Checkout
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, PLANS, type PlanKey } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { plan, orgId } = body as { plan: PlanKey; orgId: string }

  if (!plan || !PLANS[plan]) {
    return NextResponse.json(
      { error: 'Invalid plan. Must be "standard" or "professional".' },
      { status: 400 }
    )
  }

  if (!orgId) {
    return NextResponse.json(
      { error: 'Missing required field: orgId' },
      { status: 400 }
    )
  }

  // Verify user is the org owner
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, owner_id, stripe_customer_id')
    .eq('id', orgId)
    .eq('owner_id', user.id)
    .single()

  if (!org) {
    return NextResponse.json(
      { error: 'Organization not found or you are not the owner' },
      { status: 403 }
    )
  }

  // Get or create Stripe customer
  let customerId = org.stripe_customer_id

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: {
        org_id: orgId,
        supabase_user_id: user.id,
      },
    })
    customerId = customer.id

    // Save customer ID
    await supabase
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', orgId)
  }

  // Create checkout session
  const selectedPlan = PLANS[plan]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: selectedPlan.priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
    metadata: {
      org_id: orgId,
      plan,
    },
    subscription_data: {
      metadata: {
        org_id: orgId,
        plan,
      },
    },
  })

  return NextResponse.json({ url: session.url })
}
