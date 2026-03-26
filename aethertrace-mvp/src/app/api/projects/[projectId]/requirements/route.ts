/**
 * POST  /api/projects/[projectId]/requirements — Add a requirement to a custody plan
 * PATCH /api/projects/[projectId]/requirements — Fulfill a requirement (link evidence)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyOrgMembership } from '@/lib/auth-guard'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Explicit org membership check (belt + suspenders with RLS)
  const membership = await verifyOrgMembership(supabase, user.id, projectId)
  if (!membership.authorized) {
    return NextResponse.json({ error: membership.error || 'Access denied' }, { status: 403 })
  }

  const body = await request.json()
  const { custodyPlanId, category, description, milestone, dueDate, required } = body

  if (!custodyPlanId || !category || !description) {
    return NextResponse.json(
      { error: 'Missing required fields: custodyPlanId, category, description' },
      { status: 400 }
    )
  }

  // --- C3 FIX: Block adding requirements to non-draft plans ---
  // Once a plan is activated, its content is frozen (plan_hash was computed).
  // Adding requirements would invalidate the hash and break immutability.
  const { data: parentPlan, error: planFetchError } = await supabase
    .from('custody_plans')
    .select('id, status')
    .eq('id', custodyPlanId)
    .single()

  if (planFetchError || !parentPlan) {
    return NextResponse.json({ error: 'Custody plan not found' }, { status: 404 })
  }

  if (parentPlan.status !== 'draft') {
    return NextResponse.json(
      { error: 'Cannot add requirements to an activated plan' },
      { status: 400 }
    )
  }

  // Get current max sort_order for this plan
  const { data: maxSort } = await supabase
    .from('evidence_requirements')
    .select('sort_order')
    .eq('custody_plan_id', custodyPlanId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sortOrder = maxSort ? maxSort.sort_order + 1 : 1

  const { data: requirement, error } = await supabase
    .from('evidence_requirements')
    .insert({
      custody_plan_id: custodyPlanId,
      category,
      description,
      milestone: milestone || null,
      due_date: dueDate || null,
      required: required ?? true,
      status: 'pending',
      sort_order: sortOrder,
      metadata: {},
    })
    .select()
    .single()

  if (error) {
    console.error('Requirement creation failed:', error)
    return NextResponse.json({ error: 'Failed to create requirement' }, { status: 500 })
  }

  return NextResponse.json({ requirement }, { status: 201 })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Explicit org membership check (belt + suspenders with RLS)
  const patchMembership = await verifyOrgMembership(supabase, user.id, projectId)
  if (!patchMembership.authorized) {
    return NextResponse.json({ error: patchMembership.error || 'Access denied' }, { status: 403 })
  }

  const body = await request.json()
  const { requirementId, evidenceItemId } = body

  if (!requirementId || !evidenceItemId) {
    return NextResponse.json(
      { error: 'Missing required fields: requirementId, evidenceItemId' },
      { status: 400 }
    )
  }

  // Verify the evidence item exists and belongs to this project
  const { data: evidence } = await supabase
    .from('evidence_items')
    .select('id')
    .eq('id', evidenceItemId)
    .eq('project_id', projectId)
    .single()

  if (!evidence) {
    return NextResponse.json({ error: 'Evidence item not found' }, { status: 404 })
  }

  // Fulfill the requirement
  const { data: requirement, error } = await supabase
    .from('evidence_requirements')
    .update({
      status: 'fulfilled',
      fulfilled_by: evidenceItemId,
      fulfilled_at: new Date().toISOString(),
    })
    .eq('id', requirementId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update requirement' }, { status: 500 })
  }

  return NextResponse.json({ requirement })
}
