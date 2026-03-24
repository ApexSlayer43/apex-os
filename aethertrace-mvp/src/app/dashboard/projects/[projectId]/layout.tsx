/**
 * Project Layout — Dark Void Shell
 * Persistent project header + tab navigation
 * Seal · Chain · Packages · Reconstruct
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, FolderOpen, Zap, Link2, Package, Cpu } from 'lucide-react'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  /* ── Data ──────────────────────────────────────────── */
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, status, created_at, org_id')
    .eq('id', projectId)
    .single()

  if (!project) redirect('/dashboard')

  const { count: evidenceCount } = await supabase
    .from('evidence_items')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  const { count: packageCount } = await supabase
    .from('evidence_packages')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  const created = new Date(project.created_at)
  const formattedDate = created.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  /* ── Nav tabs ──────────────────────────────────────── */
  const tabs = [
    {
      href: `/dashboard/projects/${projectId}/seal`,
      icon: <Zap size={12} />,
      label: 'Seal Evidence',
      sub: 'capture',
    },
    {
      href: `/dashboard/projects/${projectId}/chain`,
      icon: <Link2 size={12} />,
      label: 'Chain View',
      sub: 'ledger',
    },
    {
      href: `/dashboard/projects/${projectId}/packages`,
      icon: <Package size={12} />,
      label: 'Packages',
      sub: 'export',
    },
    {
      href: `/dashboard/projects/${projectId}/reconstruct`,
      icon: <Cpu size={12} />,
      label: 'AI Reconstruct',
      sub: 'intelligence',
    },
  ]

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Project header ─────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid rgba(22,48,88,0.4)',
        background: '#04080F',
      }}>
        <div style={{ padding: '24px 48px 0' }}>

          {/* Breadcrumb */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
          }}>
            <Link
              href="/dashboard"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.1em',
                color: '#486080',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#7EB8F7')}
              onMouseLeave={e => (e.currentTarget.style.color = '#486080')}
            >
              Dashboard
            </Link>
            <ChevronRight size={10} style={{ color: '#284870' }} />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.1em',
              color: '#7AAAC8',
            }}>
              {project.name}
            </span>
          </div>

          {/* Project title + meta */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 6,
              }}>
                <FolderOpen size={16} style={{ color: '#486080' }} />
                <h1 style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 'clamp(20px, 2vw, 28px)',
                  fontWeight: 400,
                  color: '#DCF0FF',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.2,
                }}>
                  {project.name}
                </h1>
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
                  textTransform: 'uppercase' as const,
                  color: project.status === 'active' ? '#10B981' : '#486080',
                }}>
                  {project.status}
                </div>
              </div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                color: '#284870',
                letterSpacing: '0.08em',
                paddingLeft: 28,
              }}>
                Created {formattedDate}
              </div>
            </div>

            {/* Stats pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatPill value={String(evidenceCount ?? 0)} label="items sealed" />
              <StatPill value={String(packageCount ?? 0)} label="packages" />
            </div>
          </div>

          {/* Tab navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 0,
          }}>
            {tabs.map(tab => (
              <ProjectTab
                key={tab.href}
                href={tab.href}
                icon={tab.icon}
                label={tab.label}
                sub={tab.sub}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Page content ────────────────────────────────── */}
      {children}
    </div>
  )
}

/* ── Stat pill ──────────────────────────────────────────── */
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      background: '#06101E',
      border: '1px solid rgba(22,48,88,0.4)',
      padding: '10px 20px',
      textAlign: 'center' as const,
    }}>
      <div style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: 22,
        color: '#DCF0FF',
        lineHeight: 1,
        marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 8,
        color: '#284870',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
      }}>
        {label}
      </div>
    </div>
  )
}

/* ── Project tab ────────────────────────────────────────── */
function ProjectTab({
  href,
  icon,
  label,
  sub,
}: {
  href: string
  icon: React.ReactNode
  label: string
  sub: string
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'flex-start',
        gap: 2,
        padding: '10px 20px 12px',
        textDecoration: 'none',
        borderBottom: '2px solid transparent',
        borderTop: '1px solid transparent',
        borderLeft: '1px solid transparent',
        borderRight: '1px solid transparent',
        transition: 'all 0.15s',
        marginBottom: -1,
        position: 'relative' as const,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderBottomColor = 'rgba(126,184,247,0.4)'
        el.style.borderTopColor = 'rgba(22,48,88,0.3)'
        el.style.borderLeftColor = 'rgba(22,48,88,0.3)'
        el.style.borderRightColor = 'rgba(22,48,88,0.3)'
        el.style.background = 'rgba(22,48,88,0.15)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderBottomColor = 'transparent'
        el.style.borderTopColor = 'transparent'
        el.style.borderLeftColor = 'transparent'
        el.style.borderRightColor = 'transparent'
        el.style.background = 'transparent'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: 500,
        color: '#7AAAC8',
      }}>
        <span style={{ color: '#486080' }}>{icon}</span>
        {label}
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 8,
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        color: '#284870',
        paddingLeft: 18,
      }}>
        {sub}
      </div>
    </Link>
  )
}
