/**
 * Seal Evidence — Clean Chat Interface
 * Claude-style: greeting + input. Nothing else.
 * History is toggleable, hidden by default.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SealChatBox } from '@/components/seal-chat-box'
import { SealPageShell } from '@/components/seal-shell'

export default async function SealPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, status')
    .eq('id', projectId)
    .single()

  if (!project) redirect('/dashboard')

  // Guard: require an active custody plan before sealing evidence
  const { data: activePlan } = await supabase
    .from('custody_plans')
    .select('id, status')
    .eq('project_id', projectId)
    .in('status', ['active', 'completed', 'archived'])
    .limit(1)
    .single()

  if (!activePlan) {
    // No active plan — redirect to custody ceremony
    redirect(`/dashboard/projects/${projectId}/plan`)
  }

  const { data: recentItems } = await supabase
    .from('evidence_items')
    .select('id, file_name, file_type, file_size, note, content_hash, ingested_at')
    .eq('project_id', projectId)
    .order('ingested_at', { ascending: false })
    .limit(50)

  const { count: chainDepth } = await supabase
    .from('evidence_items')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  const items = (recentItems ?? []).map(item => ({
    id: item.id,
    fileName: item.file_name,
    fileType: item.file_type,
    fileSize: item.file_size,
    note: item.note,
    contentHash: item.content_hash,
    ingestedAt: item.ingested_at,
    verificationUrl: `/verify/${item.content_hash}`,
  }))

  return (
    <SealPageShell
      projectName={project.name}
      projectId={projectId}
      chainDepth={chainDepth ?? 0}
      items={items}
    />
  )
}
