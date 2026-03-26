/**
 * Subscription guard — reusable check for org subscription status.
 *
 * Pattern mirrors auth-guard.ts: a pure function that takes supabase + userId,
 * queries the org, and returns a structured result. Routes import and call it
 * before proceeding with write operations.
 *
 * Plan limits:
 *   - starter:      max 5 active projects
 *   - professional:  unlimited
 *
 * Status behavior:
 *   - active:    full access
 *   - past_due:  grace period — reads allowed, writes blocked
 *   - inactive:  blocked (402)
 *   - canceled:  blocked (402)
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface SubscriptionResult {
  active: boolean
  plan: string
  projectLimit: number
  gracePeriod?: boolean
  error?: string
}

const PLAN_LIMITS: Record<string, number> = {
  starter: 5,
  professional: Infinity,
}

/**
 * Check a user's org subscription status.
 *
 * Resolves the user's org via org_members, then reads subscription_status + plan
 * from the organizations table.
 *
 * Returns { active: true } when the subscription allows write operations,
 * or { active: false, error } with a human-readable reason when it doesn't.
 */
export async function checkSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionResult> {
  // Step 1: Get user's org membership
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', userId)
    .limit(1)
    .single()

  if (!membership) {
    return {
      active: false,
      plan: 'none',
      projectLimit: 0,
      error: 'No organization found. Create an organization to get started.',
    }
  }

  // Step 2: Get org subscription status
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('subscription_status, plan')
    .eq('id', membership.org_id)
    .single()

  if (orgError || !org) {
    return {
      active: false,
      plan: 'none',
      projectLimit: 0,
      error: 'Organization not found.',
    }
  }

  const plan = org.plan || 'starter'
  const status = org.subscription_status || 'inactive'
  const projectLimit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.starter

  // Active subscription — full access
  if (status === 'active') {
    return { active: true, plan, projectLimit }
  }

  // Past due — grace period: reads OK, writes blocked
  if (status === 'past_due') {
    return {
      active: false,
      plan,
      projectLimit,
      gracePeriod: true,
      error: 'Subscription payment is past due. Read access continues during the grace period, but new evidence cannot be sealed until payment is resolved.',
    }
  }

  // Inactive or canceled — fully blocked
  return {
    active: false,
    plan,
    projectLimit,
    error: 'Subscription is not active. Subscribe at aethertrace.com/pricing to begin sealing evidence.',
  }
}

/**
 * Check whether the org has hit its active project limit.
 *
 * Call this before creating a new project, not on every upload.
 * Evidence uploads to existing projects are allowed regardless of count.
 */
export async function checkProjectLimit(
  supabase: SupabaseClient,
  orgId: string,
  plan: string
): Promise<{ withinLimit: boolean; currentCount: number; limit: number }> {
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.starter

  if (limit === Infinity) {
    return { withinLimit: true, currentCount: 0, limit }
  }

  const { count } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('status', 'active')

  const currentCount = count ?? 0
  return { withinLimit: currentCount < limit, currentCount, limit }
}
