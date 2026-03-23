/**
 * GET  /api/projects/[projectId]/custody-plan — Get the active custody plan
 * POST /api/projects/[projectId]/custody-plan — Create a new custody plan
 * PATCH /api/projects/[projectId]/custody-plan — Update plan status (activate, complete, archive)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the active or most recent plan with its requirements
  const { data: plan, error } = await supabase
    .from('custody_plans')
    .select(`
      id, project_id, created_by, name, description, status,
      plan_hash, activated_at, completed_at, metadata,
      created_at, updated_at,
      evidence_requirements (
        id, category, description, milestone, due_date,
        required, status, fulfilled_by, fulfilled_at, sort_order, metadata
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // No plan found is not an error — return null
    if (error.code === 'PGRST116') {
      return NextResponse.json({ plan: null })
    }
    return NextResponse.json({ error: 'Failed to fetch custody plan' }, { status: 500 })
  }

  return NextResponse.json({ plan })
}

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
  const { name, description, requirements } = body

  if (!name) {
    return NextResponse.json(
      { error: 'Missing required field: name' },
      { status: 400 }
    )
  }

  // Create the plan
  const { data: plan, error: planError } = await supabase
    .from('custody_plans')
    .insert({
      project_id: projectId,
      created_by: user.id,
      name,
      description: description || null,
      status: 'draft',
      metadata: {},
    })
    .select()
    .single()

  if (planError) {
    console.error('Custody plan creation failed:', planError)
    return NextResponse.json({ error: 'Failed to create custody plan' }, { status: 500 })
  }

  // If requirements were provided, create them
  if (requirements && Array.isArray(requirements) && requirements.length > 0) {
    const reqs = requirements.map((req: { category: string; description: string; milestone?: string; dueDate?: string; required?: boolean }, idx: number) => ({
      custody_plan_id: plan.id,
      category: req.category,
      description: req.description,
      milestone: req.milestone || null,
      due_date: req.dueDate || null,
      required: req.required ?? true,
      status: 'pending',
      sort_order: idx + 1,
      metadata: {},
    }))

    const { error: reqError } = await supabase
      .from('evidence_requirements')
      .insert(reqs)

    if (reqError) {
      console.error('Requirements creation failed:', reqError)
      // Plan still created — requirements can be added later
    }
  }

  // Re-fetch plan with requirements
  const { data: fullPlan } = await supabase
    .from('custody_plans')
    .select(`
      id, project_id, created_by, name, description, status,
      plan_hash, activated_at, completed_at, metadata,
      created_at, updated_at,
      evidence_requirements (
        id, category, description, milestone, due_date,
        required, status, fulfilled_by, fulfilled_at, sort_order, metadata
      )
    `)
    .eq('id', plan.id)
    .single()

  return NextResponse.json({ plan: fullPlan }, { status: 201 })
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
  const { planId, status } = body

  if (!planId || !status) {
    return NextResponse.json(
      { error: 'Missing required fields: planId, status' },
      { status: 400 }
    )
  }

  const validStatuses = ['draft', 'active', 'completed', 'archived']
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    )
  }

  const updates: Record<string, unknown> = { status }
  if (status === 'active') updates.activated_at = new Date().toISOString()
  if (status === 'completed') updates.completed_at = new Date().toISOString()

  const { data: plan, error } = await supabase
    .from('custody_plans')
    .update(updates)
    .eq('id', planId)
    .eq('project_id', projectId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update custody plan' }, { status: 500 })
  }

  return NextResponse.json({ plan })
}
