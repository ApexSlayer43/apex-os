/**
 * AetherTrace Intelligence — Seal Page
 * Global chat-style interface with project filter.
 * Glowy silver waves background, ring mark, centered chat box.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SealPageClient } from './seal-client'

export default async function SealPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('org_members')
    .select('role, organizations(id)')
    .eq('user_id', user.id)
    .limit(1)

  const orgId = (memberships?.[0]?.organizations as any)?.id
  if (!orgId) redirect('/dashboard')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, status')
    .eq('org_id', orgId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <SealPageClient
      projects={(projects ?? []).map(p => ({ id: p.id, name: p.name }))}
      userName={user.user_metadata?.org_name || user.email?.split('@')[0] || 'there'}
    />
  )
}
