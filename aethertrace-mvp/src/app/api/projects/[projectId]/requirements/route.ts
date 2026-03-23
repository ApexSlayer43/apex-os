/**
 * POST  /api/projects/[projectId]/requirements — Add a requirement to a custody plan
 * PATCH /api/projects/[projectId]/requirements — Fulfill a requirement (link evidence)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const body = await request.json()
  const { custodyPlanId, category, description, milestone, dueDate, required } = body

  if (!custodyPlanId || !category || !description) {
    return NextResponse.json(
      { error: 'Missing required fields: custodyPlanId, category, description' },
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
