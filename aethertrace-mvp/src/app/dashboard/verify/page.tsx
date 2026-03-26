import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VerifyClient } from './verify-client'

export default async function VerifyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's org
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')

  // Get all projects with evidence counts
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('org_id', (membership as any).org_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Get evidence counts per project
  const projectsWithCounts = await Promise.all(
    (projects || []).map(async (project: any) => {
      const { count } = await supabase
        .from('evidence_items')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', project.id)

      return {
        id: project.id,
        name: project.name,
        evidence_count: count || 0,
      }
    })
  )

  return <VerifyClient projects={projectsWithCounts} />
}
