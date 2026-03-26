/**
 * GET  /api/projects — List all projects for the authenticated user's org
 * POST /api/projects — Create a new project
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserOrgMembership } from '@/lib/auth-guard'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Explicit org membership check — only return projects for user's org
  const orgMembership = await getUserOrgMembership(supabase, user.id)
  if (!orgMembership) {
    return NextResponse.json({ error: 'Access denied — no org membership' }, { status: 403 })
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id, org_id, name, description, status, created_at, updated_at
    `)
    .eq('org_id', orgMembership.orgId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }

  return NextResponse.json({ projects })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, orgId } = body

  if (!name || !orgId) {
    return NextResponse.json(
      { error: 'Missing required fields: name, orgId' },
      { status: 400 }
    )
  }

  // Verify user belongs to this org
  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      org_id: orgId,
      name,
      description: description || null,
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    console.error('Project creation failed:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }

  return NextResponse.json({ project }, { status: 201 })
}
