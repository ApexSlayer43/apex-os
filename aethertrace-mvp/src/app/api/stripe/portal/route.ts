/**
 * POST /api/stripe/portal — Create a Stripe Customer Portal session
 *
 * Allows customers to manage their subscription (upgrade, cancel, update payment).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { orgId } = body

  if (!orgId) {
    return NextResponse.json(
      { error: 'Missing required field: orgId' },
      { status: 400 }
    )
  }

  // Get org with Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id, owner_id')
    .eq('id', orgId)
    .eq('owner_id', user.id)
    .single()

  if (!org || !org.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No active subscription found' },
      { status: 404 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await getStripe().billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${appUrl}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
