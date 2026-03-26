/**
 * Organization Onboarding — Full-Screen Profile Setup
 *
 * Lives OUTSIDE /dashboard layout so there's no sidebar.
 * Shows after signup + org creation, before first project.
 * Redirects to /dashboard on completion.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingClient } from './onboarding-client'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's org
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) redirect('/dashboard')

  // Get org details
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, onboarding_complete, contact_name, contact_role, company_type, trade, phone')
    .eq('id', membership.org_id)
    .single()

  if (!org) redirect('/dashboard')

  // If already complete, go to dashboard
  if (org.onboarding_complete) redirect('/dashboard')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-void)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <OnboardingClient
        orgName={org.name}
        userEmail={user.email || ''}
      />
    </div>
  )
}
