/**
 * Dashboard — Main view after login
 * Shows org info, projects list, subscription status.
 * Trust Fortress: clean data, no decoration, institutional tone.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get user's org membership
  const { data: memberships } = await supabase
    .from('org_members')
    .select(`
      role,
      organizations (
        id, name, subscription_status, plan
      )
    `)
    .eq('user_id', user.id)

  const org = (memberships?.[0]?.organizations as unknown) as {
    id: string; name: string; subscription_status: string; plan: string
  } | null
  const role = memberships?.[0]?.role

  // Get projects for this org
  const { data: projects } = org ? await supabase
    .from('projects')
    .select('id, name, status, created_at')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false }) : { data: [] }

  // Get evidence counts per project
  const projectIds = (projects || []).map(p => p.id)
  const { data: evidenceCounts } = projectIds.length > 0 ? await supabase
    .from('evidence_items')
    .select('project_id')
    .in('project_id', projectIds) : { data: [] }

  const countMap: Record<string, number> = {}
  ;(evidenceCounts || []).forEach(e => {
    countMap[e.project_id] = (countMap[e.project_id] || 0) + 1
  })

  const needsSubscription = !org || org.subscription_status !== 'active'

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-primary tracking-tight">AetherTrace</h1>
            {org && (
              <span className="text-sm text-slate-500 border-l border-slate-200 pl-3">
                {org.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button className="text-sm text-slate-500 hover:text-primary transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Subscription banner */}
        {needsSubscription && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-6 py-4 mb-8">
            <p className="text-sm text-amber-800">
              <strong>Subscription required.</strong> AetherTrace requires an active subscription before
              evidence custody begins.{' '}
              <Link href="/pricing" className="text-accent font-medium hover:underline">
                View plans
              </Link>
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-lg px-6 py-4">
            <div className="text-sm text-slate-500 mb-1">Projects</div>
            <div className="text-2xl font-semibold text-primary">{(projects || []).length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-6 py-4">
            <div className="text-sm text-slate-500 mb-1">Evidence Items</div>
            <div className="text-2xl font-semibold text-primary">
              {Object.values(countMap).reduce((a, b) => a + b, 0)}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-6 py-4">
            <div className="text-sm text-slate-500 mb-1">Subscription</div>
            <div className="text-2xl font-semibold text-primary capitalize">
              {org?.subscription_status || 'None'}
            </div>
          </div>
        </div>

        {/* Projects section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-primary">Projects</h2>
          {!needsSubscription && <NewProjectButton orgId={org?.id || ''} />}
        </div>

        {(projects || []).length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg px-6 py-12 text-center">
            <p className="text-sm text-slate-500">
              {needsSubscription
                ? 'Subscribe to create your first project.'
                : 'No projects yet. Create one to begin capturing evidence.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {(projects || []).map(project => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="block bg-white border border-slate-200 rounded-lg px-6 py-4
                  hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-primary">{project.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-mono">
                      {countMap[project.id] || 0} items
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      project.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function NewProjectButton({ orgId }: { orgId: string }) {
  return (
    <form action={async (formData: FormData) => {
      'use server'
      const name = formData.get('name') as string
      if (!name) return

      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      await supabase.from('projects').insert({
        org_id: orgId,
        name,
        status: 'active',
      })

      const { redirect } = await import('next/navigation')
      redirect('/dashboard')
    }}>
      <div className="flex items-center gap-2">
        <input
          name="name"
          type="text"
          placeholder="Project name"
          required
          className="px-3 py-1.5 border border-slate-300 rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
            placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-1.5 rounded-md text-sm font-medium
            hover:bg-slate-700 transition-colors"
        >
          Create project
        </button>
      </div>
    </form>
  )
}
