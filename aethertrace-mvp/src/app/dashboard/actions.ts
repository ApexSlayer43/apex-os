'use server'

/**
 * Dashboard Server Actions
 * createProject — creates a new project under the user's org
 *
 * Security model:
 * - Auth verified on every call via getUser()
 * - Org membership verified before insert (prevents IDOR)
 * - Name sanitized: trimmed, max 120 chars, non-empty enforced
 * - RLS on projects table is the final enforcement layer
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type CreateProjectResult =
  | { success: true; projectId: string }
  | { success: false; error: string }

export async function createProject(
  orgId: string,
  rawName: string
): Promise<CreateProjectResult> {
  const name = rawName?.trim().slice(0, 120)

  if (!name) {
    return { success: false, error: 'Project name is required.' }
  }

  if (!orgId) {
    return { success: false, error: 'Organization ID is required.' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Authentication required.' }
  }

  const { data: membership, error: memberError } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return { success: false, error: 'Access denied to this organization.' }
  }

  const { data: project, error: insertError } = await supabase
    .from('projects')
    .insert({
      org_id: orgId,
      name,
      status: 'active',
    })
    .select('id')
    .single()

  if (insertError || !project) {
    console.error('[createProject] insert error:', insertError)
    return { success: false, error: 'Failed to create project. Please try again.' }
  }

  revalidatePath('/dashboard')

  return { success: true, projectId: project.id }
}
