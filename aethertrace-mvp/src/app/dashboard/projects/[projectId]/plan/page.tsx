/**
 * Custody Plan Page — Server Component
 *
 * Fetches the current custody plan and its requirements directly from Supabase.
 * Delegates interactive UI to PlanClient.
 *
 * States:
 *   1. No plan -> "Create Custody Plan" form
 *   2. Draft   -> Editable requirements list + Activate button
 *   3. Active  -> Locked plan with completeness progress
 *   4. Completed/Archived -> Read-only historical view
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlanClient } from './plan-client'

export default async function CustodyPlanPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify org membership via project lookup
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, org_id')
    .eq('id', projectId)
    .single()

  if (!project) redirect('/dashboard')

  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('org_id', project.org_id)
    .limit(1)
    .single()

  if (!membership) redirect('/dashboard')

  // Fetch the most recent custody plan with requirements
  const { data: plan } = await supabase
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

  // Fetch evidence items for fulfilled requirement display
  const { data: evidenceItems } = await supabase
    .from('evidence_items')
    .select('id, file_name, ingested_at')
    .eq('project_id', projectId)
    .order('ingested_at', { ascending: false })

  return (
    <div style={{ padding: '40px 44px 100px', position: 'relative', zIndex: 1 }}>
      {/* Breadcrumb — uses CSS class for hover since this is a server component */}
      <div className="plan-breadcrumb" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 28,
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'rgba(200,212,228,0.2)', letterSpacing: '0.04em',
      }}>
        <Link href="/dashboard" className="plan-breadcrumb-link">
          Dashboard
        </Link>
        <span style={{ color: 'rgba(200,212,228,0.1)' }}>/</span>
        <Link href={`/dashboard/projects/${projectId}/seal`} className="plan-breadcrumb-link">
          {project.name}
        </Link>
        <span style={{ color: 'rgba(200,212,228,0.1)' }}>/</span>
        <span style={{ color: 'rgba(200,212,228,0.35)' }}>Custody Plan</span>
      </div>

      <PlanClient
        projectId={projectId}
        initialPlan={plan ?? null}
        evidenceItems={evidenceItems ?? []}
      />
    </div>
  )
}
