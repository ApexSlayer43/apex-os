/**
 * Dashboard — Project overview
 * Dark void design system · Iceberg principle
 * Stats + project grid + new project
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FolderOpen, Plus, ChevronRight, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  /* ── Data ──────────────────────────────────────────────── */
  const { data: memberships } = await supabase
    .from('org_members')
    .select(`role, organizations(id, name, subscription_status, plan)`)
    .eq('user_id', user.id)

  const org = (memberships?.[0]?.organizations as unknown) as {
    id: string; name: string; subscription_status: string; plan: string
  } | null

  const { data: projects } = org
    ? await supabase
        .from('projects')
        .select('id, name, status, created_at')
        .eq('org_id', org.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const projectIds = (projects || []).map(p => p.id)
  const { data: evidenceCounts } = projectIds.length
    ? await supabase
        .from('evidence_items')
        .select('project_id')
        .in('project_id', projectIds)
    : { data: [] }

  const countMap: Record<string, number> = {}
  ;(evidenceCounts || []).forEach(e => {
    countMap[e.project_id] = (countMap[e.project_id] || 0) + 1
  })

  const totalEvidence = Object.values(countMap).reduce((a, b) => a + b, 0)
  const needsSubscription = !org || org.subscription_status !== 'active'

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', padding: '48px 48px 80px' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#7EB8F7',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}>
          <span style={{
            display: 'inline-block',
            width: 24, height: 1,
            background: '#7EB8F7',
            boxShadow: '0 0 6px #7EB8F7',
          }} />
          Command Center
        </div>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(28px, 3vw, 40px)',
          fontWeight: 400,
          color: '#DCF0FF',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          margin: 0,
        }}>
          {org ? org.name : 'Your Workspace'}
        </h1>
        {org && (
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.1em',
            color: '#486080',
            marginTop: 8,
          }}>
            {org.plan?.toUpperCase() || 'NO PLAN'} · {org.subscription_status?.toUpperCase()}
          </p>
        )}
      </div>

      {/* ── Subscription banner ────────────────────────────── */}
      {needsSubscription && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          padding: '16px 20px',
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.2)',
          marginBottom: 40,
        }}>
          <AlertCircle size={15} style={{ color: '#F59E0B', marginTop: 1, flexShrink: 0 }} />
          <div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: '#B8D4EE',
              margin: 0,
            }}>
              <strong style={{ color: '#DCF0FF' }}>Subscription required.</strong>{' '}
              AetherTrace requires an active subscription before evidence custody begins.
            </p>
            <Link
              href="/pricing"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#7EB8F7',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 8,
              }}
            >
              View plans <ChevronRight size={11} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Stats row ──────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        marginBottom: 48,
        background: 'rgba(22,48,88,0.2)',
        border: '1px solid rgba(22,48,88,0.3)',
      }}>
        {[
          {
            label: 'Active Projects',
            value: (projects || []).filter(p => p.status === 'active').length,
            sub: `${(projects || []).length} total`,
          },
          {
            label: 'Evidence Items',
            value: totalEvidence,
            sub: 'sealed to chain',
          },
          {
            label: 'Custody Status',
            value: needsSubscription ? 'Inactive' : 'Active',
            sub: org?.plan || '—',
            accent: !needsSubscription,
          },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: '#06101E',
              padding: '28px 32px',
            }}
          >
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#486080',
              marginBottom: 12,
            }}>
              {stat.label}
            </div>
            <div style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 36,
              color: stat.accent ? '#10B981' : '#DCF0FF',
              lineHeight: 1,
              marginBottom: 6,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              color: '#284870',
              letterSpacing: '0.08em',
            }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Projects section ───────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#486080',
        }}>
          Projects
        </div>
        {!needsSubscription && <NewProjectButton orgId={org?.id || ''} />}
      </div>

      {/* Project list */}
      {(projects || []).length === 0 ? (
        <EmptyState subscriptionRequired={needsSubscription} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(22,48,88,0.12)' }}>
          {(projects || []).map((project, i) => (
            <ProjectRow
              key={project.id}
              project={project}
              evidenceCount={countMap[project.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Project row ─────────────────────────────────────────────── */
function ProjectRow({
  project,
  evidenceCount,
}: {
  project: { id: string; name: string; status: string; created_at: string }
  evidenceCount: number
}) {
  const date = new Date(project.created_at)
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px',
        background: '#06101E',
        textDecoration: 'none',
        borderLeft: '2px solid transparent',
        transition: 'all 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderLeftColor = '#7EB8F7'
        el.style.background = '#081422'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderLeftColor = 'transparent'
        el.style.background = '#06101E'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <FolderOpen size={14} style={{ color: '#284870', flexShrink: 0 }} />
        <div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: '#B8D4EE',
            marginBottom: 3,
          }}>
            {project.name}
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            color: '#284870',
            letterSpacing: '0.06em',
          }}>
            Created {formatted}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            color: '#7AAAC8',
          }}>
            {evidenceCount}
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 8,
            color: '#284870',
            letterSpacing: '0.1em',
          }}>
            items sealed
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          background: project.status === 'active'
            ? 'rgba(16,185,129,0.08)'
            : 'rgba(22,48,88,0.4)',
          border: `1px solid ${project.status === 'active'
            ? 'rgba(16,185,129,0.2)'
            : 'rgba(22,48,88,0.6)'}`,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 8,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: project.status === 'active' ? '#10B981' : '#486080',
        }}>
          {project.status}
        </div>

        <ChevronRight size={13} style={{ color: '#284870' }} />
      </div>
    </Link>
  )
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyState({ subscriptionRequired }: { subscriptionRequired: boolean }) {
  return (
    <div style={{
      border: '1px solid rgba(22,48,88,0.3)',
      borderStyle: 'dashed',
      padding: '64px 32px',
      textAlign: 'center',
    }}>
      <FolderOpen size={24} style={{ color: '#163058', margin: '0 auto 16px' }} />
      <p style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: 18,
        color: '#486080',
        marginBottom: 8,
      }}>
        {subscriptionRequired ? 'Subscribe to begin custody' : 'No projects yet'}
      </p>
      <p style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        color: '#284870',
        letterSpacing: '0.06em',
        lineHeight: 1.8,
      }}>
        {subscriptionRequired
          ? 'An active subscription is required before evidence custody begins.'
          : 'Create a project to start sealing evidence to the chain.'}
      </p>
    </div>
  )
}

/* ── New project button ──────────────────────────────────────── */
function NewProjectButton({ orgId }: { orgId: string }) {
  return (
    <form
      action={async (formData: FormData) => {
        'use server'
        const name = formData.get('name') as string
        if (!name?.trim()) return
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        await supabase.from('projects').insert({
          org_id: orgId,
          name: name.trim(),
          status: 'active',
        })
        const { redirect } = await import('next/navigation')
        redirect('/dashboard')
      }}
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
    >
      <input
        name="name"
        type="text"
        placeholder="Project name"
        required
        style={{
          background: 'rgba(22,48,88,0.25)',
          border: '1px solid rgba(22,48,88,0.5)',
          padding: '7px 14px',
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          color: '#B8D4EE',
          outline: 'none',
          width: 200,
          caretColor: '#7EB8F7',
        }}
      />
      <button
        type="submit"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 16px',
          background: 'rgba(126,184,247,0.1)',
          border: '1px solid rgba(126,184,247,0.25)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#7EB8F7',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <Plus size={11} />
        Create
      </button>
    </form>
  )
}
