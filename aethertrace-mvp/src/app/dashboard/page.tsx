/**
 * Dashboard Page
 * PRISM design — locked March 24, 2026
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NewProjectInput } from './components/new-project-input'
import { InlineCreateRow } from './components/inline-create-row'

type Org = {
  id: string
  name: string
  plan: string
  subscription_status: string
}

type ProjectWithStats = {
  id: string
  name: string
  status: 'active' | 'archived'
  created_at: string
  itemsSealed: number
  lastSealed: string | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('org_members')
    .select('role, organizations(id, name, subscription_status, plan)')
    .eq('user_id', user.id)
    .limit(1)

  const rawOrg = memberships?.[0]?.organizations as unknown as Org | null
  const org = rawOrg ?? null
  const isActive = org?.subscription_status === 'active'

  const { data: rawProjects } = org
    ? await supabase
        .from('projects')
        .select('id, name, status, created_at')
        .eq('org_id', org.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const projects = rawProjects ?? []
  const projectIds = projects.map(p => p.id)

  const { data: evidenceRows } = projectIds.length > 0
    ? await supabase
        .from('evidence_items')
        .select('project_id, ingested_at')
        .in('project_id', projectIds)
    : { data: [] }

  const statsMap: Record<string, { count: number; lastSealed: string | null }> = {}
  for (const projectId of projectIds) {
    statsMap[projectId] = { count: 0, lastSealed: null }
  }
  for (const row of (evidenceRows ?? [])) {
    const stat = statsMap[row.project_id]
    if (!stat) continue
    stat.count += 1
    if (!stat.lastSealed || row.ingested_at > stat.lastSealed) {
      stat.lastSealed = row.ingested_at
    }
  }

  const projectsWithStats: ProjectWithStats[] = projects.map(p => ({
    id: p.id,
    name: p.name,
    status: p.status as 'active' | 'archived',
    created_at: p.created_at,
    itemsSealed: statsMap[p.id]?.count ?? 0,
    lastSealed: statsMap[p.id]?.lastSealed ?? null,
  }))

  const activeCount = projectsWithStats.filter(p => p.status === 'active').length
  const totalSealed = projectsWithStats.reduce((sum, p) => sum + p.itemsSealed, 0)

  return (
    <div style={{ padding: '80px 52px 120px', position: 'relative', zIndex: 1 }}>
      {!isActive && <SubscriptionBanner />}
      <CommandHeader
        orgName={org?.name ?? 'Your Workspace'}
        plan={org?.plan ?? ''}
        subscriptionStatus={org?.subscription_status ?? 'inactive'}
        orgId={org?.id ?? ''}
        isActive={isActive}
      />
      <StatsStrip
        activeCount={activeCount}
        totalCount={projects.length}
        totalSealed={totalSealed}
        isActive={isActive}
        plan={org?.plan ?? ''}
      />
      <ProjectSection
        projects={projectsWithStats}
        orgId={org?.id ?? ''}
        canCreate={isActive && !!org}
      />
    </div>
  )
}

function SubscriptionBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '16px 20px',
      background: 'rgba(245,158,11,0.04)',
      border: '1px solid rgba(245,158,11,0.16)',
      marginBottom: 40,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
        <path d="M7 1L13 12H1L7 1Z" stroke="#F59E0B" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
        <line x1="7" y1="5.5" x2="7" y2="8.5" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="7" cy="10.5" r="0.6" fill="#F59E0B" />
      </svg>
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#B8D4EE', margin: 0, lineHeight: 1.5 }}>
          <strong style={{ color: '#DCF0FF', fontWeight: 500 }}>Subscription required.</strong>
          {' '}AetherTrace requires an active subscription before evidence custody begins.
        </p>
        <Link href="/pricing" style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#7EB8F7', textDecoration: 'none',
        }}>
          View plans →
        </Link>
      </div>
    </div>
  )
}

function CommandHeader({ orgName, plan, subscriptionStatus, orgId, isActive }: {
  orgName: string; plan: string; subscriptionStatus: string; orgId: string; isActive: boolean
}) {
  const subLine = plan && subscriptionStatus
    ? `${plan.toUpperCase()} · ${subscriptionStatus.toUpperCase()}`
    : subscriptionStatus.toUpperCase()

  return (
    <div style={{ marginBottom: 64 }}>
      <div className="eye" style={{ marginBottom: 18 }}>Custody Operations</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3vw, 40px)',
            fontWeight: 400, color: '#DCF0FF', letterSpacing: '-0.02em',
            lineHeight: 1.1, margin: 0, marginBottom: 9,
          }}>{orgName}</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#486080', letterSpacing: '0.1em', margin: 0 }}>
            {subLine}
          </p>
        </div>
        {isActive && orgId && <NewProjectInput orgId={orgId} />}
      </div>
    </div>
  )
}

function StatsStrip({ activeCount, totalCount, totalSealed, isActive, plan }: {
  activeCount: number; totalCount: number; totalSealed: number; isActive: boolean; plan: string
}) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 1, background: 'rgba(22,48,88,0.22)',
      border: '1px solid rgba(22,48,88,0.28)', marginBottom: 64,
    }}>
      <StatCell label="Active Projects" value={String(activeCount)} sub={`${totalCount} total`} type="number" />
      <StatCell label="Items Sealed" value={String(totalSealed)} sub="sealed to chain" type="number" />
      <StatCell
        label="Custody Status"
        value={isActive ? 'Active' : 'Inactive'}
        sub={plan ? plan.charAt(0).toUpperCase() + plan.slice(1) + ' plan' : 'No plan'}
        type={isActive ? 'active' : 'inactive'}
      />
    </div>
  )
}

function StatCell({ label, value, sub, type }: {
  label: string; value: string; sub: string; type: 'number' | 'active' | 'inactive'
}) {
  const isNumber = type === 'number'
  const statusColor = type === 'active' ? '#10B981' : '#F59E0B'
  return (
    <div style={{ background: '#06101E', padding: '40px 44px' }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#486080', marginBottom: 16 }}>
        {label}
      </div>
      <div style={{
        fontFamily: isNumber ? 'var(--font-display)' : 'var(--font-serif)',
        fontSize: isNumber ? 56 : 34,
        color: isNumber ? '#FFFFFF' : statusColor,
        lineHeight: 1, marginBottom: 8, letterSpacing: isNumber ? '1px' : 'normal',
      }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#284870', letterSpacing: '0.08em' }}>
        {sub}
      </div>
    </div>
  )
}

function ProjectSection({ projects, orgId, canCreate }: {
  projects: ProjectWithStats[]; orgId: string; canCreate: boolean
}) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#486080', marginBottom: 12 }}>
        Projects
      </div>
      {projects.length === 0 && !canCreate ? (
        <EmptyState subscriptionRequired={!canCreate} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(22,48,88,0.15)' }}>
          {projects.map(project => <ProjectRow key={project.id} project={project} />)}
          {canCreate && <InlineCreateRow orgId={orgId} />}
        </div>
      )}
    </div>
  )
}

function ProjectRow({ project }: { project: ProjectWithStats }) {
  const isArchived = project.status === 'archived'
  const createdDate = new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const lastSealedRelative = project.lastSealed ? formatRelative(project.lastSealed) : '—'

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className={`project-row ${isArchived ? 'project-row--archived' : ''}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <svg width="15" height="13" viewBox="0 0 16 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M0 2C0 .9.9 0 2 0h4l2 2h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H2C.9 14 0 13.1 0 12V2Z" fill={isArchived ? '#486080' : '#7AAAC8'} opacity={isArchived ? 0.35 : 0.7} />
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: isArchived ? '#486080' : '#B8D4EE', marginBottom: 4, letterSpacing: '-0.01em' }}>
            {project.name}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#284870', letterSpacing: '0.06em' }}>
            Created {createdDate}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: isArchived ? '#284870' : '#7AAAC8' }}>{project.itemsSealed}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#284870', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Items Sealed</div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isArchived ? '#284870' : '#486080', minWidth: 90, textAlign: 'right' }}>
          {lastSealedRelative}
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
          background: isArchived ? 'rgba(22,48,88,0.3)' : 'rgba(16,185,129,0.06)',
          border: `1px solid ${isArchived ? 'rgba(22,48,88,0.5)' : 'rgba(16,185,129,0.16)'}`,
          fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: isArchived ? '#486080' : '#10B981',
        }}>
          {project.status}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M4 2l4 4-4 4" stroke={isArchived ? '#163058' : '#284870'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  )
}

function EmptyState({ subscriptionRequired }: { subscriptionRequired: boolean }) {
  return (
    <div style={{ border: '1px dashed rgba(22,48,88,0.45)', padding: '72px 32px', textAlign: 'center' }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ margin: '0 auto 14px', display: 'block' }}>
        <path d="M1 4C1 2.9 1.9 2 3 2H8L10 4H19C20.1 4 21 4.9 21 6V18C21 19.1 20.1 20 19 20H3C1.9 20 1 19.1 1 18V4Z" stroke="#163058" strokeWidth="1.25" fill="none" />
      </svg>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: '#486080', marginBottom: 10 }}>
        {subscriptionRequired ? 'Subscribe to begin custody' : 'No custody operations yet'}
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#284870', letterSpacing: '0.04em', lineHeight: 1.9, marginBottom: 24 }}>
        {subscriptionRequired
          ? 'An active subscription is required before evidence custody begins.'
          : 'Create a project to start sealing evidence to the chain.'}
      </p>
      {subscriptionRequired && (
        <Link href="/pricing" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px',
          background: 'rgba(126,184,247,0.07)', border: '1px solid rgba(126,184,247,0.2)',
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: '#7EB8F7', textDecoration: 'none',
        }}>
          View plans
        </Link>
      )}
    </div>
  )
}

function formatRelative(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHrs = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffMin < 2)    return 'Just now'
  if (diffMin < 60)   return `${diffMin}m ago`
  if (diffHrs < 24)   return diffHrs === 1 ? '1 hour ago' : `${diffHrs} hours ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7)   return `${diffDays} days ago`
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
