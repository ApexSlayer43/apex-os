import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('org_members')
    .select('role, org_id, organizations(id, name, contact_name, contact_role, company_type, trade, phone, plan, subscription_status, stripe_customer_id)')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')

  const org = membership.organizations as any

  return (
    <SettingsClient
      org={{
        id: org?.id || '',
        name: org?.name || '',
        contact_name: org?.contact_name || null,
        contact_role: org?.contact_role || null,
        company_type: org?.company_type || null,
        trade: org?.trade || null,
        phone: org?.phone || null,
        plan: org?.plan || 'starter',
        subscription_status: org?.subscription_status || 'active',
        stripe_customer_id: org?.stripe_customer_id || null,
      }}
      email={user.email || ''}
      userId={user.id}
    />
  )
}
