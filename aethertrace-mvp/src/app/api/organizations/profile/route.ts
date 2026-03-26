/**
 * Organization Profile API — POST to complete onboarding
 *
 * Updates the organization with profile fields and marks onboarding_complete.
 * This gates project creation — no profile, no projects.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { contactName, contactRole, companyType, trade, phone } = body

  if (!contactName || !contactRole || !companyType) {
    return NextResponse.json(
      { error: 'Missing required fields: contactName, contactRole, companyType' },
      { status: 400 }
    )
  }

  // Find the user's org
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'No organization found' }, { status: 404 })
  }

  // Only owners can complete onboarding
  if (membership.role !== 'owner') {
    return NextResponse.json({ error: 'Only the organization owner can complete onboarding' }, { status: 403 })
  }

  // Update organization profile
  const { data: org, error: updateError } = await supabase
    .from('organizations')
    .update({
      contact_name: contactName.trim(),
      contact_role: contactRole,
      company_type: companyType,
      trade: trade || null,
      phone: phone?.trim() || null,
      onboarding_complete: true,
    })
    .eq('id', membership.org_id)
    .select()
    .single()

  if (updateError) {
    console.error('Profile update failed:', updateError)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json({ organization: org })
}
