/**
 * Project Page — Routes to Plan or Seal
 *
 * If no active custody plan exists, redirect to the plan ceremony.
 * If an active plan exists, redirect to the seal page.
 * The custody plan IS the onboarding for each project.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()

  // Check if an active custody plan exists for this project
  const { data: plan } = await supabase
    .from('custody_plans')
    .select('id, status')
    .eq('project_id', projectId)
    .in('status', ['active', 'completed', 'archived'])
    .limit(1)
    .single()

  if (plan) {
    // Active plan exists — go to seal evidence
    redirect(`/dashboard/projects/${projectId}/seal`)
  } else {
    // No active plan — start the custody ceremony
    redirect(`/dashboard/projects/${projectId}/plan`)
  }
}
