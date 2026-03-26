import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IntelligenceClient } from './intelligence-client'

export default async function IntelligencePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's org
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, organizations(contact_name)')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')

  // Get all projects for the project picker
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('org_id', (membership as any).org_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const userName = (membership.organizations as any)?.contact_name || ''

  return (
    <IntelligenceClient
      projects={(projects || []).map((p: any) => ({ id: p.id, name: p.name }))}
      userName={userName}
    />
  )
}
