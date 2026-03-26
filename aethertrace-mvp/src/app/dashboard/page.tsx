/**
 * Dashboard Page — Bento Layout
 * Row 1: 4 stat cards
 * Row 2: Activity feed (wide) + Custody summary (narrow)
 * Row 3: Projects table
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NewProjectInput } from './components/new-project-input'
import { InlineCreateRow } from './components/inline-create-row'
import { SpotlightStat } from './components/spotlight-stat'
import { SpotlightProjectRow } from './components/spotlight-project-row'
import { ChainIntegrityCard } from './components/chain-integrity-card'

type Org = { id: string; name: string; plan: string; subscription_status: string }
type ProjectWithStats = { id: string; name: string; status: 'active' | 'archived'; created_at: string; itemsSealed: number; lastSealed: string | null; planStatus: 'none' | 'draft' | 'active' | 'completed' | 'archived' }
type RecentSeal = { file_name: string; project_name: string; ingested_at: string; chain_position: number }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('org_members')
    .select('role, organizations(id, name, subscription_status, plan)')
    .eq('user_id', user.id)
    .limit(1)

  const org = (memberships?.[0]?.organizations as unknown as Org | null) ?? null
  const isActive = org?.subscription_status === 'active'

  // Guard: redirect to onboarding if profile not complete
  let contactName: string | null = null
  if (org) {
    const { data: orgDetails } = await supabase
      .from('organizations')
      .select('onboarding_complete, contact_name')
      .eq('id', org.id)
      .single()

    if (orgDetails && !orgDetails.onboarding_complete) {
      redirect('/onboarding')
    }
    contactName = orgDetails?.contact_name ?? null
  }

  const { data: rawProjects } = org
    ? await supabase.from('projects').select('id, name, status, created_at').eq('org_id', org.id).order('created_at', { ascending: false })
    : { data: [] }

  const projects = rawProjects ?? []
  const projectIds = projects.map(p => p.id)

  const { data: evidenceRows } = projectIds.length > 0
    ? await supabase.from('evidence_items').select('project_id, ingested_at').in('project_id', projectIds)
    : { data: [] }

  const statsMap: Record<string, { count: number; lastSealed: string | null }> = {}
  for (const pid of projectIds) statsMap[pid] = { count: 0, lastSealed: null }
  for (const row of (evidenceRows ?? [])) {
    const s = statsMap[row.project_id]; if (!s) continue
    s.count += 1
    if (!s.lastSealed || row.ingested_at > s.lastSealed) s.lastSealed = row.ingested_at
  }

  // Fetch custody plan status for each project
  const { data: planRows } = projectIds.length > 0
    ? await supabase.from('custody_plans').select('project_id, status').in('project_id', projectIds)
    : { data: [] }
  const planStatusMap: Record<string, string> = {}
  for (const row of (planRows ?? [])) {
    planStatusMap[row.project_id] = row.status
  }

  const projectsWithStats: ProjectWithStats[] = projects.map(p => ({
    id: p.id, name: p.name, status: p.status as 'active' | 'archived',
    created_at: p.created_at, itemsSealed: statsMap[p.id]?.count ?? 0,
    lastSealed: statsMap[p.id]?.lastSealed ?? null,
    planStatus: (planStatusMap[p.id] as ProjectWithStats['planStatus']) ?? 'none',
  }))

  const activeCount = projectsWithStats.filter(p => p.status === 'active').length
  const totalSealed = projectsWithStats.reduce((sum, p) => sum + p.itemsSealed, 0)
  const lastSealedProject = projectsWithStats.filter(p => p.lastSealed).sort((a, b) => new Date(b.lastSealed!).getTime() - new Date(a.lastSealed!).getTime())[0]
  const lastSealedTimestamp = lastSealedProject?.lastSealed
    ? new Date(lastSealedProject.lastSealed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : 'No seals yet'

  // Fetch recent evidence for activity feed
  const { data: recentEvidence } = projectIds.length > 0
    ? await supabase
        .from('evidence_items')
        .select('file_name, ingested_at, chain_position, project_id')
        .in('project_id', projectIds)
        .order('ingested_at', { ascending: false })
        .limit(6)
    : { data: [] }

  const projectNameMap: Record<string, string> = {}
  for (const p of projects) projectNameMap[p.id] = p.name

  const recentSeals: RecentSeal[] = (recentEvidence ?? []).map(e => ({
    file_name: e.file_name,
    project_name: projectNameMap[e.project_id] ?? 'Unknown',
    ingested_at: e.ingested_at,
    chain_position: e.chain_position,
  }))

  // First-time user experience — 0 projects
  if (projects.length === 0) {
    const firstName = contactName?.split(' ')[0] ?? null
    return (
      <div style={{ padding: '40px 44px 100px', position: 'relative', zIndex: 1 }}>
        {!isActive && <SubscriptionBanner />}

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '70vh', textAlign: 'center',
        }}>
          {/* Welcome heading */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(200,212,228,0.25)', marginBottom: 16,
          }}>
            {org?.name ?? 'Your Organization'}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400,
            color: '#DCF0FF', letterSpacing: '-0.02em', margin: 0, marginBottom: 12,
            textShadow: '0 0 60px rgba(200,212,228,0.06)',
          }}>
            {firstName ? `Welcome, ${firstName}.` : 'Welcome to AetherTrace.'}
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(200,212,228,0.35)',
            lineHeight: 1.8, maxWidth: 440, margin: '0 auto 40px',
          }}>
            Your evidence custody system is active. Create your first project to begin establishing a cryptographic chain of custody.
          </p>

          {/* Create project CTA */}
          {isActive && org && (
            <div style={{ marginBottom: 48 }}>
              <NewProjectInput orgId={org.id} />
            </div>
          )}

          {/* Three steps */}
          <div style={{
            display: 'flex', gap: 32, justifyContent: 'center',
            padding: '32px 0',
            borderTop: '1px solid rgba(200,212,228,0.06)',
          }}>
            <StepIndicator num="1" label="Create Project" desc="Name and scope your work" />
            <StepIndicator num="2" label="Define Custody Plan" desc="Declare what you'll document" />
            <StepIndicator num="3" label="Seal Evidence" desc="Upload with cryptographic proof" />
          </div>

          {/* Trust bar */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
            color: 'rgba(200,212,228,0.15)', marginTop: 40,
          }}>
            SHA-256 ENCRYPTION · IMMUTABLE CHAIN · YOUR EVIDENCE, YOUR CUSTODY
          </div>
        </div>
      </div>
    )
  }

  // Returning user — stats dashboard
  const hasSeals = totalSealed > 0
  const firstProject = projectsWithStats[0]

  return (
    <div style={{ padding: '40px 44px 100px', position: 'relative', zIndex: 1 }}>
      {!isActive && <SubscriptionBanner />}

      {/* Header — org name only, no tier label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400,
          color: '#DCF0FF', letterSpacing: '-0.02em', margin: 0,
          textShadow: '0 0 60px rgba(200,212,228,0.06)',
        }}>{org?.name ?? 'Your Workspace'}</h1>
        {isActive && org && <NewProjectInput orgId={org.id} />}
      </div>

      {/* Row 1: 4 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
        <ChainIntegrityCard totalItems={totalSealed} totalProjects={activeCount} />
        <SpotlightStat label="Items Sealed" value={String(totalSealed)} sub="sealed to chain" valueFont="display" valueSize={40} />
        <SpotlightStat label="Active Projects" value={String(activeCount)} sub={`${projects.length} total`} valueFont="display" valueSize={40} />
        <SpotlightStat label="Last Sealed" value={lastSealedTimestamp} sub={lastSealedProject?.name ?? '—'} valueFont="display" valueSize={24} />
      </div>

      {/* Row 2: Activity + Chain (when seals exist) OR guided CTA (when empty) */}
      {hasSeals ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
          <ActivityFeed seals={recentSeals} />
          <ChainViz seals={recentSeals.slice(0, 5)} />
        </div>
      ) : (
        <div className="glass-card" style={{
          padding: '32px 28px', marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderLeft: '2px solid rgba(126,184,247,0.2)',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 18, color: '#DCF0FF',
              marginBottom: 6,
            }}>
              Seal your first piece of evidence
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(200,212,228,0.3)',
              lineHeight: 1.6,
            }}>
              {firstProject?.planStatus === 'active'
                ? `Your custody plan for "${firstProject.name}" is locked. Start uploading evidence to build your chain.`
                : firstProject?.planStatus === 'draft'
                  ? `Finish your custody plan for "${firstProject.name}" to begin sealing evidence.`
                  : `Open "${firstProject?.name ?? 'your project'}" to define a custody plan and start sealing.`
              }
            </div>
          </div>
          <Link href={`/dashboard/projects/${firstProject?.id}`} style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#B8D4EE', textDecoration: 'none',
            padding: '10px 20px', border: '1px solid rgba(200,212,228,0.1)',
            borderRadius: 6, flexShrink: 0, transition: 'background 0.15s, border-color 0.15s',
          }}>
            {firstProject?.planStatus === 'active' ? 'Seal Evidence →' : firstProject?.planStatus === 'draft' ? 'Finish Plan →' : 'Get Started →'}
          </Link>
        </div>
      )}

      {/* Row 3: Projects */}
      <div className="glass-card" style={{ padding: '24px 0', overflow: 'hidden' }}>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: 'rgba(200,212,228,0.35)',
          padding: '0 28px', marginBottom: 16,
        }}>
          Projects
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
          {projectsWithStats.map(project => <SpotlightProjectRow key={project.id} project={project} />)}
          {isActive && org && <InlineCreateRow orgId={org.id} />}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVITY FEED — Recent seals across all projects
   ═══════════════════════════════════════════════════════════════ */

function ActivityFeed({ seals }: { seals: RecentSeal[] }) {
  return (
    <div className="glass-card" style={{ padding: '24px 28px', overflow: 'hidden' }}>
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'rgba(200,212,228,0.4)', marginBottom: 20,
      }}>
        Recent Activity
      </div>
      {seals.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(200,212,228,0.2)' }}>No seals yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {seals.map((seal, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 0',
              borderBottom: i < seals.length - 1 ? '1px solid rgba(200,212,228,0.04)' : 'none',
            }}>
              {/* Chain position dot — first one pulses */}
              <div
                className={i === 0 ? 'activity-pulse' : ''}
                style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: '#10B981',
                  ...( i !== 0 ? { boxShadow: '0 0 8px rgba(16,185,129,0.3)' } : {}),
                }}
              />
              {/* File info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 12, color: '#B8D4EE',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {seal.file_name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(200,212,228,0.2)' }}>
                  {seal.project_name}
                </div>
              </div>
              {/* Chain position */}
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(200,212,228,0.2)',
                letterSpacing: '0.06em', flexShrink: 0,
              }}>
                #{seal.chain_position}
              </div>
              {/* Time */}
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(200,212,228,0.3)',
                flexShrink: 0, minWidth: 70, textAlign: 'right',
              }}>
                {formatRelative(seal.ingested_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CUSTODY SUMMARY — Org info + quick stats
   ═══════════════════════════════════════════════════════════════ */

function ChainViz({ seals }: { seals: RecentSeal[] }) {
  return (
    <div className="glass-card" style={{ padding: '24px 28px', overflow: 'hidden' }}>
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'rgba(200,212,228,0.4)', marginBottom: 20,
      }}>
        Hash Chain
      </div>
      {seals.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(200,212,228,0.2)' }}>No seals yet</p>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          {/* Vertical connecting line — pulses */}
          <div className="chain-line-pulse" style={{
            position: 'absolute', left: 8, top: 6, bottom: 6,
            width: 2, background: 'rgba(16,185,129,0.15)',
            borderRadius: 1,
          }} />
          {seals.map((seal, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              marginBottom: i < seals.length - 1 ? 20 : 0,
              position: 'relative',
            }}>
              {/* Chain node — first one pulses */}
              <div
                className={i === 0 ? 'activity-pulse' : ''}
                style={{
                  position: 'absolute', left: -20,
                  width: 10, height: 10, borderRadius: '50%',
                  background: i === 0 ? '#10B981' : 'rgba(16,185,129,0.35)',
                  border: '2px solid #02050B',
                }}
              />
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: 12, color: i === 0 ? '#B8D4EE' : 'rgba(200,212,228,0.4)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {seal.file_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SHARED
   ═══════════════════════════════════════════════════════════════ */

function SubscriptionBanner() {
  return (
    <div className="glass-card" style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '18px 24px', background: 'rgba(245,158,11,0.03)',
      borderColor: 'rgba(245,158,11,0.12)', marginBottom: 24,
      backdropFilter: 'blur(8px)',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
        <path d="M7 1L13 12H1L7 1Z" stroke="#F59E0B" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
        <line x1="7" y1="5.5" x2="7" y2="8.5" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="7" cy="10.5" r="0.6" fill="#F59E0B" />
      </svg>
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#B8D4EE', margin: 0, lineHeight: 1.5 }}>
          <strong style={{ color: '#DCF0FF', fontWeight: 500 }}>Subscription required.</strong>
          {' '}Active subscription needed before evidence custody begins.
        </p>
        <Link href="/pricing" style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#C8D4E0', textDecoration: 'none',
        }}>
          View plans →
        </Link>
      </div>
    </div>
  )
}

function EmptyState({ subscriptionRequired }: { subscriptionRequired: boolean }) {
  return (
    <div style={{ padding: '48px 32px', textAlign: 'center' }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ margin: '0 auto 14px', display: 'block' }}>
        <path d="M1 4C1 2.9 1.9 2 3 2H8L10 4H19C20.1 4 21 4.9 21 6V18C21 19.1 20.1 20 19 20H3C1.9 20 1 19.1 1 18V4Z" stroke="rgba(200,212,228,0.15)" strokeWidth="1.25" fill="none" />
      </svg>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'rgba(200,212,228,0.5)', marginBottom: 10 }}>
        {subscriptionRequired ? 'Subscribe to begin custody' : 'No projects yet'}
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(200,212,228,0.25)', letterSpacing: '0.04em', lineHeight: 1.9 }}>
        {subscriptionRequired ? 'Active subscription required.' : 'Create a project to start sealing evidence.'}
      </p>
    </div>
  )
}

function StepIndicator({ num, label, desc }: { num: string; label: string; desc: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, maxWidth: 160 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '1px solid rgba(200,212,228,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(200,212,228,0.3)',
      }}>
        {num}
      </div>
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 13, color: '#B8D4EE', fontWeight: 500,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(200,212,228,0.25)',
        lineHeight: 1.6,
      }}>
        {desc}
      </div>
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
  if (diffMin < 2) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHrs < 24) return diffHrs === 1 ? '1 hour ago' : `${diffHrs} hours ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
