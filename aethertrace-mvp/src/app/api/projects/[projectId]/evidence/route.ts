/**
 * GET /api/projects/[projectId]/evidence — List all evidence items for a project
 *
 * Returns items ordered by chain_position (ascending) — the canonical chain order.
 * RLS ensures only org members can access.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyOrgMembership } from '@/lib/auth-guard'

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

  // Explicit org membership check (belt + suspenders with RLS)
  const membership = await verifyOrgMembership(supabase, user.id, projectId)
  if (!membership.authorized) {
    return NextResponse.json({ error: membership.error || 'Access denied' }, { status: 403 })
  }

  const { data: items, error } = await supabase
    .from('evidence_items')
    .select(`
      id, project_id, submitted_by, file_name, file_type, file_size,
      content_hash, chain_hash, chain_position, previous_hash,
      requirement_id, captured_at, time_confidence, ingested_at, metadata
    `)
    .eq('project_id', projectId)
    .order('chain_position', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch evidence' }, { status: 500 })
  }

  return NextResponse.json({ items })
}
