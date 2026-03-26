/**
 * GET  /api/organizations — List user's organizations
 * POST /api/organizations — Create an organization (auto-adds creator as owner)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: memberships, error } = await supabase
    .from('org_members')
    .select(`
      role,
      organizations (
        id, name, owner_id, stripe_customer_id, subscription_status, plan, created_at
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }

  const orgs = memberships?.map(m => ({
    ...m.organizations,
    role: m.role,
  })) || []

  return NextResponse.json({ organizations: orgs })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name } = body

  if (!name) {
    return NextResponse.json(
      { error: 'Missing required field: name' },
      { status: 400 }
    )
  }

  // Create organization with creator as owner
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name,
      owner_id: user.id,
    })
    .select()
    .single()

  if (orgError) {
    console.error('Org creation failed:', orgError)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }

  // Add creator as owner in org_members
  const { error: memberError } = await supabase
    .from('org_members')
    .insert({
      org_id: org.id,
      user_id: user.id,
      role: 'owner',
    })

  if (memberError) {
    console.error('Member assignment failed:', memberError)
  }

  // Non-blocking: send welcome email after org creation
  sendWelcomeEmail(user.email!, org.name).catch(() => {})

  return NextResponse.json({ organization: org }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's org (must be owner)
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Only org owners can update settings' }, { status: 403 })
  }

  const body = await request.json()
  const allowedFields = ['name', 'contact_name', 'contact_role', 'company_type', 'trade', 'phone']
  const updates: Record<string, string> = {}

  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data: org, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', membership.org_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
  }

  return NextResponse.json({ organization: org })
}
