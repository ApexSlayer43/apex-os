/**
 * Application-level org membership verification
 *
 * Belt + suspenders with RLS: even if RLS is misconfigured,
 * this explicit check prevents unauthorized access via UUID guessing.
 *
 * Pattern extracted from evidence/upload route — now reusable across all
 * authenticated endpoints that operate on a project.
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface OrgMembershipResult {
  authorized: boolean
  orgId: string | null
  role: string | null
  error?: string
}

/**
 * Verify that a user belongs to the org that owns a given project.
 *
 * 1. Fetches the project by ID to get org_id
 * 2. Checks org_members for (org_id, user_id)
 * 3. Returns { authorized: true, orgId, role } or { authorized: false, error }
 */
export async function verifyOrgMembership(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<OrgMembershipResult> {
  // Step 1: Fetch project to get org_id
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, org_id')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    return { authorized: false, orgId: null, role: null, error: 'Project not found' }
  }

  // Step 2: Check org_members for (org_id, user_id)
  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', project.org_id)
    .eq('user_id', userId)
    .single()

  if (!membership) {
    return { authorized: false, orgId: project.org_id, role: null, error: 'Access denied' }
  }

  return { authorized: true, orgId: project.org_id, role: membership.role }
}

/**
 * Get the user's org membership directly (for routes that don't have a projectId,
 * e.g. GET /api/projects which lists all projects for the user's org).
 *
 * Returns the org_id and role, or null if the user has no org membership.
 */
export async function getUserOrgMembership(
  supabase: SupabaseClient,
  userId: string
): Promise<{ orgId: string; role: string } | null> {
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', userId)
    .limit(1)
    .single()

  if (!membership) return null
  return { orgId: membership.org_id, role: membership.role }
}
