/**
 * Dashboard Layout
 * Persistent icon rail + expandable sidebar (Claude-style)
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from './components/sidebar'
import { IntelligenceWidget } from './components/intelligence-widget'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: '#02050B' }}>
      <DashboardShell email={user.email ?? ''}>
        {children}
        <IntelligenceWidget />
      </DashboardShell>
    </div>
  )
}
