/**
 * Project Overview — Command Center
 * Dark void · Iceberg principle
 * Chain integrity + recent activity + 4 quick-action cards
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, Link2, Package, Cpu,
  ShieldCheck, ChevronRight, Clock, FileText,
  AlertTriangle,
} from 'lucide-react'

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  /* ── Data ──────────────────────────────────────────── */
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, status, created_at')
    .eq('id', projectId)
    .single()

  if (!project) redirect('/dashboard')

  // Recent evidence items (latest 5)
  const { data: recentItems } = await supabase
    .from('evidence_items')
    .select('id, file_name, file_type, content_hash, chain_hash, chain_position, ingested_at')
    .eq('project_id', projectId)
    .order('chain_position', { ascending: false })
    .limit(5)

  // Total chain depth
  const { count: chainDepth } = await supabase
    .from('evidence_items')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  // Package count
  const { count: packageCount } = await supabase
    .from('evidence_packages')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  // Latest custody event for "last sealed" time
  const { data: latestEvent } = await supabase
    .from('custody_events')
    .select('created_at, event_type')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const chainIsEmpty = (chainDepth ?? 0) === 0
  const lastSealed = latestEvent
    ? new Date(latestEvent.created_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
      })
    : null

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div style={{ padding: '40px 48px 80px' }}>

      {/* ── Chain integrity banner ──────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 24px',
        background: chainIsEmpty
          ? 'rgba(22,48,88,0.2)'
          : 'rgba(16,185,129,0.04)',
        border: `1px solid ${chainIsEmpty
          ? 'rgba(22,48,88,0.35)'
          : 'rgba(16,185,129,0.15)'}`,
        marginBottom: 40,
      }}>
        {chainIsEmpty
          ? <AlertTriangle size={15} style={{ color: '#F59E0B', flexShrink: 0 }} />
          : <ShieldCheck size={15} style={{ color: '#10B981', flexShrink: 0 }} />
        }
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: '#B8D4EE',
            marginBottom: 2,
          }}>
            {chainIsEmpty
              ? <><strong style={{ color: '#DCF0FF' }}>Chain empty.</strong> No evidence sealed yet — begin capture below.</>
              : <><strong style={{ color: '#10B981' }}>Chain intact.</strong> {chainDepth} item{chainDepth !== 1 ? 's' : ''} sealed · cryptographic integrity verified.</>
            }
          </div>
          {lastSealed && (
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              color: '#486080',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <Clock size={8} />
              Last sealed {lastSealed}
            </div>
          )}
        </div>
        {!chainIsEmpty && recentItems?.[0] && (
          <div
            className="hash-pill"
            title={recentItems[0].chain_hash}
            style={{ cursor: 'default' }}
          >
            HEAD: {recentItems[0].chain_hash?.slice(0, 14)}…
          </div>
        )}
      </div>

      {/* ── Quick action cards ──────────────────────────── */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#486080',
        marginBottom: 16,
      }}>
        Protocol Actions
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        background: 'rgba(22,48,88,0.15)',
        marginBottom: 48,
      }}>
        <ActionCard
          href={`/dashboard/projects/${projectId}/seal`}
          icon={<Zap size={18} />}
          label="Seal Evidence"
          description="Capture files, photos, notes. SHA-256 hashed and chained on submission."
          accent="#7EB8F7"
          primary
        />
        <ActionCard
          href={`/dashboard/projects/${projectId}/chain`}
          icon={<Link2 size={18} />}
          label="Chain View"
          description={`${chainDepth ?? 0} sealed item${chainDepth !== 1 ? 's' : ''} in custody ledger.`}
          accent="#7AAAC8"
        />
        <ActionCard
          href={`/dashboard/projects/${projectId}/packages`}
          icon={<Package size={18} />}
          label="Export Package"
          description={`${packageCount ?? 0} court-ready package${packageCount !== 1 ? 's' : ''} generated.`}
          accent="#7AAAC8"
        />
        <ActionCard
          href={`/dashboard/projects/${projectId}/reconstruct`}
          icon={<Cpu size={18} />}
          label="AI Reconstruct"
          description="Query the chain. AI reconstructs a verified narrative from sealed evidence."
          accent="#7AAAC8"
        />
      </div>

      {/* ── Recent chain activity ───────────────────────── */}
      <div>
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
            Recent Chain Activity
          </div>
          {(recentItems?.length ?? 0) > 0 && (
            <Link
              href={`/dashboard/projects/${projectId}/chain`}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#486080',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#7EB8F7')}
              onMouseLeave={e => (e.currentTarget.style.color = '#486080')}
            >
              Full chain <ChevronRight size={10} />
            </Link>
          )}
        </div>

        {chainIsEmpty ? (
          /* Empty chain state */
          <div style={{
            border: '1px solid rgba(22,48,88,0.3)',
            borderStyle: 'dashed',
            padding: '48px 32px',
            textAlign: 'center',
          }}>
            <ShieldCheck size={20} style={{ color: '#163058', margin: '0 auto 12px', display: 'block' }} />
            <p style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 16,
              color: '#486080',
              marginBottom: 8,
            }}>
              Chain not yet initialized
            </p>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: '#284870',
              letterSpacing: '0.06em',
              lineHeight: 1.8,
              marginBottom: 20,
            }}>
              The first evidence item sealed creates the genesis block.<br />
              Every subsequent item chains to the one before it.
            </p>
            <Link
              href={`/dashboard/projects/${projectId}/seal`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                background: 'rgba(126,184,247,0.08)',
                border: '1px solid rgba(126,184,247,0.2)',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#7EB8F7',
                textDecoration: 'none',
              }}
            >
              <Zap size={10} />
              Begin sealing evidence
            </Link>
          </div>
        ) : (
          /* Chain items */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            background: 'rgba(22,48,88,0.1)',
          }}>
            {(recentItems || []).map((item, idx) => (
              <ChainRow
                key={item.id}
                item={item}
                isHead={idx === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Action card ─────────────────────────────────────────── */
function ActionCard({
  href,
  icon,
  label,
  description,
  accent,
  primary,
}: {
  href: string
  icon: React.ReactNode
  label: string
  description: string
  accent: string
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 24px 20px',
        background: primary ? 'rgba(126,184,247,0.04)' : '#06101E',
        border: primary ? '1px solid rgba(126,184,247,0.12)' : '1px solid transparent',
        textDecoration: 'none',
        transition: 'all 0.15s',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background = primary ? 'rgba(126,184,247,0.07)' : '#081422'
        el.style.borderColor = primary
          ? 'rgba(126,184,247,0.2)'
          : 'rgba(22,48,88,0.5)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background = primary ? 'rgba(126,184,247,0.04)' : '#06101E'
        el.style.borderColor = primary ? 'rgba(126,184,247,0.12)' : 'transparent'
      }}
    >
      {/* Icon */}
      <div style={{ color: accent, opacity: primary ? 1 : 0.7 }}>
        {icon}
      </div>

      {/* Label */}
      <div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: primary ? '#DCF0FF' : '#B8D4EE',
          marginBottom: 6,
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          color: '#486080',
          letterSpacing: '0.04em',
          lineHeight: 1.7,
        }}>
          {description}
        </div>
      </div>

      {/* Arrow */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 8,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: accent,
        opacity: primary ? 0.8 : 0.5,
      }}>
        Open <ChevronRight size={9} />
      </div>
    </Link>
  )
}

/* ── Chain row ───────────────────────────────────────────── */
function ChainRow({
  item,
  isHead,
}: {
  item: {
    id: string
    file_name: string
    file_type: string
    content_hash: string
    chain_hash: string
    chain_position: number
    ingested_at: string
  }
  isHead: boolean
}) {
  const date = new Date(item.ingested_at)
  const formatted = date.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '14px 20px',
      background: '#06101E',
    }}>
      {/* Chain position + connector */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        flexShrink: 0,
      }}>
        <div style={{
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isHead ? 'rgba(16,185,129,0.1)' : 'rgba(22,48,88,0.4)',
          border: `1px solid ${isHead ? 'rgba(16,185,129,0.25)' : 'rgba(22,48,88,0.6)'}`,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 8,
          color: isHead ? '#10B981' : '#486080',
          letterSpacing: 0,
        }}>
          {item.chain_position}
        </div>
      </div>

      {/* File icon */}
      <FileText size={13} style={{ color: '#284870', flexShrink: 0 }} />

      {/* Name + date */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: '#B8D4EE',
          marginBottom: 3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.file_name}
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          color: '#284870',
          letterSpacing: '0.06em',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <Clock size={8} />
          Sealed {formatted}
        </div>
      </div>

      {/* Hash pills */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <span
          className="hash-pill"
          title={`Content hash: ${item.content_hash}`}
        >
          {item.content_hash?.slice(0, 10)}…
        </span>
        <span
          className="hash-pill"
          title={`Chain hash: ${item.chain_hash}`}
        >
          ⛓ {item.chain_hash?.slice(0, 10)}…
        </span>
      </div>

      {/* Sealed badge */}
      <span className="badge-sealed" style={{ flexShrink: 0 }}>
        sealed
      </span>
    </div>
  )
}
